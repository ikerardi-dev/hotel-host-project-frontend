import { Building, BrushCleaning, CalendarDays, CircleUser, Users } from '@lucide/vue'

// Menú inferior de cada rol. `route` es el nombre de la ruta en src/router/index.js
export const navigationByRole = {
  ADMIN: {
    section: 'Administración',
    items: [
      { route: 'today', label: 'Hoy', icon: CalendarDays },
      { route: 'occupancy', label: 'Ocupación', icon: Building },
      { route: 'cleanings', label: 'Limpiezas', icon: BrushCleaning },
      { route: 'employees', label: 'Empleados', icon: Users },
      { route: 'profile', label: 'Perfil', icon: CircleUser },
    ],
  },
  CLEANING: {
    section: 'Operaciones',
    items: [
      { route: 'my-cleanings', label: 'Mis limpiezas', icon: BrushCleaning },
      { route: 'profile', label: 'Perfil', icon: CircleUser },
    ],
  },
}
