import { computed, toValue } from 'vue'

/**
 * Agrupa los apartamentos por edificio, en el orden en que llegan, con cuántos están ocupados.
 * apartments: ref, computed o array de apartamentos de la API.
 */
export function useBuildingGroups(apartments) {
  return computed(() => {
    const byId = new Map()
    for (const apartment of toValue(apartments)) {
      const { id, name } = apartment.building
      if (!byId.has(id)) byId.set(id, { id, name, apartments: [] })
      byId.get(id).apartments.push(apartment)
    }
    return [...byId.values()].map((building) => {
      const occupied = building.apartments.filter((a) => a.status === 'OCCUPIED').length
      return {
        ...building,
        occupied,
        occupancy: Math.round((occupied / building.apartments.length) * 100),
      }
    })
  })
}
