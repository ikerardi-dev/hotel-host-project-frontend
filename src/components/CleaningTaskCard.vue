<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BedDouble, Building, Clock, UserRound } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { CLEANING_STATUS } from '@/utils/cleaningStatus'
import { formatBeds, formatHour, formatTime } from '@/utils/format'

const props = defineProps({
  cleaning: { type: Object, required: true },
  // Vista del admin: muestra a quién está asignada y destaca las que necesitan atención
  showAssignee: { type: Boolean, default: false },
})

const status = computed(() => CLEANING_STATUS[props.cleaning.status])
const doneTasks = computed(() => props.cleaning.checklist.filter((item) => item.done).length)
const needsAttention = computed(
  () => props.showAssignee && (!props.cleaning.assignedTo || props.cleaning.incidentNotes),
)
</script>

<template>
  <RouterLink
    :to="{ name: 'cleaning-detail', params: { id: cleaning.id } }"
    class="flex flex-col gap-3 rounded-lg border bg-surface p-4 shadow-card"
    :class="
      needsAttention
        ? 'border-danger-line'
        : cleaning.status === 'IN_PROGRESS'
          ? 'border-warning-line'
          : 'border-border'
    "
  >
    <header class="flex items-start justify-between gap-2">
      <div>
        <p class="flex items-center gap-1 text-label-sm uppercase text-primary">
          <Building class="size-3.5" aria-hidden="true" />
          {{ cleaning.apartment.buildingName }}
        </p>
        <h3 class="text-headline-md">Unidad {{ cleaning.apartment.code }}</h3>
      </div>
      <BaseBadge :variant="status.variant">{{ status.label }}</BaseBadge>
    </header>

    <div class="flex flex-col gap-1 rounded-md bg-surface-muted px-3 py-2">
      <p class="flex items-center gap-2 text-label-lg">
        <Clock class="size-4 text-ink-muted" aria-hidden="true" />
        {{ formatHour(cleaning.startTime) }} – {{ formatHour(cleaning.endTime) }}
      </p>
      <p v-if="cleaning.previousCheckOut || cleaning.nextCheckIn" class="text-body-sm text-ink-muted">
        <span v-if="cleaning.previousCheckOut">Salida {{ formatTime(cleaning.previousCheckOut) }}</span>
        <span v-if="cleaning.previousCheckOut && cleaning.nextCheckIn"> · </span>
        <span v-if="cleaning.nextCheckIn">Próxima entrada {{ formatTime(cleaning.nextCheckIn) }}</span>
      </p>
    </div>

    <p v-if="showAssignee" class="flex items-center gap-2 text-label-lg">
      <UserRound class="size-4 text-ink-muted" aria-hidden="true" />
      <span v-if="cleaning.assignedTo">{{ cleaning.assignedTo.name }}</span>
      <span v-else class="text-danger-ink">Sin asignar</span>
    </p>

    <p class="flex items-start gap-2 text-body-md text-ink-muted">
      <BedDouble class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {{ formatBeds(cleaning.apartment.beds) }}
    </p>

    <p class="text-body-sm text-ink-muted">
      Checklist: {{ doneTasks }} de {{ cleaning.checklist.length }}
      <span v-if="cleaning.incidentNotes" class="text-danger-ink"> · Con incidencia</span>
    </p>
  </RouterLink>
</template>
