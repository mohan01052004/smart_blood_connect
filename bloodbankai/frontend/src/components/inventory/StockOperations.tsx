import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import type { BloodGroup } from './types'

interface Props {
  onSubmit: (data: {
    bloodGroup: BloodGroup
    quantity: number
    type: 'ADD' | 'DEDUCT'
  }) => void
}

export default function StockOperations({ onSubmit }: Props) {
  const [type, setType] = useState<'ADD' | 'DEDUCT'>('ADD')
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('A+')
  const [quantity, setQuantity] = useState(1)

  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box display="grid" gap={2}>
          <Typography variant="h6">Stock Operations</Typography>

          <Box display="flex" gap={1}>
            <Button
              variant={type === 'ADD' ? 'contained' : 'outlined'}
              onClick={() => setType('ADD')}
            >
              Add
            </Button>
            <Button
              variant={type === 'DEDUCT' ? 'contained' : 'outlined'}
              onClick={() => setType('DEDUCT')}
            >
              Deduct
            </Button>
          </Box>

          <TextField
            select
            label="Blood Group"
            value={bloodGroup}
            onChange={(e) =>
              setBloodGroup(e.target.value as BloodGroup)
            }
          >
            {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map((bg) => (
              <MenuItem key={bg} value={bg}>
                {bg}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <Button
            variant="contained"
            color="error"
            onClick={() =>
              onSubmit({ bloodGroup, quantity, type })
            }
          >
            {type === 'ADD' ? 'Add Stock' : 'Deduct Stock'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
