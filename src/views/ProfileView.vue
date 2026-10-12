<script setup>
import { computed, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ChevronRight, IdCard, KeyRound, Lock, LogOut, Phone, ShieldCheck } from '@lucide/vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const ROLE_LABELS = { ADMIN: 'Administrador', CLEANING: 'Empleado de limpieza' }

const form = reactive({
  firstName: auth.user.firstName ?? '',
  lastName: auth.user.lastName ?? '',
  phone: auth.user.phone ?? '',
})
const firstNameError = ref('')
const saving = ref(false)

const initials = computed(() => `${auth.user.firstName?.[0] ?? ''}${auth.user.lastName?.[0] ?? ''}`.toUpperCase())
const changed = computed(
  () =>
    form.firstName.trim() !== (auth.user.firstName ?? '') ||
    form.lastName.trim() !== (auth.user.lastName ?? '') ||
    form.phone.trim() !== (auth.user.phone ?? ''),
)

async function save() {
  firstNameError.value = form.firstName.trim() ? '' : 'El nombre es obligatorio'
  if (firstNameError.value) return

  saving.value = true
  try {
    await auth.updateProfile({ firstName: form.firstName, lastName: form.lastName, phone: form.phone })
    toast.show('Datos guardados')
  } catch (e) {
    toast.show(e.message, 'error')
  } finally {
    saving.value = false
  }
}

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <header class="flex flex-col items-center gap-2 rounded-lg border border-border bg-surface p-5 text-center shadow-card">
      <span
        class="flex size-20 items-center justify-center rounded-full bg-sand text-headline-md text-ink-muted"
        aria-hidden="true"
      >
        {{ initials }}
      </span>
      <h2 class="text-headline-md">{{ auth.user.firstName }} {{ auth.user.lastName }}</h2>
      <BaseBadge variant="neutral">{{ ROLE_LABELS[auth.role] }}</BaseBadge>
      <p class="text-body-md text-ink-muted">{{ auth.user.email }}</p>
    </header>

    <form
      class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card"
      novalidate
      @submit.prevent="save"
    >
      <h3 class="flex items-center gap-2 text-headline-sm">
        <IdCard class="size-5 text-primary" aria-hidden="true" />
        Datos personales
      </h3>
      <BaseInput v-model="form.firstName" label="Nombre" autocomplete="given-name" :error="firstNameError" />
      <BaseInput v-model="form.lastName" label="Apellidos" autocomplete="family-name" />
      <BaseInput v-model="form.phone" label="Teléfono" type="tel" :icon="Phone" autocomplete="tel" />
      <BaseInput
        :model-value="auth.user.email"
        label="Correo electrónico"
        :icon="Lock"
        hint="Solo el administrador puede cambiarlo."
        readonly
        disabled
      />
      <BaseButton type="submit" :disabled="!changed || saving">
        {{ saving ? 'Guardando…' : 'Guardar cambios' }}
      </BaseButton>
    </form>

    <section class="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 shadow-card">
      <h3 class="flex items-center gap-2 text-headline-sm">
        <ShieldCheck class="size-5 text-primary" aria-hidden="true" />
        Seguridad
      </h3>
      <RouterLink
        :to="{ name: 'change-password' }"
        class="flex min-h-12 items-center gap-3 rounded-md bg-surface-muted px-3"
      >
        <KeyRound class="size-5 text-ink-muted" aria-hidden="true" />
        <span class="flex-1 text-label-lg">Cambiar contraseña</span>
        <ChevronRight class="size-5 text-ink-muted" aria-hidden="true" />
      </RouterLink>
    </section>

    <BaseButton variant="danger" class="w-full" @click="logout">
      <LogOut class="size-5" aria-hidden="true" />
      Cerrar sesión
    </BaseButton>
  </section>
</template>
