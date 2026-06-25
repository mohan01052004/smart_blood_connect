import { Alert, Snackbar } from '@mui/material'

interface Props {
  open: boolean
  message: string
  severity?: 'success' | 'error' | 'warning' | 'info'
  onClose: () => void
}

export default function AppSnackbar({
  open,
  message,
  severity = 'success',
  onClose,
}: Props) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  )
}