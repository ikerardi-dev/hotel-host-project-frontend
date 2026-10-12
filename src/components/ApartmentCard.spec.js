import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ApartmentCard from './ApartmentCard.vue'

function apartment(overrides = {}) {
  return {
    id: 1,
    code: '2B',
    capacity: 6,
    status: 'FREE',
    beds: [
      { type: 'DOUBLE_BED', quantity: 1 },
      { type: 'SINGLE_BED', quantity: 2 },
    ],
    currentGuest: null,
    nextGuest: null,
    ...overrides,
  }
}

describe('ApartmentCard', () => {
  it('muestra el código, las plazas, las camas y el estado', () => {
    const wrapper = mount(ApartmentCard, { props: { apartment: apartment() } })

    expect(wrapper.text()).toContain('2B')
    expect(wrapper.text()).toContain('6 plazas')
    expect(wrapper.text()).toContain('1 cama doble · 2 individuales')
    expect(wrapper.text()).toContain('Libre')
    expect(wrapper.text()).toContain('Sin reservas próximas')
  })

  it('muestra el huésped actual si está ocupado', () => {
    const wrapper = mount(ApartmentCard, {
      props: {
        apartment: apartment({
          status: 'OCCUPIED',
          currentGuest: {
            guestName: 'Laura Gómez',
            checkIn: '2026-10-10T16:00:00',
            checkOut: '2026-10-14T11:00:00',
          },
        }),
      },
    })

    expect(wrapper.text()).toContain('Ocupado')
    expect(wrapper.text()).toContain('Laura Gómez')
  })

  it('muestra la próxima entrada si no hay huésped', () => {
    const wrapper = mount(ApartmentCard, {
      props: { apartment: apartment({ status: 'READY', nextGuest: { checkIn: '2026-10-20T16:00:00' } }) },
    })

    expect(wrapper.text()).toContain('Limpio y listo')
    expect(wrapper.text()).toContain('Próxima entrada')
  })
})
