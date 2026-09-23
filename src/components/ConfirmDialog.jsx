export default function ConfirmDialog({
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    danger = false,
    onConfirm,
    onCancel,
}) {
    return (
        <div className="modal-overlay confirm-overlay" onClick={onCancel}>
            <div
                className="confirm-dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="confirm-title">{title}</h3>
                {message && <p className="confirm-message">{message}</p>}
                <div className="confirm-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        className={`btn-primary ${danger ? 'btn-danger' : ''}`}
                        onClick={onConfirm}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}