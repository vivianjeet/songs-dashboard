import { useMemo, useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  ThemeProvider,
  CssBaseline,
} from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { createAppTheme } from './theme/theme.js'
import { SongsTable, TABLE_WIDTH } from './components/SongsTable.jsx'

const CONTENT_PADDING = 48

function App() {
  const [mode, setMode] = useState('light')
  const theme = useMemo(() => createAppTheme(mode), [mode])

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', minWidth: TABLE_WIDTH + CONTENT_PADDING, position: 'relative' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ flex: 1 }}>
              Songs Dashboard
            </Typography>
            <IconButton onClick={toggleMode} color="inherit" aria-label="toggle dark mode">
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            position: 'absolute',
            top: 'calc(35vh - 269px)',
            left: '50%',
            transform: 'translateX(-50%)',
            px: 3,
          }}
        >
          <SongsTable />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
