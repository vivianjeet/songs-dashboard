export function binDurationsInSeconds(durationsMs, binCount = 10) {
  const seconds = durationsMs.map((ms) => ms / 1000)
  if (seconds.length === 0) return []

  const min = Math.min(...seconds)
  const max = Math.max(...seconds)
  const binWidth = (max - min) / binCount || 1

  const bins = Array.from({ length: binCount }, (_, i) => {
    const rangeStart = min + i * binWidth
    const rangeEnd = rangeStart + binWidth
    return { rangeStart, rangeEnd, count: 0 }
  })

  for (const value of seconds) {
    const bucketIndex = Math.min(binCount - 1, Math.floor((value - min) / binWidth))
    bins[bucketIndex].count += 1
  }

  return bins.map((bin) => ({
    label: `${Math.round(bin.rangeStart)}-${Math.round(bin.rangeEnd)}`,
    count: bin.count,
  }))
}
