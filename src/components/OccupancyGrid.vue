<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { BrushCleaning } from '@lucide/vue'
import { bookingSpan, channelLetter } from '@/utils/occupancy'

const props = defineProps({
  days: { type: Array, required: true }, // 7 fechas AAAA-MM-DD
  today: { type: String, required: true },
  apartments: { type: Array, required: true },
  bookings: { type: Array, required: true },
  cleanings: { type: Array, required: true },
})

const router = useRouter()

const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })

const header = computed(() =>
  props.days.map((date) => ({
    date,
    weekday: weekday.format(new Date(`${date}T00:00:00`)).replace('.', ''),
    number: Number(date.slice(8)),
  })),
)

// Por apartamento: sus barras de reserva y las columnas con limpieza
const rows = computed(() =>
  props.apartments.map((apartment) => ({
    ...apartment,
    bars: props.bookings
      .filter((booking) => booking.apartmentId === apartment.id)
      .map((booking) => ({ booking, span: bookingSpan(booking, props.days) }))
      .filter(({ span }) => span !== null),
    cleaningColumns: props.cleanings
      .filter((cleaning) => cleaning.apartmentId === apartment.id)
      .map((cleaning) => props.days.indexOf(cleaning.date) + 1)
      .filter((column) => column > 0),
  })),
)

function surname(guestName) {
  return guestName.trim().split(/\s+/).at(-1)
}
</script>

<template>
  <div class="-mx-4 overflow-x-auto px-4">
    <div class="min-w-[22rem] overflow-hidden rounded-lg border border-border bg-surface shadow-card" role="table">
      <div class="grid grid-cols-[3.5rem_repeat(7,minmax(2.5rem,1fr))] border-b border-border" role="row">
        <span class="px-2 py-2 text-label-sm uppercase text-ink-muted" role="columnheader">Apto.</span>
        <span
          v-for="day in header"
          :key="day.date"
          class="flex flex-col items-center py-1 text-label-sm"
          :class="day.date === today ? 'bg-primary/10 text-primary' : 'text-ink-muted'"
          role="columnheader"
        >
          <span class="uppercase">{{ day.weekday }}</span>
          <span class="text-label-lg tabular-nums">{{ day.number }}</span>
        </span>
      </div>

      <button
        v-for="row in rows"
        :key="row.id"
        type="button"
        class="grid w-full grid-cols-[3.5rem_1fr] border-b border-border text-left last:border-b-0 hover:bg-surface-muted"
        role="row"
        :aria-label="`Apartamento ${row.code}: ver calendario`"
        @click="router.push({ name: 'apartment-detail', params: { id: row.id } })"
      >
        <span class="flex flex-col justify-center px-2 py-2" role="rowheader">
          <span class="text-label-lg tabular-nums">{{ row.code }}</span>
          <span class="text-label-sm text-ink-muted">{{ row.capacity }}p</span>
        </span>

        <!-- Celdas de fondo, barras de reserva y limpiezas comparten la fila 1 de esta cuadrícula -->
        <span class="grid min-h-12 grid-cols-7 items-center" role="cell">
          <span
            v-for="(day, index) in days"
            :key="day"
            class="h-full border-l border-border"
            :class="{ 'bg-primary/10': day === today }"
            :style="{ gridColumn: index + 1, gridRow: 1 }"
          />
          <span
            v-for="{ booking, span } in row.bars"
            :key="booking.id"
            class="z-10 mx-0.5 flex h-7 items-center gap-1 overflow-hidden bg-primary px-1.5 text-label-sm text-white"
            :class="[span.continuesBefore ? 'rounded-l-none' : 'rounded-l-md', span.continuesAfter ? 'rounded-r-none' : 'rounded-r-md']"
            :style="{ gridColumn: `${span.start} / ${span.end}`, gridRow: 1 }"
            :title="`${booking.guestName} (${booking.checkIn.slice(0, 10)} → ${booking.checkOut.slice(0, 10)})`"
          >
            <span class="rounded-sm bg-white/25 px-1">{{ channelLetter(booking.channel) }}</span>
            <span class="truncate">{{ surname(booking.guestName) }}</span>
          </span>
          <span
            v-for="column in row.cleaningColumns"
            :key="`c${column}`"
            class="z-20 flex size-5 items-center justify-center self-end justify-self-end rounded-sm bg-warning text-white"
            :style="{ gridColumn: column, gridRow: 1 }"
            aria-label="Limpieza"
          >
            <BrushCleaning class="size-3.5" aria-hidden="true" />
          </span>
        </span>
      </button>
    </div>
  </div>
</template>
