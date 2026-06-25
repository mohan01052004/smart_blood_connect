import { useState, useEffect } from 'react'
import InventoryIcon from '@mui/icons-material/Inventory'
import PageHeader from '../../components/common/PageHeader'
import InventoryTable from '../../components/inventory/InventoryTable'
import StockOperations from '../../components/inventory/StockOperations'
import AppSnackbar from '../../components/common/AppSnackbar'
import PageLoader from '../../components/common/PageLoader'
import type { InventoryItem } from '../../components/inventory/types'
import { Box } from '@mui/material'
import { apiClient } from '../../api/apiClient'

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await apiClient.inventory.getAll()
      const mappedInventory = response.data.map((item: any) => ({
        id: item.id?.toString(),
        bloodGroup: item.blood_group,
        quantity: item.quantity || 0,
        lastUpdated: new Date().toLocaleDateString(),
      }))
      setInventory(mappedInventory)
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
      setToast({
        open: true,
        message: 'Failed to load inventory',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOperation = async ({
    bloodGroup,
    quantity,
    type,
  }: any) => {
    try {
      setLoading(true)
      
      // Create or update inventory
      const existing = inventory.find(
        (i) => i.bloodGroup === bloodGroup
      )

      if (existing) {
        const newQuantity = type === 'ADD' 
          ? existing.quantity + quantity
          : Math.max(existing.quantity - quantity, 0)
        
        await apiClient.inventory.update(existing.id, {
          blood_group: bloodGroup,
          quantity: newQuantity,
        })
      } else {
        await apiClient.inventory.create({
          blood_group: bloodGroup,
          quantity: type === 'ADD' ? quantity : 0,
        })
      }

      // Refresh inventory
      await fetchInventory()
      
      setToast({
        open: true,
        message: `Stock ${type === 'ADD' ? 'added' : 'deducted'} successfully`,
        severity: 'success',
      })
    } catch (error) {
      console.error('Operation failed:', error)
      setToast({
        open: true,
        message: 'Failed to update inventory',
        severity: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Blood Stock Inventory"
        subtitle="Monitor and manage blood availability across banks"
        icon={<InventoryIcon color="error" />}
      />

      {loading ? (
        <PageLoader />
      ) : (
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 2, minWidth: { xs: '100%', md: 400 } }}>
            <InventoryTable inventory={inventory} />
          </Box>

          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 300 } }}>
            <StockOperations onSubmit={handleOperation} />
          </Box>
        </Box>
      )}

      <AppSnackbar
        {...toast}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </>
  )
}
