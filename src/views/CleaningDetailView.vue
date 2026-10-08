<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, BedDouble, Check, CircleCheck, Clock, Play, TriangleAlert, UserRound } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import {
  getCleaning,
  reassignCleaning,
  updateChecklistItem,
  updateCleaningStatus,
  updateIncident,
} from '@/api/cleanings'
import { getEmployees } from '@/api/employees'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { CLEANING_STATUS } from '@/utils/cleaningStatus'
import { formatBeds, formatHour, formatLongDate, formatTime } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const auth = useAuthStore()

const cleaning = ref(null)
const loadError = ref('')
const busy = ref(false)
const incident = ref('')
const confirmFinishOpen = ref(false)

// El admin puede modificar la limpieza de un empleado, pero antes se le avisa (una vez por visita)
const adminConfirmOpen = ref(false)
const adminConfirmed = ref(false)
let pendingAction = null

// Reasignación (solo admin y solo limpiezas pendientes)
const isAdmin = computed(() => auth.role === 'ADMIN')
const cleaners = ref([])
const assignment = ref({ cleanerId: '', startTime: '', endTime: '' })
const assignmentChanged = computed(
  () =>
    String(assignment.value.cleanerId) !== String(cleaning.value.assignedTo?.id ?? '') ||
    assignment.value.startTime !== formatHour(cleaning.value.startTime) ||
    assignment.value.endTime !== formatHour(cleaning.value.endTime),
)

const status = computed(() => CLEANING_STATUS[cleaning.value.status])
const inProgress = computed(() => cleaning.value.status === 'IN_PROGRESS')
const doneTasks = computed(() => cleaning.value.checklist.filter((item) => item.done).length)
const totalTasks = computed(() => cleaning.value.checklist.length)
const progress = computed(() => (totalTasks.value ? Math.round((doneTasks.value / totalTasks.value) * 100) : 0))
const incidentChanged = computed(() => incident.value.trim() !== (cleaning.value.incidentNotes ?? ''))
const editingSomeoneElsesCleaning = computed(
  () => auth.role === 'ADMIN' && cleaning.value.assignedTo && cleaning.value.assignedTo.id !== auth.user.id,
)

function guarded(action) {
  if (editingSomeoneElsesCleaning.value && !adminConfirmed.value) {
    pendingAction = action
    adminConfirmOpen.value = true
  } else {
    action()
  }
}

function confirmAdminEdit() {
  adminConfirmed.value = true
  adminConfirmOpen.value = false
  pendingAction?.()
  pendingAction = null
}

onMounted(async () => {
  try {
    setCleaning(await getCleaning(route.params.id))
  } catch (e) {
    loadError.value = e.message
  }
  if (isAdmin.value) {
    try {
      cleaners.value = (await getEmployees()).filter((employee) => employee.active)
    } catch {
      cleaners.value = []
    }
  }
})

function setCleaning(updated) {
  cleaning.value = updated
  incident.value = updated.incidentNotes ?? ''
  assignment.value = {
    cleanerId: updated.assignedTo?.id ?? '',
    startTime: formatHour(updated.startTime),
    endTime: formatHour(updated.endTime),
  }
}

function saveAssignment() {
  if (assignment.value.endTime <= assignment.value.startTime) {
    toast.show('La limpieza debe terminar después de empezar', 'error')
    return
  }
  run(
    () =>
      reassignCleaning(cleaning.value.id, {
        cleanerId: assignment.value.cleanerId || null,
        startTime: assignment.value.startTime,
        endTime: assignment.value.endTime,
      }),
    'Asignación guardada',
  )
}

// Ejecuta una acción contra la API mostrando el error, si lo hay, en un aviso
async function run(action, successMessage) {
  busy.value = true
  try {
    setCleaning(await action())
    if (successMessage) toast.show(successMessage)
  } catch (e) {
    toast.show(e.message, 'error')
  } finally {
    busy.value = false
  }
}

function start() {
  guarded(() => run(() => updateCleaningStatus(cleaning.value.id, 'IN_PROGRESS'), 'Limpieza empezada'))
}

function toggleItem(item) {
  guarded(() => run(() => updateChecklistItem(cleaning.value.id, item.id, !item.done)))
}

function saveIncident() {
  guarded(() => run(() => updateIncident(cleaning.value.id, incident.value), 'Incidencia guardada'))
}

function askFinish() {
  guarded(() => {
    if (doneTasks.value < totalTasks.value) {
      confirmFinishOpen.value = true
    } else {
      finish()
    }
  })
}

