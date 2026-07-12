import { Paper, Typography, Box } from '@mui/material'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export function DanceabilityScatter({ songs }) {
  const data = songs.map((song) => ({
    title: song.title,
    danceability: song.danceability,
    energy: song.energy,
  }))

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Danceability vs Energy
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="danceability" name="Danceability" domain={[0, 1]} />
            <YAxis type="number" dataKey="energy" name="Energy" domain={[0, 1]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value) => value.toFixed(3)}
              labelFormatter={() => ''}
            />
            <Scatter data={data} fill="#00695c" />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
