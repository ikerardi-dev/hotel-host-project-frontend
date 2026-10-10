import { describe, it, expect } from 'vitest'
import { bookingSpan, startOfWeek, weekDays } from './occupancy'

// Semana del lunes 5 al domingo 11 de octubre de 2026
const days = weekDays('2026-10-05')

describe('semana', () => {
  it('encuentra el lunes de cualquier día', () => {
    expect(startOfWeek('2026-10-08')).toBe('2026-10-05')
    expect(startOfWeek('2026-10-11')).toBe('2026-10-05')
    expect(startOfWeek('2026-10-05')).toBe('2026-10-05')
  })

  it('tiene 7 días de lunes a domingo', () => {
    expect(days).toEqual([
      '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11',
    ])
  })
})

describe('bookingSpan', () => {
  it('ocupa las noches de la estancia: de la entrada al día anterior a la salida', () => {
    const span = bookingSpan({ checkIn: '2026-10-06T16:00:00', checkOut: '2026-10-09T11:00:00' }, days)
    expect(span).toEqual({ start: 2, end: 5, continuesBefore: false, continuesAfter: false })
  })

  it('se recorta a la semana y avisa de que continúa', () => {
    const span = bookingSpan({ checkIn: '2026-10-02T16:00:00', checkOut: '2026-10-15T11:00:00' }, days)
    expect(span).toEqual({ start: 1, end: 8, continuesBefore: true, continuesAfter: true })
  })

  it('no aparece si sale el lunes (no tiene noches esa semana)', () => {
    expect(bookingSpan({ checkIn: '2026-10-01T16:00:00', checkOut: '2026-10-05T11:00:00' }, days)).toBeNull()
  })
})
