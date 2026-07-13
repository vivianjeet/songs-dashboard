import { ChartCard } from './ChartCard.jsx'
import { SimpleBarChart } from './SimpleBarChart.jsx'

export function AcousticnessBar({ songs }) {
  const data = songs.map((song) => ({ title: song.title, acousticness: song.acousticness }))

  return (
    <ChartCard title="Acousticness">
      <SimpleBarChart data={data} xKey="title" barKey="acousticness" domain={[0, 1]} />
    </ChartCard>
  )
}
