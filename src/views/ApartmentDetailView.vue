<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, BedDouble } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import BookingCalendar from '@/components/BookingCalendar.vue'
import BookingFormModal from '@/components/BookingFormModal.vue'
import DayDetailPanel from '@/components/DayDetailPanel.vue'
import { getApartment, getApartmentBookings, getApartmentCleanings } from '@/api/apartments'
import { cancelBooking } from '@/api/bookings'
import { useToastStore } from '@/stores/toast'
import { buildMonthGrid, bookingsOnDay } from '@/utils/calendar'
import { localDate } from '@/utils/dates'
import { formatBeds } from '@/utils/format'

const STATUS = {
  OCCUPIED: { label: 'Ocupado', variant: 'primary' },
  PENDING_CLEANING: { label: 'Pendiente de limpieza', variant: 'warning' },
  READY: { label: 'Limpio y listo', variant: 'success' },
  FREE: { label: 'Libre', variant: 'neutral' },
}

const route = useRoute()
const router = useRouter()
const today = localDate(0)

const apartment = ref(null)
const bookings = ref([])
const cleanings = ref([])
const loadError = ref('')
const year = ref(Number(today.slice(0, 4)))
const month = ref(Number(today.slice(5, 7)) - 1)
const selectedDate = ref(null)

async function loadMonth() {
  // Se piden todos los días visibles del calendario, también los del mes anterior y siguiente
  const days = buildMonthGrid(year.value, month.value)
  const from = days[0].date
  const to = days.at(-1).date
  try {
    ;[bookings.value, cleanings.value] = await Promise.all([
      getApartmentBookings(route.params.id, from, to),
      getApartmentCleanings(route.params.id, from, to),
    ])
  } catch (e) {
    loadError.value = e.message
  }
}

onMounted(async () => {
  try {
    apartment.value = await getApartment(route.params.id)
  } catch (e) {
    loadError.value = e.message
    return
  }
  loadMonth()
})

watch([year, month], loadMonth)

function changeMonth(delta) {
  const date = new Date(year.value, month.value + delta, 1)
  year.value = date.getFullYear()
  month.value = date.getMonth()
  selectedDate.value = null
}

// Pulsar el día seleccionado lo cierra
function selectDay(date) {
  selectedDate.value = selectedDate.value === date ? null : date
}

// Editar y cancelar reservas desde el detalle del día
const toast = useToastStore()
const editingBooking = ref(null)
const formOpen = ref(false)
const cancellingBooking = ref(null)
const cancelOpen = ref(false)
const cancelling = ref(false)

async function reload() {
  try {
    apartment.value = await getApartment(route.params.id)
  } catch (e) {
    loadError.value = e.message
  }
  await loadMonth()
}

function editBooking(booking) {
  editingBooking.value = booking
  formOpen.value = true
}

function askCancel(booking) {
  cancellingBooking.value = booking
  cancelOpen.value = true
}

async function confirmCancel() {
  cancelling.value = true
  try {
    await cancelBooking(cancellingBooking.value.id)
    toast.show('Reserva cancelada')
    cancelOpen.value = false
    await reload()
  } catch (e) {
    toast.show(e.message, 'error')
  } finally {
    cancelling.value = false
  }
}

const dayBookings = computed(() => (selectedDate.value ? bookingsOnDay(selectedDate.value, bookings.value) : []))
const dayCleanings = computed(() => cleanings.value.filter((cleaning) => cleaning.date === selectedDate.value))
</script>

<template>
  <section class="flex flex-col gap-4">
    <button
      type="button"
      class="inline-flex w-fit items-center gap-1 rounded-full bg-surface-muted px-3 py-2 text-label-lg text-primary"
      @click="router.push({ name: 'today' })"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      Hoy
    </button>

    <p v-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>

    <template v-if="apartment">
      <header class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-label-sm uppercase text-ink-muted">{{ apartment.building.name }}</p>
            <h2 class="text-headline-lg-mobile">Apartamento {{ apartment.code }}</h2>
          </div>
          <BaseBadge :variant="STATUS[apartment.status].variant">{{ STATUS[apartment.status].label }}</BaseBadge>
        </div>
        <p class="flex items-start gap-2 rounded-md bg-surface-muted px-3 py-2 text-body-md">
          <BedDouble class="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
          <span>
            {{ formatBeds(apartment.beds) }}
            <span class="block text-label-md text-primary">{{ apartment.capacity }} plazas</span>
          </span>
        </p>
      </header>

      <!-- En escritorio, el calendario y el detalle del día van uno al lado del otro -->
      <div class="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start">
      <BookingCalendar
        :year="year"
        :month="month"
        :bookings="bookings"
        :cleanings="cleanings"
        :selected-date="selectedDate"
        :today="today"
        @previous="changeMonth(-1)"
        @next="changeMonth(1)"
        @select="selectDay"
      />

      <p
        v-if="!selectedDate"
        class="hidden rounded-lg border border-dashed border-border-input p-6 text-center text-body-md text-ink-muted lg:block"
      >
        Pulsa un día del calendario para ver sus reservas y su limpieza.
      </p>

      <Transition
        enter-active-class="transition duration-200 ease-out"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="-translate-y-2 opacity-0"
        leave-to-class="-translate-y-2 opacity-0"
        mode="out-in"
      >
        <DayDetailPanel
          v-if="selectedDate"
          :key="selectedDate"
          :date="selectedDate"
          :today="today"
          :bookings="dayBookings"
          :cleanings="dayCleanings"
          :capacity="apartment.capacity"
          @edit="editBooking"
          @cancel="askCancel"
        />
      </Transition>
      </div>

      <BookingFormModal
        v-model:open="formOpen"
        :apartments="[apartment]"
        :booking="editingBooking"
        @saved="reload"
      />

      <BaseConfirmDialog
        v-if="cancellingBooking"
        v-model:open="cancelOpen"
        :title="`¿Cancelar la reserva de ${cancellingBooking.guestName}?`"
        message="La reserva quedará cancelada y su limpieza pendiente también. Las fechas volverán a estar libres."
        confirm-label="Cancelar reserva"
        variant="danger"
        :loading="cancelling"
        @confirm="confirmCancel"
      />
    </template>
  </section>
</template>
