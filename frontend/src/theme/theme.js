import { createTheme } from '@mui/material/styles'

export function createAppTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#00695c',
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: '"Source Code Pro", monospace',
    },
  })
}
