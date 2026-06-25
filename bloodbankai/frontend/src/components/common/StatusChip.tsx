import { Chip } from '@mui/material'

type StatusChipProps = {
  value: string
}

const StatusChip = ({ value }: StatusChipProps) => {
  const getColor = () => {
    // Request statuses
    if (value === 'Pending') return 'warning'
    if (value === 'Processing') return 'info'
    if (value === 'Fulfilled') return 'success'
    
    // Donor statuses
    if (value === 'Available') return 'success'
    if (value === 'Unavailable') return 'error'
    
    return 'default'
  }

  return <Chip label={value} color={getColor() as any} size="small" />
}

export default StatusChip