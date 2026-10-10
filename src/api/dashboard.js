import { api } from './client'

// Cifras y línea de tiempo del día (solo admin)
export function getTodayDashboard() {
  return api.get('/dashboard/today')
}
