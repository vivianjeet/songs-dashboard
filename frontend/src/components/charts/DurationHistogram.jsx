import { binDurationsInSeconds } from '../../utils/binning.js'
import { ChartCard } from './ChartCard.jsx'
import { SimpleBarChart } from './SimpleBarChart.jsx'

export function DurationHistogram({ songs }) {
  const data = binDurationsInSeconds(songs.map((song) => song.duration_ms))

  return (
    <ChartCard title="Duration Distribution (seconds)">
      <SimpleBarChart data={data} xKey="label" barKey="count" showXTicks xFontSize={11} allowDecimals={false} />
    </ChartCard>
  )
}
