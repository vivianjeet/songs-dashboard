import { describe, it, expect } from 'vitest'
import { binDurationsInSeconds } from './binning.js'

describe('binDurationsInSeconds', () => {
  it('returns an empty array for no input', () => {
    expect(binDurationsInSeconds([])).toEqual([])
  })

  it('returns the requested number of bins', () => {
    const bins = binDurationsInSeconds([100000, 200000, 300000], 5)
    expect(bins).toHaveLength(5)
  })

  it('defaults to 10 bins', () => {
    const bins = binDurationsInSeconds([100000, 200000])
    expect(bins).toHaveLength(10)
  })

  it('places every value into some bin (counts sum to input length)', () => {
    const durations = [100000, 150000, 200000, 250000, 300000, 350000]
    const bins = binDurationsInSeconds(durations, 3)
    const total = bins.reduce((sum, bin) => sum + bin.count, 0)
    expect(total).toBe(durations.length)
  })

  it('does not throw when all durations are identical', () => {
    const bins = binDurationsInSeconds([200000, 200000, 200000], 4)
    const total = bins.reduce((sum, bin) => sum + bin.count, 0)
    expect(total).toBe(3)
  })

  it('places the maximum value into the last bin, not overflowing', () => {
    const durations = [100000, 200000, 300000]
    const bins = binDurationsInSeconds(durations, 3)
    expect(bins[bins.length - 1].count).toBeGreaterThanOrEqual(1)
  })

  it('produces labels formatted as "start-end" in seconds', () => {
    const bins = binDurationsInSeconds([100000, 200000], 2)
    expect(bins[0].label).toMatch(/^\d+-\d+$/)
  })
})
