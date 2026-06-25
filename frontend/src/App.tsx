

import './App.css'
import { useEffect } from 'react'
import { useBloodBankStore } from './store/bloodbank.store'

function App() {
  useEffect(() => {
    // Load stored auth data on app startup
    useBloodBankStore.getState().loadFromStorage()
  }, [])

  return <div>App</div>

export default App
