import {
  Button,
  TextField,
  Paper,
  Stack,
  Typography,
  Link,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../../store/auth.store'

const Register = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const [bankName, setBankName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = () => {
    if (!bankName || !email || !password || !confirmPassword) return
    if (password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    login(email)
    navigate('/app/dashboard')
  }

  return (
    <Paper elevation={3} sx={{ p: 4, bgcolor: 'white' }}>
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={600}>
          Create Account
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Register your blood bank to continue.
        </Typography>

        <TextField
          label="Blood Bank Name"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          fullWidth
        />

        <TextField
          label="Email"
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

        <TextField
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
        />

        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleRegister}
        >
          Sign Up
        </Button>

        <Typography variant="body2" textAlign="center">
          Already have an account?{' '}
          <Link component="button" onClick={() => navigate('/')}>
            Log in
          </Link>
        </Typography>
      </Stack>
    </Paper>
  )
}

export default Register
