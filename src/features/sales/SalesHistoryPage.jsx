import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSales } from '../../hooks/useSales'
import SaleRow from './SaleRow'

const RANGES = [
    { key: 'today', label: 'Hoy' },
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: 'all', label: 'Todo' },
]

function startOfRange(rangeKey) {
    const now = new Date()
    if (rangeKey === 'today') {
        const d = new Date(now)
        d.setHours(0, 0, 0, 0)
        return d
    }
    if (rangeKey === '7d') {
        const d = new Date(now)
        d.setDate(d.getDate() - 7)
        d.setHours(0, 0, 0, 0)
        return d
    }
    if (rangeKey === '30d') {
        const d = new Date(now)
        d.setDate(d.getDate() - 30)
        d.setHours(0, 0, 0, 0)
        return d
    }
    return null
}

function formatDayLabel(dayStr) {
    const d = new Date(dayStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    if (d.getTime() === today.getTime()) return 'Hoy'
    if (d.getTime() === yesterday.getTime()) return 'Ayer'

    return d.toLocaleDateString('es-BO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
}

export default function SalesHistoryPage() {
    const { sales, loading, error } = useSales()
    const [range, setRange] = useState('7d')
    const [search, setSearch] = useState('')

    const filtered = useMemo(() => {
        const from = startOfRange(range)
        const q = search.trim().toLowerCase()

        return sales.filter((s) => {
        if (from && new Date(s.created_at) < from) return false
        if (q) {
            const name = (s.medications?.name ?? '').toLowerCase()
            if (!name.includes(q)) return false
        }
        return true
        })
    }, [sales, range, search])

    const grouped = useMemo(() => {
        const map = {}
        for (const s of filtered) {
        const day = s.created_at.slice(0, 10)
        if (!map[day]) map[day] = []
        map[day].push(s)
        }
        return Object.entries(map)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([day, items]) => ({
            day,
            items,
            total: items.reduce((sum, i) => sum + Number(i.total), 0),
        }))
    }, [filtered])

    const grandTotal = filtered.reduce((s, i) => s + Number(i.total), 0)
    const txCount = grouped.length

    return (
        <div className="page">
        <header className="topbar">
            <div className="topbar-left">
            <Link to="/" className="back-link">← Inventario</Link>
            <h1 className="brand-small">Historial de ventas</h1>
            </div>
        </header>

        <div className="filters-wrapper">
            <div className="range-tabs">
            {RANGES.map((r) => (
                <button
                key={r.key}
                className={`range-tab ${range === r.key ? 'active' : ''}`}
                onClick={() => setRange(r.key)}
                >
                {r.label}
                </button>
            ))}
            </div>

            <div className="search-bar">
            <input
                type="text"
                placeholder="Buscar por medicamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
                <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label="Limpiar"
                >
                ×
                </button>
            )}
            </div>
        </div>

        <main className="content">
            {loading && <p className="muted">Cargando historial...</p>}
            {error && <p className="error">Error: {error}</p>}

            {!loading && !error && (
            <>
                <div className="history-summary">
                <div className="summary-card">
                    <span className="summary-label">Total vendido</span>
                    <strong className="summary-value">{grandTotal.toFixed(2)} Bs</strong>
                </div>
                <div className="summary-card">
                    <span className="summary-label">Días con ventas</span>
                    <strong className="summary-value">{txCount}</strong>
                </div>
                </div>

                {grouped.length === 0 && (
                <div className="empty-state">
                    <p className="empty-title">Sin ventas en este período</p>
                    <p className="empty-text">
                    Prueba con otro rango o borra el filtro de búsqueda.
                    </p>
                </div>
                )}

                {grouped.map(({ day, items, total }) => (
                <section key={day} className="history-day">
                    <header className="history-day-header">
                    <span className="history-day-label">{formatDayLabel(day)}</span>
                    <span className="history-day-total">{total.toFixed(2)} Bs</span>
                    </header>
                    <ul className="sale-list">
                    {items.map((s) => (
                        <SaleRow key={s.id} sale={s} />
                    ))}
                    </ul>
                </section>
                ))}
            </>
            )}
        </main>
        </div>
    )
}