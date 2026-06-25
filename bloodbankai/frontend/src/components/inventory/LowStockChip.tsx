import { Chip } from '@mui/material'

export default function LowStockChip({ quantity }: { quantity: number }) {
  if (quantity === 0)
    return <Chip label="Out of Stock" color="error" size="small" />

  if (quantity < 5)
    return <Chip label="Low Stock" color="warning" size="small" />

  return <Chip label="Available" color="success" size="small" />
}
