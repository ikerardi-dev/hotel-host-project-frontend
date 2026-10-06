const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijkmnpqrstuvwxyz'
const DIGITS = '23456789'
const ALL = UPPERCASE + LOWERCASE + DIGITS

function randomChar(chars) {
  const [value] = crypto.getRandomValues(new Uint32Array(1))
  return chars[value % chars.length]
}

// Contraseña temporal que cumple los requisitos (mayúscula y número garantizados).
// Sin caracteres que se confunden al dictarla (O/0, l/1, I).
export function generateTemporaryPassword(length = 10) {
  const chars = [randomChar(UPPERCASE), randomChar(DIGITS)]
  while (chars.length < length) {
    chars.push(randomChar(ALL))
  }
  // Mezcla para que la mayúscula y el número no vayan siempre al principio
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
