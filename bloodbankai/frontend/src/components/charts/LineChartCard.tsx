import { Card, CardContent, Typography } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = {
  title: string
  data: { day: string; time: number }[]
}

const LineChartCard = ({ title, data }: Props) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" mb={2}>
          {title}
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#C62828"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default LineChartCard
