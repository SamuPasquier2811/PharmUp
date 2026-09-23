import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import PasswordInput from './PasswordInput'

export default function Register() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        full_name: '',
        pharmacy_name: '',
        pharmacy_address: '',
        pharmacy_phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function update(field, value) {
        setForm((f) => ({ ...f, [field]: value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden.')
            return
        }

        if (form.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.')
            return
        }

        setLoading(true)

        const { error } = await signUp(form.email, form.password, {
            full_name: form.full_name,
            pharmacy_name: form.pharmacy_name,
            pharmacy_address: form.pharmacy_address,
            pharmacy_phone: form.pharmacy_phone,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        navigate('/', { replace: true })
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="brand">FarmUp</h1>
                <h2>Crear cuenta</h2>

                <form onSubmit={handleSubmit}>
                <label>Nombre completo</label>
                <input
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    required
                />

                <label>Nombre de la farmacia</label>
                <input
                    value={form.pharmacy_name}
                    onChange={(e) => update('pharmacy_name', e.target.value)}
                    required
                />

                <label>Dirección de la farmacia</label>
                <input
                    value={form.pharmacy_address}
                    onChange={(e) => update('pharmacy_address', e.target.value)}
                />

                <label>Teléfono de la farmacia</label>
                <input
                    value={form.pharmacy_phone}
                    onChange={(e) => update('pharmacy_phone', e.target.value)}
                />

                <label>Correo</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    required
                    autoComplete="email"
                />

                <label>Contraseña</label>
                <PasswordInput
                    value={form.password}
                    onChange={(v) => update('password', v)}
                    autoComplete="new-password"
                    required
                />

                <label>Confirmar contraseña</label>
                <PasswordInput
                    value={form.confirmPassword}
                    onChange={(v) => update('confirmPassword', v)}
                    autoComplete="new-password"
                    required
                />

                {error && <p className="error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
                </form>

                <p className="auth-link">
                    ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
                </p>
            </div>
        </div>
    )
}