<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { buildMonthGrid, isNightBooked } from '@/utils/calendar'

const props = defineProps({
  year: { type: Number, required: true },
  month: { type: Number, required: true }, // 0 a 11
  bookings: { type: Array, required: true },
  cleanings: { type: Array, required: true },
  selectedDate: { type: String, default: null },
  today: { type: String, required: true },
})

const emit = defineEmits(['select', 'previous', 'next'])

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' })

const title = computed(() => monthName.format(new Date(props.year, props.month, 1)))
const cleaningDates = computed(() => new Set(props.cleanings.map((cleaning) => cleaning.date)))

const days = computed(() =>
  buildMonthGrid(props.year, props.month).map((day) => ({
    ...day,
    number: Number(day.date.slice(8)),
    booked: isNightBooked(day.date, props.bookings),
    cleaning: cleaningDates.value.has(day.date),
  })),
)

function dayClasses(day) {
  if (day.date === props.selectedDate) return 'bg-primary text-white'
  if (day.booked) return 'bg-primary/15 text-primary'
  return day.inMonth ? 'text-ink' : 'text-ink-disabled'
}
</script>

<template>
  <section class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
    <header class="flex items-center justify-between">
      <h2 class="text-headline-sm first-letter:uppercase">{{ title }}</h2>
      <div class="flex gap-1">
        <button
          type="button"
          class="flex size-11 items-center justify-center rounded-full bg-surface-muted"
          aria-label="Mes anterior"
          @click="emit('previous')"
        >
          <ChevronLeft class="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="flex size-11 items-center justify-center rounded-full bg-surface-muted"
          aria-label="Mes siguiente"
          @click="emit('next')"
        >
          <ChevronRight class="size-5" aria-hidden="true" />
        </button>
      </div>
    </header>

    <div class="grid grid-cols-7 gap-1 text-center" role="grid">
      <span v-for="weekday in WEEKDAYS" :key="weekday" class="py-1 text-label-md text-ink-muted" role="columnheader">
        {{ weekday }}
      </span>
      <button
        v-for="day in days"
        :key="day.date"
        type="button"
        class="relative flex aspect-square items-center justify-center rounded-md text-label-lg tabular-nums"
        :class="[dayClasses(day), { 'ring-2 ring-primary': day.date === today && day.date !== selectedDate }]"
        :aria-pressed="day.date === selectedDate"
        :aria-label="`${day.number}${day.booked ? ', reservado' : ''}${day.cleaning ? ', limpieza' : ''}`"
        @click="emit('select', day.date)"
      >
        {{ day.number }}
        <span
          v-if="day.cleaning"
          class="absolute bottom-1 size-1.5 rounded-full bg-warning"
          aria-hidden="true"
        />
      </button>
    </div>

    <ul class="flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-ink-muted">
      <li class="flex items-center gap-1.5"><span class="size-3 rounded-sm bg-primary/15" /> Reservado</li>
      <li class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-warning" /> Limpieza</li>
      <li class="flex items-center gap-1.5"><span class="size-3 rounded-sm ring-2 ring-primary" /> Hoy</li>
    </ul>
  </section>
</template>
