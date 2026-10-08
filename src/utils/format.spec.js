import { describe, it, expect } from 'vitest'
import { formatBeds, formatDateRange, formatDayTitle, formatHour, formatLongDate, formatTime } from './format'

describe('formatBeds', () => {
  it('describe las camas en singular y plural', () => {
    expect(
      formatBeds([
        { type: 'DOUBLE_BED', quantity: 1 },
        { type: 'DOUBLE_SOFA_BED', quantity: 1 },
        { type: 'SINGLE_BED', quantity: 2 },
      ]),
    ).toBe('1 cama doble · 1 sofá cama doble · 2 individuales')
  })

  it('usa el plural de cama doble', () => {
    expect(formatBeds([{ type: 'DOUBLE_BED', quantity: 2 }])).toBe('2 camas dobles')
  })
})

describe('fechas', () => {
  it('formatea un rango de fechas corto en español', () => {
    expect(formatDateRange('2026-10-20T16:00:00', '2026-10-25T11:00:00')).toBe('20 oct – 25 oct')
  })

  it('formatea la hora', () => {
    expect(formatTime('2026-10-20T16:00:00')).toBe('16:00')
    expect(formatHour('12:30:00')).toBe('12:30')
  })

  it('formatea una fecha larga con el día de la semana', () => {
    expect(formatLongDate('2026-10-08')).toBe('jueves, 8 de octubre')
  })

  it('pone Hoy, Mañana o Ayer delante de la fecha cuando corresponde', () => {
    expect(formatDayTitle('2026-10-08', '2026-10-08')).toBe('Hoy · jueves, 8 de octubre')
    expect(formatDayTitle('2026-10-09', '2026-10-08')).toBe('Mañana · viernes, 9 de octubre')
    expect(formatDayTitle('2026-10-07', '2026-10-08')).toBe('Ayer · miércoles, 7 de octubre')
    expect(formatDayTitle('2026-10-12', '2026-10-08')).toBe('lunes, 12 de octubre')
  })
})
