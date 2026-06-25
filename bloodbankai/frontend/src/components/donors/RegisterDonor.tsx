import { Box, Button, MenuItem, TextField, Alert } from '@mui/material'
import { useState } from 'react'
import type { BloodGroup, Donor } from './types'
import { apiClient } from '../../api/apiClient'

interface Props {
  onAdd: (donor: Donor) => void
  onDone: () => void
}

const COOLING_DAYS = 180

function isWithinCoolingPeriod(dateStr: string): boolean {
  if (!dateStr) return false
  const donated = new Date(dateStr)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - COOLING_DAYS)
  return donated > cutoff
}

export default function RegisterDonor({ onAdd, onDone }: Props) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bloodGroup: '' as BloodGroup,
    location: '',
    email: '',
    lastDonatedAt: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const withinCooling = isWithinCoolingPeriod(form.lastDonatedAt)

  const submit = async () => {
    if (!form.name || !form.phone || !form.bloodGroup || !form.location || !form.email) {
      setError('Please fill all required fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await apiClient.donor.create({
        name: form.name,
        phone: form.phone,
        blood_group: form.bloodGroup,
        location: form.location,
        email: form.email,
        last_donated_at: form.lastDonatedAt ? new Date(form.lastDonatedAt).toISOString() : null,
      })

      onAdd({
        id: response.data.id?.toString(),
        name: response.data.name,
        phone: response.data.phone,
        bloodGroup: response.data.blood_group,
        location: response.data.location,
        status: response.data.status === 'available' ? 'Available' : 'Unavailable',
        addedByBankId: response.data.added_by_bank_id,
        lastDonated: response.data.last_donated_at
          ? new Date(response.data.last_donated_at).toLocaleDateString()
          : 'Never',
      })
      onDone()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register donor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box display="grid" gap={2} maxWidth={500}>
      <TextField
        label="Full Name *"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        disabled={loading}
        required
      />

      <TextField
        label="Phone Number *"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        disabled={loading}
        required
      />

      <TextField
        label="Email *"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        disabled={loading}
        required
      />

      <TextField
        select
        label="Blood Group *"
        value={form.bloodGroup}
        onChange={(e) =>
          setForm({ ...form, bloodGroup: e.target.value as BloodGroup })
        }
        disabled={loading}
        required
      >
        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
          <MenuItem key={bg} value={bg}>
            {bg}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Location *"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        disabled={loading}
        required
        helperText="Enter city or area name (used for distance matching)"
      />

      <TextField
        label="Last Blood Donation Date (if any)"
        type="date"
        value={form.lastDonatedAt}
        onChange={(e) => setForm({ ...form, lastDonatedAt: e.target.value })}
        disabled={loading}
        InputLabelProps={{ shrink: true }}
        inputProps={{ max: new Date().toISOString().split('T')[0] }}
        helperText="Leave blank if the donor has never donated"
      />

      {withinCooling && (
        <Alert severity="warning">
          ⚠️ This donor donated within the last 6 months and will be marked as <strong>Unavailable</strong> (cooling period). They won't be matched for email requests.
        </Alert>
      )}

      {error && (
        <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
          {error}
        </Box>
      )}

      <Button 
        variant="contained" 
        color="error" 
        onClick={submit}
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register Donor'}
      </Button>
    </Box>
  )
}