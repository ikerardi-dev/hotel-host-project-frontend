<script setup>
import { computed } from 'vue'
import { Building, BrushCleaning, LogIn, LogOut } from '@lucide/vue'

const props = defineProps({
  dashboard: { type: Object, required: true },
})

const occupancy = computed(() =>
  props.dashboard.totalApartments
    ? Math.round((props.dashboard.occupiedApartments / props.dashboard.totalApartments) * 100)
    : 0,
)
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <article class="flex flex-col gap-1 rounded-lg border border-border bg-surface p-3 shadow-card">
      <LogIn class="size-5 text-primary" aria-hidden="true" />
      <p class="text-headline-lg-mobile tabular-nums">{{ dashboard.checkIns }}</p>
      <h3 class="text-label-md text-ink-muted">Entradas hoy</h3>
    </article>

    <article class="flex flex-col gap-1 rounded-lg border border-border bg-surface p-3 shadow-card">
      <LogOut class="size-5 text-warning-ink" aria-hidden="true" />
      <p class="text-headline-lg-mobile tabular-nums">{{ dashboard.checkOuts }}</p>
      <h3 class="text-label-md text-ink-muted">Salidas hoy</h3>
    </article>

    <article class="flex flex-col gap-1 rounded-lg border border-border bg-surface p-3 shadow-card">
      <BrushCleaning class="size-5 text-warning" aria-hidden="true" />
      <p class="text-headline-lg-mobile tabular-nums">{{ dashboard.pendingCleanings }}</p>
      <h3 class="text-label-md text-ink-muted">Limpiezas pendientes</h3>
      <p class="text-body-sm text-ink-muted">
        {{ dashboard.inProgressCleanings }} en curso · {{ dashboard.doneCleanings }} hechas
      </p>
    </article>

    <article class="flex flex-col gap-1 rounded-lg border border-border bg-surface p-3 shadow-card">
      <Building class="size-5 text-primary" aria-hidden="true" />
      <p class="text-headline-lg-mobile tabular-nums">
        {{ dashboard.occupiedApartments }}<span class="text-headline-sm text-ink-muted"> / {{ dashboard.totalApartments }}</span>
      </p>
      <h3 class="text-label-md text-ink-muted">Ocupación ahora</h3>
      <div
        class="h-1.5 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        :aria-valuenow="occupancy"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div class="h-full rounded-full bg-primary" :style="{ width: `${occupancy}%` }" />
      </div>
    </article>
  </div>
</template>
