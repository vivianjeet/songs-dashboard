import { useTheme } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export function SimpleBarChart({ data, xKey, barKey, domain, showXTicks = false, xFontSize, allowDecimals = true }) {
  const theme = useTheme()

  return (
    <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} tick={showXTicks} fontSize={xFontSize} />
      <YAxis domain={domain} allowDecimals={allowDecimals} />
      <Tooltip />
      <Bar dataKey={barKey} fill={theme.palette.primary.main} />
    </BarChart>
  )
}
