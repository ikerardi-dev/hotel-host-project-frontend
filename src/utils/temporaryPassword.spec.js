import { describe, it, expect } from 'vitest'
import { isValidPassword } from './passwordRules'
import { generateTemporaryPassword } from './temporaryPassword'

describe('generateTemporaryPassword', () => {
  it('siempre cumple los requisitos de contraseña', () => {
    for (let i = 0; i < 200; i++) {
      expect(isValidPassword(generateTemporaryPassword())).toBe(true)
    }
  })

  it('genera contraseñas distintas cada vez', () => {
    expect(generateTemporaryPassword()).not.toBe(generateTemporaryPassword())
  })
})
