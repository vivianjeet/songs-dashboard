import { Paper, Typography, Box } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function TempoBar({ songs }) {
  const data = songs.map((song) => ({ title: song.title, tempo: song.tempo }))

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Tempo
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" tick={false} />
            <YAxis />
            <Tooltip labelFormatter={(label) => label} />
            <Bar dataKey="tempo" fill="#00695c" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}
