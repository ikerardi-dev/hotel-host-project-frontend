import { describe, it, expect } from 'vitest'
import { countNights, toLocalDateTime } from './dates'

describe('dates', () => {
  it('une fecha y hora en el formato de la API', () => {
    expect(toLocalDateTime('2026-10-20', '16:00')).toBe('2026-10-20T16:00:00')
  })

  it('cuenta las noches entre entrada y salida', () => {
    expect(countNights('2026-10-20', '2026-10-25')).toBe(5)
  })

  it('devuelve 0 si la salida no es posterior o faltan fechas', () => {
    expect(countNights('2026-10-25', '2026-10-20')).toBe(0)
    expect(countNights('', '2026-10-20')).toBe(0)
  })
})
