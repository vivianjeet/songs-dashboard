import { Paper, Typography, Box } from '@mui/material'
import { ResponsiveContainer } from 'recharts'

export function ChartCard({ title, children }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </Box>
    </Paper>
  )
}
