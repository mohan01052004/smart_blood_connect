import type { Donor } from '../types/donor'

export const donors: Donor[] = [
  {
    id: '1',
    name: 'Rahul Kumar',
    bloodGroup: 'O+',
    phone: '9876543210',
    location: 'Bangalore',
    lastDonated: '2 months ago',
    status: 'Available',
  },
  {
    id: '2',
    name: 'Anita Sharma',
    bloodGroup: 'A-',
    phone: '9123456789',
    location: 'Mysore',
    lastDonated: '1 month ago',
    status: 'Unavailable',
  },
]
