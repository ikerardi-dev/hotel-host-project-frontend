<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Lock, Mail } from '@lucide/vue'
import logo from '@/assets/logo.png'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value.trim(), password.value)
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
      <img :src="logo" alt="" class="size-20 rounded-lg shadow-card" />
      <h1 class="text-headline-md">Gestión de apartamentos</h1>
      <p class="text-body-md text-ink-muted">
        Panel de operaciones interno · Legazpi, Casa Baratura y La Refierta
      </p>
    </header>

    <form
      class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card"
      novalidate
      @submit.prevent="submit"
    >
      <BaseInput
        v-model="email"
        label="Correo electrónico"
        type="email"
        :icon="Mail"
        placeholder="ej. admin@alojamientos.es"
        autocomplete="username"
        required
      />
      <BaseInput
        v-model="password"
        label="Contraseña"
        type="password"
        :icon="Lock"
        autocomplete="current-password"
        required
      />

      <p
        v-if="error"
        role="alert"
        class="rounded-md border border-danger-line bg-danger-soft px-3 py-2 text-body-md text-danger-ink"
      >
        {{ error }}
      </p>

      <BaseButton type="submit" class="w-full" :disabled="loading || !email || !password">
        {{ loading ? 'Entrando…' : 'Entrar' }}
        <ArrowRight v-if="!loading" class="size-5" aria-hidden="true" />
      </BaseButton>

      <p class="text-center text-body-md text-ink-muted">
        ¿Olvidaste tu contraseña? Contacta con el administrador.
      </p>
    </form>
  </main>
</template>
