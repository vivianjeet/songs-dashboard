import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchSongs } from '../api/api.js'
import { compareSongs } from '../utils/sortSongs.js'

const PAGE_SIZE = 10
const STORE_CAP = 100

export function useSongs() {
    const [store, setStore] = useState(new Map())
    const [total, setTotal] = useState(null)
    const [sort, setSortState] = useState('id')
    const [order, setOrderState] = useState('asc')
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const inFlight = useRef(new Set())

    const isFullyLoadedRef = useRef(false)
    useEffect(() => {
        isFullyLoadedRef.current = total !== null && store.size >= total
    }, [store, total])


    const loadRange = useCallback(
        async (start, count) => {
            const key = `${start}:${count}:${sort}:${order}`
            if (inFlight.current.has(key)) return
            inFlight.current.add(key)
            setLoading(true)
            setError(null)
            try {
                const data = await fetchSongs({ offset: start, limit: count, sort, order })
                setStore((prev) => {
                    const next = new Map(prev)
                    data.items.forEach((song, i) => next.set(start + i, song))
                    if (next.size > STORE_CAP) {
                        const excess = next.size - STORE_CAP
                        const keys = [...next.keys()].sort((a,b) => Math.abs(a - page) - Math.abs(b - page))
                        keys.slice(-excess).forEach((k) => next.delete(k))
                    }
                    return next
                })
                setTotal(data.total)
            } catch (err) {
                setError(err)
            } finally {
                inFlight.current.delete(key)
                setLoading(false)
            }
        },[sort, order, page]
    )

    useEffect(() => {
        const windowStart = Math.max(0, (page - 1)*PAGE_SIZE)
        const windowEnd = total === null ? (page + 2) * PAGE_SIZE : Math.min(total, (page + 2) * PAGE_SIZE)

        const missingRanges = []
        let rangeStart = null
        for (let i = windowStart; i < windowEnd; i++){
            if (!store.has(i)) {
                if (rangeStart === null) rangeStart = i
            } else if (rangeStart !== null) {
                missingRanges.push([rangeStart, i - rangeStart])
                rangeStart = null
            }
        }

        if (rangeStart != null) {
            missingRanges.push([rangeStart, windowEnd - rangeStart])
        }

        missingRanges.forEach(([start, count]) => loadRange(start, count))
    }, [page, store, total, loadRange])

    const setSort = useCallback((column, direction) => {
        if (isFullyLoadedRef.current) {
            setStore((prev) => {
            const sorted = [...prev.values()].sort((a, b) => compareSongs(a, b, column, direction))
            return new Map(sorted.map((song, i) => [i, song]))
            })
            setSortState(column)
            setOrderState(direction)
            setPage(0)
            return
        }
        setStore(new Map())
        setTotal(null)
        setPage(0)
        setSortState(column)
        setOrderState(direction)
    }, [])

    const retry = useCallback(() => {
        setStore(new Map())
        loadRange(page*PAGE_SIZE, PAGE_SIZE)
    }, [page, loadRange])

    return {
        store,
        total,
        page,
        setPage,
        sort,
        order,
        setSort,
        loading,
        error,
        retry,
        isFullyLoaded: total !== null && store.size >= total
    }
}