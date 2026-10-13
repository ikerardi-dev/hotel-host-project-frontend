import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'

const ADMIN = ['ADMIN']
const CLEANING = ['CLEANING']
const ALL_ROLES = ['ADMIN', 'CLEANING']

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/first-access',
      name: 'first-access',
      component: () => import('@/views/FirstAccessView.vue'),
      meta: { roles: ALL_ROLES },
    },
    {
      path: '/',
      component: AppLayout,
      // Sin ruta concreta: el guard lleva a la pantalla de inicio del rol
      children: [
        {
          path: 'today',
          name: 'today',
          component: () => import('@/views/TodayView.vue'),
          meta: { title: 'Hoy', roles: ADMIN },
        },
        {
          path: 'apartments/:id',
          name: 'apartment-detail',
          component: () => import('@/views/ApartmentDetailView.vue'),
          meta: { title: 'Apartamento', roles: ADMIN },
        },
        {
          path: 'occupancy',
          name: 'occupancy',
          component: () => import('@/views/OccupancyView.vue'),
          meta: { title: 'Ocupación', roles: ADMIN },
        },
        {
          path: 'cleanings',
          name: 'cleanings',
          component: () => import('@/views/CleaningsView.vue'),
          meta: { title: 'Limpiezas', roles: ADMIN },
        },
        {
          path: 'employees',
          name: 'employees',
          component: () => import('@/views/EmployeesView.vue'),
          meta: { title: 'Empleados', roles: ADMIN },
        },
        {
          path: 'employees/new',
          name: 'employee-new',
          component: () => import('@/views/NewEmployeeView.vue'),
          meta: { title: 'Nuevo empleado', roles: ADMIN },
        },
        {
          path: 'employees/:id',
          name: 'employee-detail',
          component: () => import('@/views/EmployeeDetailView.vue'),
          meta: { title: 'Ficha del empleado', roles: ADMIN },
        },
        {
          path: 'my-cleanings',
          name: 'my-cleanings',
          component: () => import('@/views/MyCleaningsView.vue'),
          meta: { title: 'Mis limpiezas', roles: CLEANING },
        },
        {
          path: 'cleanings/:id',
          name: 'cleaning-detail',
          component: () => import('@/views/CleaningDetailView.vue'),
          meta: { title: 'Detalle de limpieza', roles: ALL_ROLES },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
          meta: { title: 'Mi perfil', roles: ALL_ROLES },
        },
        {
          path: 'profile/password',
          name: 'change-password',
          component: () => import('@/views/ChangePasswordView.vue'),
          meta: { title: 'Cambiar contraseña', roles: ALL_ROLES },
        },
      ],
    },
    // Solo en desarrollo: catálogo de componentes base
    ...(import.meta.env.DEV
      ? [{ path: '/ui', component: () => import('@/views/dev/UiPreviewView.vue'), meta: { public: true } }]
      : []),
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    // Con sesión iniciada no tiene sentido volver al login
    return to.name === 'login' && auth.isAuthenticated ? auth.homeRoute : true
  }

  if (!auth.isAuthenticated) {
    return { name: 'login' }
  }

  // Con la contraseña temporal solo se puede estar en la pantalla de cambiarla
  if (auth.mustChangePassword !== (to.name === 'first-access')) {
    return auth.mustChangePassword ? { name: 'first-access' } : auth.homeRoute
  }

  // Ruta sin rol permitido (o la raíz "/"): a la pantalla de inicio del rol
  if (!to.meta.roles?.includes(auth.role)) {
    return auth.homeRoute
  }

  return true
})

export default router
