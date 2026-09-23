export default function SearchBar({ value, onChange }) {
    return (
        <div className="search-bar">
            <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                placeholder="Buscar medicamento..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {value && (
                <button
                type="button"
                className="search-clear"
                onClick={() => onChange('')}
                aria-label="Limpiar"
                >
                ×
                </button>
            )}
        </div>
    )
}