import { create } from 'zustand'
import { apiClient } from '../api/apiClient'

export interface BloodBank {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  latitude: number
  longitude: number
  is_active: boolean
  created_at?: string
}

interface BloodBankStore {
  bloodBank: BloodBank | null
  token: string | null
  isLoading: boolean
  error: string | null
  signup: (data: any) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loadFromStorage: () => void
}

export const useBloodBankStore = create<BloodBankStore>((set) => ({
  bloodBank: null,
  token: null,
  isLoading: false,
  error: null,

  signup: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.auth.signup(data)
      const { access_token, blood_bank } = response.data
      
      localStorage.setItem('blood_bank_token', access_token)
      localStorage.setItem('blood_bank', JSON.stringify(blood_bank))
      
      set({
        bloodBank: blood_bank,
        token: access_token,
        isLoading: false,
      })
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Signup failed'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.auth.login({ email, password })
      const { access_token, blood_bank } = response.data
      
      localStorage.setItem('blood_bank_token', access_token)
      localStorage.setItem('blood_bank', JSON.stringify(blood_bank))
      
      set({
        bloodBank: blood_bank,
        token: access_token,
        isLoading: false,
      })
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('blood_bank_token')
    localStorage.removeItem('blood_bank')
    set({ bloodBank: null, token: null, error: null })
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('blood_bank_token')
    const bankJson = localStorage.getItem('blood_bank')
    
    if (token && bankJson) {
      try {
        const bloodBank = JSON.parse(bankJson)
        set({ token, bloodBank })
      } catch {
        localStorage.removeItem('blood_bank_token')
        localStorage.removeItem('blood_bank')
      }
    }
  },
}))
