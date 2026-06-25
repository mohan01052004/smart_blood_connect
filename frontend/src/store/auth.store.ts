import { createContext, useContext, useState, createElement } from 'react'
import type { ReactNode } from 'react'
interface User {
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)

  const login = (email: string) => setUser({ email })
  const logout = () => setUser(null)

  return createElement(AuthContext.Provider, {
    value: { user, login, logout }
  }, children)
}

export const useAuthStore = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthStore must be used within AuthProvider')
  }
  return context
}
