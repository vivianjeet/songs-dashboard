import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { SongsProvider, useSongsContext } from './SongsContext.jsx'

vi.mock('../api/api.js', () => ({
  fetchSongs: vi.fn(),
  updateSongRating: vi.fn(),
}))

import { fetchSongs } from '../api/api.js'

function makeSongs(offset, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `song-${offset + i}`,
    title: `Song ${offset + i}`,
    danceability: 0.5,
  }))
}

function mockFetchImpl(total = 100) {
  return ({ offset, limit }) => {
    const count = Math.max(0, Math.min(limit, total - offset))
    return Promise.resolve({ items: makeSongs(offset, count), total })
  }
}

describe('SongsContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches the first page with the initial 20-row window', async () => {
    fetchSongs.mockImplementation(mockFetchImpl())
    const { result } = renderHook(() => useSongsContext(), { wrapper: SongsProvider })

    await waitFor(() => expect(result.current.store.size).toBe(20))

    expect(fetchSongs).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 0, limit: 20 }),
    )
  })

  it('navigating to a new page fetches it and prefetches the next page', async () => {
    fetchSongs.mockImplementation(mockFetchImpl())
    const { result } = renderHook(() => useSongsContext(), { wrapper: SongsProvider })
    await waitFor(() => expect(result.current.store.size).toBe(20))
    fetchSongs.mockClear()

    act(() => result.current.setPage(2))

    await waitFor(() => expect(result.current.store.has(20)).toBe(true))
    await waitFor(() => expect(result.current.store.has(30)).toBe(true))

    expect(fetchSongs).toHaveBeenCalledWith(expect.objectContaining({ offset: 20, limit: 10 }))
    expect(fetchSongs).toHaveBeenCalledWith(expect.objectContaining({ offset: 30, limit: 10 }))
  })

  it('does not re-fetch a page that is already cached', async () => {
    fetchSongs.mockImplementation(mockFetchImpl())
    const { result } = renderHook(() => useSongsContext(), { wrapper: SongsProvider })
    await waitFor(() => expect(result.current.store.size).toBe(20))

    act(() => result.current.setPage(1))
    await waitFor(() => expect(result.current.store.has(20)).toBe(true))

    fetchSongs.mockClear()
    act(() => result.current.setPage(0))

    await new Promise((r) => setTimeout(r, 0))
    expect(fetchSongs).not.toHaveBeenCalledWith(expect.objectContaining({ offset: 0 }))
  })

  it('changing sort while not fully loaded resets the cache and re-fetches from the server', async () => {
    fetchSongs.mockImplementation(mockFetchImpl())
    const { result } = renderHook(() => useSongsContext(), { wrapper: SongsProvider })
    await waitFor(() => expect(result.current.store.size).toBe(20))
    fetchSongs.mockClear()

    act(() => result.current.setSort('tempo', 'desc'))

    await waitFor(() =>
      expect(fetchSongs).toHaveBeenCalledWith(
        expect.objectContaining({ offset: 0, limit: 20, sort: 'tempo', order: 'desc' }),
      ),
    )
  })

  it('evicts the oldest cached page once the cache exceeds the 500-row cap', async () => {
    fetchSongs.mockImplementation(mockFetchImpl(1000))
    const { result } = renderHook(() => useSongsContext(), { wrapper: SongsProvider })
    await waitFor(() => expect(result.current.store.size).toBe(20))

    for (let p = 2; p <= 60; p++) {
      act(() => result.current.setPage(p))
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(result.current.store.has(p * 10)).toBe(true))
    }

    expect(result.current.store.size).toBeLessThanOrEqual(500)
    expect(result.current.store.has(0)).toBe(false)
    expect(result.current.store.has(600)).toBe(true)
  })

  it('loadAll fetches everything once and is a no-op on subsequent calls', async () => {
    fetchSongs.mockImplementation(mockFetchImpl())
    const { result } = renderHook(() => useSongsContext(), { wrapper: SongsProvider })
    await waitFor(() => expect(result.current.store.size).toBe(20))
    fetchSongs.mockClear()

    await act(async () => {
      await result.current.loadAll()
    })

    expect(result.current.store.size).toBe(100)
    expect(result.current.isFullyLoaded).toBe(true)
    expect(fetchSongs).toHaveBeenCalledTimes(1)

    fetchSongs.mockClear()
    await act(async () => {
      await result.current.loadAll()
    })
    expect(fetchSongs).not.toHaveBeenCalled()
  })

  it('loadAll pages through the full dataset when it exceeds a single request', async () => {
    fetchSongs.mockImplementation(mockFetchImpl(2500))
    const { result } = renderHook(() => useSongsContext(), { wrapper: SongsProvider })
    await waitFor(() => expect(result.current.store.size).toBe(20))
    fetchSongs.mockClear()

    await act(async () => {
      await result.current.loadAll()
    })

    expect(result.current.store.size).toBe(2500)
    expect(result.current.isFullyLoaded).toBe(true)
    expect(fetchSongs).toHaveBeenCalledTimes(3)
    expect(fetchSongs).toHaveBeenNthCalledWith(1, expect.objectContaining({ offset: 0, limit: 1000 }))
    expect(fetchSongs).toHaveBeenNthCalledWith(2, expect.objectContaining({ offset: 1000, limit: 1000 }))
    expect(fetchSongs).toHaveBeenNthCalledWith(3, expect.objectContaining({ offset: 2000, limit: 1000 }))
  })
})
