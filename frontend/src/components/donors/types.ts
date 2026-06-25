export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'O+'
  | 'O-'
  | 'AB+'
  | 'AB-'

export type DonorStatus = 'Available' | 'Unavailable'

export interface Donor {
  id: string
  name: string
  phone: string
  bloodGroup: BloodGroup
  location: string
  lastDonated?: string
  status: DonorStatus
  addedByBankId?: number
}