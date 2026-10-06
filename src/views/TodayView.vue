<script setup>
import { computed, onMounted, ref } from 'vue'
import ApartmentCard from '@/components/ApartmentCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import { getApartments } from '@/api/apartments'

const apartments = ref([])
const loading = ref(true)
const loadError = ref('')
const selectedBuildingId = ref(null) // null = todos

onMounted(async () => {
  try {
    apartments.value = await getApartments()
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
})

// Edificios en el orden en que llegan los apartamentos, con sus apartamentos y ocupados
const buildings = computed(() => {
  const byId = new Map()
  for (const apartment of apartments.value) {
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

const visibleBuildings = computed(() =>
  selectedBuildingId.value === null
    ? buildings.value
    : buildings.value.filter((building) => building.id === selectedBuildingId.value),
)
</script>

<template>
  <section class="flex flex-col gap-5">
    <p v-if="loading" class="text-body-md text-ink-muted">Cargando apartamentos…</p>
    <p v-else-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>

    <template v-else>
      <div class="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
        <BaseChip class="shrink-0" :selected="selectedBuildingId === null" @click="selectedBuildingId = null">
          Todos ({{ apartments.length }})
        </BaseChip>
        <BaseChip
          v-for="building in buildings"
          :key="building.id"
          class="shrink-0"
          :selected="selectedBuildingId === building.id"
          @click="selectedBuildingId = building.id"
        >
          {{ building.name }} ({{ building.apartments.length }})
        </BaseChip>
      </div>

      <section v-for="building in visibleBuildings" :key="building.id" class="flex flex-col gap-3">
        <header class="flex items-end justify-between gap-2">
          <div>
            <h2 class="text-headline-md">{{ building.name }}</h2>
            <p class="text-body-sm text-ink-muted">
              {{ building.apartments.length }} apartamentos · {{ building.occupied }} ocupados
            </p>
          </div>
          <BaseBadge variant="primary">{{ building.occupancy }}% ocupación</BaseBadge>
        </header>

        <div class="grid grid-cols-2 gap-3">
          <ApartmentCard v-for="apartment in building.apartments" :key="apartment.id" :apartment="apartment" />
        </div>
      </section>
    </template>
  </section>
</template>
