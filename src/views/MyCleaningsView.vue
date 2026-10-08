<script setup>
import { computed, onMounted, ref } from 'vue'
import CleaningTaskCard from '@/components/CleaningTaskCard.vue'
import { getMyCleanings } from '@/api/cleanings'
import { useAuthStore } from '@/stores/auth'
import { localDate } from '@/utils/dates'
import { formatLongDate } from '@/utils/format'

const auth = useAuthStore()

const cleanings = ref([])
const loading = ref(true)
const loadError = ref('')

const today = localDate(0)
const tomorrow = localDate(1)

onMounted(async () => {
  try {
    cleanings.value = await getMyCleanings()
  } catch (e) {
    loadError.value = e.message
  } finally {
    loading.value = false
  }
})

const todayCleanings = computed(() => cleanings.value.filter((c) => c.date === today))
const summary = computed(() => ({
  today: todayCleanings.value.length,
  inProgress: cleanings.value.filter((c) => c.status === 'IN_PROGRESS').length,
  done: todayCleanings.value.filter((c) => c.status === 'DONE').length,
}))

// Agrupadas por día; las de días anteriores sin terminar van juntas como "Atrasadas"
const groups = computed(() => {
  const byKey = new Map()
  for (const cleaning of cleanings.value) {
    const key = cleaning.date < today ? 'overdue' : cleaning.date
    if (!byKey.has(key)) byKey.set(key, { key, title: groupTitle(key), cleanings: [] })
    byKey.get(key).cleanings.push(cleaning)
  }
  return [...byKey.values()]
})

function groupTitle(key) {
  if (key === 'overdue') return 'Atrasadas'
  if (key === today) return `Hoy · ${formatLongDate(key)}`
  if (key === tomorrow) return `Mañana · ${formatLongDate(key)}`
  return formatLongDate(key)
}
</script>

<template>
  <section class="flex flex-col gap-5">
    <header class="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
      <div>
        <h2 class="text-headline-md">Hola, {{ auth.user?.firstName }}</h2>
        <p class="text-body-md text-ink-muted first-letter:uppercase">{{ formatLongDate(today) }}</p>
      </div>
      <dl class="grid grid-cols-3 gap-2 text-center">
        <div class="rounded-md bg-surface-muted py-2">
          <dt class="text-label-sm uppercase text-ink-muted">Hoy</dt>
          <dd class="text-headline-sm tabular-nums">{{ summary.today }}</dd>
        </div>
        <div class="rounded-md bg-warning-soft py-2">
          <dt class="text-label-sm uppercase text-warning-ink">En curso</dt>
          <dd class="text-headline-sm tabular-nums text-warning-ink">{{ summary.inProgress }}</dd>
        </div>
        <div class="rounded-md bg-success-soft py-2">
          <dt class="text-label-sm uppercase text-success-ink">Hechas hoy</dt>
          <dd class="text-headline-sm tabular-nums text-success-ink">{{ summary.done }}</dd>
        </div>
      </dl>
    </header>

    <p v-if="loading" class="text-body-md text-ink-muted">Cargando limpiezas…</p>
    <p v-else-if="loadError" role="alert" class="text-body-md text-danger-ink">{{ loadError }}</p>
    <p v-else-if="groups.length === 0" class="text-body-md text-ink-muted">
      No tienes limpiezas asignadas.
    </p>

    <section v-for="group in groups" :key="group.key" class="flex flex-col gap-3">
      <h2
        class="text-label-lg uppercase first-letter:uppercase"
        :class="group.key === 'overdue' ? 'text-danger-ink' : 'text-ink'"
      >
        {{ group.title }}
      </h2>
      <CleaningTaskCard v-for="cleaning in group.cleanings" :key="cleaning.id" :cleaning="cleaning" />
    </section>
  </section>
</template>
