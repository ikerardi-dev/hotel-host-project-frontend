import { api } from './client'

export function getMyCleanings() {
  return api.get('/me/cleanings')
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
