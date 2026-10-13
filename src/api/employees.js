import { api } from './client'

export function getEmployees() {
  return api.get('/employees')
}

export function getEmployee(id) {
  return api.get(`/employees/${id}`)
}

export function createEmployee(employee) {
  return api.post('/employees', employee)
}

export function updateEmployee(id, employee) {
  return api.put(`/employees/${id}`, employee)
}

// La contraseña anterior deja de valer y el empleado tendrá que cambiar esta en su próximo acceso
export function resetEmployeePassword(id, temporaryPassword) {
  return api.put(`/employees/${id}/password`, { temporaryPassword })
}

// Devuelve { employee, unassignedCleanings }
export function updateEmployeeStatus(id, active) {
  return api.patch(`/employees/${id}/status`, { active })
}

// Solo se puede eliminar a un empleado ya dado de baja
export function deleteEmployee(id) {
  return api.delete(`/employees/${id}`)
}
