import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdjustStockForm({ medication, onSuccess, onCancel }) {
    const batches = medication.batches ?? []
    const [batchId, setBatchId] = useState(batches[0]?.id ?? '')
    const [amount, setAmount] = useState('')
    const [reason, setReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const selectedBatch = batches.find((b) => b.id === batchId)
    const preview = selectedBatch
        ? selectedBatch.quantity + (Number(amount) || 0)
        : null

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        const num = Number(amount)
        if (!amount || isNaN(num) || num === 0) {
        setError('Ingresa una cantidad distinta de 0.')
        return
        }

        if (!selectedBatch) {
        setError('Selecciona un lote.')
        return
        }

        const newQty = selectedBatch.quantity + num
        if (newQty < 0) {
        setError(
            `No puedes dejar el stock en negativo. Actual: ${selectedBatch.quantity}.`
        )
        return
        }

        setLoading(true)
        const { error: updErr } = await supabase
        .from('batches')
        .update({ quantity: newQty })
        .eq('id', selectedBatch.id)
        setLoading(false)

        if (updErr) {
        setError(updErr.message)
        return
        }
        onSuccess()
    }

    if (batches.length === 0) {
        return (
        <div className="adjust-form">
            <p className="muted">
            No hay lotes para ajustar. Primero registra una entrada de stock.
            </p>
            <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
                Cerrar
            </button>
            </div>
        </div>
        )
    }

    return (
        <form className="adjust-form" onSubmit={handleSubmit}>
        <div className="form-group">
            <label>Lote a ajustar</label>
            <select value={batchId} onChange={(e) => setBatchId(e.target.value)}>
            {batches.map((b) => (
                <option key={b.id} value={b.id}>
                {b.batch_number || 'Sin N°'} — {b.quantity} und
                {b.expiry_date
                    ? ` — vence ${new Date(b.expiry_date).toLocaleDateString('es-BO')}`
                    : ''}
                </option>
            ))}
            </select>
        </div>

        <div className="form-group">
            <label>
            Cantidad a ajustar
            {/* <span className="hint"> (usa + para sumar, − para restar)</span> */}
            </label>
            <input
            type="number"
            step="1"
            placeholder="Ej: +5 o -3"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            autoFocus
            />
        </div>

        <div className="form-group">
            <label>Motivo (opcional)</label>
            <input
            placeholder="Venta mal registrada, conteo físico..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            />
        </div>

        {selectedBatch && amount && !isNaN(Number(amount)) && (
            <p className="adjust-preview">
            {selectedBatch.quantity} und → <strong>{preview} und</strong>
            </p>
        )}

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Aplicando...' : 'Aplicar ajuste'}
            </button>
        </div>
        </form>
    )
}