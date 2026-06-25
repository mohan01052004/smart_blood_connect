import { Box, Typography } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'

interface Props {
  title: string
  subtitle?: string
}

export default function EmptyState({ title, subtitle }: Props) {
  return (
    <Box
      textAlign="center"
      py={6}
      color="text.secondary"
    >
      <InboxIcon fontSize="large" />
      <Typography variant="h6" mt={1}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2">
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}