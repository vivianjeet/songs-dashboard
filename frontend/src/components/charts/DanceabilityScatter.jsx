import { useTheme } from '@mui/material'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartCard } from './ChartCard.jsx'

export function DanceabilityScatter({ songs }) {
  const theme = useTheme()
  const data = songs.map((song) => ({
    title: song.title,
    danceability: song.danceability,
    energy: song.energy,
  }))

  return (
    <ChartCard title="Danceability vs Energy">
      <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="danceability" name="Danceability" domain={[0, 1]} />
        <YAxis type="number" dataKey="energy" name="Energy" domain={[0, 1]} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value) => value.toFixed(3)}
          labelFormatter={() => ''}
        />
        <Scatter data={data} fill={theme.palette.primary.main} />
      </ScatterChart>
    </ChartCard>
  )
}
