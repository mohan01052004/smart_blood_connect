import { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, CircularProgress, Alert,
  ToggleButton, ToggleButtonGroup, Chip, Divider
} from '@mui/material'

import EmailIcon from '@mui/icons-material/Email'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import PublicIcon from '@mui/icons-material/Public'
import BloodtypeIcon from '@mui/icons-material/Bloodtype'
import PersonIcon from '@mui/icons-material/Person'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'

import StatCard from '../../components/common/StatCard'
import PieChartCard from '../../components/charts/PieChartCard'
import BarChartCard from '../../components/charts/BarChartCard'
import LineChartCard from '../../components/charts/LineChartCard'
import { apiClient } from '../../api/apiClient'

// ─── My Bank Dashboard ───────────────────────────────────────────────────────

const MyBankDashboard = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMyStats = async () => {
      try {
        setError(null)
        const res = await apiClient.dashboard.getMyStats()
        setData(res.data)
      } catch {
        setError('Failed to load My Bank stats')
      } finally {
        setLoading(false)
      }
    }
    fetchMyStats()
  }, [])

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>

  const bank = data?.blood_bank || {}
  const inv = data?.inventory_stats || {}
  const inventoryGroups: { blood_group: string; quantity: number }[] = inv.inventory_by_group || []

  const BLOOD_COLORS: Record<string, string> = {
    'A+': '#e53935', 'A-': '#ef9a9a',
    'B+': '#1e88e5', 'B-': '#90caf9',
    'O+': '#43a047', 'O-': '#a5d6a7',
    'AB+': '#8e24aa', 'AB-': '#ce93d8',
  }

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Profile Card */}
      <Card sx={{ mb: 4, background: 'linear-gradient(135deg, #c62828 0%, #e53935 100%)', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <LocalHospitalIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">{bank.name || 'My Blood Bank'}</Typography>
              <Chip
                label={bank.is_active ? 'Active' : 'Inactive'}
                size="small"
                sx={{ bgcolor: bank.is_active ? '#4caf50' : '#f44336', color: 'white', mt: 0.5 }}
              />
            </Box>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.3)', mb: 2 }} />
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <PersonIcon fontSize="small" />
              <Typography variant="body2">{bank.email}</Typography>
            </Box>
            {bank.phone && (
              <Box display="flex" alignItems="center" gap={1}>
                <PhoneIcon fontSize="small" />
                <Typography variant="body2">{bank.phone}</Typography>
              </Box>
            )}
            {bank.address && (
              <Box display="flex" alignItems="center" gap={1}>
                <LocationOnIcon fontSize="small" />
                <Typography variant="body2">{bank.address}</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Inventory Summary Cards */}
      <Box display="flex" gap={3} flexWrap="wrap" mb={4}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
          <StatCard title="Total Blood Units" value={inv.total_units?.toString() || '0'} subtitle="Units in your inventory" />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
          <StatCard title="Blood Groups" value={inv.blood_groups_count?.toString() || '0'} subtitle="Registered blood types" />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '200px' } }}>
          <StatCard title="Available Groups" value={inv.available_groups?.toString() || '0'} subtitle="Groups with stock > 0" />
        </Box>
      </Box>

      {/* Inventory breakdown */}
      <Box display="flex" gap={3} flexWrap="wrap">
        {/* Blood group chips */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 380 } }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <BloodtypeIcon color="error" />
                <Typography variant="h6">Blood Group Inventory</Typography>
              </Box>
              {inventoryGroups.length > 0 ? (
                <Box display="flex" flexWrap="wrap" gap={1.5}>
                  {inventoryGroups.map((item) => (
                    <Box
                      key={item.blood_group}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: BLOOD_COLORS[item.blood_group] || '#e53935',
                        color: 'white',
                        minWidth: 72,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">{item.blood_group}</Typography>
                      <Typography variant="body2">{item.quantity} units</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No inventory added yet. Go to the Inventory page to add stock.</Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Pie chart */}
        {inventoryGroups.length > 0 && (
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 380 } }}>
            <PieChartCard
              title="Inventory Distribution"
              data={inventoryGroups.map((item) => ({
                name: item.blood_group,
                value: item.quantity,
              }))}
            />
          </Box>
        )}
      </Box>
    </>
  )
}

