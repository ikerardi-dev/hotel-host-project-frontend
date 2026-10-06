// Fecha local en formato AAAA-MM-DD, con los días que se indiquen a partir de hoy
export function localDate(daysFromToday = 0) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  return date.toLocaleDateString('sv-SE')
}

// "2026-10-20" + "16:00" → "2026-10-20T16:00:00" (formato que espera la API)
export function toLocalDateTime(date, time) {
  return `${date}T${time}:00`
}

// Noches entre dos fechas AAAA-MM-DD (0 si las fechas no son válidas)
export function countNights(checkInDate, checkOutDate) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  const nights = Math.round((Date.parse(checkOutDate) - Date.parse(checkInDate)) / MS_PER_DAY)
  return Number.isFinite(nights) && nights > 0 ? nights : 0
}
