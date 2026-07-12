import { useState } from 'react'
import { Box, Tabs, Tab, Alert, CircularProgress } from '@mui/material'
import { useAllSongs } from '../hooks/useAllSongs.js'
import { DanceabilityScatter } from '../components/charts/DanceabilityScatter.jsx'
import { DurationHistogram } from '../components/charts/DurationHistogram.jsx'
import { AcousticnessBar } from '../components/charts/AcousticnessBar.jsx'
import { TempoBar } from '../components/charts/TempoBar.jsx'

const CHARTS = [
  { key: 'danceability', label: 'Danceability', Component: DanceabilityScatter },
  { key: 'duration', label: 'Duration', Component: DurationHistogram },
  { key: 'acousticness', label: 'Acousticness', Component: AcousticnessBar },
  { key: 'tempo', label: 'Tempo', Component: TempoBar },
]

export function ChartsPage() {
  const { songs, loading, error } = useAllSongs()
  const [activeChart, setActiveChart] = useState(CHARTS[0].key)

  const ActiveChartComponent = CHARTS.find((c) => c.key === activeChart).Component

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '100px' }}>
      <Tabs value={activeChart} onChange={(_, value) => setActiveChart(value)}>
        {CHARTS.map((chart) => (
          <Tab key={chart.key} value={chart.key} label={chart.label} />
        ))}
      </Tabs>
      <Box sx={{ p: 3, width: '100%', maxWidth: 800 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">Failed to load chart data: {error.message}</Alert>
        ) : (
          <ActiveChartComponent songs={songs} />
        )}
      </Box>
    </Box>
  )
}
