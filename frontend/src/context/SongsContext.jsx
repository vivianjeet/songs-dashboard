import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { fetchSongs, updateSongRating } from '../api/api.js'
import { compareSongs } from '../utils/sortSongs.js'

const SongsContext = createContext(null)

export function SongsProvider({ children }) {
  const [store, setStore] = useState(new Map())
  const [total, setTotal] = useState(null)
  const [sort, setSortState] = useState('id')
  const [order, setOrderState] = useState('asc')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSongs({ offset: 0, limit: 100, sort: 'id', order: 'asc' })
      setStore(new Map(data.items.map((song, i) => [i, song])))
      setTotal(data.total)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const setSort = useCallback((column, direction) => {
    setStore((prev) => {
      const sorted = [...prev.values()].sort((a, b) => compareSongs(a, b, column, direction))
      return new Map(sorted.map((song, i) => [i, song]))
    })
    setSortState(column)
    setOrderState(direction)
    setPage(0)
  }, [])

  const retry = useCallback(() => {
    loadAll()
  }, [loadAll])

  const updateRating = useCallback(async (index, songId, rating) => {
    let previousSong = null
    setStore((prev) => {
      const current = prev.get(index)
      if (!current || current.id !== songId) return prev
      previousSong = current
      const next = new Map(prev)
      next.set(index, { ...current, rating })
      return next
    })

    try {
      await updateSongRating(songId, rating)
    } catch (err) {
      setError(err)
      if (previousSong) {
        setStore((prev) => {
          const next = new Map(prev)
          next.set(index, previousSong)
          return next
        })
      }
    }
  }, [])

  const value = {
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
    updateRating,
    isFullyLoaded: total !== null && store.size >= total,
  }

  return <SongsContext.Provider value={value}>{children}</SongsContext.Provider>
}

export function useSongsContext() {
  const context = useContext(SongsContext)
  if (context === null) {
    throw new Error('useSongsContext must be used within a SongsProvider')
  }
  return context
}