async function finish() {
  confirmFinishOpen.value = false
  await run(() => updateCleaningStatus(cleaning.value.id, 'DONE'), 'Limpieza finalizada')
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <button
      type="button"
      class="inline-flex w-fit items-center gap-1 rounded-full bg-surface-muted px-3 py-2 text-label-lg text-primary"
      @click="router.back()"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      Volver
    </button>

    <p v-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>

    <template v-else-if="cleaning">
      <header class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="text-label-sm uppercase text-ink-muted">{{ cleaning.apartment.buildingName }}</p>
            <h2 class="text-headline-lg-mobile">Unidad {{ cleaning.apartment.code }}</h2>
          </div>
          <BaseBadge :variant="status.variant">{{ status.label }}</BaseBadge>
        </div>
        <div class="flex flex-col gap-1 rounded-md bg-surface-muted px-3 py-2">
          <p class="text-body-sm text-ink-muted first-letter:uppercase">{{ formatLongDate(cleaning.date) }}</p>
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
      </header>

      <section
        v-if="isAdmin"
        class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card"
      >
        <h3 class="flex items-center gap-2 text-headline-sm">
          <UserRound class="size-5 text-ink-muted" aria-hidden="true" />
          Asignación
        </h3>
        <template v-if="cleaning.status === 'PENDING'">
          <label class="flex flex-col gap-1.5">
            <span class="text-label-lg">Empleado</span>
            <select
              v-model="assignment.cleanerId"
              class="h-12 rounded-md border border-border-input bg-surface px-3 text-body-lg focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Sin asignar</option>
              <option v-for="cleaner in cleaners" :key="cleaner.id" :value="cleaner.id">
                {{ cleaner.firstName }} {{ cleaner.lastName }}
              </option>
            </select>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <BaseInput v-model="assignment.startTime" label="Desde" type="time" />
            <BaseInput v-model="assignment.endTime" label="Hasta" type="time" />
          </div>
          <BaseButton variant="secondary" :disabled="!assignmentChanged || busy" @click="saveAssignment">
            Guardar asignación
          </BaseButton>
        </template>
        <p v-else class="text-body-md">
          {{ cleaning.assignedTo?.name ?? 'Sin asignar' }}
          <span class="block text-body-sm text-ink-muted">Solo se pueden reasignar las limpiezas pendientes.</span>
        </p>
      </section>

      <section class="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 shadow-card">
        <h3 class="flex items-center gap-2 text-headline-sm">
          <BedDouble class="size-5 text-ink-muted" aria-hidden="true" />
          Camas a preparar
        </h3>
        <p class="text-body-md">{{ formatBeds(cleaning.apartment.beds) }}</p>
        <p class="text-body-sm text-ink-muted">{{ cleaning.apartment.capacity }} plazas</p>
      </section>

      <section class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
        <div class="flex items-center justify-between">
          <h3 class="text-headline-sm">Lista de control</h3>
          <span class="text-label-md text-primary">{{ doneTasks }} de {{ totalTasks }}</span>
        </div>
        <div
          class="h-2 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          :aria-valuenow="progress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="h-full rounded-full bg-primary transition-all" :style="{ width: `${progress}%` }" />
        </div>
        <p v-if="cleaning.status === 'PENDING'" class="text-body-sm text-ink-muted">
          Empieza la limpieza para ir marcando las tareas.
        </p>
        <ul class="flex flex-col gap-2">
          <li v-for="item in cleaning.checklist" :key="item.id">
            <button
              type="button"
              role="checkbox"
              :aria-checked="item.done"
              :disabled="!inProgress || busy"
              class="flex min-h-12 w-full items-center gap-3 rounded-md border border-border px-3 text-left disabled:cursor-not-allowed"
              @click="toggleItem(item)"
            >
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-full border-2"
                :class="item.done ? 'border-success bg-success text-white' : 'border-border-input'"
              >
                <Check v-if="item.done" class="size-4" aria-hidden="true" />
              </span>
              <span :class="item.done ? 'text-ink-disabled line-through' : 'text-ink'">{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
        <h3 class="flex items-center gap-2 text-headline-sm">
          <TriangleAlert class="size-5 text-warning" aria-hidden="true" />
          Incidencias
        </h3>
        <label class="flex flex-col gap-1.5">
          <span class="text-label-md text-ink-muted">Desperfectos o problemas encontrados (opcional)</span>
          <textarea
            v-model="incident"
            rows="3"
            maxlength="1000"
            :disabled="cleaning.status === 'CANCELLED'"
            class="rounded-md border border-border-input bg-surface px-3 py-2 text-body-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </label>
        <BaseButton variant="secondary" :disabled="!incidentChanged || busy" @click="saveIncident">
          Guardar incidencia
        </BaseButton>
      </section>

      <BaseButton v-if="cleaning.status === 'PENDING'" class="w-full" :disabled="busy" @click="start">
        <Play class="size-5" aria-hidden="true" />
        Empezar limpieza
      </BaseButton>
      <BaseButton v-else-if="inProgress" class="w-full" :disabled="busy" @click="askFinish">
        <CircleCheck class="size-5" aria-hidden="true" />
        Finalizar limpieza
      </BaseButton>
      <p
        v-else-if="cleaning.status === 'DONE'"
        class="flex items-center justify-center gap-2 rounded-md bg-success-soft px-3 py-3 text-label-lg text-success-ink"
      >
        <CircleCheck class="size-5" aria-hidden="true" />
        Completada a las {{ formatTime(cleaning.finishedAt) }}
      </p>

      <BaseConfirmDialog
        v-model:open="confirmFinishOpen"
        title="¿Finalizar con tareas pendientes?"
        :message="`Has completado ${doneTasks} de ${totalTasks} tareas de la lista de control.`"
        confirm-label="Finalizar igualmente"
        :loading="busy"
        @confirm="finish"
      />

      <BaseConfirmDialog
        v-model:open="adminConfirmOpen"
        title="¿Estás seguro de modificar las tareas del empleado?"
        message="Se verán las modificaciones en su perfil."
        confirm-label="Sí, modificar"
        @confirm="confirmAdminEdit"
      />
    </template>
  </section>
</template>
