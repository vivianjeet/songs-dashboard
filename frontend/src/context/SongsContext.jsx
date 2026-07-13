import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { fetchSongs, updateSongRating } from '../api/api.js'
import { compareSongs } from '../utils/sortSongs.js'

const SongsContext = createContext(null)

const PAGE_SIZE = 10
const INITIAL_FETCH_SIZE = 20
const MAX_CACHED_ROWS = 500
const LOAD_ALL_PAGE_SIZE = 1000

export function SongsProvider({ children }) {
  const [store, setStore] = useState(new Map())
  const [total, setTotal] = useState(null)
  const [sort, setSortState] = useState('id')
  const [order, setOrderState] = useState('asc')
  const [page, setPageState] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isFullyLoaded, setIsFullyLoaded] = useState(false)

  const pageLoadOrderRef = useRef([])
  const loadedPagesRef = useRef(new Set())
  const inFlightPagesRef = useRef(new Map())
  const isFullyLoadedRef = useRef(false)
  const sortRef = useRef({ sort: 'id', order: 'asc' })

  const resetCache = useCallback(() => {
    pageLoadOrderRef.current = []
    loadedPagesRef.current = new Set()
    inFlightPagesRef.current = new Map()
    isFullyLoadedRef.current = false
    setStore(new Map())
    setIsFullyLoaded(false)
  }, [])

  const rememberPageLoaded = useCallback((pageNumber) => {
    if (!loadedPagesRef.current.has(pageNumber)) {
      loadedPagesRef.current.add(pageNumber)
      pageLoadOrderRef.current.push(pageNumber)
    }
  }, [])

  const evictIfNeeded = useCallback((keepPages) => {
    if (isFullyLoadedRef.current) return
    setStore((prev) => {
      if (prev.size <= MAX_CACHED_ROWS) return prev
      let next = prev
      let mutated = false
      while (next.size > MAX_CACHED_ROWS && pageLoadOrderRef.current.length > 0) {
        const oldestPage = pageLoadOrderRef.current[0]
        if (keepPages.has(oldestPage)) break
        pageLoadOrderRef.current.shift()
        loadedPagesRef.current.delete(oldestPage)
        if (!mutated) {
          next = new Map(prev)
          mutated = true
        }
        const start = oldestPage * PAGE_SIZE
        for (let i = start; i < start + PAGE_SIZE; i++) next.delete(i)
      }
      return mutated ? next : prev
    })
  }, [])

  const fetchPage = useCallback(
    (pageNumber, { limit = PAGE_SIZE, silent = false } = {}) => {
      if (loadedPagesRef.current.has(pageNumber)) return Promise.resolve()
      if (inFlightPagesRef.current.has(pageNumber)) return inFlightPagesRef.current.get(pageNumber)

      const offset = pageNumber * PAGE_SIZE
      if (!silent) {
        setLoading(true)
        setError(null)
      }

      const request = fetchSongs({ offset, limit, sort: sortRef.current.sort, order: sortRef.current.order })
        .then((data) => {
          setStore((prev) => {
            const next = new Map(prev)
            data.items.forEach((song, i) => next.set(offset + i, song))
            return next
          })
          setTotal(data.total)
          for (let p = pageNumber; p * PAGE_SIZE < offset + data.items.length; p++) {
            rememberPageLoaded(p)
          }
        })
        .catch((err) => {
          if (!silent) setError(err)
        })
        .finally(() => {
          inFlightPagesRef.current.delete(pageNumber)
          if (!silent) setLoading(false)
        })

      inFlightPagesRef.current.set(pageNumber, request)
      return request
    },
    [rememberPageLoaded],
  )

  const ensurePage = useCallback(
    async (pageNumber) => {
      await fetchPage(pageNumber)
      evictIfNeeded(new Set([pageNumber, pageNumber + 1]))
      fetchPage(pageNumber + 1, { silent: true }).then(() =>
        evictIfNeeded(new Set([pageNumber, pageNumber + 1])),
      )
    },
    [fetchPage, evictIfNeeded],
  )

  useEffect(() => {
    fetchPage(0, { limit: INITIAL_FETCH_SIZE })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setPage = useCallback(
    (newPage) => {
      setPageState(newPage)
      ensurePage(newPage)
    },
    [ensurePage],
  )

  const setSort = useCallback(
    (column, direction) => {
      sortRef.current = { sort: column, order: direction }
      setSortState(column)
      setOrderState(direction)
      setPageState(0)

      if (isFullyLoadedRef.current) {
        setStore((prev) => {
          const sorted = [...prev.values()].sort((a, b) => compareSongs(a, b, column, direction))
          return new Map(sorted.map((song, i) => [i, song]))
        })
        return
      }

      resetCache()
      fetchPage(0, { limit: INITIAL_FETCH_SIZE })
    },
    [resetCache, fetchPage],
  )

  const retry = useCallback(() => {
    resetCache()
    fetchPage(page, { limit: page === 0 ? INITIAL_FETCH_SIZE : PAGE_SIZE })
  }, [resetCache, fetchPage, page])

  const storeRef = useRef(store)
  storeRef.current = store
  const totalRef = useRef(total)
  totalRef.current = total

  const loadAll = useCallback(async () => {
    if (totalRef.current !== null && storeRef.current.size >= totalRef.current) {
      isFullyLoadedRef.current = true
      setIsFullyLoaded(true)
      return storeRef.current
    }
    setLoading(true)
    setError(null)
    try {
      const fullStore = new Map()
      let offset = 0
      let knownTotal = Infinity

      while (offset < knownTotal) {
        const data = await fetchSongs({
          offset,
          limit: LOAD_ALL_PAGE_SIZE,
          sort: sortRef.current.sort,
          order: sortRef.current.order,
        })
        data.items.forEach((song, i) => fullStore.set(offset + i, song))
        knownTotal = data.total
        offset += data.items.length
        if (data.items.length === 0) break
      }

      setStore(fullStore)
      setTotal(knownTotal)
      isFullyLoadedRef.current = true
      setIsFullyLoaded(true)
      return fullStore
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateRating = useCallback(async (index, songId, rating) => {
    const previousSong = storeRef.current.get(index)
    if (!previousSong || previousSong.id !== songId) return

    setStore((prev) => {
      const next = new Map(prev)
      next.set(index, { ...previousSong, rating })
      return next
    })

    try {
      const updatedSong = await updateSongRating(songId, rating)
      setStore((prev) => {
        const current = prev.get(index)
        if (!current || current.id !== songId) return prev
        if (current.rating === updatedSong.rating) return prev
        const next = new Map(prev)
        next.set(index, updatedSong)
        return next
      })
    } catch (err) {
      setError(err)
      setStore((prev) => {
        const next = new Map(prev)
        next.set(index, previousSong)
        return next
      })
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
    loadAll,
    isFullyLoaded,
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
