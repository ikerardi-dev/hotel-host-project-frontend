import { describe, it, expect } from 'vitest'
import { isValidPassword } from './passwordRules'

describe('passwordRules', () => {
  it('acepta una contraseña con 8 caracteres, una mayúscula y un número', () => {
    expect(isValidPassword('NuevaClave1')).toBe(true)
  })

  it.each([
    ['demasiado corta', 'Clave1'],
    ['sin mayúscula', 'nuevaclave1'],
    ['sin número', 'NuevaClave'],
  ])('rechaza una contraseña %s', (_, password) => {
    expect(isValidPassword(password)).toBe(false)
  })
})
