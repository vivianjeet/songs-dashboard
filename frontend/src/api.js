const BASE_URL = '/api'

export async function fetchSongs({ offset, limit, sort, order}, signal){
    const params = new URLSearchParams({
        offset: String(offset),
        limit: String(limit),
        sort,
        order
    })
    const response = await fetch(`${BASE_URL}/songs?${params}`, {signal})
    if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.status}`)
    }
    return response.json()
}

export async function searchSongByTitle(title, signal) {
    const params = new URLSearchParams({ title })
    const response = await fetch(`${BASE_URL}/songs/search?${params}`, {signal})
    if (response.status === 404) {
        return null
    }
    if (!response.ok) {
        throw new Error(`Failed to search songs: ${response.status}`)
    }
    return response.json()
}

export async function updateSongRating(songId, rating, signal) {
    const response = await fetch(`${BASE_URL}/songs/${songId}/rating`, {
        signal,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ rating })
    })
    if (!response.ok) {
        throw new Error(`Failed to update rating: ${response.status}`)
    }
    return response.json()
}

export async function suggestSongTitles(title, signal) {
    const params = new URLSearchParams({ title })
    const response = await fetch(`${BASE_URL}/songs/suggestions?${params}`, {signal})
    if (!response.ok) {
        throw new Error(`Failed to fetch Suggestions: ${response.status}`)
    }
    return response.json()
}