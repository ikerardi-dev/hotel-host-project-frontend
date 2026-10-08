// Canales de reserva (solo informativos: no hay conexión con ninguna plataforma)
export const BOOKING_CHANNELS = [
  { value: 'BOOKING', label: 'Booking.com' },
  { value: 'AIRBNB', label: 'Airbnb' },
  { value: 'DIRECT', label: 'Directa' },
  { value: 'PHONE', label: 'Teléfono' },
]

export function channelLabel(value) {
  return BOOKING_CHANNELS.find((channel) => channel.value === value)?.label ?? value
}
