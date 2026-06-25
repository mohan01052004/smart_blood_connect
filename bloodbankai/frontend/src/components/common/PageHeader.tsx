import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  subtitle?: string
  icon?: ReactNode
}

const PageHeader = ({ title, subtitle, icon }: PageHeaderProps) => {
  return (
    <Box mb={4}>
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography variant="h4" fontWeight={600} sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          {title}
        </Typography>
      </Box>

      {subtitle && (
        <Typography color="text.secondary" mt={0.5} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

export default PageHeader
