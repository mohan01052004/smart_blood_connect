import { useState } from 'react'
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, IconButton, TableContainer, Paper, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Typography, Alert,
} from '@mui/material'
import EditCalendarIcon from '@mui/icons-material/EditCalendar'
import DeleteIcon from '@mui/icons-material/Delete'
import { apiClient } from '../../api/apiClient'
import type { Donor } from './types'

interface Props {
  donors: Donor[]
  currentBankId?: number
  onDelete?: (id: string) => void
  onUpdated?: (id: string, lastDonated: string, status: 'Available' | 'Unavailable') => void
}

const COOLING_DAYS = 180

function isWithinCooling(dateStr: string): boolean {
  if (!dateStr) return false
  const donated = new Date(dateStr)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - COOLING_DAYS)
  return donated > cutoff
}

export default function DonorTable({ donors, currentBankId, onDelete, onUpdated }: Props) {
  const [editDonor, setEditDonor] = useState<Donor | null>(null)
  const [dateValue, setDateValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const openEdit = (donor: Donor) => {
    setEditDonor(donor)
    // Pre-fill with existing date if available (convert locale date back to yyyy-mm-dd)
    if (donor.lastDonated && donor.lastDonated !== 'Never') {
      const d = new Date(donor.lastDonated)
      if (!isNaN(d.getTime())) {
        setDateValue(d.toISOString().split('T')[0])
      } else {
        setDateValue('')
      }
    } else {
      setDateValue('')
    }
    setSaveError('')
  }

  const handleSave = async () => {
    if (!editDonor) return
    setSaving(true)
    setSaveError('')
    try {
      const isoDate = dateValue ? new Date(dateValue).toISOString() : null
      const res = await apiClient.donor.updateLastDonated(editDonor.id, isoDate)
      const updated = res.data
      onUpdated?.(
        editDonor.id,
        updated.last_donated_at ? new Date(updated.last_donated_at).toLocaleDateString() : 'Never',
        updated.status === 'available' ? 'Available' : 'Unavailable'
      )
      setEditDonor(null)
    } catch (err: any) {
      setSaveError(err.response?.data?.detail || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const withinCooling = isWithinCooling(dateValue)

  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2, overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Blood Group</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Last Donated</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {donors.map((donor) => {
              const canDelete = currentBankId != null && donor.addedByBankId === currentBankId
              return (
                <TableRow key={donor.id}>
                  <TableCell>{donor.name}</TableCell>
                  <TableCell>
                    <Chip label={donor.bloodGroup} color="error" />
                  </TableCell>
                  <TableCell>{donor.phone}</TableCell>
                  <TableCell>{donor.location}</TableCell>
                  <TableCell>{donor.lastDonated || 'Never'}</TableCell>
                  <TableCell>
                    <Chip
                      label={donor.status}
                      color={donor.status === 'Available' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {/* Edit last donated — available to ALL banks */}
                    <Tooltip title="Update last donation date">
                      <IconButton color="primary" onClick={() => openEdit(donor)}>
                        <EditCalendarIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Delete — only for the registering bank */}
                    {canDelete ? (
                      <Tooltip title="Delete donor">
                        <IconButton color="error" onClick={() => onDelete?.(donor.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Added by another blood bank">
                        <span>
                          <IconButton disabled>
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Last Donated Dialog */}
      <Dialog open={!!editDonor} onClose={() => setEditDonor(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Update Last Donation Date
          <Typography variant="body2" color="text.secondary">
            {editDonor?.name} — {editDonor?.bloodGroup}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Last Blood Donation Date"
            type="date"
            fullWidth
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: new Date().toISOString().split('T')[0] }}
            helperText="Clear the date if the donor has never donated"
          />
          {withinCooling && (
            <Alert severity="warning" sx={{ mt: 1.5 }}>
              ⚠️ Within 6-month cooling period — donor will be marked <strong>Unavailable</strong>
            </Alert>
          )}
          {!withinCooling && dateValue && (
            <Alert severity="success" sx={{ mt: 1.5 }}>
              ✅ Cooling period passed — donor will be marked <strong>Available</strong>
            </Alert>
          )}
          {saveError && (
            <Alert severity="error" sx={{ mt: 1.5 }}>{saveError}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDonor(null)} disabled={saving}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}