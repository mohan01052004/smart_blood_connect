export type BloodGroup =
  | 'A+' | 'A-' | 'B+' | 'B-'
  | 'O+' | 'O-' | 'AB+' | 'AB-'

export interface InventoryItem {
  id: string
  bloodGroup: BloodGroup
  bank: string
  quantity: number
  lastUpdated: string
  expiryDate?: string
}
