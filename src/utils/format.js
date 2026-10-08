const BED_LABELS = {
  DOUBLE_BED: ['cama doble', 'camas dobles'],
  DOUBLE_SOFA_BED: ['sofá cama doble', 'sofás cama dobles'],
  SINGLE_BED: ['individual', 'individuales'],
}

// [{ type: 'DOUBLE_BED', quantity: 1 }, { type: 'SINGLE_BED', quantity: 2 }] → "1 cama doble · 2 individuales"
export function formatBeds(beds) {
  return beds
    .map(({ type, quantity }) => `${quantity} ${BED_LABELS[type][quantity === 1 ? 0 : 1]}`)
    .join(' · ')
}

const shortDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' })
const time = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' })

// "2026-10-20T16:00:00" → "20 oct"
export function formatShortDate(isoDateTime) {
  return shortDate.format(new Date(isoDateTime))
}

// "2026-10-20T16:00:00" → "16:00"
export function formatTime(isoDateTime) {
  return time.format(new Date(isoDateTime))
}

// → "20 oct – 25 oct"
export function formatDateRange(from, to) {
  return `${formatShortDate(from)} – ${formatShortDate(to)}`
}

const longDate = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

// "2026-10-08" → "jueves, 8 de octubre" (la fecha se interpreta en hora local)
export function formatLongDate(isoDate) {
  return longDate.format(new Date(`${isoDate}T00:00:00`))
}

// Título de un día respecto a hoy: "Hoy · jueves, 8 de octubre", "Mañana · …", "Ayer · …" o la fecha
export function formatDayTitle(isoDate, today = new Date().toLocaleDateString('sv-SE')) {
  const offsetDays = Math.round((Date.parse(isoDate) - Date.parse(today)) / (24 * 60 * 60 * 1000))
  const prefix = { 0: 'Hoy', 1: 'Mañana', '-1': 'Ayer' }[offsetDays]
  return prefix ? `${prefix} · ${formatLongDate(isoDate)}` : formatLongDate(isoDate)
}

// Hora de la API "12:00:00" → "12:00"
export function formatHour(isoTime) {
  return isoTime.slice(0, 5)
}
