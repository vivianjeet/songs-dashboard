import { describe, it, expect } from 'vitest'
import { compareSongs } from './sortSongs.js'

describe('compareSongs', () => {
  it('sorts numeric columns ascending', () => {
    const a = { tempo: 100 }
    const b = { tempo: 120 }
    expect(compareSongs(a, b, 'tempo', 'asc')).toBeLessThan(0)
  })

  it('sorts numeric columns descending', () => {
    const a = { tempo: 100 }
    const b = { tempo: 120 }
    expect(compareSongs(a, b, 'tempo', 'desc')).toBeGreaterThan(0)
  })

  it('sorts string columns ascending using locale comparison', () => {
    const a = { title: 'Apple' }
    const b = { title: 'Banana' }
    expect(compareSongs(a, b, 'title', 'asc')).toBeLessThan(0)
  })

  it('sorts string columns descending', () => {
    const a = { title: 'Apple' }
    const b = { title: 'Banana' }
    expect(compareSongs(a, b, 'title', 'desc')).toBeGreaterThan(0)
  })

  it('returns 0 for equal values', () => {
    const a = { tempo: 100 }
    const b = { tempo: 100 }
    expect(compareSongs(a, b, 'tempo', 'asc')).toBe(0)
  })

  it('produces a symmetric result when comparands are swapped', () => {
    const a = { title: 'Apple' }
    const b = { title: 'Banana' }
    const forward = compareSongs(a, b, 'title', 'asc')
    const backward = compareSongs(b, a, 'title', 'asc')
    expect(Math.sign(forward)).toBe(-Math.sign(backward))
  })
})
