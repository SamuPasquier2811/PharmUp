import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { AuthContext } from './authContext'

export default function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        if (!session) setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            setSession(session)
            if (!session) {
            setProfile(null)
            setLoading(false)
            }
        }
        )

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (!session) return;
        let cancelled = false;

        supabase
        .from('profiles')
        .select('*, pharmacies(*)')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
            if (cancelled) return
            if (error) {
            console.error('Error cargando perfil:', error)
            setProfile(null)
            } else {
            setProfile(data)
            }
            setLoading(false)
        })

        return () => { cancelled = true }
    }, [session])

    const value = {
        session,
        user: session?.user ?? null,
        profile,
        pharmacyId: profile?.pharmacy_id ?? null,
        pharmacy: profile?.pharmacies ?? null,
        loading,
        signIn: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),
        signUp: (email, password, metadata) =>
        supabase.auth.signUp({ email, password, options: { data: metadata } }),
        signOut: () => supabase.auth.signOut(),
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}