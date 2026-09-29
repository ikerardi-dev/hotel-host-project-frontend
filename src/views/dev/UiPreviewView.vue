<script setup>
// Página solo de desarrollo (/ui) para ver los componentes base. No existe en producción.
import { ref } from 'vue'
import { Lock, Mail } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseBottomSheet from '@/components/ui/BaseBottomSheet.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseChip from '@/components/ui/BaseChip.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

const email = ref('')
const password = ref('')
const buildings = ['Todos', 'Legazpi', 'Casa Baratura', 'La Refierta']
const selectedBuilding = ref('Todos')
const sheetOpen = ref(false)
</script>

<template>
  <main class="mx-auto flex max-w-lg flex-col gap-8 p-4">
    <h1 class="text-headline-md">Componentes base</h1>

    <section class="flex flex-col gap-3">
      <h2 class="text-headline-sm">BaseButton</h2>
      <BaseButton>Primario</BaseButton>
      <BaseButton variant="secondary">Secundario</BaseButton>
      <BaseButton variant="danger">Dar de baja</BaseButton>
      <BaseButton variant="ghost">Cancelar</BaseButton>
      <BaseButton disabled>Desactivado</BaseButton>
    </section>

    <section class="flex flex-col gap-4">
      <h2 class="text-headline-sm">BaseInput</h2>
      <BaseInput v-model="email" label="Correo electrónico" type="email" :icon="Mail" placeholder="ej. admin@alojamientos.es" />
      <BaseInput v-model="password" label="Contraseña" type="password" :icon="Lock" hint="Mínimo 8 caracteres" />
      <BaseInput label="Email" model-value="lucia.fernandez@" error="Email no válido" />
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-headline-sm">BaseBadge</h2>
      <div class="flex flex-wrap gap-2">
        <BaseBadge variant="success">Limpio y listo</BaseBadge>
        <BaseBadge variant="warning">Pendiente</BaseBadge>
        <BaseBadge variant="danger">Incidencia</BaseBadge>
        <BaseBadge variant="primary">Ocupado</BaseBadge>
        <BaseBadge variant="neutral">Libre</BaseBadge>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-headline-sm">BaseChip</h2>
      <div class="flex flex-wrap gap-2">
        <BaseChip
          v-for="building in buildings"
          :key="building"
          :selected="selectedBuilding === building"
          @click="selectedBuilding = building"
        >
          {{ building }}
        </BaseChip>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-headline-sm">Toast</h2>
      <BaseButton variant="secondary" @click="toastStore.show('Empleado creado')">Aviso de éxito</BaseButton>
      <BaseButton variant="secondary" @click="toastStore.show('No se ha podido guardar', 'error')">Aviso de error</BaseButton>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-headline-sm">BaseBottomSheet</h2>
      <BaseButton @click="sheetOpen = true">Abrir panel</BaseButton>
    </section>

    <BaseBottomSheet v-model:open="sheetOpen" title="Registrar reserva">
      <p class="text-body-md text-ink-muted">Aquí va el contenido del panel.</p>
      <template #footer>
        <div class="flex gap-3">
          <BaseButton variant="secondary" class="flex-1" @click="sheetOpen = false">Cancelar</BaseButton>
          <BaseButton class="flex-1">Guardar</BaseButton>
        </div>
      </template>
    </BaseBottomSheet>
  </main>
</template>
