<script setup>
import { RouterLink } from 'vue-router'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { CLEANING_STATUS } from '@/utils/cleaningStatus'
import { formatHour } from '@/utils/format'

defineProps({
  events: { type: Array, required: true },
})

const TYPES = {
  CHECK_OUT: { label: 'Salida', dot: 'bg-warning-ink' },
  CLEANING: { label: 'Limpieza', dot: 'bg-warning' },
  CHECK_IN: { label: 'Entrada', dot: 'bg-primary' },
}

// Las limpiezas llevan a su detalle; entradas y salidas, al calendario del apartamento
function linkTo(event) {
  return event.type === 'CLEANING'
    ? { name: 'cleaning-detail', params: { id: event.cleaningId } }
    : { name: 'apartment-detail', params: { id: event.apartmentId } }
}
</script>

<template>
  <section class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
    <h2 class="text-headline-sm">Hoy</h2>

    <p v-if="events.length === 0" class="text-body-md text-ink-muted">
      Hoy no hay entradas, salidas ni limpiezas.
    </p>

    <ol class="flex flex-col">
      <li v-for="(event, index) in events" :key="index" class="flex gap-3">
        <div class="flex flex-col items-center pt-1.5" aria-hidden="true">
          <span class="size-2.5 rounded-full" :class="TYPES[event.type].dot" />
          <span v-if="index < events.length - 1" class="w-px flex-1 bg-border" />
        </div>
        <RouterLink :to="linkTo(event)" class="flex flex-1 flex-col gap-0.5 pb-4">
          <p class="flex flex-wrap items-center gap-x-2 text-label-lg">
            <span class="tabular-nums">
              {{ formatHour(event.time) }}<template v-if="event.endTime">–{{ formatHour(event.endTime) }}</template>
            </span>
            <span class="text-label-md uppercase text-ink-muted">{{ TYPES[event.type].label }}</span>
            <span>{{ event.buildingName }} · {{ event.apartmentCode }}</span>
          </p>
          <p v-if="event.guestName" class="text-body-sm text-ink-muted">Huésped: {{ event.guestName }}</p>
          <div v-if="event.type === 'CLEANING'" class="flex flex-wrap items-center gap-2 text-body-sm">
            <span :class="event.assignedToName ? 'text-ink-muted' : 'text-danger-ink'">
              {{ event.assignedToName ?? 'Sin asignar' }}
            </span>
            <BaseBadge :variant="CLEANING_STATUS[event.cleaningStatus].variant">
              {{ CLEANING_STATUS[event.cleaningStatus].label }}
            </BaseBadge>
          </div>
        </RouterLink>
      </li>
    </ol>
  </section>
</template>
