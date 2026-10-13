<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, Check, Lock, WandSparkles } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import EmployeeFields from '@/components/EmployeeFields.vue'
import { createEmployee } from '@/api/employees'
import { useEmployeeForm } from '@/composables/useEmployeeForm'
import { useToastStore } from '@/stores/toast'
import { generateTemporaryPassword } from '@/utils/temporaryPassword'

const router = useRouter()
const toast = useToastStore()

const { buildings, form, errors, generalError, toggleBuilding, validate, payload, showApiError } =
  useEmployeeForm({ withPassword: true })
const saving = ref(false)

async function submit() {
  if (!validate()) return

  saving.value = true
  try {
    await createEmployee(payload())
    toast.show('Empleado creado')
    router.push({ name: 'employees' })
  } catch (e) {
    showApiError(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-4 lg:max-w-2xl" novalidate @submit.prevent="submit">
    <RouterLink
      :to="{ name: 'employees' }"
      class="inline-flex w-fit items-center gap-1 rounded-full bg-surface-muted px-3 py-2 text-label-lg text-primary"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      Empleados
    </RouterLink>

    <EmployeeFields :form="form" :errors="errors" :buildings="buildings" @toggle-building="toggleBuilding">
      <template #credentials>
        <div class="flex flex-col gap-2">
          <BaseInput
            v-model="form.temporaryPassword"
            label="Contraseña temporal"
            type="password"
            :icon="Lock"
            autocomplete="new-password"
            hint="El empleado deberá cambiarla en su primer acceso. Comunícasela tú."
            :error="errors.temporaryPassword"
          />
          <BaseButton variant="secondary" class="w-fit" @click="form.temporaryPassword = generateTemporaryPassword()">
            <WandSparkles class="size-4" aria-hidden="true" />
            Generar otra
          </BaseButton>
        </div>
      </template>
    </EmployeeFields>

    <p
      v-if="generalError"
      role="alert"
      class="rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-body-md text-danger-ink"
    >
      {{ generalError }}
    </p>

    <div class="flex gap-3">
      <BaseButton variant="secondary" class="flex-1" @click="router.push({ name: 'employees' })">
        Cancelar
      </BaseButton>
      <BaseButton type="submit" class="flex-[2]" :disabled="saving">
        <Check class="size-5" aria-hidden="true" />
        {{ saving ? 'Guardando…' : 'Guardar empleado' }}
      </BaseButton>
    </div>
  </form>
</template>
