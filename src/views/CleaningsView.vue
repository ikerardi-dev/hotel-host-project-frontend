<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import CleaningTaskCard from '@/components/CleaningTaskCard.vue'
import { getBuildings } from '@/api/buildings'
import { searchCleanings } from '@/api/cleanings'
import { getEmployees } from '@/api/employees'
import { localDate } from '@/utils/dates'
import { formatDayTitle } from '@/utils/format'

// Filtro de estado: 'UNASSIGNED' no es un estado, se envía como unassigned=true
const STATUS_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'DONE', label: 'Hechas' },
  { value: 'UNASSIGNED', label: 'Sin asignar' },
]

const filters = reactive({
  from: localDate(-7),
  to: localDate(7),
  status: '',
  buildingId: '',
  employeeId: '',
})

const cleanings = ref([])
const buildings = ref([])
const employees = ref([])
const loading = ref(true)
const loadError = ref('')
const today = localDate(0)

async function load() {
  loading.value = true
  try {
    cleanings.value = await searchCleanings({
      from: filters.from,
      to: filters.to,
      status: filters.status === 'UNASSIGNED' ? '' : filters.status,
      unassigned: filters.status === 'UNASSIGNED',
      buildingId: filters.buildingId,
      employeeId: filters.employeeId,
    })
    loadError.value = ''
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  load()
  try {
    ;[buildings.value, employees.value] = await Promise.all([getBuildings(), getEmployees()])
  } catch {
    // Sin estas listas solo faltan esos dos filtros; la pantalla sigue funcionando
  }
})

watch(filters, () => {
  if (filters.from && filters.to) load()
})

const summary = computed(() => ({
  total: cleanings.value.length,
  pending: cleanings.value.filter((c) => c.status === 'PENDING').length,
  inProgress: cleanings.value.filter((c) => c.status === 'IN_PROGRESS').length,
  done: cleanings.value.filter((c) => c.status === 'DONE').length,
  unassigned: cleanings.value.filter((c) => !c.assignedTo && c.status !== 'CANCELLED').length,
}))

const groups = computed(() => {
  const byDate = new Map()
  for (const cleaning of cleanings.value) {
    if (!byDate.has(cleaning.date)) byDate.set(cleaning.date, [])
    byDate.get(cleaning.date).push(cleaning)
  }
  return [...byDate.entries()].map(([date, items]) => ({ date, title: formatDayTitle(date, today), cleanings: items }))
})
</script>

<template>
  <section class="flex flex-col gap-4">
    <dl class="grid grid-cols-5 gap-1.5 text-center">
      <div class="rounded-md bg-surface py-2 shadow-card">
        <dt class="text-label-sm text-ink-muted">Total</dt>
        <dd class="text-headline-sm tabular-nums">{{ summary.total }}</dd>
      </div>
      <div class="rounded-md bg-surface-muted py-2">
        <dt class="text-label-sm text-ink-muted">Pend.</dt>
        <dd class="text-headline-sm tabular-nums">{{ summary.pending }}</dd>
      </div>
      <div class="rounded-md bg-warning-soft py-2">
        <dt class="text-label-sm text-warning-ink">En curso</dt>
        <dd class="text-headline-sm tabular-nums text-warning-ink">{{ summary.inProgress }}</dd>
      </div>
      <div class="rounded-md bg-success-soft py-2">
        <dt class="text-label-sm text-success-ink">Hechas</dt>
        <dd class="text-headline-sm tabular-nums text-success-ink">{{ summary.done }}</dd>
      </div>
      <div class="rounded-md bg-danger-soft py-2">
        <dt class="text-label-sm text-danger-ink">Sin asig.</dt>
        <dd class="text-headline-sm tabular-nums text-danger-ink">{{ summary.unassigned }}</dd>
      </div>
    </dl>

    <details class="rounded-lg border border-border bg-surface p-4 shadow-card" open>
      <summary class="cursor-pointer text-label-lg">Filtros</summary>
      <div class="mt-3 flex flex-col gap-3">
        <div class="grid grid-cols-2 gap-2">
          <BaseInput v-model="filters.from" label="Desde" type="date" />
          <BaseInput v-model="filters.to" label="Hasta" type="date" />
        </div>
        <div class="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          <BaseChip
            v-for="option in STATUS_FILTERS"
            :key="option.value"
            class="shrink-0"
            :selected="filters.status === option.value"
            @click="filters.status = option.value"
          >
            {{ option.label }}
          </BaseChip>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <label class="flex flex-col gap-1.5">
            <span class="text-label-lg">Edificio</span>
            <select
              v-model="filters.buildingId"
              class="h-12 rounded-md border border-border-input bg-surface px-3 text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Todos</option>
              <option v-for="building in buildings" :key="building.id" :value="building.id">
                {{ building.name }}
              </option>
            </select>
          </label>
          <label class="flex flex-col gap-1.5">
            <span class="text-label-lg">Empleado</span>
            <select
              v-model="filters.employeeId"
              class="h-12 rounded-md border border-border-input bg-surface px-3 text-body-md focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">Todos</option>
              <option v-for="employee in employees" :key="employee.id" :value="employee.id">
                {{ employee.firstName }} {{ employee.lastName }}{{ employee.active ? '' : ' (baja)' }}
              </option>
            </select>
          </label>
        </div>
      </div>
    </details>

    <p v-if="loading" class="text-body-md text-ink-muted">Cargando limpiezas…</p>
    <p v-else-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>
    <p v-else-if="groups.length === 0" class="text-body-md text-ink-muted">
      No hay limpiezas con estos filtros.
    </p>

    <section v-for="group in groups" :key="group.date" class="flex flex-col gap-3">
      <h2
        class="text-label-lg uppercase first-letter:uppercase"
        :class="group.date === today ? 'text-primary' : 'text-ink'"
      >
        {{ group.title }}
      </h2>
      <CleaningTaskCard
        v-for="cleaning in group.cleanings"
        :key="cleaning.id"
        :cleaning="cleaning"
        show-assignee
      />
    </section>
  </section>
</template>
