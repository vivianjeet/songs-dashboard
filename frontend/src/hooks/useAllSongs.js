import { useEffect, useState } from 'react'
import { fetchSongs } from '../api/api.js'

export function useAllSongs() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)
    fetchSongs({ offset: 0, limit: 100, sort: 'id', order: 'asc' }, controller.signal)
      .then((data) => setSongs(data.items))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  return { songs, loading, error }
}
