import { ChartCard } from './ChartCard.jsx'
import { SimpleBarChart } from './SimpleBarChart.jsx'

export function TempoBar({ songs }) {
  const data = songs.map((song) => ({ title: song.title, tempo: song.tempo }))

  return (
    <ChartCard title="Tempo">
      <SimpleBarChart data={data} xKey="title" barKey="tempo" />
    </ChartCard>
  )
}
