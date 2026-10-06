<script setup>
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, Check, IdCard, Lock, Mail, Phone, WandSparkles } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { getBuildings } from '@/api/buildings'
import { createEmployee } from '@/api/employees'
import { useToastStore } from '@/stores/toast'
import { isValidPassword } from '@/utils/passwordRules'
import { generateTemporaryPassword } from '@/utils/temporaryPassword'

const router = useRouter()
const toast = useToastStore()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_PATTERN = /^([0-9]{8}|[XYZ][0-9]{7})[A-Z]$/i

// Errores de la API que corresponden a un campo concreto
const FIELD_BY_ERROR = { EMAIL_ALREADY_EXISTS: 'email', DNI_ALREADY_EXISTS: 'dni' }

const buildings = ref([])
const form = reactive({
  firstName: '',
  lastName: '',
  dni: '',
  phone: '',
  email: '',
  temporaryPassword: generateTemporaryPassword(),
  buildingIds: [],
  hireDate: new Date().toLocaleDateString('sv-SE'), // hoy en formato AAAA-MM-DD
  notes: '',
})
const errors = reactive({})
const generalError = ref('')
const saving = ref(false)

onMounted(async () => {
  try {
    buildings.value = await getBuildings()
  } catch (e) {
    generalError.value = e.message
  }
})

function toggleBuilding(id) {
  form.buildingIds = form.buildingIds.includes(id)
    ? form.buildingIds.filter((buildingId) => buildingId !== id)
    : [...form.buildingIds, id]
}

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!form.firstName.trim()) errors.firstName = 'El nombre es obligatorio'
  if (!form.lastName.trim()) errors.lastName = 'Los apellidos son obligatorios'
  if (!DNI_PATTERN.test(form.dni.trim())) errors.dni = 'El DNI/NIE no tiene un formato válido'
  if (!form.phone.trim()) errors.phone = 'El teléfono es obligatorio'
  if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Email no válido'
  if (!isValidPassword(form.temporaryPassword)) {
    errors.temporaryPassword = 'Mínimo 8 caracteres, una mayúscula y un número'
  }
  if (form.buildingIds.length === 0) errors.buildingIds = 'Asigna al menos un edificio'
  if (!form.hireDate) errors.hireDate = 'La fecha de alta es obligatoria'
  return Object.keys(errors).length === 0
}

async function submit() {
  generalError.value = ''
  if (!validate()) return

  saving.value = true
  try {
    await createEmployee({ ...form, notes: form.notes.trim() || null })
    toast.show('Empleado creado')
    router.push({ name: 'employees' })
  } catch (e) {
    const field = FIELD_BY_ERROR[e.code]
    if (field) {
      errors[field] = e.message
    } else {
      generalError.value = e.message
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
    <RouterLink
      :to="{ name: 'employees' }"
      class="inline-flex w-fit items-center gap-1 rounded-full bg-surface-muted px-3 py-2 text-label-lg text-primary"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      Empleados
    </RouterLink>

    <fieldset class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card">
      <legend class="sr-only">Datos personales</legend>
      <h2 class="text-label-lg uppercase text-primary" aria-hidden="true">1. Datos personales</h2>
      <BaseInput v-model="form.firstName" label="Nombre" autocomplete="off" :error="errors.firstName" />
      <BaseInput v-model="form.lastName" label="Apellidos" autocomplete="off" :error="errors.lastName" />
      <BaseInput v-model="form.dni" label="DNI / NIE" :icon="IdCard" autocomplete="off" :error="errors.dni" />
      <BaseInput
        v-model="form.phone"
        label="Teléfono de contacto"
        type="tel"
        :icon="Phone"
        autocomplete="off"
        :error="errors.phone"
      />
    </fieldset>

    <fieldset class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card">
      <legend class="sr-only">Credenciales de acceso</legend>
      <h2 class="text-label-lg uppercase text-primary" aria-hidden="true">2. Credenciales de acceso</h2>
      <BaseInput
        v-model="form.email"
        label="Correo electrónico (usuario)"
        type="email"
        :icon="Mail"
        autocomplete="off"
        :error="errors.email"
      />
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
    </fieldset>

    <fieldset class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card">
      <legend class="sr-only">Asignación de trabajo</legend>
      <h2 class="text-label-lg uppercase text-primary" aria-hidden="true">3. Asignación de trabajo</h2>

      <div class="flex flex-col gap-2">
        <p class="text-label-lg">Edificios asignados</p>
        <div class="flex flex-wrap gap-2">
          <BaseChip
            v-for="building in buildings"
            :key="building.id"
            :selected="form.buildingIds.includes(building.id)"
            @click="toggleBuilding(building.id)"
          >
            <Check v-if="form.buildingIds.includes(building.id)" class="size-4" aria-hidden="true" />
            {{ building.name }}
            <span class="text-label-md opacity-75">{{ building.apartmentCount }} uds</span>
          </BaseChip>
        </div>
        <p v-if="errors.buildingIds" class="text-body-sm text-danger-ink">{{ errors.buildingIds }}</p>
      </div>

      <BaseInput v-model="form.hireDate" label="Fecha de alta" type="date" :error="errors.hireDate" />

      <label class="flex flex-col gap-1.5">
        <span class="text-label-lg">Notas internas (opcional)</span>
        <textarea
          v-model="form.notes"
          rows="3"
          maxlength="500"
          class="rounded-md border border-border-input bg-surface px-3 py-2 text-body-lg focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </label>
    </fieldset>

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
