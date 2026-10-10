<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import OccupancyGrid from '@/components/OccupancyGrid.vue'
import { getBuildings } from '@/api/buildings'
import { getOccupancy } from '@/api/occupancy'
import { localDate } from '@/utils/dates'
import { formatShortDate } from '@/utils/format'
import { addDays, startOfWeek, weekDays } from '@/utils/occupancy'

const today = localDate(0)

const buildings = ref([])
const buildingId = ref(null)
const monday = ref(startOfWeek(today))
const occupancy = ref(null)
const loadError = ref('')

const days = computed(() => weekDays(monday.value))
const weekTitle = computed(
  () => `${formatShortDate(`${days.value[0]}T00:00:00`)} – ${formatShortDate(`${days.value.at(-1)}T00:00:00`)}`,
)
// Ocupación de hoy en el edificio (si hoy está en la semana visible)
const occupiedToday = computed(() => {
  if (!occupancy.value || !days.value.includes(today)) return null
  const ids = new Set(
    occupancy.value.bookings
      .filter((b) => b.checkIn.slice(0, 10) <= today && today < b.checkOut.slice(0, 10))
      .map((b) => b.apartmentId),
  )
  return ids.size
})

async function load() {
  if (!buildingId.value) return
  try {
    occupancy.value = await getOccupancy(buildingId.value, days.value[0], days.value.at(-1))
    loadError.value = ''
  } catch (e) {
    loadError.value = e.message
  }
}

onMounted(async () => {
  try {
    buildings.value = await getBuildings()
    buildingId.value = buildings.value[0]?.id ?? null
  } catch (e) {
    loadError.value = e.message
  }
})

watch([buildingId, monday], load)
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
      <BaseChip
        v-for="building in buildings"
        :key="building.id"
        class="shrink-0"
        :selected="buildingId === building.id"
        @click="buildingId = building.id"
      >
        {{ building.name }}
        <span class="text-label-md opacity-75">{{ building.apartmentCount }}</span>
      </BaseChip>
    </div>

    <div class="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-2 py-1 shadow-card">
      <button
        type="button"
        class="flex size-11 items-center justify-center rounded-full"
        aria-label="Semana anterior"
        @click="monday = addDays(monday, -7)"
      >
        <ChevronLeft class="size-5" aria-hidden="true" />
      </button>
      <div class="text-center">
        <p class="text-label-lg">{{ weekTitle }}</p>
        <button
          v-if="monday !== startOfWeek(today)"
          type="button"
          class="text-label-md text-primary"
          @click="monday = startOfWeek(today)"
        >
          Volver a esta semana
        </button>
        <p v-else-if="occupiedToday !== null && occupancy" class="text-body-sm text-ink-muted">
          Hoy: {{ occupiedToday }} de {{ occupancy.apartments.length }} ocupados
        </p>
      </div>
      <button
        type="button"
        class="flex size-11 items-center justify-center rounded-full"
        aria-label="Semana siguiente"
        @click="monday = addDays(monday, 7)"
      >
        <ChevronRight class="size-5" aria-hidden="true" />
      </button>
    </div>

    <ul class="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-ink-muted">
      <li class="flex items-center gap-1.5"><span class="size-3 rounded-sm bg-primary" /> Reserva</li>
      <li class="flex items-center gap-1.5"><span class="size-3 rounded-sm bg-warning" /> Limpieza</li>
      <li class="flex items-center gap-1.5"><span class="size-3 rounded-sm bg-primary/10" /> Hoy</li>
      <li>B Booking · A Airbnb · D Directa · T Teléfono</li>
    </ul>

    <p v-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>

    <OccupancyGrid
      v-if="occupancy"
      :days="days"
      :today="today"
      :apartments="occupancy.apartments"
      :bookings="occupancy.bookings"
      :cleanings="occupancy.cleanings"
    />
  </section>
</template>
