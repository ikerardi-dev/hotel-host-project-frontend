import { api } from './client'

// Apartamentos, reservas y limpiezas de un edificio en un periodo (from y to en formato AAAA-MM-DD)
export function getOccupancy(buildingId, from, to) {
  return api.get(`/occupancy?${new URLSearchParams({ buildingId, from, to })}`)
}
