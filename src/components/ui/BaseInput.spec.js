import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseInput from './BaseInput.vue'

describe('BaseInput', () => {
  it('asocia la etiqueta al input y le pasa los atributos extra', () => {
    const wrapper = mount(BaseInput, {
      props: { label: 'Correo' },
      attrs: { placeholder: 'ej. ana@test.es' },
    })
    const input = wrapper.get('input')

    expect(wrapper.get('label').attributes('for')).toBe(input.attributes('id'))
    expect(input.attributes('placeholder')).toBe('ej. ana@test.es')
  })

  it('actualiza el v-model al escribir', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        label: 'Nombre',
        modelValue: '',
        'onUpdate:modelValue': (value) => wrapper.setProps({ modelValue: value }),
      },
    })

    await wrapper.get('input').setValue('Ana')

    expect(wrapper.props('modelValue')).toBe('Ana')
  })

  it('muestra el error y marca el input como inválido', () => {
    const wrapper = mount(BaseInput, { props: { label: 'DNI', error: 'El DNI no es válido' } })

    expect(wrapper.text()).toContain('El DNI no es válido')
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true')
  })

  it('permite mostrar y ocultar la contraseña', async () => {
    const wrapper = mount(BaseInput, { props: { label: 'Contraseña', type: 'password' } })
    expect(wrapper.get('input').attributes('type')).toBe('password')

    await wrapper.get('button[aria-label="Mostrar contraseña"]').trigger('click')

    expect(wrapper.get('input').attributes('type')).toBe('text')
  })
})
