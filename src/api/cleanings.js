import { api } from './client'

export function getMyCleanings() {
  return api.get('/me/cleanings')
}

// Solo admin. filters: { from, to, status?, buildingId?, employeeId?, unassigned? }
export function searchCleanings(filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '' && value !== false) params.set(key, value)
  })
  return api.get(`/cleanings?${params}`)
}

// Solo admin: { cleanerId (null = sin asignar), startTime, endTime } en una limpieza pendiente
export function reassignCleaning(id, assignment) {
  return api.patch(`/cleanings/${id}`, assignment)
}

export function getCleaning(id) {
  return api.get(`/cleanings/${id}`)
}

// status: 'IN_PROGRESS' (empezar) o 'DONE' (finalizar)
export function updateCleaningStatus(id, status) {
  return api.patch(`/cleanings/${id}/status`, { status })
}

export function updateChecklistItem(id, itemId, done) {
  return api.patch(`/cleanings/${id}/checklist/${itemId}`, { done })
}

export function updateIncident(id, incidentNotes) {
  return api.patch(`/cleanings/${id}/incident`, { incidentNotes })
}
