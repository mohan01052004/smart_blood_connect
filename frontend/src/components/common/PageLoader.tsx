import { Box, CircularProgress } from '@mui/material'

export default function PageLoader() {
  return (
    <Box
      height="300px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress color="error" />
    </Box>
  )
}