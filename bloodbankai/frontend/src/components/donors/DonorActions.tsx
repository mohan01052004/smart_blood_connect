import { Box, Button } from '@mui/material'

export type DonorView = 'LIST' | 'REGISTER' | 'FIND'

interface Props {
  view: DonorView
  onChange: (view: DonorView) => void
}

function DonorActions({ view, onChange }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }} mb={3}>
      <Button
        variant={view === 'LIST' ? 'contained' : 'outlined'}
        onClick={() => onChange('LIST')}
      >
        View Donors
      </Button>

      <Button
        variant={view === 'REGISTER' ? 'contained' : 'outlined'}
        onClick={() => onChange('REGISTER')}
      >
        Register Donor
      </Button>

      <Button
        variant={view === 'FIND' ? 'contained' : 'outlined'}
        onClick={() => onChange('FIND')}
      >
        Find Eligible Donors
      </Button>
    </Box>
  )
}

export default DonorActions