// Textos para dar de baja o reactivar a un empleado (lista de empleados y ficha)

export function statusDialog(employee, name) {
  return employee.active
    ? {
        title: `¿Dar de baja a ${name}?`,
        message:
          'No podrá iniciar sesión, pero su historial de limpiezas se conservará. Sus limpiezas pendientes se quedarán sin asignar.',
        confirmLabel: 'Dar de baja',
        variant: 'danger',
      }
    : {
        title: `¿Reactivar a ${name}?`,
        message: 'Podrá volver a iniciar sesión con su contraseña actual.',
        confirmLabel: 'Reactivar',
        variant: 'primary',
      }
}

// result: respuesta de updateEmployeeStatus ({ employee, unassignedCleanings })
export function statusChangedMessage(name, { employee, unassignedCleanings }) {
  let message = employee.active ? `${name} reactivado` : `${name} dado de baja`
  if (unassignedCleanings > 0) {
    message += `. ${unassignedCleanings} limpieza(s) se han quedado sin asignar`
  }
  return message
}
