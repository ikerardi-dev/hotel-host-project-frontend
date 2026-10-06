import { api } from './client'

export function getApartments() {
  return api.get('/apartments')
}
