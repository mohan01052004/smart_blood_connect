import { Card, CardContent, Typography } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  title: string
  data: { name: string; parsed: number; missed: number }[]
}

const BarChartCard = ({ title, data }: Props) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" mb={2}>
          {title}
        </Typography>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Bar dataKey="parsed" fill="#C62828" />
            <Bar dataKey="missed" fill="#FFCDD2" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default BarChartCard
