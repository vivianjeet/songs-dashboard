import { useMemo, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Box, IconButton, Button, ThemeProvider, CssBaseline } from '@mui/material'
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { createAppTheme } from './theme/theme.js'
import { SongsPage } from './pages/SongsPage.jsx'
import { ChartsPage } from './pages/ChartsPage.jsx'

function App() {
  const [mode, setMode] = useState('light')
  const theme = useMemo(() => createAppTheme(mode), [mode])
  const location = useLocation()

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="h1" sx={{ mr: 4 }}>
              Songs Dashboard
            </Typography>
            <Button
              component={Link}
              to="/"
              color="inherit"
              sx={{ fontWeight: location.pathname === '/' ? 700 : 400 }}
            >
              Home
            </Button>
            <Button
              component={Link}
              to="/charts"
              color="inherit"
              sx={{ fontWeight: location.pathname === '/charts' ? 700 : 400 }}
            >
              Charts
            </Button>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={toggleMode} color="inherit" aria-label="toggle dark mode">
              {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<SongsPage />} />
          <Route path="/charts" element={<ChartsPage />} />
        </Routes>
      </Box>
    </ThemeProvider>
  )
}

export default App
