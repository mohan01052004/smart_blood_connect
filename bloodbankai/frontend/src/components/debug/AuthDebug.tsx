import { useState, useEffect } from 'react'
import { Box, Typography, Button, Alert } from '@mui/material'
import { apiClient } from '../../api/apiClient'

const AuthDebug = () => {
  const [token, setToken] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<string>('Checking...')
  const [backendStatus, setBackendStatus] = useState<string>('Checking...')

  useEffect(() => {
    checkAuth()
    checkBackend()
  }, [])

  const checkAuth = async () => {
    const storedToken = localStorage.getItem('blood_bank_token')
    setToken(storedToken)
    
    if (!storedToken) {
      setAuthStatus('No token found - Please login')
      return
    }

    try {
      const response = await apiClient.auth.getProfile()
      setAuthStatus(`Authenticated as: ${response.data.name}`)
    } catch (error: any) {
      setAuthStatus(`Auth failed: ${error.response?.status} - ${error.message}`)
    }
  }

  const checkBackend = async () => {
    try {
      // Test basic endpoint
      const testResponse = await fetch('/api/test')
      const testData = await testResponse.json()
      

      // Test data endpoint
      const dataResponse = await fetch('/api/test-data')
      const dataResult = await dataResponse.json()
      
      setBackendStatus(`Backend OK: ${testData.message} | Found ${dataResult.total_count} emails in DB`)
    } catch (error: any) {
      setBackendStatus(`Backend Error: ${error.message}`)
    }
  }

  const clearToken = () => {
    localStorage.removeItem('blood_bank_token')
    setToken(null)
    setAuthStatus('Token cleared')
  }

  const testLogin = async () => {
    try {
      const response = await apiClient.auth.login({
        email: 'test@bloodbank.com',
        password: 'password123'
      })
      const { access_token } = response.data
      localStorage.setItem('blood_bank_token', access_token)
      setAuthStatus('Test login successful!')
      checkAuth()
    } catch (error: any) {
      setAuthStatus(`Test login failed: ${error.response?.data?.detail || error.message}`)
    }
  }

  return (
    <Box p={2} border={1} borderColor="grey.300" borderRadius={1} mb={2}>
      <Typography variant="h6" mb={2}>Debug Information</Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">Backend Status: {backendStatus}</Typography>
      </Alert>
      
      <Alert severity={token ? 'success' : 'warning'} sx={{ mb: 2 }}>
        <Typography variant="body2">Auth Status: {authStatus}</Typography>
      </Alert>
      
      {token && (
        <Box mb={2}>
          <Typography variant="body2">Token: {token.substring(0, 50)}...</Typography>
          <Button size="small" onClick={clearToken} color="secondary">
            Clear Token
          </Button>
        </Box>
      )}
      
      <Box display="flex" gap={1} flexWrap="wrap">
        <Button size="small" onClick={checkAuth} variant="outlined">
          Recheck Auth
        </Button>
        <Button size="small" onClick={testLogin} variant="contained" color="success">
          Test Login
        </Button>
        <Button 
          size="small" 
          onClick={() => window.location.href = '/login'} 
          variant="contained"
          color="primary"
        >
          Go to Login
        </Button>
      </Box>
    </Box>
  )
}

export default AuthDebug