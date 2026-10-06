<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, KeyRound, Lock, ShieldCheck } from '@lucide/vue'
import logo from '@/assets/logo.png'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import PasswordRequirements from '@/components/PasswordRequirements.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { isValidPassword } from '@/utils/passwordRules'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const newPassword = ref('')
const repeatPassword = ref('')
const error = ref('')
const loading = ref(false)

const passwordsMatch = computed(() => newPassword.value === repeatPassword.value)
const repeatError = computed(() =>
  repeatPassword.value && !passwordsMatch.value ? 'Las contraseñas no coinciden' : '',
)
const canSubmit = computed(
  () => isValidPassword(newPassword.value) && passwordsMatch.value && !loading.value,
)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.changePassword(null, newPassword.value)
    toast.show('Contraseña actualizada')
    router.push(auth.homeRoute)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-8">
    <header class="flex flex-col items-center gap-3 text-center">
      <img :src="logo" alt="" class="size-16 rounded-lg shadow-card" />
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-sand-light px-3 py-1 text-label-sm uppercase text-ink-muted"
      >
        <ShieldCheck class="size-3.5" aria-hidden="true" />
        Paso obligatorio de seguridad
      </span>
      <h1 class="text-headline-lg-mobile">Cambia tu contraseña</h1>
      <p class="text-body-md text-ink-muted">
        Has iniciado sesión con una contraseña temporal. Por seguridad, crea una contraseña nueva
        para continuar.
      </p>
    </header>

    <form
      class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card"
      novalidate
      @submit.prevent="submit"
    >
      <BaseInput
        v-model="newPassword"
        label="Nueva contraseña"
        type="password"
        :icon="KeyRound"
        autocomplete="new-password"
        required
      />
      <PasswordRequirements :password="newPassword" />
      <BaseInput
        v-model="repeatPassword"
        label="Repetir contraseña"
        type="password"
        :icon="Lock"
        autocomplete="new-password"
        :error="repeatError"
        required
      />

      <p
        v-if="error"
        role="alert"
        class="rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-body-md text-danger-ink"
      >
        {{ error }}
      </p>

      <BaseButton type="submit" class="w-full" :disabled="!canSubmit">
        {{ loading ? 'Guardando…' : 'Guardar y continuar' }}
        <ArrowRight v-if="!loading" class="size-5" aria-hidden="true" />
      </BaseButton>
    </form>
  </main>
</template>
