import { Outlet } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'

const AuthLayout = () => {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="white"
    >
      <Box textAlign="center" width={420}>
        <FavoriteIcon color="primary" fontSize="large" />
        <Typography variant="h4" mt={1} mb={1}>
          Welcome to Blood Dot
        </Typography>
        <Typography color="text.secondary" mb={4}>
          AI-Powered Blood Availability Network
        </Typography>

        <Outlet />
      </Box>
    </Box>
  )
}

export default AuthLayout
