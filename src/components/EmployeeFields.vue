<script setup>
import { Check, IdCard, Mail, Phone } from '@lucide/vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

// form es el objeto reactivo de useEmployeeForm: los campos se editan directamente sobre él
defineProps({
  form: { type: Object, required: true },
  errors: { type: Object, required: true },
  buildings: { type: Array, required: true },
})

const emit = defineEmits(['toggle-building'])
</script>

<template>
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
    <!-- En el alta, la contraseña temporal; en la ficha va en su propia sección -->
    <slot name="credentials" />
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
          @click="emit('toggle-building', building.id)"
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
</template>
