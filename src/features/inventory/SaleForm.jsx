import { useState } from 'react'
import { registerSale } from '../../lib/sales'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export default function SaleForm({ medication, onSuccess, onAddToCart }) {
    const { pharmacyId, user } = useAuth()
    const [quantity, setQuantity] = useState('1')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const totalStock = (medication.batches ?? []).reduce(
        (s, b) => s + b.quantity,
        0
    )

    function validate() {
        const qty = Number(quantity)
        if (!qty || qty <= 0) return 'Ingresa una cantidad válida.'
        if (qty > totalStock) return `Solo hay ${totalStock} en stock.`
        return null
    }

    async function handleSellNow(e) {
        e.preventDefault()
        const err = validate()
        if (err) return setError(err)
        setError('')
        setLoading(true)
        try {
            await registerSale({
                medication,
                quantity: Number(quantity),
                pharmacyId,
                userId: user.id,
            })
            toast.success('Venta registrada correctamente')
            setQuantity('1')
            onSuccess()
        } catch (err) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleAddToCart() {
        const err = validate()
        if (err) return setError(err)
        setError('')
        onAddToCart(medication, Number(quantity))
        setQuantity('1')
    }

    return (
        <form className="sale-form" onSubmit={handleSellNow}>
        <label className="sale-label">
            Cantidad a vender (unidades: {medication.unit})
        </label>
        <input
            type="number"
            min="1"
            inputMode="numeric"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="sale-input"
        />

        {error && <p className="error">{error}</p>}

        <div className="sale-actions">
            <button
            type="button"
            className="btn-secondary btn-add-cart"
            onClick={handleAddToCart}
            disabled={loading}
            >
            Agregar a venta
            </button>
            <button
            type="submit"
            className="btn-primary btn-sale"
            disabled={loading}
            >
            {loading ? 'Registrando...' : 'Vender ahora'}
            </button>
        </div>
        </form>
    )
}