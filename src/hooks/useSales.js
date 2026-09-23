import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useSales() {
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const query = useCallback(() => {
        return supabase
        .from('sales')
        .select('id, quantity, unit_price, total, created_at, medications(name, concentration, unit)')
        .order('created_at', { ascending: false })
    }, [])

    useEffect(() => {
        let cancelled = false
        query().then(({ data, error }) => {
        if (cancelled) return
        if (error) {
            console.error(error)
            setError(error.message)
        } else {
            setSales(data ?? [])
            setError(null)
        }
        setLoading(false)
        })
        return () => { cancelled = true }
    }, [query])

    const refetch = useCallback(async () => {
        const { data, error } = await query()
        if (error) {
        console.error(error)
        setError(error.message)
        } else {
        setSales(data ?? [])
        setError(null)
        }
    }, [query])

    return { sales, loading, error, refetch }
}