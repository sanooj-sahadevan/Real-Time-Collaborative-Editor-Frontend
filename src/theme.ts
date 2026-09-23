import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#d97706', contrastText: '#fffaf0' },
    secondary: { main: '#263238' },
    background: { default: '#f6f3ed', paper: '#fffdf8' },
    text: { primary: '#20252b', secondary: '#667078' },
    divider: '#e6e0d6',
    error: { main: '#c2413b' },
  },
  typography: {
    fontFamily: '"DM Sans", "Helvetica Neue", sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: '-0.03em' },
    h2: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600, letterSpacing: '-0.025em' },
    h3: { fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10, paddingInline: 16 } } },
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
  },
});