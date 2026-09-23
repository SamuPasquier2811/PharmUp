import { useState } from 'react'
import SaleForm from './SaleForm'
import AddBatchForm from './AddBatchForm'
import AdjustStockForm from './AdjustStockForm'

export default function MedicationModal({ medication, onClose, onUpdate, onAddToCart }) {
    const [showAddBatch, setShowAddBatch] = useState(false)
    const [showAdjust, setShowAdjust] = useState(false)

    const batches = [...(medication.batches ?? [])].sort((a, b) => {
        if (!a.expiry_date) return 1
        if (!b.expiry_date) return -1
        return new Date(a.expiry_date) - new Date(b.expiry_date)
    })

    const today = new Date()

    function expiryStatus(dateStr) {
        if (!dateStr) return 'ok'
        const d = new Date(dateStr)
        if (d < today) return 'expired'
        const in30 = new Date()
        in30.setDate(today.getDate() + 30)
        if (d <= in30) return 'soon'
        return 'ok'
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <header className="modal-header">
            <div>
                <h2>
                {medication.name} {medication.concentration}
                </h2>
                <p className="modal-subtitle">
                {[medication.form, medication.laboratory]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
            </div>
            <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                ×
            </button>
            </header>

            <div className="modal-body">
            {/* Información general */}
            <section className="modal-section">
                <h3 className="section-title">Información</h3>
                <dl className="info-grid">
                {medication.active_ingredient && (
                    <>
                    <dt>Principio activo</dt>
                    <dd>{medication.active_ingredient}</dd>
                    </>
                )}
                {medication.presentation && (
                    <>
                    <dt>Presentación</dt>
                    <dd>{medication.presentation}</dd>
                    </>
                )}
                {medication.category && (
                    <>
                    <dt>Categoría</dt>
                    <dd>{medication.category}</dd>
                    </>
                )}
                {medication.unit && (
                    <>
                    <dt>Unidad de venta</dt>
                    <dd>{medication.unit}</dd>
                    </>
                )}
                {medication.barcode && (
                    <>
                    <dt>Código de barras</dt>
                    <dd>{medication.barcode}</dd>
                    </>
                )}
                <dt>Receta</dt>
                <dd>{medication.requires_prescription ? 'Sí' : 'No'}</dd>
                </dl>
            </section>

            {/* Lotes */}
            <section className="modal-section">
                <h3 className="section-title">Lotes ({batches.length})</h3>

                {batches.length === 0 ? (
                <p className="empty-mini">No hay lotes registrados.</p>
                ) : (
                <ul className="batch-list">
                    {batches.map((b) => {
                    const status = expiryStatus(b.expiry_date)
                    return (
                        <li key={b.id} className={`batch-item ${status}`}>
                        <div className="batch-info">
                            <strong>{b.batch_number || 'Sin número'}</strong>
                            <span className="batch-meta">
                            {b.expiry_date
                                ? `Vence ${new Date(b.expiry_date).toLocaleDateString('es-BO')}`
                                : 'Sin vencimiento'}
                            {b.location && ` · ${b.location}`}
                            </span>
                        </div>
                        <div className="batch-qty">
                            <span className={`stock-pill ${status}`}>{b.quantity}</span>
                            <span className="batch-price">
                            {Number(b.sale_price).toFixed(2)} Bs
                            </span>
                        </div>
                        </li>
                    )
                    })}
                </ul>
                )}

                {showAddBatch ? (
                <AddBatchForm
                    medicationId={medication.id}
                    onCancel={() => setShowAddBatch(false)}
                    onSuccess={() => {
                    setShowAddBatch(false)
                    onUpdate()
                    }}
                />
                ) : showAdjust ? (
                <AdjustStockForm
                    medication={medication}
                    onCancel={() => setShowAdjust(false)}
                    onSuccess={() => {
                    setShowAdjust(false)
                    onUpdate()
                    }}
                />
                ) : (
                <div className="modal-actions-inline">
                    <button
                    type="button"
                    className="btn-link"
                    onClick={() => setShowAddBatch(true)}
                    >
                    + Registrar entrada
                    </button>
                    <button
                    type="button"
                    className="btn-link"
                    onClick={() => setShowAdjust(true)}
                    >
                    ⚙ Ajustar stock
                    </button>
                </div>
                )}
            </section>

            {/* Venta */}
            <section className="modal-section">
                <h3 className="section-title">Registrar venta</h3>
                <SaleForm
                    medication={medication}
                    onSuccess={onUpdate}
                    onAddToCart={onAddToCart}
                />
            </section>
            </div>
        </div>
        </div>
    )
}