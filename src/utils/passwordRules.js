// Requisitos de contraseña: los mismos que valida el backend
export const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (password) => password.length >= 8 },
  { label: 'Al menos una letra mayúscula', test: (password) => /[A-Z]/.test(password) },
  { label: 'Al menos un número', test: (password) => /\d/.test(password) },
]

export function isValidPassword(password) {
  return passwordRules.every((rule) => rule.test(password))
}
