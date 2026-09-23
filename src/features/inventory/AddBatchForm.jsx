import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AddBatchForm({ medicationId, onSuccess, onCancel }) {
    const [form, setForm] = useState({
        batch_number: '',
        expiry_date: '',
        quantity: '',
        cost_price: '',
        sale_price: '',
        location: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function update(k, v) { setForm((f) => ({ ...f, [k]: v })) }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (!form.quantity || Number(form.quantity) <= 0) {
        setError('La cantidad debe ser mayor a 0.')
        return
        }

        setLoading(true)
        const { error } = await supabase.from('batches').insert({
        medication_id: medicationId,
        batch_number: form.batch_number || null,
        expiry_date: form.expiry_date || null,
        quantity: Number(form.quantity),
        cost_price: Number(form.cost_price) || 0,
        sale_price: Number(form.sale_price) || 0,
        location: form.location || null,
        })
        setLoading(false)

        if (error) {
        setError(error.message)
        return
        }
        onSuccess()
    }

    return (
        <form className="inline-form" onSubmit={handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                <label>Cantidad *</label>
                <input
                    type="number" min="1"
                    value={form.quantity}
                    onChange={(e) => update('quantity', e.target.value)}
                    required
                />
                </div>
                <div className="form-group">
                <label>Vence</label>
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
                <input
                    value={form.batch_number}
                    onChange={(e) => update('batch_number', e.target.value)}
                />
                </div>
                <div className="form-group">
                <label>Ubicación</label>
                <input
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                />
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
                <label>Venta (Bs)</label>
                <input
                    type="number" step="0.01"
                    value={form.sale_price}
                    onChange={(e) => update('sale_price', e.target.value)}
                />
                </div>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Agregar stock'}
                </button>
            </div>
        </form>
    )
}