<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, KeyRound, Lock, RotateCcw } from '@lucide/vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import PasswordRequirements from '@/components/PasswordRequirements.vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { isValidPassword } from '@/utils/passwordRules'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const currentPassword = ref('')
const newPassword = ref('')
const repeatPassword = ref('')
const currentError = ref('')
const saving = ref(false)

const repeatError = computed(() =>
  repeatPassword.value && newPassword.value !== repeatPassword.value ? 'Las contraseñas no coinciden' : '',
)
const canSubmit = computed(
  () =>
    currentPassword.value &&
    isValidPassword(newPassword.value) &&
    newPassword.value === repeatPassword.value &&
    !saving.value,
)

async function submit() {
  currentError.value = ''
  saving.value = true
  try {
    await auth.changePassword(currentPassword.value, newPassword.value)
    toast.show('Contraseña actualizada')
    router.push({ name: 'profile' })
  } catch (e) {
    // La contraseña actual incorrecta se muestra en su campo; el resto de errores, en un aviso
    if (e.code === 'INVALID_CURRENT_PASSWORD') {
      currentError.value = e.message
    } else {
      toast.show(e.message, 'error')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="flex flex-col gap-4 lg:max-w-2xl">
    <button
      type="button"
      class="inline-flex w-fit items-center gap-1 rounded-full bg-surface-muted px-3 py-2 text-label-lg text-primary"
      @click="router.push({ name: 'profile' })"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      Mi perfil
    </button>

    <form
      class="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card"
      novalidate
      @submit.prevent="submit"
    >
      <p class="text-body-md text-ink-muted">
        Introduce tu contraseña actual y elige una nueva. ¿Olvidaste la actual? Contacta con el administrador.
      </p>
      <BaseInput
        v-model="currentPassword"
        label="Contraseña actual"
        type="password"
        :icon="Lock"
        autocomplete="current-password"
        :error="currentError"
      />
      <BaseInput
        v-model="newPassword"
        label="Nueva contraseña"
        type="password"
        :icon="KeyRound"
        autocomplete="new-password"
      />
      <PasswordRequirements :password="newPassword" />
      <BaseInput
        v-model="repeatPassword"
        label="Repetir nueva contraseña"
        type="password"
        :icon="RotateCcw"
        autocomplete="new-password"
        :error="repeatError"
      />
      <BaseButton type="submit" :disabled="!canSubmit">
        {{ saving ? 'Guardando…' : 'Actualizar contraseña' }}
      </BaseButton>
    </form>
  </section>
</template>
