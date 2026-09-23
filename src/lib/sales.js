import { supabase } from './supabase'

function buildFifoPlan(medication, quantity) {
    const available = (medication.batches ?? [])
        .filter((b) => b.quantity > 0)
        .sort((a, b) => {
        if (!a.expiry_date) return 1
        if (!b.expiry_date) return -1
        return new Date(a.expiry_date) - new Date(b.expiry_date)
        })

    const total = available.reduce((s, b) => s + b.quantity, 0)
    if (total < quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${total}`)
    }

    let remaining = quantity
    const plan = []
    for (const batch of available) {
        if (remaining <= 0) break
        const take = Math.min(batch.quantity, remaining)
        plan.push({ batch, take })
        remaining -= take
    }
    return plan
    }

    export function calculateSalePrice(medication, quantity) {
    try {
        const plan = buildFifoPlan(medication, quantity)
        return plan.reduce(
        (s, { batch, take }) => s + (batch.sale_price ?? 0) * take,
        0
        )
    } catch {
        return 0
    }
    }

    export async function registerSale({ medication, quantity, pharmacyId, userId }) {
    const qty = Number(quantity)
    if (!qty || qty <= 0) throw new Error('Cantidad inválida.')

    const plan = buildFifoPlan(medication, qty)

    for (const { batch, take } of plan) {
        const { error } = await supabase
        .from('batches')
        .update({ quantity: batch.quantity - take })
        .eq('id', batch.id)
        if (error) throw error
    }

    const rows = plan.map(({ batch, take }) => ({
        pharmacy_id: pharmacyId,
        medication_id: medication.id,
        batch_id: batch.id,
        quantity: take,
        unit_price: batch.sale_price ?? 0,
        total: (batch.sale_price ?? 0) * take,
        sold_by: userId,
    }))

    const { error: saleError } = await supabase.from('sales').insert(rows)
    if (saleError) throw saleError
    }

    export async function registerMultiSale({ items, pharmacyId, userId }) {
    if (!items?.length) throw new Error('El carrito está vacío.')

    // 1. Validar TODOS antes de tocar nada
    const plans = items.map((item) => {
        const qty = Number(item.quantity)
        if (!qty || qty <= 0) {
        throw new Error(`${item.medication.name}: cantidad inválida.`)
        }
        try {
        return {
            medication: item.medication,
            quantity: qty,
            plan: buildFifoPlan(item.medication, qty),
        }
        } catch (err) {
        throw new Error(`${item.medication.name}: ${err.message}`, { cause: err })
        }
    })

    // 2. Descontar stock
    for (const { plan } of plans) {
        for (const { batch, take } of plan) {
        const { error } = await supabase
            .from('batches')
            .update({ quantity: batch.quantity - take })
            .eq('id', batch.id)
        if (error) throw error
        }
    }

    // 3. Insertar ventas
    const allRows = []
    for (const { medication, plan } of plans) {
        for (const { batch, take } of plan) {
        allRows.push({
            pharmacy_id: pharmacyId,
            medication_id: medication.id,
            batch_id: batch.id,
            quantity: take,
            unit_price: batch.sale_price ?? 0,
            total: (batch.sale_price ?? 0) * take,
            sold_by: userId,
        })
        }
    }

    const { error: saleError } = await supabase.from('sales').insert(allRows)
    if (saleError) throw saleError
}