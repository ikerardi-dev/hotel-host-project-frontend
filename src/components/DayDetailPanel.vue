<script setup>
import { CalendarX, LogIn, LogOut, Pencil, Phone, StickyNote, Users } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CleaningTaskCard from '@/components/CleaningTaskCard.vue'
import { channelLabel } from '@/utils/bookingChannels'
import { countNights } from '@/utils/dates'
import { formatDayTitle, formatShortDate, formatTime } from '@/utils/format'

defineProps({
  date: { type: String, required: true },
  today: { type: String, required: true },
  bookings: { type: Array, required: true },
  cleanings: { type: Array, required: true },
  capacity: { type: Number, required: true },
})

const emit = defineEmits(['edit', 'cancel'])
</script>

<template>
  <section class="flex flex-col gap-3">
    <h2 class="text-label-lg uppercase text-primary first-letter:uppercase">{{ formatDayTitle(date, today) }}</h2>

    <p v-if="bookings.length === 0 && cleanings.length === 0" class="text-body-md text-ink-muted">
      Día libre: sin reservas ni limpiezas.
    </p>

    <article
      v-for="booking in bookings"
      :key="booking.id"
      class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card"
    >
      <header class="flex items-start justify-between gap-2">
        <div>
          <p class="text-label-sm uppercase text-ink-muted">
            {{ booking.checkIn.slice(0, 10) === date ? 'Huésped entrante' : booking.checkOut.slice(0, 10) === date ? 'Huésped saliente' : 'Huésped alojado' }}
          </p>
          <h3 class="text-headline-sm">{{ booking.guestName }}</h3>
        </div>
        <BaseBadge variant="neutral">{{ channelLabel(booking.channel) }}</BaseBadge>
      </header>

      <dl class="grid grid-cols-2 gap-2 rounded-md bg-surface-muted p-3 text-body-sm">
        <div>
          <dt class="flex items-center gap-1 text-label-md text-primary">
            <LogIn class="size-3.5" aria-hidden="true" /> Entrada
          </dt>
          <dd>{{ formatShortDate(booking.checkIn) }}, {{ formatTime(booking.checkIn) }}</dd>
        </div>
        <div>
          <dt class="flex items-center gap-1 text-label-md text-warning-ink">
            <LogOut class="size-3.5" aria-hidden="true" /> Salida
          </dt>
          <dd>{{ formatShortDate(booking.checkOut) }}, {{ formatTime(booking.checkOut) }}</dd>
        </div>
      </dl>

      <p class="flex items-center gap-2 text-body-md">
        <Users class="size-4 text-ink-muted" aria-hidden="true" />
        {{ booking.guests }} de {{ capacity }} plazas ·
        {{ countNights(booking.checkIn.slice(0, 10), booking.checkOut.slice(0, 10)) }} noches
      </p>
      <a v-if="booking.guestPhone" :href="`tel:${booking.guestPhone}`" class="flex items-center gap-2 text-body-md text-primary">
        <Phone class="size-4" aria-hidden="true" />
        {{ booking.guestPhone }}
      </a>
      <p v-if="booking.guestEmail" class="truncate text-body-md text-ink-muted">{{ booking.guestEmail }}</p>
      <p v-if="booking.reference" class="text-body-sm text-ink-muted">Referencia: {{ booking.reference }}</p>
      <p v-if="booking.notes" class="flex items-start gap-2 rounded-md bg-warning-soft p-3 text-body-md text-warning-ink">
        <StickyNote class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {{ booking.notes }}
      </p>

      <div class="flex gap-2">
        <BaseButton variant="secondary" class="flex-1" @click="emit('edit', booking)">
          <Pencil class="size-4" aria-hidden="true" />
          Editar
        </BaseButton>
        <BaseButton variant="danger" class="flex-1" @click="emit('cancel', booking)">
          <CalendarX class="size-4" aria-hidden="true" />
          Cancelar reserva
        </BaseButton>
      </div>
    </article>

    <CleaningTaskCard v-for="cleaning in cleanings" :key="cleaning.id" :cleaning="cleaning" show-assignee />
  </section>
</template>
