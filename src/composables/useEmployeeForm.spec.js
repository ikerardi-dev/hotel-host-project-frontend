import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { useEmployeeForm } from './useEmployeeForm'

vi.mock('@/api/buildings', () => ({
  getBuildings: vi.fn().mockResolvedValue([{ id: 1, name: 'Legazpi', apartmentCount: 4 }]),
}))

// Monta un componente mínimo que usa el composable y lo expone para el test
function withForm(options) {
  let result
  mount(
    defineComponent({
      setup() {
        result = useEmployeeForm(options)
        return () => h('div')
      },
    }),
  )
  return result
}

const EMPLOYEE = {
  id: 3,
  firstName: 'Lucía',
  lastName: 'Fernández',
  dni: '12345678Z',
  phone: '600000000',
  email: 'lucia@hotelhost.local',
  buildings: [{ id: 1, name: 'Legazpi' }],
  hireDate: '2026-10-01',
  notes: null,
}

describe('useEmployeeForm', () => {
  it('carga los edificios al montar', async () => {
    const { buildings } = withForm({ withPassword: false })
    await flushPromises()

    expect(buildings.value).toHaveLength(1)
  })

  it('el alta trae una contraseña temporal generada; la edición no lleva contraseña', () => {
    expect(withForm({ withPassword: true }).form.temporaryPassword).toMatch(/^(?=.*[A-Z])(?=.*\d).{8,}$/)
    expect(withForm({ withPassword: false }).form).not.toHaveProperty('temporaryPassword')
  })

  it('rellena el formulario con un empleado y lo da por válido', () => {
    const { form, fill, validate, errors } = withForm({ withPassword: false })

    fill(EMPLOYEE)

    expect(form.buildingIds).toEqual([1])
    expect(form.notes).toBe('')
    expect(validate()).toBe(true)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('marca los campos obligatorios y el DNI con formato incorrecto', () => {
    const { form, validate, errors } = withForm({ withPassword: false })
    form.dni = '1234'

    expect(validate()).toBe(false)
    expect(errors.firstName).toBe('El nombre es obligatorio')
    expect(errors.dni).toBe('El DNI/NIE no tiene un formato válido')
    expect(errors.buildingIds).toBe('Asigna al menos un edificio')
  })

  it('envía las notas vacías como null', () => {
    const { fill, payload } = withForm({ withPassword: false })
    fill(EMPLOYEE)

    expect(payload().notes).toBeNull()
  })

  it('muestra los errores de la API en su campo o como error general', () => {
    const { errors, generalError, showApiError } = withForm({ withPassword: false })

    showApiError({ code: 'EMAIL_ALREADY_EXISTS', message: 'Ya existe un usuario con ese email' })
    showApiError({ code: 'INTERNAL_ERROR', message: 'Error inesperado' })

    expect(errors.email).toBe('Ya existe un usuario con ese email')
    expect(generalError.value).toBe('Error inesperado')
  })
})
