<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus } from '@lucide/vue'
import ApartmentCard from '@/components/ApartmentCard.vue'
import BookingFormModal from '@/components/BookingFormModal.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import TodaySummary from '@/components/TodaySummary.vue'
import TodayTimeline from '@/components/TodayTimeline.vue'
import { getApartments } from '@/api/apartments'
import { getTodayDashboard } from '@/api/dashboard'
import { useAsyncData } from '@/composables/useAsyncData'
import { useBuildingGroups } from '@/composables/useBuildingGroups'

const selectedBuildingId = ref(null) // null = todos
const bookingModalOpen = ref(false)

// Resumen del día y apartamentos; se recarga también al guardar una reserva
const {
  data,
  loading,
  error: loadError,
  reload: load,
} = useAsyncData(async () => {
  const [dashboard, apartments] = await Promise.all([getTodayDashboard(), getApartments()])
  return { dashboard, apartments }
})

const dashboard = computed(() => data.value?.dashboard ?? null)
const apartments = computed(() => data.value?.apartments ?? [])
const buildings = useBuildingGroups(apartments)

const visibleBuildings = computed(() =>
  selectedBuildingId.value === null
    ? buildings.value
    : buildings.value.filter((building) => building.id === selectedBuildingId.value),
)
</script>

<template>
  <section class="flex flex-col gap-5">
    <p v-if="loading" class="text-body-md text-ink-muted">Cargando…</p>
    <p v-else-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>

    <template v-else>
      <TodaySummary :dashboard="dashboard" />
      <TodayTimeline :events="dashboard.timeline" />

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

        <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <RouterLink
            v-for="apartment in building.apartments"
            :key="apartment.id"
            :to="{ name: 'apartment-detail', params: { id: apartment.id } }"
            class="flex"
          >
            <ApartmentCard class="flex-1" :apartment="apartment" />
          </RouterLink>
        </div>
      </section>

      <button
        type="button"
        class="fixed right-4 bottom-24 z-10 flex size-14 lg:right-8 lg:bottom-8 items-center justify-center rounded-full bg-primary text-white shadow-floating hover:bg-primary-hover"
        aria-label="Registrar reserva"
        @click="bookingModalOpen = true"
      >
        <Plus class="size-6" aria-hidden="true" />
      </button>

      <BookingFormModal v-model:open="bookingModalOpen" :apartments="apartments" @saved="load" />
    </template>
  </section>
</template>
