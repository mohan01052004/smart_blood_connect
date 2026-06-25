import { Card, CardContent, Typography } from '@mui/material'

interface StatCardProps {
  title: string
  value: string
  subtitle: string
}

export default function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
          {title}
        </Typography>
        <Typography variant="h3" fontWeight={600} sx={{ fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }, my: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  )
}