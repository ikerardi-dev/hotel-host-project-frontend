<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, Search } from '@lucide/vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import EmployeeCard from '@/components/EmployeeCard.vue'
import { getEmployees, updateEmployeeStatus } from '@/api/employees'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const employees = ref([])
const loading = ref(true)
const loadError = ref('')
const search = ref('')
const showActive = ref(true)

const selected = ref(null)
const dialogOpen = ref(false)
const saving = ref(false)

const activeCount = computed(() => employees.value.filter((e) => e.active).length)
const inactiveCount = computed(() => employees.value.length - activeCount.value)

const visibleEmployees = computed(() => {
  const term = search.value.trim().toLowerCase()
  return employees.value.filter(
    (e) =>
      e.active === showActive.value &&
      (!term || `${e.firstName} ${e.lastName} ${e.email} ${e.phone}`.toLowerCase().includes(term)),
  )
})

const selectedName = computed(() =>
  selected.value ? `${selected.value.firstName} ${selected.value.lastName}` : '',
)

onMounted(async () => {
  try {
    employees.value = await getEmployees()
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
})

function askToggleStatus(employee) {
  selected.value = employee
  dialogOpen.value = true
}

async function confirmToggleStatus() {
  saving.value = true
  try {
    const { employee, unassignedCleanings } = await updateEmployeeStatus(
      selected.value.id,
      !selected.value.active,
    )
    employees.value = employees.value.map((e) => (e.id === employee.id ? employee : e))

    let message = employee.active ? `${selectedName.value} reactivado` : `${selectedName.value} dado de baja`
    if (unassignedCleanings > 0) {
      message += `. ${unassignedCleanings} limpieza(s) se han quedado sin asignar`
    }
    toast.show(message)
    dialogOpen.value = false
  } catch (e) {
    toast.show(e.message, 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <p class="text-body-md text-ink-muted">
      {{ activeCount }} activos · {{ inactiveCount }} de baja
    </p>

    <label class="relative">
      <span class="sr-only">Buscar empleado</span>
      <Search
        class="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-muted"
        aria-hidden="true"
      />
      <input
        v-model="search"
        type="search"
        placeholder="Buscar por nombre, email o teléfono"
        class="h-12 w-full rounded-md border border-border-input bg-surface pr-3 pl-10 text-body-lg placeholder:text-ink-disabled focus:ring-2 focus:ring-primary focus:outline-none"
      />
    </label>

    <div class="flex gap-2">
      <BaseChip :selected="showActive" @click="showActive = true">Activos ({{ activeCount }})</BaseChip>
      <BaseChip :selected="!showActive" @click="showActive = false">De baja ({{ inactiveCount }})</BaseChip>
    </div>

    <p v-if="loading" class="text-body-md text-ink-muted">Cargando empleados…</p>
    <p v-else-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>
    <p v-else-if="visibleEmployees.length === 0" class="text-body-md text-ink-muted">
      {{ search ? 'Ningún empleado coincide con la búsqueda.' : 'No hay empleados en esta lista.' }}
    </p>

    <EmployeeCard
      v-for="employee in visibleEmployees"
      :key="employee.id"
      :employee="employee"
      @toggle-status="askToggleStatus"
    />

    <RouterLink
      :to="{ name: 'employee-new' }"
      class="fixed right-4 bottom-24 z-10 flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-floating hover:bg-primary-hover"
      aria-label="Añadir empleado"
    >
      <Plus class="size-6" aria-hidden="true" />
    </RouterLink>

    <BaseConfirmDialog
      v-if="selected"
      v-model:open="dialogOpen"
      :title="selected.active ? `¿Dar de baja a ${selectedName}?` : `¿Reactivar a ${selectedName}?`"
      :message="
        selected.active
          ? 'No podrá iniciar sesión, pero su historial de limpiezas se conservará. Sus limpiezas pendientes se quedarán sin asignar.'
          : 'Podrá volver a iniciar sesión con su contraseña actual.'
      "
      :confirm-label="selected.active ? 'Dar de baja' : 'Reactivar'"
      :variant="selected.active ? 'danger' : 'primary'"
      :loading="saving"
      @confirm="confirmToggleStatus"
    />
  </section>
</template>