// ─── Network Dashboard ───────────────────────────────────────────────────────

const NetworkDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [recentEmails, setRecentEmails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)
        const res = await apiClient.dashboard.getStats()
        setStats(res.data)
        setRecentEmails(res.data.recent_emails || [])
      } catch {
        setError('Failed to load Network stats')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Stat cards */}
      <Box display="flex" gap={3} flexWrap="wrap" mb={4}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '220px' } }}>
          <StatCard title="Total Requests Processed" value={stats?.service_stats?.total_requests_processed?.toString() || '0'} subtitle="Blood requests handled by AI" />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '220px' } }}>
          <StatCard title="Today's Requests" value={stats?.service_stats?.today_processed?.toString() || '0'} subtitle="Requests processed today" />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '220px' } }}>
          <StatCard title="Weekly Requests" value={stats?.service_stats?.weekly_processed?.toString() || '0'} subtitle="Last 7 days" />
        </Box>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: '220px' } }}>
          <StatCard title="Unique Requesters" value={stats?.service_stats?.unique_requesters?.toString() || '0'} subtitle="Different people helped" />
        </Box>
      </Box>

      {/* Recent Emails */}
      <Box mb={4}>
        <Card sx={{ backgroundColor: '#ffffff', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <EmailIcon color="primary" />
              <Typography variant="h6">Recent Email Responses</Typography>
            </Box>
            {recentEmails.length > 0 ? (
              recentEmails.map((email, idx) => (
                <Box key={idx} p={2} mb={1} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="body2" fontWeight="bold">From: {email.sender}</Typography>
                  <Typography variant="body2" color="text.secondary">Subject: {email.subject}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Processed: {new Date(email.processed_at).toLocaleString()}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No emails processed yet</Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Charts */}
      <Box display="flex" flexDirection="column" gap={3}>
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 400 } }}>
            <PieChartCard
              title="Request Processing Timeline"
              data={[
                { name: 'Today', value: stats?.service_stats?.today_processed || 0 },
                { name: 'This Week', value: (stats?.service_stats?.weekly_processed || 0) - (stats?.service_stats?.today_processed || 0) },
                { name: 'This Month', value: (stats?.service_stats?.monthly_processed || 0) - (stats?.service_stats?.weekly_processed || 0) },
              ]}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 400 } }}>
            <BarChartCard
              title="Top Requesters"
              data={stats?.top_requesters?.map((req: any) => ({
                name: req.sender.split('@')[0],
                parsed: req.request_count,
                missed: 0,
              })) || []}
            />
          </Box>
        </Box>
        <Box>
          <LineChartCard
            title="Service Performance Metrics"
            data={[
              { day: 'Avg Daily', time: stats?.service_stats?.avg_daily_requests || 0 },
              { day: 'Today', time: stats?.service_stats?.today_processed || 0 },
              { day: 'Weekly', time: stats?.service_stats?.weekly_processed || 0 },
              { day: 'Monthly', time: stats?.service_stats?.monthly_processed || 0 },
              { day: 'Total', time: stats?.service_stats?.total_requests_processed || 0 },
            ]}
          />
        </Box>
      </Box>
    </>
  )
}

// ─── Main Dashboard (with toggle) ────────────────────────────────────────────

const Dashboard = () => {
  const [view, setView] = useState<'mybank' | 'network'>('mybank')

  return (
    <>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <DashboardIcon color="primary" />
          <Typography variant="h4">
            {view === 'mybank' ? 'My Bank Dashboard' : 'Network Dashboard'}
          </Typography>
        </Box>

        {/* Toggle Switch */}
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, val) => { if (val) setView(val) }}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            '& .MuiToggleButton-root': {
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              gap: 0.5,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            },
          }}
        >
          <ToggleButton value="mybank">
            <LocalHospitalIcon fontSize="small" /> My Bank
          </ToggleButton>
          <ToggleButton value="network">
            <PublicIcon fontSize="small" /> Network
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Content */}
      {view === 'mybank' ? <MyBankDashboard /> : <NetworkDashboard />}
    </>
  )
}

export default Dashboard