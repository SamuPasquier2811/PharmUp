function getStock(med) {
    return (med.batches ?? []).reduce((s, b) => s + (b.quantity ?? 0), 0)
}

function getStatus(med) {
    const batches = (med.batches ?? []).filter((b) => b.quantity > 0)
    if (batches.length === 0) return { level: 'out', label: 'Sin stock' }

    const today = new Date()
    const in30 = new Date()
    in30.setDate(today.getDate() + 30)

    const hasExpired = batches.some((b) => b.expiry_date && new Date(b.expiry_date) < today)
    const hasSoon = batches.some(
        (b) => b.expiry_date && new Date(b.expiry_date) >= today && new Date(b.expiry_date) <= in30
    )

    if (hasExpired) return { level: 'expired', label: 'Lote vencido' }
    if (hasSoon) return { level: 'soon', label: 'Vence pronto' }
    return { level: 'ok', label: 'Disponible' }
}

export default function MedicationCard({ medication, onClick }) {
    const stock = getStock(medication)
    const status = getStatus(medication)

    return (
        <button type="button" className="med-card" onClick={onClick}>
        <div className="med-card-main">
            <h3 className="med-card-title">
            {medication.name}
            {medication.concentration && ` ${medication.concentration}`}
            </h3>
            <p className="med-card-subtitle">
            {[medication.form, medication.laboratory].filter(Boolean).join(' · ')}
            </p>
        </div>
        <div className="med-card-side">
            <span className={`med-stock ${status.level}`}>{stock}</span>
            <span className={`med-badge ${status.level}`}>{status.label}</span>
        </div>
        </button>
    )
}