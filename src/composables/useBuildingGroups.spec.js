import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useBuildingGroups } from './useBuildingGroups'

function apartment(id, buildingId, buildingName, status) {
  return { id, code: String(id), status, building: { id: buildingId, name: buildingName } }
}

describe('useBuildingGroups', () => {
  it('agrupa por edificio en el orden de llegada y calcula la ocupación', () => {
    const apartments = ref([
      apartment(1, 1, 'Legazpi', 'OCCUPIED'),
      apartment(2, 1, 'Legazpi', 'FREE'),
      apartment(3, 2, 'Casa Baratura', 'OCCUPIED'),
      apartment(4, 1, 'Legazpi', 'OCCUPIED'),
    ])

    const groups = useBuildingGroups(apartments)

    expect(groups.value.map((g) => g.name)).toEqual(['Legazpi', 'Casa Baratura'])
    expect(groups.value[0]).toMatchObject({ occupied: 2, occupancy: 67 })
    expect(groups.value[0].apartments).toHaveLength(3)
    expect(groups.value[1]).toMatchObject({ occupied: 1, occupancy: 100 })
  })

  it('se recalcula cuando cambian los apartamentos', () => {
    const apartments = ref([apartment(1, 1, 'Legazpi', 'FREE')])
    const groups = useBuildingGroups(apartments)
    expect(groups.value[0].occupied).toBe(0)

    apartments.value = [apartment(1, 1, 'Legazpi', 'OCCUPIED')]

    expect(groups.value[0].occupied).toBe(1)
  })
})
