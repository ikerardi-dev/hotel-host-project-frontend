<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { BrushCleaning, Hash, Mail, Minus, Phone, Plus, User } from '@lucide/vue'
import BaseBottomSheet from '@/components/ui/BaseBottomSheet.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { createBooking, getAvailability } from '@/api/bookings'
import { getEmployees } from '@/api/employees'
import { useToastStore } from '@/stores/toast'
import { BOOKING_CHANNELS } from '@/utils/bookingChannels'
import { countNights, localDate, toLocalDateTime } from '@/utils/dates'

const open = defineModel('open', { type: Boolean, default: false })

const props = defineProps({
  apartments: { type: Array, required: true },
})

const emit = defineEmits(['created'])

const toast = useToastStore()

function emptyForm() {
  return {
    buildingId: props.apartments[0]?.building.id ?? null,
    apartmentId: null,
    channel: 'BOOKING',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    reference: '',
    checkInDate: localDate(0),
    checkInTime: '16:00',
    checkOutDate: localDate(1),
    checkOutTime: '11:00',
    guests: 1,
    notes: '',
    scheduleCleaning: true,
    cleanerId: '',
    cleaningStart: '12:00',
    cleaningEnd: '14:00',
  }
}

const form = reactive(emptyForm())
const cleaners = ref([])
const unavailableIds = ref(new Set())
const error = ref('')
const saving = ref(false)

const buildings = computed(() => {
  const byId = new Map()
  props.apartments.forEach((a) => byId.set(a.building.id, a.building))
  return [...byId.values()]
})
const buildingApartments = computed(() => props.apartments.filter((a) => a.building.id === form.buildingId))
const selectedApartment = computed(() => props.apartments.find((a) => a.id === form.apartmentId) ?? null)
const maxGuests = computed(() => selectedApartment.value?.capacity ?? 1)
const nights = computed(() => countNights(form.checkInDate, form.checkOutDate))
const checkIn = computed(() => toLocalDateTime(form.checkInDate, form.checkInTime))
const checkOut = computed(() => toLocalDateTime(form.checkOutDate, form.checkOutTime))
const validDates = computed(() => form.checkInDate && form.checkOutDate && checkOut.value > checkIn.value)

// Al abrir: formulario limpio y empleados activos para asignar la limpieza
watch(open, async (isOpen) => {
  if (!isOpen) return
  Object.assign(form, emptyForm())
  error.value = ''
  try {
    cleaners.value = (await getEmployees()).filter((employee) => employee.active)
  } catch {
    cleaners.value = []
  }
})

// Con fechas válidas se consultan los apartamentos ya ocupados
watch([checkIn, checkOut, open], async () => {
  if (!open.value || !validDates.value) {
    unavailableIds.value = new Set()
    return
  }
  try {
    const { unavailableApartmentIds } = await getAvailability(checkIn.value, checkOut.value)
    unavailableIds.value = new Set(unavailableApartmentIds)
  } catch {
    unavailableIds.value = new Set()
  }
})

watch(maxGuests, (max) => {
  if (form.guests > max) form.guests = max
})

function selectBuilding(id) {
  form.buildingId = id
  form.apartmentId = null
}

function validate() {
  if (!form.apartmentId) return 'Elige un apartamento'
  if (unavailableIds.value.has(form.apartmentId)) return 'El apartamento ya está ocupado en esas fechas'
  if (!form.guestName.trim()) return 'El nombre del huésped es obligatorio'
  if (!validDates.value) return 'La salida debe ser posterior a la entrada'
  if (form.scheduleCleaning && form.cleaningEnd <= form.cleaningStart) {
    return 'La limpieza debe terminar después de empezar'
  }
  return ''
}

