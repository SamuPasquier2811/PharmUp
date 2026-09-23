import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMedications } from '../../hooks/useMedications'
import SearchBar from './SearchBar'
import MedicationCard from './MedicationCard'
import MedicationModal from './MedicationModal'
import AddMedicationModal from './AddMedicationModal'
import CartDrawer from './CartDrawer'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function InventoryPage() {
    const { pharmacy, signOut } = useAuth()
    const { medications, loading, error, refetch } = useMedications()

    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [showAdd, setShowAdd] = useState(false)
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const [showCart, setShowCart] = useState(false)

    // Carrito: [{ medication, quantity }]
    const [cart, setCart] = useState([])

    function addToCart(medication, quantity) {
        setCart((prev) => {
        const existing = prev.find((i) => i.medication.id === medication.id)
        if (existing) {
            return prev.map((i) =>
            i.medication.id === medication.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            )
        }
        return [...prev, { medication, quantity }]
        })
        // Cerrar modal para que vea el efecto
        setSelected(null)
    }

    function removeFromCart(medicationId) {
        setCart((prev) => prev.filter((i) => i.medication.id !== medicationId))
    }

    function updateQty(medicationId, value) {
        const qty = Number(value)
        if (!qty || qty <= 0) return
        setCart((prev) =>
        prev.map((i) =>
            i.medication.id === medicationId ? { ...i, quantity: qty } : i
        )
        )
    }

    function clearCart() {
        setCart([])
    }

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        if (!q) return medications
        return medications.filter((m) => {
        const fields = [
            m.name,
            m.active_ingredient,
            m.laboratory,
            m.category,
            m.barcode,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
        return fields.includes(q)
        })
    }, [medications, search])

    const selectedLive = selected
        ? medications.find((m) => m.id === selected.id) ?? null
        : null

    const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

    return (
        <div className="page">
        <header className="topbar">
            <div className="topbar-left">
            <h1 className="brand-small">PharmUp</h1>
            {pharmacy?.name && (
                <span className="pharmacy-name">{pharmacy.name}</span>
            )}
            </div>
            <div className="topbar-actions">
            <Link to="/historial" className="btn-secondary btn-sm">
                Historial
            </Link>
            <button
                className="btn-primary btn-sm"
                onClick={() => setShowAdd(true)}
            >
                + Nuevo
            </button>
            <button
                className="btn-logout"
                onClick={() => setShowLogoutConfirm(true)}
            >
                Salir
            </button>
            </div>
        </header>

        <div className="search-wrapper">
            <SearchBar value={search} onChange={setSearch} />
        </div>

        <main className="content">
            {loading && <p className="muted">Cargando inventario...</p>}
            {error && <p className="error">Error: {error}</p>}

            {!loading && !error && medications.length === 0 && (
            <div className="empty-state">
                <p className="empty-title">Tu inventario está vacío</p>
                <p className="empty-text">
                Toca <strong>+ Nuevo</strong> para agregar tu primer medicamento.
                </p>
            </div>
            )}

            {!loading && medications.length > 0 && filtered.length === 0 && (
            <p className="muted">
                No se encontraron medicamentos con “{search}”.
            </p>
            )}

            <div className="med-list">
            {filtered.map((m) => (
                <MedicationCard
                key={m.id}
                medication={m}
                onClick={() => setSelected(m)}
                />
            ))}
            </div>
        </main>

        {/* Botón flotante del carrito */}
        {cart.length > 0 && (
            <button
            className="cart-fab"
            onClick={() => setShowCart(true)}
            aria-label="Ver venta en curso"
            >
            <span className="cart-fab-label">Venta</span>
            <span className="cart-fab-badge">{cartCount}</span>
            </button>
        )}

        {selectedLive && (
            <MedicationModal
            medication={selectedLive}
            onClose={() => setSelected(null)}
            onUpdate={() => refetch({ silent: true })}
            onAddToCart={addToCart}
            />
        )}

        {showAdd && (
            <AddMedicationModal
            onClose={() => setShowAdd(false)}
            onSuccess={() => {
                setShowAdd(false)
                refetch()
            }}
            />
        )}

        {showCart && (
            <CartDrawer
            items={cart}
            onClose={() => setShowCart(false)}
            onRemove={removeFromCart}
            onUpdateQty={updateQty}
            onSuccess={() => {
                setShowCart(false)
                clearCart()
                refetch({ silent: true })
            }}
            />
        )}

        {showLogoutConfirm && (
            <ConfirmDialog
            title="¿Cerrar sesión?"
            message="Tendrás que volver a ingresar tu correo y contraseña."
            confirmLabel="Sí, cerrar sesión"
            cancelLabel="Cancelar"
            danger
            onConfirm={() => {
                setShowLogoutConfirm(false)
                signOut()
            }}
            onCancel={() => setShowLogoutConfirm(false)}
            />
        )}
        </div>
    )
}