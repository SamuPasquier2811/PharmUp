import { useCallback, useMemo, useState } from 'react'
import { ToastContext } from './toastContext'
import Toaster from '../components/Toaster'

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const push = useCallback((type, message, duration = 3000) => {
        const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Date.now() + Math.random())

        setToasts((prev) => [...prev, { id, type, message }])
        setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
    }, [])

    const value = useMemo(
        () => ({
        success: (msg, duration) => push('success', msg, duration),
        error: (msg, duration) => push('error', msg, duration),
        info: (msg, duration) => push('info', msg, duration),
        }),
        [push]
    )

    return (
        <ToastContext.Provider value={value}>
        {children}
        <Toaster toasts={toasts} />
        </ToastContext.Provider>
    )
}