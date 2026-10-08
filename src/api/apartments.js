import { api } from './client'

export function getApartments() {
  return api.get('/apartments')
}

export function getApartment(id) {
  return api.get(`/apartments/${id}`)
}

// Reservas activas del apartamento que tocan el periodo (from y to en formato AAAA-MM-DD)
export function getApartmentBookings(id, from, to) {
  return api.get(`/apartments/${id}/bookings?${new URLSearchParams({ from, to })}`)
}

export function getApartmentCleanings(id, from, to) {
  return api.get(`/apartments/${id}/cleanings?${new URLSearchParams({ from, to })}`)
}
