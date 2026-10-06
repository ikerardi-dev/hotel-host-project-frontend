import { api } from './client'

export function getBuildings() {
  return api.get('/buildings')
}
