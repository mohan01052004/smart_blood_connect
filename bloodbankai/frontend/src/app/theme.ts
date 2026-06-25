import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#C62828', // Blood red
    },
    background: {
      default: '#F6F1EE',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F1F1F',
      secondary: '#6B6B6B',
    },
  },
  typography: {
    fontFamily: `'Inter', 'Roboto', sans-serif`,
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
})
