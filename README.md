# Gestión de Apartamentos · Frontend

Aplicación web **pensada primero para el móvil**, con la que el personal de un alojamiento turístico organiza el servicio de limpieza de **19 apartamentos** en 3 edificios (Legazpi, Casa Baratura y La Refierta).

El encargado anota las entradas y salidas de huéspedes, controla la ocupación y reparte las limpiezas. El personal de limpieza ve sus tareas del día y las completa desde el móvil con una checklist.

> Backend (API REST en Spring Boot): [hotel-host-project-backend](https://github.com/ikerardi-dev/hotel-host-project-backend)

---

## Índice

- [Pantallas](#pantallas)
- [Tecnologías](#tecnologías)
- [Puesta en marcha en local](#puesta-en-marcha-en-local)
- [Scripts](#scripts)
- [Conexión con la API](#conexión-con-la-api)
- [Sistema de diseño](#sistema-de-diseño)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Tests](#tests)
- [Compilar para producción](#compilar-para-producción)
- [Próximos pasos](#próximos-pasos)

---

## Pantallas

La app tiene dos roles, y cada uno ve **solo su menú y sus pantallas**. No hay registro público: el administrador da de alta al personal.

### Administrador

| Pantalla | Qué hace |
|---|---|
| **Hoy** | Resumen del día (entradas, salidas, limpiezas y ocupación), línea de tiempo por horas y apartamentos agrupados por edificio con su estado. Botón **+** para registrar una reserva |
| **Apartamento** | Calendario mensual con noches reservadas y días de limpieza. Al pulsar un día se despliegan las reservas (con editar y cancelar) y la limpieza |
| **Ocupación** | Planning semanal por edificio: reservas como barras y limpiezas marcadas |
| **Limpiezas** | Control de todas las limpiezas con resumen, filtros e historial. Las sin asignar o con incidencia salen destacadas |
| **Detalle de limpieza** | Reasignar empleado y franja. Si el admin modifica las tareas de un empleado, se le pide confirmación |
| **Empleados** | Lista con buscador y pestañas Activos / De baja; alta con contraseña temporal; baja y reactivación |
| **Perfil** | Datos personales y cambio de contraseña |

### Empleado de limpieza

| Pantalla | Qué hace |
|---|---|
| **Primer acceso** | Obliga a cambiar la contraseña temporal antes de entrar |
| **Mis limpiezas** | Resumen del día y tareas agrupadas: atrasadas, hoy, mañana… |
| **Detalle de la tarea** | Camas a preparar, checklist con progreso, incidencias, y empezar o finalizar |
| **Perfil** | Datos personales y cambio de contraseña |

---

## Tecnologías

| | |
|---|---|
| Framework | Vue 3 (Composition API con `<script setup>`) |
| Lenguaje | JavaScript |
| Build | Vite 8 |
| Rutas | Vue Router 5, con rutas protegidas por rol |
| Estado | Pinia 4 |
| Estilos | Tailwind CSS 4 con los tokens del sistema de diseño |
| Iconos | Lucide (`@lucide/vue`) |
| Tests | Vitest + jsdom + Vue Test Utils |
| Diseño | Google Stitch / Figma |

---

## Puesta en marcha en local

### Requisitos

- Node.js 22.18 o superior (o 24.12 o superior)
- El **backend arrancado** en `http://localhost:8081` (ver su README)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/ikerardi-dev/hotel-host-project-frontend.git
cd hotel-host-project-frontend

# 2. Instalar dependencias
npm install

# 3. Arrancar en modo desarrollo
npm run dev
```

Abre **http://localhost:5173** y entra con el administrador definido en el `.env` del backend (`ADMIN_EMAIL` y `ADMIN_PASSWORD`). Desde **Empleados** puedes crear empleados de limpieza para probar el otro rol.

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila la versión de producción en `dist/` |
| `npm run preview` | Sirve en local la versión compilada |
| `npm run test:unit` | Tests en modo vigilancia (`npm run test:unit -- --run` para ejecutarlos una vez) |

---

## Conexión con la API

- La URL del backend sale de la variable **`VITE_API_URL`**:
  - `.env.development`: `http://localhost:8081/api`
  - `.env.production`: se crea al desplegar, con la URL real
- Toda la comunicación está en **`src/api/`**: funciones de JavaScript puro, independientes de Vue, para reutilizarlas al migrar a React.
- **`client.js`** centraliza las peticiones:
  - añade el token de sesión (`Authorization: Bearer …`);
  - convierte los errores de la API (`{ error, message }`) en un `ApiError` con `status`, `code` y `message`;
  - si la sesión caduca (401), cierra la sesión y vuelve al login.
- **Las variables `VITE_*` no son secretas**: Vite las incluye en el JavaScript que descarga el navegador. Nunca se pone en ellas nada privado.

---

## Sistema de diseño

Exportado de Google Stitch y traducido a **tokens de Tailwind** en [`src/assets/styles.css`](src/assets/styles.css). Los valores por defecto de Tailwind están desactivados, así que solo se pueden usar los del diseño:

- **Colores:** `primary` (teal `#0F766E`), `sand`, `warning` (ámbar, limpiezas), `success`, `danger`, más fondos, bordes y textos (`canvas`, `surface`, `ink`…).
- **Texto:** `headline-lg`, `headline-md`, `body-md`, `label-lg`…, cada uno con su tamaño, interlineado y grosor.
- **Formas:** `rounded-md` (12 px, inputs y botones), `rounded-lg` (16 px, tarjetas), `shadow-card` y `shadow-floating`.

**Componentes base reutilizables** en `src/components/ui/`: `BaseButton`, `BaseInput` (con mostrar u ocultar contraseña y errores accesibles), `BaseBadge`, `BaseChip`, `BaseBottomSheet`, `BaseConfirmDialog` y `ToastContainer`.

En modo desarrollo, la ruta **`/ui`** muestra un catálogo con todos los componentes base. No existe en producción.

---

## Estructura del proyecto

```
src/
├── api/            Funciones de acceso a la API (cliente HTTP y una por recurso)
├── assets/         styles.css (Tailwind y tokens) y logo
├── composables/    Lógica reutilizable entre vistas (carga de datos, agrupar por edificio)
├── components/     Componentes de pantalla (ApartmentCard, BookingCalendar, OccupancyGrid…)
│   ├── layout/     Cabecera, navegación inferior (móvil) y menú lateral (escritorio)
│   └── ui/         Componentes base del sistema de diseño
├── layouts/        AppLayout y menú de cada rol
├── router/         Rutas, roles permitidos y guard de sesión
├── stores/         Pinia: sesión (auth) y avisos (toast)
├── utils/          Fechas, formatos, calendario, planning, contraseñas…
└── views/          Una vista por pantalla
```

---

## Tests

61 tests con Vitest:

```bash
npm run test:unit -- --run
```

- **Unitarios:** el cliente HTTP (token, errores y sesión caducada), el store de sesión, los requisitos de contraseña, el generador de contraseñas temporales, la lógica de fechas, calendario y planning, y los composables.
- **De componentes**, con Vue Test Utils: `BaseButton`, `BaseInput`, `ApartmentCard`, `CleaningTaskCard` y la pantalla de login (con la API simulada).

---

## Compilar para producción

```bash
npm run build
```

Genera la carpeta `dist/` con archivos estáticos, que se pueden servir desde cualquier hosting. Antes hay que crear `.env.production` con la URL de la API en producción.

Como es una SPA con rutas propias (`/today`, `/employees`…), el servidor tiene que devolver `index.html` para cualquier ruta. En un hosting Apache se consigue con un `.htaccess` en la carpeta del frontend:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Próximos pasos

- Despliegue online en un subdominio del hosting del hotel.
- Editar empleados y restablecer su contraseña desde el panel.
- Instalable en el móvil (PWA), vista mensual del planning y fotos en las incidencias.
- Migración del frontend a **React**, reutilizando `src/api/`, las utilidades y las clases de Tailwind.
