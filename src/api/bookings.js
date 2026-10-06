import { api } from './client'

export function createBooking(booking) {
  return api.post('/bookings', booking)
}

// Devuelve { unavailableApartmentIds: [...] } para las fechas indicadas
export function getAvailability(checkIn, checkOut) {
  const params = new URLSearchParams({ checkIn, checkOut })
  return api.get(`/apartments/availability?${params}`)
}
