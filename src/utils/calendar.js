// Fecha local en formato AAAA-MM-DD
function toIsoDate(date) {
  return date.toLocaleDateString('sv-SE')
}

/**
 * Días que se ven en el calendario de un mes (month de 0 a 11): semanas completas de lunes a domingo,
 * incluidos los días del mes anterior y siguiente que completan la primera y la última semana.
 */
export function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(1 - ((first.getDay() + 6) % 7)) // retrocede hasta el lunes

  const last = new Date(year, month + 1, 0)
  const end = new Date(last)
  end.setDate(last.getDate() + ((7 - last.getDay()) % 7)) // avanza hasta el domingo

  const days = []
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    days.push({ date: toIsoDate(day), inMonth: day.getMonth() === month })
  }
  return days
}

// Una noche está reservada si la estancia empieza ese día o antes y termina después
export function isNightBooked(date, bookings) {
  return bookings.some((booking) => booking.checkIn.slice(0, 10) <= date && date < booking.checkOut.slice(0, 10))
}

// Reservas que tocan un día: con entrada, salida o estancia ese día
export function bookingsOnDay(date, bookings) {
  return bookings.filter((booking) => booking.checkIn.slice(0, 10) <= date && date <= booking.checkOut.slice(0, 10))
}
