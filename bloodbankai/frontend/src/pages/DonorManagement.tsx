import { useState, useEffect } from 'react'
import PeopleIcon from '@mui/icons-material/People'
import PageHeader from '../components/common/PageHeader'
import DonorActions from '../components/donors/DonorActions'
import type { DonorView } from '../components/donors/DonorActions'
import DonorTable from '../components/donors/DonorTable'
import RegisterDonor from '../components/donors/RegisterDonor'
import FindDonors from '../components/donors/FindDonors'
import AppSnackbar from '../components/common/AppSnackbar'
import PageLoader from '../components/common/PageLoader'
import type { Donor } from '../components/donors/types'
import { apiClient } from '../api/apiClient'
import { useBloodBankStore } from '../store/bloodbank.store'

export default function DonorManagement() {
  const [view, setView] = useState<DonorView>('LIST')
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  })

  const bloodBank = useBloodBankStore((state) => state.bloodBank)

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      const response = await apiClient.donor.getAll()
      const mappedDonors = response.data.map((d: any) => ({
        id: d.id?.toString(),
        name: d.name,
        phone: d.phone,
        bloodGroup: d.blood_group,
        location: d.location,
        lastDonated: d.last_donated_at
          ? new Date(d.last_donated_at).toLocaleDateString()
          : 'Never',
        status: d.status === 'available' ? 'Available' : 'Unavailable',
        addedByBankId: d.added_by_bank_id ?? undefined,
      }))
      setDonors(mappedDonors)
    } catch (error) {
      console.error('Failed to fetch donors:', error)
      setToast({ open: true, message: 'Failed to load donors', severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiClient.donor.delete(id)
      setDonors((prev) => prev.filter((d) => d.id !== id))
      setToast({ open: true, message: 'Donor deleted successfully', severity: 'success' })
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Failed to delete donor'
      setToast({ open: true, message: msg, severity: 'error' })
    }
  }

  return (
    <>
      <PageHeader
        title="Donor Management"
        subtitle="View, register, and find eligible blood donors"
        icon={<PeopleIcon color="error" />}
      />

      <DonorActions view={view} onChange={setView} />

      {loading && view === 'LIST' ? (
        <PageLoader />
      ) : (
        <>
          {view === 'LIST' && (
            <DonorTable
              donors={donors}
              currentBankId={bloodBank?.id}
              onDelete={handleDelete}
              onUpdated={(id, lastDonated, status) => {
                setDonors((prev) =>
                  prev.map((d) => d.id === id ? { ...d, lastDonated, status } : d)
                )
                setToast({ open: true, message: 'Last donation date updated', severity: 'success' })
              }}
            />
          )}

          {view === 'REGISTER' && (
            <RegisterDonor
              onAdd={(d) => {
                setDonors([...donors, d])
                setToast({ open: true, message: 'Donor registered successfully', severity: 'success' })
                setView('LIST')
                fetchDonors()
              }}
              onDone={() => setView('LIST')}
            />
          )}

          {view === 'FIND' && <FindDonors donors={donors} />}
        </>
      )}

      <AppSnackbar
        {...toast}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  )
}