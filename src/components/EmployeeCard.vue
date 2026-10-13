<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { BrushCleaning, Mail, Phone, UserCheck, UserX } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps({
  employee: { type: Object, required: true },
})

const emit = defineEmits(['toggle-status'])

const initials = computed(
  () => `${props.employee.firstName[0] ?? ''}${props.employee.lastName[0] ?? ''}`.toUpperCase(),
)
const fullName = computed(() => `${props.employee.firstName} ${props.employee.lastName}`)
</script>

<template>
  <!-- Toda la tarjeta lleva a la ficha (enlace estirado sobre el nombre); el botón de baja queda por encima -->
  <article
    class="relative flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card hover:border-primary"
  >
    <header class="flex items-start gap-3">
      <span
        class="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand-light text-label-lg text-ink-muted"
        aria-hidden="true"
      >
        {{ initials }}
      </span>
      <div class="min-w-0 flex-1">
        <h3 class="text-headline-sm">
          <RouterLink
            :to="{ name: 'employee-detail', params: { id: employee.id } }"
            class="after:absolute after:inset-0 after:rounded-lg"
          >
            {{ fullName }}
          </RouterLink>
        </h3>
        <BaseBadge :variant="employee.active ? 'success' : 'neutral'">
          {{ employee.active ? 'Activo' : 'De baja' }}
        </BaseBadge>
      </div>
      <button
        type="button"
        class="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full"
        :class="employee.active ? 'text-danger hover:bg-danger-soft' : 'text-primary hover:bg-surface-muted'"
        :aria-label="employee.active ? `Dar de baja a ${fullName}` : `Reactivar a ${fullName}`"
        @click="emit('toggle-status', employee)"
      >
        <component :is="employee.active ? UserX : UserCheck" class="size-5" aria-hidden="true" />
      </button>
    </header>

    <dl class="flex flex-col gap-1 text-body-md text-ink-muted">
      <div class="flex items-center gap-2">
        <dt><Phone class="size-4" aria-label="Teléfono" /></dt>
        <dd>{{ employee.phone }}</dd>
      </div>
      <div class="flex min-w-0 items-center gap-2">
        <dt><Mail class="size-4" aria-label="Email" /></dt>
        <dd class="truncate">{{ employee.email }}</dd>
      </div>
      <div class="flex items-center gap-2">
        <dt><BrushCleaning class="size-4" aria-label="Limpiezas" /></dt>
        <dd>
          <strong class="text-ink">{{ employee.cleaningsThisWeek }}</strong> limpiezas esta semana
        </dd>
      </div>
    </dl>

    <ul class="flex flex-wrap gap-1.5">
      <li
        v-for="building in employee.buildings"
        :key="building.id"
        class="rounded-full bg-surface-muted px-2.5 py-0.5 text-label-md text-ink-muted"
      >
        {{ building.name }}
      </li>
    </ul>
  </article>
</template>
