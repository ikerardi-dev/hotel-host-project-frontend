<script setup>
import { computed } from 'vue'
import { Users } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { formatBeds, formatDateRange, formatShortDate, formatTime } from '@/utils/format'

const props = defineProps({
  apartment: { type: Object, required: true },
})

const STATUS = {
  OCCUPIED: { label: 'Ocupado', variant: 'primary' },
  PENDING_CLEANING: { label: 'Pendiente de limpieza', variant: 'warning' },
  READY: { label: 'Limpio y listo', variant: 'success' },
  FREE: { label: 'Libre', variant: 'neutral' },
}

const status = computed(() => STATUS[props.apartment.status])
const beds = computed(() => formatBeds(props.apartment.beds))
</script>

<template>
  <article class="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 shadow-card">
    <header class="flex flex-wrap items-start justify-between gap-1">
      <h3 class="text-headline-md tabular-nums">{{ apartment.code }}</h3>
      <BaseBadge :variant="status.variant">{{ status.label }}</BaseBadge>
    </header>

    <p class="flex items-center gap-1.5 text-body-sm text-ink-muted">
      <Users class="size-4 shrink-0" aria-hidden="true" />
      {{ apartment.capacity }} plazas
    </p>
    <p class="text-body-sm text-ink-muted">{{ beds }}</p>

    <div class="mt-auto border-t border-border pt-2 text-body-sm">
      <template v-if="apartment.currentGuest">
        <p class="truncate text-label-md">{{ apartment.currentGuest.guestName }}</p>
        <p class="text-ink-muted">
          {{ formatDateRange(apartment.currentGuest.checkIn, apartment.currentGuest.checkOut) }}
        </p>
      </template>
      <template v-else-if="apartment.nextGuest">
        <p class="text-ink-muted">Próxima entrada</p>
        <p class="text-label-md text-primary">
          {{ formatShortDate(apartment.nextGuest.checkIn) }}, {{ formatTime(apartment.nextGuest.checkIn) }}
        </p>
      </template>
      <p v-else class="text-ink-muted">Sin reservas próximas</p>
    </div>
  </article>
</template>
