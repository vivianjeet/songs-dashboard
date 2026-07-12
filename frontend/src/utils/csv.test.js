import { describe, it, expect } from 'vitest'
import { buildCsv } from './csv.js'

const COLUMNS = [
  { key: 'title', label: 'Title' },
  { key: 'rating', label: 'Rating' },
]

describe('buildCsv', () => {
  it('builds a header row from column labels', () => {
    const csv = buildCsv(COLUMNS, [])
    expect(csv).toBe('Title,Rating')
  })

  it('builds one line per row in column order', () => {
    const rows = [{ title: '3AM', rating: 4 }]
    const csv = buildCsv(COLUMNS, rows)
    expect(csv).toBe('Title,Rating\r\n3AM,4')
  })

  it('escapes fields containing a comma', () => {
    const rows = [{ title: 'Baby, Come Back', rating: 3 }]
    const csv = buildCsv(COLUMNS, rows)
    expect(csv).toContain('"Baby, Come Back"')
  })

  it('escapes fields containing a double quote by doubling it', () => {
    const rows = [{ title: 'She said "hi"', rating: 3 }]
    const csv = buildCsv(COLUMNS, rows)
    expect(csv).toContain('"She said ""hi"""')
  })

  it('escapes fields containing a newline', () => {
    const rows = [{ title: 'Line1\nLine2', rating: 3 }]
    const csv = buildCsv(COLUMNS, rows)
    expect(csv).toContain('"Line1\nLine2"')
  })

  it('does not quote plain fields', () => {
    const rows = [{ title: 'Clocks', rating: 5 }]
    const csv = buildCsv(COLUMNS, rows)
    expect(csv).toContain('Clocks,5')
    expect(csv).not.toContain('"Clocks"')
  })

  it('renders null or undefined values as N/A', () => {
    const rows = [{ title: 'Untitled', rating: null }]
    const csv = buildCsv(COLUMNS, rows)
    expect(csv).toContain('Untitled,N/A')
  })

  it('joins multiple rows with CRLF line endings', () => {
    const rows = [
      { title: 'Song A', rating: 1 },
      { title: 'Song B', rating: 2 },
    ]
    const csv = buildCsv(COLUMNS, rows)
    expect(csv.split('\r\n')).toHaveLength(3)
  })
})
