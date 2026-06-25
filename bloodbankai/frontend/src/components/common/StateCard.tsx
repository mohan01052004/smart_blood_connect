import { Card, CardContent, Typography } from '@mui/material'

type Props = {
  title: string
  value: string
  subtitle: string
}

const StatCard = ({ title, value, subtitle }: Props) => {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" gutterBottom>
          {title}
        </Typography>

        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default StatCard
