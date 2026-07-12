import { useEffect, useRef, useState } from 'react'
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState(null)
  const debouncedInput = useDebouncedValue(inputValue, 300)
  const requestIdRef = useRef(0)
  const suppressSuggestionsRef = useRef(false)

  useEffect(() => {
    const requestId = ++requestIdRef.current
    if (suppressSuggestionsRef.current || debouncedInput.length === 0) {
      setSuggestions([])
      return
    }
    if (isFullyLoaded) {
      setSuggestions(localSuggestions(store, debouncedInput))
      return
    }
    const controller = new AbortController()
    suggestSongTitles(debouncedInput, controller.signal)
      .then((results) => {
        if (requestIdRef.current === requestId) setSuggestions(results)
      })
      .catch((err) => {
        if (requestIdRef.current === requestId && err.name !== 'AbortError') setError(err)
      })
    return () => {
      controller.abort()
    }
  }, [debouncedInput, isFullyLoaded, store])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [suggestions])

  const runSearch = async (title) => {
    if (title.length === 0) return
    requestIdRef.current += 1
    suppressSuggestionsRef.current = true
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
    setInputValue(title)
    runSearch(title)
  }

  const handleInputChange = (e) => {
    suppressSuggestionsRef.current = false
    setInputValue(e.target.value)
    setNotFound(false)
    onClear()
  }

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0) {
        e.preventDefault()
        handleSuggestionClick(suggestions[highlightedIndex].title)
      }
    } else if (e.key === 'Escape') {
      setSuggestions([])
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          placeholder="Search by song title"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={suggestions.length > 0}
          aria-controls="search-suggestions-list"
          aria-activedescendant={
            highlightedIndex >= 0 ? `suggestion-${suggestions[highlightedIndex]?.id}` : undefined
          }
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
        <Button
          size="small"
          onClick={() => {
            requestIdRef.current += 1
            suppressSuggestionsRef.current = false
            setInputValue('')
            setNotFound(false)
            setSuggestions([])
            onClear()
          }}
          sx={{ visibility: hasResult ? 'visible' : 'hidden' }}
        >
          Clear search
        </Button>
      </Box>

      {suggestions.length > 0 && (
        <Paper sx={{ position: 'absolute', top: '100%', mt: 0.5, zIndex: 10, minWidth: 280 }}>
          <List dense id="search-suggestions-list" role="listbox">
            {suggestions.map((s, i) => (
              <ListItemButton
                key={s.id}
                id={`suggestion-${s.id}`}
                role="option"
                aria-selected={i === highlightedIndex}
                selected={i === highlightedIndex}
                onClick={() => handleSuggestionClick(s.title)}
                onMouseEnter={() => setHighlightedIndex(i)}
              >
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
