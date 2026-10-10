// Fechas AAAA-MM-DD en hora local
export function addDays(isoDate, days) {
  const date = new Date(`${isoDate}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toLocaleDateString('sv-SE')
}

// Lunes de la semana de una fecha
export function startOfWeek(isoDate) {
  const weekday = (new Date(`${isoDate}T00:00:00`).getDay() + 6) % 7 // 0 = lunes
  return addDays(isoDate, -weekday)
}

export function weekDays(monday) {
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
}

/**
 * Columnas que ocupa una reserva en la semana (1 a 7, el final es exclusivo). Se pintan las noches:
 * desde el día de entrada hasta el día anterior a la salida. null si no tiene noches en esa semana.
 */
export function bookingSpan(booking, days) {
  const checkIn = booking.checkIn.slice(0, 10)
  const checkOut = booking.checkOut.slice(0, 10)
  const weekStart = days[0]
  const weekEnd = addDays(days.at(-1), 1) // exclusivo

  const first = checkIn > weekStart ? checkIn : weekStart
  const lastExclusive = checkOut < weekEnd ? checkOut : weekEnd
  if (first >= lastExclusive) return null

  const start = days.indexOf(first) + 1
  const nights = days.filter((day) => day >= first && day < lastExclusive).length
  return {
    start,
    end: start + nights,
    continuesBefore: checkIn < weekStart,
    continuesAfter: checkOut > weekEnd,
  }
}

const CHANNEL_LETTERS = { BOOKING: 'B', AIRBNB: 'A', DIRECT: 'D', PHONE: 'T' }

export function channelLetter(channel) {
  return CHANNEL_LETTERS[channel] ?? '?'
}
