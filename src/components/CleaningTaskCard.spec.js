import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import CleaningTaskCard from './CleaningTaskCard.vue'

function cleaning(overrides = {}) {
  return {
    id: 7,
    status: 'PENDING',
    startTime: '12:00:00',
    endTime: '14:00:00',
    previousCheckOut: '2026-10-12T11:00:00',
    nextCheckIn: null,
    assignedTo: { id: 3, name: 'Ana López' },
    incidentNotes: null,
    apartment: { code: 'A', buildingName: 'Legazpi', beds: [{ type: 'DOUBLE_BED', quantity: 1 }] },
    checklist: [
      { id: 1, done: true },
      { id: 2, done: false },
    ],
    ...overrides,
  }
}

function mountCard(props) {
  return mount(CleaningTaskCard, { props, global: { stubs: { RouterLink: RouterLinkStub } } })
}

describe('CleaningTaskCard', () => {
  it('muestra el apartamento, el estado y el progreso del checklist', () => {
    const wrapper = mountCard({ cleaning: cleaning() })

    expect(wrapper.text()).toContain('Legazpi')
    expect(wrapper.text()).toContain('Unidad A')
    expect(wrapper.text()).toContain('Pendiente')
    expect(wrapper.text()).toContain('Checklist: 1 de 2')
  })

  it('enlaza al detalle de la limpieza', () => {
    const wrapper = mountCard({ cleaning: cleaning() })

    expect(wrapper.getComponent(RouterLinkStub).props('to')).toEqual({
      name: 'cleaning-detail',
      params: { id: 7 },
    })
  })

  it('solo muestra el empleado asignado en la vista del admin', () => {
    expect(mountCard({ cleaning: cleaning() }).text()).not.toContain('Ana López')
    expect(mountCard({ cleaning: cleaning(), showAssignee: true }).text()).toContain('Ana López')
  })

  it('destaca en el admin las limpiezas sin asignar o con incidencia', () => {
    const unassigned = mountCard({ cleaning: cleaning({ assignedTo: null }), showAssignee: true })
    const withIncident = mountCard({
      cleaning: cleaning({ incidentNotes: 'Falta una toalla' }),
      showAssignee: true,
    })

    expect(unassigned.text()).toContain('Sin asignar')
    expect(unassigned.getComponent(RouterLinkStub).classes()).toContain('border-danger-line')
    expect(withIncident.text()).toContain('Con incidencia')
    expect(withIncident.getComponent(RouterLinkStub).classes()).toContain('border-danger-line')
  })
})
