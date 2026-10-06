import { api } from './client'

export function getEmployees() {
  return api.get('/employees')
}

export function createEmployee(employee) {
  return api.post('/employees', employee)
}

// Devuelve { employee, unassignedCleanings }
export function updateEmployeeStatus(id, active) {
  return api.patch(`/employees/${id}/status`, { active })
}
