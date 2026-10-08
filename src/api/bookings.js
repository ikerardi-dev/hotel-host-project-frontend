import { api } from './client'

export function createBooking(booking) {
  return api.post('/bookings', booking)
}

// El apartamento no cambia al editar y la limpieza se gestiona desde su detalle
export function updateBooking(id, booking) {
  return api.put(`/bookings/${id}`, booking)
}

// La reserva queda cancelada (no se borra) y su limpieza pendiente también
export function cancelBooking(id) {
  return api.patch(`/bookings/${id}/cancel`)
}

// Devuelve { unavailableApartmentIds: [...] }. Al editar, excludeBookingId evita que la propia reserva cuente
export function getAvailability(checkIn, checkOut, excludeBookingId = null) {
  const params = new URLSearchParams({ checkIn, checkOut })
  if (excludeBookingId) params.set('excludeBookingId', excludeBookingId)
  return api.get(`/apartments/availability?${params}`)
}
