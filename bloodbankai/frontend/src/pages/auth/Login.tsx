import { Button, TextField, Paper, Stack, Typography, Link, Alert } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { apiClient } from '../../api/apiClient'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await apiClient.auth.login({ email, password })
      const { access_token } = response.data
      
      // Store the token
      localStorage.setItem('blood_bank_token', access_token)
      
      // Navigate to dashboard
      navigate('/app/dashboard')
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper elevation={3} sx={{ p: 4, bgcolor: 'white' }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={600}>
          Welcome Back
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Enter your credentials to log in.
        </Typography>

        {error && (
          <Alert severity="error">{error}</Alert>
        )}

        <TextField
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleLogin}
          disabled={loading || !email || !password}
          sx={{ mt: 1 }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        {/* Signup link */}
        <Typography variant="body2" textAlign="center">
          Don’t have an account?{' '}
          <Link
            component="button"
            onClick={() => navigate('/register')}
            underline="hover"
            color="primary"
          >
            Sign up
          </Link>
        </Typography>
      </Stack>
    </Paper>
  )
}

export default Login
