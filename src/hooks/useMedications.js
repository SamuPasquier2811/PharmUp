import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useMedications() {
    const [medications, setMedications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Query base reutilizable
    const query = useCallback(() => {
        return supabase
        .from('medications')
        .select('*, batches(*)')
        .order('name', { ascending: true })
    }, [])

    // Carga inicial: setState SOLO dentro del .then() (async real)
    useEffect(() => {
        let cancelled = false

        query().then(({ data, error }) => {
        if (cancelled) return
        if (error) {
            console.error(error)
            setError(error.message)
        } else {
            setMedications(data ?? [])
            setError(null)
        }
        setLoading(false)
        })

        return () => { cancelled = true }
    }, [query])

    // Refresco manual (con o sin spinner)
    const refetch = useCallback(async ({ silent = false } = {}) => {
        if (!silent) setLoading(true)
        const { data, error } = await query()
        if (error) {
        console.error(error)
        setError(error.message)
        } else {
        setMedications(data ?? [])
        setError(null)
        }
        if (!silent) setLoading(false)
    }, [query])

    return { medications, loading, error, refetch }
}