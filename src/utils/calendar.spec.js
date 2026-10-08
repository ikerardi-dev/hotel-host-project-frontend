import { describe, it, expect } from 'vitest'
import { bookingsOnDay, buildMonthGrid, isNightBooked } from './calendar'

describe('buildMonthGrid', () => {
  it('empieza en lunes y termina en domingo con semanas completas', () => {
    // Octubre de 2026: el día 1 es jueves y el 31 sábado
    const days = buildMonthGrid(2026, 9)

    expect(days[0]).toEqual({ date: '2026-09-28', inMonth: false })
    expect(days.at(-1)).toEqual({ date: '2026-11-01', inMonth: false })
    expect(days.length % 7).toBe(0)
    expect(days.filter((day) => day.inMonth)).toHaveLength(31)
  })
})

describe('reservas en el calendario', () => {
  const booking = { checkIn: '2026-10-10T16:00:00', checkOut: '2026-10-14T11:00:00' }

  it('marca como reservadas las noches de la estancia, no el día de salida', () => {
    expect(isNightBooked('2026-10-10', [booking])).toBe(true)
    expect(isNightBooked('2026-10-13', [booking])).toBe(true)
    expect(isNightBooked('2026-10-14', [booking])).toBe(false)
    expect(isNightBooked('2026-10-09', [booking])).toBe(false)
  })

  it('el día de salida la reserva aparece en el detalle del día', () => {
    expect(bookingsOnDay('2026-10-14', [booking])).toHaveLength(1)
    expect(bookingsOnDay('2026-10-15', [booking])).toHaveLength(0)
  })
})
