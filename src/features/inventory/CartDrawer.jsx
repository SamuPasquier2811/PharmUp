import { useState } from 'react'
import { calculateSalePrice, registerMultiSale } from '../../lib/sales'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

export default function CartDrawer({ items, onClose, onRemove, onUpdateQty, onSuccess }) {
    const { pharmacyId, user } = useAuth()
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const grandTotal = items.reduce((sum, item) => {
        return sum + calculateSalePrice(item.medication, item.quantity)
    }, 0)

    async function handleConfirm() {
        setError('')
        setLoading(true)
        try {
            await registerMultiSale({
                items,
                pharmacyId,
                userId: user.id,
            })
            toast.success(`Venta registrada (${items.length} medicamentos)`)
            onSuccess()
        } catch (err) {
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div
            className="modal-content cart-content"
            onClick={(e) => e.stopPropagation()}
        >
            <header className="modal-header">
            <div>
                <h2>Venta en curso</h2>
                <p className="modal-subtitle">
                {items.length} {items.length === 1 ? 'medicamento' : 'medicamentos'}
                </p>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                ×
            </button>
            </header>

            <div className="modal-body">
            {items.length === 0 ? (
                <p className="empty-mini">No hay medicamentos en la venta.</p>
            ) : (
                <ul className="cart-list">
                {items.map((item) => {
                    const stock = (item.medication.batches ?? []).reduce(
                    (s, b) => s + b.quantity,
                    0
                    )
                    return (
                    <li key={item.medication.id} className="cart-item">
                        <div className="cart-item-info">
                        <strong>
                            {item.medication.name} {item.medication.concentration}
                        </strong>
                        <span className="cart-item-meta">
                            {item.medication.unit} · Stock: {stock}
                        </span>
                        </div>
                        <div className="cart-item-controls">
                        <input
                            type="number"
                            min="1"
                            max={stock}
                            value={item.quantity}
                            onChange={(e) =>
                            onUpdateQty(item.medication.id, e.target.value)
                            }
                            className="cart-qty-input"
                        />
                        <button
                            type="button"
                            className="cart-remove"
                            onClick={() => onRemove(item.medication.id)}
                            aria-label="Quitar"
                        >
                            ×
                        </button>
                        </div>
                    </li>
                    )
                })}
                </ul>
            )}

            {error && <p className="error">{error}</p>}

            <div className="cart-summary">
                <span>Total aproximado</span>
                <strong>{grandTotal.toFixed(2)} Bs</strong>
            </div>

            <div className="form-actions">
                <button className="btn-secondary" onClick={onClose}>
                Seguir agregando
                </button>
                <button
                className="btn-primary btn-sale"
                onClick={handleConfirm}
                disabled={loading || items.length === 0}
                >
                {loading ? 'Registrando...' : 'Confirmar venta'}
                </button>
            </div>
            </div>
        </div>
        </div>
    )
}