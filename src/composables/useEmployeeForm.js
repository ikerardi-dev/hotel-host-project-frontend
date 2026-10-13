import { onMounted, reactive, ref } from 'vue'
import { getBuildings } from '@/api/buildings'
import { isValidPassword } from '@/utils/passwordRules'
import { generateTemporaryPassword } from '@/utils/temporaryPassword'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DNI_PATTERN = /^([0-9]{8}|[XYZ][0-9]{7})[A-Z]$/i

// Errores de la API que corresponden a un campo concreto
const FIELD_BY_ERROR = { EMAIL_ALREADY_EXISTS: 'email', DNI_ALREADY_EXISTS: 'dni' }

/**
 * Formulario de empleado compartido por el alta y la ficha.
 * withPassword: el alta incluye la contraseña temporal; al editar, la contraseña va aparte.
 */
export function useEmployeeForm({ withPassword }) {
  const buildings = ref([])
  const form = reactive({
    firstName: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    ...(withPassword && { temporaryPassword: generateTemporaryPassword() }),
    buildingIds: [],
    hireDate: new Date().toLocaleDateString('sv-SE'), // hoy en formato AAAA-MM-DD
    notes: '',
  })
  const errors = reactive({})
  const generalError = ref('')

  onMounted(async () => {
    try {
      buildings.value = await getBuildings()
    } catch (e) {
      generalError.value = e.message
    }
  })

  // Rellena el formulario con un empleado de la API
  function fill(employee) {
    Object.assign(form, {
      firstName: employee.firstName,
      lastName: employee.lastName,
      dni: employee.dni ?? '',
      phone: employee.phone ?? '',
      email: employee.email,
      buildingIds: employee.buildings.map((building) => building.id),
      hireDate: employee.hireDate ?? '',
      notes: employee.notes ?? '',
    })
  }

  function toggleBuilding(id) {
    form.buildingIds = form.buildingIds.includes(id)
      ? form.buildingIds.filter((buildingId) => buildingId !== id)
      : [...form.buildingIds, id]
  }

  function validate() {
    Object.keys(errors).forEach((key) => delete errors[key])
    generalError.value = ''
    if (!form.firstName.trim()) errors.firstName = 'El nombre es obligatorio'
    if (!form.lastName.trim()) errors.lastName = 'Los apellidos son obligatorios'
    if (!DNI_PATTERN.test(form.dni.trim())) errors.dni = 'El DNI/NIE no tiene un formato válido'
    if (!form.phone.trim()) errors.phone = 'El teléfono es obligatorio'
    if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Email no válido'
    if (withPassword && !isValidPassword(form.temporaryPassword)) {
      errors.temporaryPassword = 'Mínimo 8 caracteres, una mayúscula y un número'
    }
    if (form.buildingIds.length === 0) errors.buildingIds = 'Asigna al menos un edificio'
    if (!form.hireDate) errors.hireDate = 'La fecha de alta es obligatoria'
    return Object.keys(errors).length === 0
  }

  // Datos para enviar a la API
  function payload() {
    return { ...form, notes: form.notes.trim() || null }
  }

  // Muestra el error de la API en su campo o, si no es de un campo, arriba del botón
  function showApiError(error) {
    const field = FIELD_BY_ERROR[error.code]
    if (field) {
      errors[field] = error.message
    } else {
      generalError.value = error.message
    }
  }

  return { buildings, form, errors, generalError, fill, toggleBuilding, validate, payload, showApiError }
}
