import { Box, Button, MenuItem, TextField, Typography, CircularProgress } from '@mui/material'
import { useState } from 'react'
import type { BloodGroup, Donor } from './types'
import DonorTable from './DonorTable'
import { apiClient } from '../../api/apiClient'

interface Props {
  donors: Donor[]
}

export default function FindDonors({ donors }: Props) {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('')
  const [results, setResults] = useState<Donor[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const search = async () => {
    if (!bloodGroup) return

    try {
      setLoading(true)
      setSearched(true)
      
      // For now, filter from the donors list prop
      // In future, this can call an API endpoint
      const filtered = donors.filter(
        (d) => d.bloodGroup === bloodGroup && d.status === 'Available'
      )
      setResults(filtered)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="grid" gap={3}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          select
          label="Required Blood Group"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
          sx={{ minWidth: { xs: '100%', sm: 200 } }}
        >
          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
            <MenuItem key={bg} value={bg}>
              {bg}
            </MenuItem>
          ))}
        </TextField>

        <Button 
          variant="contained" 
          color="error" 
          onClick={search}
          disabled={loading || !bloodGroup}
          sx={{ height: 56, width: { xs: '100%', sm: 'auto' } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Donors'}
        </Button>
      </Box>

      {searched && (
        results.length > 0 ? (
          <DonorTable donors={results} />
        ) : (
          <Typography>No eligible donors found for {bloodGroup}.</Typography>
        )
      )}
    </Box>
  )
}