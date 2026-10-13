<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Check, Copy, KeyRound, Trash2, UserCheck, UserX } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseConfirmDialog from '@/components/ui/BaseConfirmDialog.vue'
import EmployeeFields from '@/components/EmployeeFields.vue'
import {
  deleteEmployee,
  getEmployee,
  resetEmployeePassword,
  updateEmployee,
  updateEmployeeStatus,
} from '@/api/employees'
import { useAsyncData } from '@/composables/useAsyncData'
import { useEmployeeForm } from '@/composables/useEmployeeForm'
import { useToastStore } from '@/stores/toast'
import { statusChangedMessage, statusDialog } from '@/utils/employeeStatus'
import { generateTemporaryPassword } from '@/utils/temporaryPassword'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const id = Number(route.params.id)

const { buildings, form, errors, generalError, fill, toggleBuilding, validate, payload, showApiError } =
  useEmployeeForm({ withPassword: false })

const {
  data: employee,
  loading,
  error: loadError,
} = useAsyncData(async () => {
  const found = await getEmployee(id)
  fill(found)
  return found
})

const fullName = computed(() => (employee.value ? `${employee.value.firstName} ${employee.value.lastName}` : ''))

// Datos
const saving = ref(false)

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    employee.value = await updateEmployee(id, payload())
    fill(employee.value)
    toast.show('Cambios guardados')
  } catch (e) {
    showApiError(e)
  } finally {
    saving.value = false
  }
}

// Contraseña olvidada: se genera una temporal y se muestra una sola vez para comunicársela
const passwordDialogOpen = ref(false)
const resetting = ref(false)
const newPassword = ref('')
const copied = ref(false)

async function confirmResetPassword() {
  resetting.value = true
  try {
    const temporaryPassword = generateTemporaryPassword()
    await resetEmployeePassword(id, temporaryPassword)
    newPassword.value = temporaryPassword
    copied.value = false
    passwordDialogOpen.value = false
  } catch (e) {
    toast.show(e.message, 'error')
  } finally {
    resetting.value = false
  }
}

async function copyPassword() {
  try {
    await navigator.clipboard.writeText(newPassword.value)
    copied.value = true
  } catch {
    toast.show('No se ha podido copiar. Apúntala a mano.', 'error')
  }
}

// Baja, reactivación y eliminación definitiva
const statusDialogOpen = ref(false)
const changingStatus = ref(false)
const deleteDialogOpen = ref(false)
const deleting = ref(false)

async function confirmToggleStatus() {
  changingStatus.value = true
  try {
    const result = await updateEmployeeStatus(id, !employee.value.active)
    employee.value = result.employee
    toast.show(statusChangedMessage(fullName.value, result))
    statusDialogOpen.value = false
  } catch (e) {
    toast.show(e.message, 'error')
  } finally {
    changingStatus.value = false
  }
}

async function confirmDelete() {
  deleting.value = true
  try {
    await deleteEmployee(id)
    toast.show(`${fullName.value} eliminado`)
    router.push({ name: 'employees' })
  } catch (e) {
    toast.show(e.message, 'error')
    deleting.value = false
  }
}
</script>

<template>
  <section class="flex flex-col gap-4 lg:max-w-2xl">
    <RouterLink
      :to="{ name: 'employees' }"
      class="inline-flex w-fit items-center gap-1 rounded-full bg-surface-muted px-3 py-2 text-label-lg text-primary"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      Empleados
    </RouterLink>

    <p v-if="loading" class="text-body-md text-ink-muted">Cargando empleado…</p>
    <p v-else-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>

    <template v-else>
      <header class="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
        <div class="min-w-0 flex-1">
          <h2 class="text-headline-md">{{ fullName }}</h2>
          <p class="text-body-md text-ink-muted">{{ employee.cleaningsThisWeek }} limpiezas esta semana</p>
        </div>
        <BaseBadge :variant="employee.active ? 'success' : 'neutral'">
          {{ employee.active ? 'Activo' : 'De baja' }}
        </BaseBadge>
      </header>

      <form class="flex flex-col gap-4" novalidate @submit.prevent="save">
        <EmployeeFields :form="form" :errors="errors" :buildings="buildings" @toggle-building="toggleBuilding" />

        <p
          v-if="generalError"
          role="alert"
          class="rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-body-md text-danger-ink"
        >
          {{ generalError }}
        </p>

        <BaseButton type="submit" :disabled="saving">
          <Check class="size-5" aria-hidden="true" />
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </BaseButton>
      </form>

      <section class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
        <h2 class="text-label-lg uppercase text-primary">Contraseña</h2>
        <p class="text-body-md text-ink-muted">
          Si ha olvidado su contraseña, genera una temporal nueva. La actual dejará de funcionar y tendrá que
          cambiar la nueva cuando vuelva a entrar.
        </p>

        <div v-if="newPassword" class="flex flex-col gap-2 rounded-md border border-warning-line bg-warning-soft p-3">
          <p class="text-label-lg">Nueva contraseña temporal</p>
          <div class="flex flex-wrap items-center gap-3">
            <code class="rounded-md bg-surface px-3 py-2 text-headline-sm tracking-wider">{{ newPassword }}</code>
            <BaseButton variant="secondary" @click="copyPassword">
              <component :is="copied ? Check : Copy" class="size-4" aria-hidden="true" />
              {{ copied ? 'Copiada' : 'Copiar' }}
            </BaseButton>
          </div>
          <p class="text-body-sm text-ink-muted">Apúntala o cópiala ahora: no se volverá a mostrar.</p>
        </div>

        <BaseButton variant="secondary" class="w-fit" @click="passwordDialogOpen = true">
          <KeyRound class="size-4" aria-hidden="true" />
          Generar nueva contraseña
        </BaseButton>
      </section>

      <section class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
        <h2 class="text-label-lg uppercase text-primary">Estado</h2>
        <BaseButton
          :variant="employee.active ? 'danger' : 'secondary'"
          class="w-fit"
          @click="statusDialogOpen = true"
        >
          <component :is="employee.active ? UserX : UserCheck" class="size-4" aria-hidden="true" />
          {{ employee.active ? 'Dar de baja' : 'Reactivar' }}
        </BaseButton>

        <template v-if="!employee.active">
          <p class="text-body-md text-ink-muted">
            Al eliminarlo desaparece de la lista para siempre. Las limpiezas que hizo conservan su nombre en el
            historial.
          </p>
          <BaseButton variant="danger" class="w-fit" @click="deleteDialogOpen = true">
            <Trash2 class="size-4" aria-hidden="true" />
            Eliminar definitivamente
          </BaseButton>
        </template>
      </section>

      <BaseConfirmDialog
        v-model:open="passwordDialogOpen"
        :title="`¿Generar una contraseña nueva para ${fullName}?`"
        message="Su contraseña actual dejará de funcionar. Tendrás que comunicarle la nueva y la cambiará al entrar."
        confirm-label="Generar contraseña"
        :loading="resetting"
        @confirm="confirmResetPassword"
      />
      <BaseConfirmDialog
        v-model:open="statusDialogOpen"
        v-bind="statusDialog(employee, fullName)"
        :loading="changingStatus"
        @confirm="confirmToggleStatus"
      />
      <BaseConfirmDialog
        v-model:open="deleteDialogOpen"
        :title="`¿Eliminar a ${fullName} definitivamente?`"
        message="Esta acción no se puede deshacer. Las limpiezas que hizo conservarán su nombre en el historial."
        confirm-label="Eliminar"
        variant="danger"
        :loading="deleting"
        @confirm="confirmDelete"
      />
    </template>
  </section>
</template>
