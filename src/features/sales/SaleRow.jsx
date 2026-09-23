export default function SaleRow({ sale }) {
    const med = sale.medications
    const time = new Date(sale.created_at).toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <li className="sale-row">
            <div className="sale-row-main">
                <strong>
                {med?.name ?? 'Medicamento eliminado'}
                {med?.concentration ? ` ${med.concentration}` : ''}
                </strong>
                <span className="sale-row-meta">
                {sale.quantity} {med?.unit ?? 'und'} × {Number(sale.unit_price).toFixed(2)} Bs · {time}
                </span>
            </div>
            <span className="sale-row-total">
                {Number(sale.total).toFixed(2)} Bs
            </span>
        </li>
    )
}