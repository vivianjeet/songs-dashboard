import { Paper, Typography, Box } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { binDurationsInSeconds } from '../../utils/binning.js'

export function DurationHistogram({ songs }) {
  const data = binDurationsInSeconds(songs.map((song) => song.duration_ms))

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Duration Distribution (seconds)
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" fontSize={11} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#00695c" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