async function submit() {
  error.value = validate()
  if (error.value) return

  saving.value = true
  try {
    await createBooking({
      apartmentId: form.apartmentId,
      channel: form.channel,
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      guestEmail: form.guestEmail || null,
      reference: form.reference,
      checkIn: checkIn.value,
      checkOut: checkOut.value,
      guests: form.guests,
      notes: form.notes,
      cleaning: form.scheduleCleaning
        ? { startTime: form.cleaningStart, endTime: form.cleaningEnd, cleanerId: form.cleanerId || null }
        : null,
    })
    toast.show('Reserva guardada')
    emit('created')
    open.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseBottomSheet v-model:open="open" title="Registrar reserva">
    <form id="new-booking" class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <section class="flex flex-col gap-2">
        <h3 class="text-label-md uppercase text-ink-muted">1. Edificio</h3>
        <div class="flex flex-wrap gap-2">
          <BaseChip
            v-for="building in buildings"
            :key="building.id"
            :selected="form.buildingId === building.id"
            @click="selectBuilding(building.id)"
          >
            {{ building.name }}
          </BaseChip>
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h3 class="text-label-md uppercase text-ink-muted">2. Apartamento</h3>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="apartment in buildingApartments"
            :key="apartment.id"
            type="button"
            :disabled="unavailableIds.has(apartment.id)"
            :aria-pressed="form.apartmentId === apartment.id"
            class="flex min-h-12 flex-col items-center justify-center rounded-md border text-label-md tabular-nums disabled:cursor-not-allowed disabled:opacity-40"
            :class="
              form.apartmentId === apartment.id
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-ink'
            "
            @click="form.apartmentId = apartment.id"
          >
            {{ apartment.code }} · {{ apartment.capacity }}p
            <span v-if="unavailableIds.has(apartment.id)" class="text-label-sm">Ocupado</span>
          </button>
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h3 class="text-label-md uppercase text-ink-muted">3. Canal</h3>
        <div class="grid grid-cols-2 gap-2">
          <BaseChip
            v-for="channel in BOOKING_CHANNELS"
            :key="channel.value"
            class="justify-center"
            :selected="form.channel === channel.value"
            @click="form.channel = channel.value"
          >
            {{ channel.label }}
          </BaseChip>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="text-label-md uppercase text-ink-muted">4. Huésped</h3>
        <BaseInput v-model="form.guestName" label="Nombre del huésped" :icon="User" autocomplete="off" />
        <BaseInput v-model="form.guestPhone" label="Teléfono (opcional)" type="tel" :icon="Phone" autocomplete="off" />
        <BaseInput v-model="form.guestEmail" label="Email (opcional)" type="email" :icon="Mail" autocomplete="off" />
        <BaseInput v-model="form.reference" label="Referencia / localizador (opcional)" :icon="Hash" autocomplete="off" />
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="text-label-md uppercase text-ink-muted">5. Fechas</h3>
        <div class="grid grid-cols-[1fr_auto] gap-2">
          <BaseInput v-model="form.checkInDate" label="Entrada" type="date" />
          <BaseInput v-model="form.checkInTime" label="Hora" type="time" />
          <BaseInput v-model="form.checkOutDate" label="Salida" type="date" />
          <BaseInput v-model="form.checkOutTime" label="Hora" type="time" />
        </div>
        <p class="rounded-md bg-sand-light px-3 py-2 text-label-md text-ink-muted">
          {{ nights }} {{ nights === 1 ? 'noche' : 'noches' }}
        </p>
      </section>

      <section class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-label-lg">Huéspedes</h3>
          <p class="text-body-sm text-ink-muted">Máximo {{ maxGuests }} plazas</p>
        </div>
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex size-12 items-center justify-center rounded-md border border-border bg-surface disabled:opacity-40"
            aria-label="Quitar un huésped"
            :disabled="form.guests <= 1"
            @click="form.guests--"
          >
            <Minus class="size-5" aria-hidden="true" />
          </button>
          <span class="w-6 text-center text-headline-sm tabular-nums" aria-live="polite">{{ form.guests }}</span>
          <button
            type="button"
            class="flex size-12 items-center justify-center rounded-md bg-primary text-white disabled:opacity-40"
            aria-label="Añadir un huésped"
            :disabled="form.guests >= maxGuests"
            @click="form.guests++"
          >
            <Plus class="size-5" aria-hidden="true" />
          </button>
        </div>
      </section>

      <label class="flex flex-col gap-1.5">
        <span class="text-label-lg">Notas (opcional)</span>
        <textarea
          v-model="form.notes"
          rows="2"
          maxlength="500"
          class="rounded-md border border-border-input bg-surface px-3 py-2 text-body-lg focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </label>

      <section class="flex flex-col gap-3 rounded-lg bg-warning-soft p-3">
        <label class="flex min-h-12 items-center justify-between gap-3">
          <span class="flex items-center gap-2">
            <BrushCleaning class="size-5 text-warning-ink" aria-hidden="true" />
            <span>
              <span class="block text-label-lg">Programar limpieza tras la salida</span>
              <span class="block text-body-sm text-ink-muted">El día de salida, con su checklist</span>
            </span>
          </span>
          <input v-model="form.scheduleCleaning" type="checkbox" class="size-6 accent-primary" />
        </label>

        <template v-if="form.scheduleCleaning">
          <div class="grid grid-cols-2 gap-2">
            <BaseInput v-model="form.cleaningStart" label="Desde" type="time" />
            <BaseInput v-model="form.cleaningEnd" label="Hasta" type="time" />
          </div>
          <label class="flex flex-col gap-1.5">
            <span class="text-label-lg">Empleado asignado</span>
            <select
              v-model="form.cleanerId"
              class="h-12 rounded-md border border-border-input bg-surface px-3 text-body-lg focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Sin asignar</option>
              <option v-for="cleaner in cleaners" :key="cleaner.id" :value="cleaner.id">
                {{ cleaner.firstName }} {{ cleaner.lastName }}
              </option>
            </select>
          </label>
        </template>
      </section>

      <p
        v-if="error"
        role="alert"
        class="rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-body-md text-danger-ink"
      >
        {{ error }}
      </p>
    </form>

    <template #footer>
      <div class="flex gap-3">
        <BaseButton variant="secondary" class="flex-1" @click="open = false">Cancelar</BaseButton>
        <BaseButton type="submit" form="new-booking" class="flex-[2]" :disabled="saving">
          {{ saving ? 'Guardando…' : 'Guardar reserva' }}
        </BaseButton>
      </div>
    </template>
  </BaseBottomSheet>
</template>
