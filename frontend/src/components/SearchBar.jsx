import { useEffect, useState } from 'react'
import { Box, TextField, Button, Paper, List, ListItemButton, ListItemText, Alert } from '@mui/material'
import { searchSongByTitle, suggestSongTitles } from '../api/api.js'
import { useDebouncedValue } from '../hooks/useDebouncedValue.js'

function localSuggestions(store, query) {
  const needle = query.toLowerCase()
  const matches = []
  for (const song of store.values()) {
    if (song.title.toLowerCase().includes(needle)) {
      matches.push({ id: song.id, title: song.title })
      if (matches.length >= 10) break
    }
  }
  return matches
}

function localExactMatch(store, title) {
  const needle = title.toLowerCase()
  for (const song of store.values()) {
    if (song.title.toLowerCase() === needle) return song
  }
  return null
}

export function SearchBar({ store, isFullyLoaded, onResult, onClear, hasResult }) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const debouncedInput = useDebouncedValue(inputValue, 300)
  const [lastSearchedQuery, setLastSearchedQuery] = useState(null)

  useEffect(() => {
    if (debouncedInput.length === 0 || debouncedInput === lastSearchedQuery) {
      setSuggestions([])
      return
    }
    if (isFullyLoaded) {
      setSuggestions(localSuggestions(store, debouncedInput))
      return
    }
    let cancelled = false
    const controller = new AbortController()
    suggestSongTitles(debouncedInput, controller.signal)
      .then((results) => {
        if (!cancelled) setSuggestions(results)
      })
      .catch((err) => {
        if (!cancelled && err.name !== 'AbortError') setError(err)
      })
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debouncedInput, isFullyLoaded, store, lastSearchedQuery])

  const runSearch = async (title) => {
    if (title.length === 0) return
    setLastSearchedQuery(title)
    setError(null)
    setNotFound(false)
    setSuggestions([])

    if (isFullyLoaded) {
      const match = localExactMatch(store, title)
      if (match) {
        onResult(match)
      } else {
        setNotFound(true)
      }
      return
    }

    try {
      const song = await searchSongByTitle(title)
      if (song) {
        onResult(song)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      setError(err)
    }
  }

  const handleSuggestionClick = (title) => {
    setSuggestions([])
    setInputValue(title)
    runSearch(title)
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    setNotFound(false)
    onClear()
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by song title"
          value={inputValue}
          onChange={handleInputChange}
          sx={{ minWidth: 280 }}
        />
        <Button
          variant="contained"
          onClick={() => {
            setSuggestions([])
            runSearch(inputValue)
          }}
        >
          Get Song
        </Button>
        {hasResult && (
          <Button
            size="small"
            onClick={() => {
              setInputValue('')
              setLastSearchedQuery(null)
              setNotFound(false)
              setSuggestions([])
              onClear()
            }}
          >
            Clear search
          </Button>
        )}
      </Box>

      {suggestions.length > 0 && (
        <Paper sx={{ position: 'absolute', top: '100%', mt: 0.5, zIndex: 10, minWidth: 280 }}>
          <List dense>
            {suggestions.map((s) => (
              <ListItemButton key={s.id} onClick={() => handleSuggestionClick(s.title)}>
                <ListItemText primary={s.title} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      {notFound && (
        <Alert severity="warning" sx={{ mt: 1, maxWidth: 400 }}>
          No song found with that title.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 1, maxWidth: 400 }}>
          {error.message}
        </Alert>
      )}
    </Box>
  )
}
