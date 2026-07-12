import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'

function App() {
  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1">
            Songs Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      </Container>
    </Box>
  )
}

export default App