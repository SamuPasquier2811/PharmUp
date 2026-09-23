import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const FORMS = ['tableta', 'cápsula', 'jarabe', 'inyectable', 'crema', 'gotas', 'sobre', 'otro']
const UNITS = ['tableta', 'cápsula', 'frasco', 'ampolla', 'tubo', 'sobre', 'unidad']
const CATEGORIES = [
    'analgésico', 'antiinflamatorio', 'antibiótico', 'antitusivo',
    'antidiabético', 'antihipertensivo', 'antialérgico', 'otro',
]

export default function AddMedicationModal({ onClose, onSuccess }) {
    const { pharmacyId } = useAuth()
    const [form, setForm] = useState({
        name: '',
        active_ingredient: '',
        laboratory: '',
        form: 'tableta',
        concentration: '',
        presentation: '',
        category: 'analgésico',
        unit: 'tableta',
        requires_prescription: false,
        barcode: '',
        notes: '',
        // lote inicial
        batch_number: '',
        expiry_date: '',
        quantity: '',
        cost_price: '',
        sale_price: '',
        location: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function update(k, v) { setForm((f) => ({ ...f, [k]: v })) }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!form.name.trim()) {
        setError('El nombre es obligatorio.')
        return
        }

        setLoading(true)

        // 1. Crear medicamento
        const { data: med, error: medError } = await supabase
        .from('medications')
        .insert({
            pharmacy_id: pharmacyId,
            name: form.name.trim(),
            active_ingredient: form.active_ingredient || null,
            laboratory: form.laboratory || null,
            form: form.form || null,
            concentration: form.concentration || null,
            presentation: form.presentation || null,
            category: form.category || null,
            unit: form.unit,
            requires_prescription: form.requires_prescription,
            barcode: form.barcode || null,
            notes: form.notes || null,
        })
        .select()
        .single()

        if (medError) {
        setError(medError.message)
        setLoading(false)
        return
        }

        // 2. Crear lote inicial si hay cantidad
        if (form.quantity && Number(form.quantity) > 0) {
        const { error: batchError } = await supabase.from('batches').insert({
            medication_id: med.id,
            batch_number: form.batch_number || null,
            expiry_date: form.expiry_date || null,
            quantity: Number(form.quantity),
            cost_price: Number(form.cost_price) || 0,
            sale_price: Number(form.sale_price) || 0,
            location: form.location || null,
        })
        if (batchError) {
            setError(`Medicamento creado, pero el lote falló: ${batchError.message}`)
            setLoading(false)
            return
        }
        }

        setLoading(false)
        onSuccess()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
            <h2>Nuevo medicamento</h2>
            <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
            </header>

            <form className="modal-body" onSubmit={handleSubmit}>
            <section className="modal-section">
                <h3 className="section-title">Datos del medicamento</h3>

                <div className="form-group">
                <label>Nombre *</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label>Principio activo</label>
                    <input value={form.active_ingredient} onChange={(e) => update('active_ingredient', e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Laboratorio</label>
                    <input value={form.laboratory} onChange={(e) => update('laboratory', e.target.value)} />
                </div>
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label>Forma</label>
                    <select value={form.form} onChange={(e) => update('form', e.target.value)}>
                    {FORMS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Concentración</label>
                    <input
                    placeholder="500 mg"
                    value={form.concentration}
                    onChange={(e) => update('concentration', e.target.value)}
                    />
                </div>
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label>Presentación</label>
                    <input
                    placeholder="caja x 10"
                    value={form.presentation}
                    onChange={(e) => update('presentation', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Categoría</label>
                    <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label>Unidad de venta</label>
                    <select value={form.unit} onChange={(e) => update('unit', e.target.value)}>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Código de barras</label>
                    <input value={form.barcode} onChange={(e) => update('barcode', e.target.value)} />
                </div>
                </div>

                <label className="checkbox-label">
                <input
                    type="checkbox"
                    checked={form.requires_prescription}
                    onChange={(e) => update('requires_prescription', e.target.checked)}
                />
                Requiere receta
                </label>
            </section>

            <section className="modal-section">
                <h3 className="section-title">Stock inicial (opcional)</h3>

                <div className="form-row">
                <div className="form-group">
                    <label>Cantidad</label>
                    <input
                    type="number" min="0"
                    value={form.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Fecha de vencimiento</label>
                    <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => update('expiry_date', e.target.value)}
                    />
                </div>
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label>N° lote</label>
                    <input value={form.batch_number} onChange={(e) => update('batch_number', e.target.value)} />
                </div>
                <div className="form-group">
                    <label>Ubicación</label>
                    <input value={form.location} onChange={(e) => update('location', e.target.value)} />
                </div>
                </div>

                <div className="form-row">
                <div className="form-group">
                    <label>Costo (Bs)</label>
                    <input
                    type="number" step="0.01"
                    value={form.cost_price}
                    onChange={(e) => update('cost_price', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Precio de venta (Bs)</label>
                    <input
                    type="number" step="0.01"
                    value={form.sale_price}
                    onChange={(e) => update('sale_price', e.target.value)}
                    />
                </div>
                </div>
            </section>

            {error && <p className="error">{error}</p>}

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
            </form>
        </div>
        </div>
    )
}