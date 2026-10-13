import { describe, it, expect } from 'vitest'
import { statusChangedMessage, statusDialog } from './employeeStatus'

describe('employeeStatus', () => {
  it('el diálogo de un empleado activo es para darlo de baja', () => {
    expect(statusDialog({ active: true }, 'Lucía')).toMatchObject({
      title: '¿Dar de baja a Lucía?',
      confirmLabel: 'Dar de baja',
      variant: 'danger',
    })
  })

  it('el diálogo de un empleado de baja es para reactivarlo', () => {
    expect(statusDialog({ active: false }, 'Lucía')).toMatchObject({ confirmLabel: 'Reactivar', variant: 'primary' })
  })

  it('avisa de las limpiezas que se quedan sin asignar al dar de baja', () => {
    expect(statusChangedMessage('Lucía', { employee: { active: false }, unassignedCleanings: 2 })).toBe(
      'Lucía dado de baja. 2 limpieza(s) se han quedado sin asignar',
    )
    expect(statusChangedMessage('Lucía', { employee: { active: true }, unassignedCleanings: 0 })).toBe(
      'Lucía reactivado',
    )
  })
})
