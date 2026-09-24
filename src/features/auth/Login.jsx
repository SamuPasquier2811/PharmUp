import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth';
import PasswordInput from './PasswordInput'

export default function Login() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { error } = await signIn(email, password)

        if (error) {
            setError('Correo o contraseña incorrectos.')
            setLoading(false)
            return
        }

        navigate('/', { replace: true })
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1 className="brand">PharmUp</h1>
                <h2>Iniciar sesión</h2>

                <form onSubmit={handleSubmit}>
                    <label>Correo</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <label>Contraseña</label>
                    <PasswordInput
                        value={password}
                        onChange={setPassword}
                        autoComplete="current-password"
                        required
                    />

                    {error && <p className="error">{error}</p>}

                    <button type="submit" disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>

                <p className="auth-link">
                    ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
                </p>
            </div>
        </div>
    )
}