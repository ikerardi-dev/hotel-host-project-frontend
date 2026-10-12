import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  it('muestra el contenido y es de tipo button por defecto', () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Guardar' } })

    expect(wrapper.text()).toBe('Guardar')
    expect(wrapper.attributes('type')).toBe('button')
    expect(wrapper.classes()).toContain('bg-primary')
  })

  it('aplica la variante y el tipo indicados', () => {
    const wrapper = mount(BaseButton, { props: { variant: 'danger', type: 'submit' } })

    expect(wrapper.attributes('type')).toBe('submit')
    expect(wrapper.classes()).toContain('bg-danger')
  })

  it('queda deshabilitado si se le pasa disabled', () => {
    const wrapper = mount(BaseButton, { attrs: { disabled: true } })

    expect(wrapper.element.disabled).toBe(true)
  })
})
