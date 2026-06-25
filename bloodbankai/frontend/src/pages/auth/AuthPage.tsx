import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
// Removed FavoriteIcon import - using blood drop emoji instead
import { useBloodBankStore } from '../../store/bloodbank.store'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AuthPage() {
  const navigate = useNavigate()
  const { login, signup, isLoading, error } = useBloodBankStore()
  const [tabValue, setTabValue] = useState(0)

  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  })

  // Signup form
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(loginData.email, loginData.password)
      navigate('/app/dashboard')
    } catch {
      // Error is handled in store
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    try {
      await signup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone || null,
        address: signupData.address || null,
        latitude: parseFloat(signupData.latitude),
        longitude: parseFloat(signupData.longitude),
      })
      navigate('/app/dashboard')
    } catch {
      // Error is handled in store
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '"🩸"',
          position: 'absolute',
          fontSize: '200px',
          opacity: 0.1,
          top: '20%',
          left: '10%',
          zIndex: 0,
        },
        '&::after': {
          content: '"🩸"',
          position: 'absolute',
          fontSize: '150px',
          opacity: 0.08,
          bottom: '15%',
          right: '15%',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Paper elevation={10} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
            <Box sx={{ fontSize: '40px', mr: 1 }}>🩸</Box>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              Blood Dot
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Tabs */}
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth">
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>

          {/* Login Tab */}
          <TabPanel value={tabValue} index={0}>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                margin="normal"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </form>
          </TabPanel>

          {/* Signup Tab */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={handleSignup}>
              <TextField
                fullWidth
                label="Blood Bank Name"
                variant="outlined"
                margin="normal"
                value={signupData.name}
                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                margin="normal"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                margin="normal"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Phone (optional)"
                variant="outlined"
                margin="normal"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
              />
              <TextField
                fullWidth
                label="Address (optional)"
                variant="outlined"
                margin="normal"
                value={signupData.address}
                onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <TextField
                  label="Latitude *"
                  type="text"
                  inputMode="decimal"
                  variant="outlined"
                  value={signupData.latitude}
                  onChange={(e) => {
                    const val = e.target.value
                    if (/^-?\d*\.?\d*$/.test(val)) setSignupData({ ...signupData, latitude: val })
                  }}
                  placeholder="e.g., 12.9586"
                  required
                  inputProps={{ pattern: '-?[0-9]*\\.?[0-9]*' }}
                />
                <TextField
                  label="Longitude *"
                  type="text"
                  inputMode="decimal"
                  variant="outlined"
                  value={signupData.longitude}
                  onChange={(e) => {
                    const val = e.target.value
                    if (/^-?\d*\.?\d*$/.test(val)) setSignupData({ ...signupData, longitude: val })
                  }}
                  placeholder="e.g., 77.7012"
                  required
                  inputProps={{ pattern: '-?[0-9]*\\.?[0-9]*' }}
                />
              </Box>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 3 }}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
              </Button>
            </form>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  )
}
