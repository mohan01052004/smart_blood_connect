import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Card,
  CardContent,
} from '@mui/material'
import type { InventoryItem } from './types'
import LowStockChip from './LowStockChip'

interface Props {
  inventory: InventoryItem[]
}

export default function InventoryTable({ inventory }: Props) {
  return (
    <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ maxHeight: 500, overflow: 'auto', '& table': { borderCollapse: 'separate', borderSpacing: '0 8px' } }}>
          <Table>
            <TableHead sx={{ position: 'sticky', top: 0, backgroundColor: 'background.paper', zIndex: 1 }}>
              <TableRow>
                <TableCell>Blood Group</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Units</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Expiry</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{item.bloodGroup}</TableCell>
                  <TableCell>{item.bank}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <LowStockChip quantity={item.quantity} />
                  </TableCell>
                  <TableCell>{item.lastUpdated}</TableCell>
                  <TableCell>{item.expiryDate || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  )
}
