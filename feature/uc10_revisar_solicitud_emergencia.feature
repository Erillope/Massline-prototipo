# language: es

Característica: Revisar solicitud de edición de emergencia
  Como usuario con permisos especiales en el sistema MassLine
  Quiero revisar las solicitudes de edición de emergencia pendientes
  Para aprobarlas o rechazarlas y desbloquear las ediciones regulares de la orden

  Antecedentes:
    Dado que el usuario tiene permisos especiales para revisar solicitudes de edición de emergencia

  # ─── Flujo principal — aprobación ─────────────────────────────────────────

  # AC1 · AC2 · AC3 · AC5
  Escenario: Aprobación exitosa de una solicitud de edición de emergencia
    Dado que existe al menos una solicitud de edición de emergencia en estado "Pendiente de aprobación"
    Cuando el usuario accede a la lista de solicitudes pendientes
    Entonces el sistema muestra todas las solicitudes de edición de emergencia en estado "Pendiente de aprobación"
    Cuando el usuario selecciona una solicitud y revisa su justificación y los cambios propuestos
    Y el usuario aprueba la solicitud
    Entonces el sistema aplica los cambios editados a la orden de compra
    Y el sistema actualiza el estado de la solicitud a "Aprobada"
    Y el sistema registra la aprobación en el historial con la fecha, hora y usuario revisor
    Y el sistema habilita nuevamente las ediciones regulares de esa orden

  # ─── Flujo alternativo — rechazo ──────────────────────────────────────────

  # AC3 · AC4 · AC6
  Escenario: Rechazo exitoso de una solicitud de edición de emergencia con motivo
    Dado que existe al menos una solicitud de edición de emergencia en estado "Pendiente de aprobación"
    Cuando el usuario accede a la lista de solicitudes pendientes
    Y el usuario selecciona una solicitud y revisa su justificación y los cambios propuestos
    Y el usuario decide rechazar la solicitud
    Y el usuario ingresa el motivo del rechazo
    Y el usuario confirma el rechazo
    Entonces el sistema mantiene los detalles originales de la orden sin aplicar los cambios propuestos
    Y el sistema actualiza el estado de la solicitud a "Rechazada" con el motivo indicado
    Y el sistema registra el rechazo en el historial con la fecha, hora, usuario revisor y motivo del rechazo
    Y el sistema habilita nuevamente las ediciones regulares de esa orden

  # AC4 — motivo de rechazo obligatorio
  Escenario: No se puede rechazar una solicitud sin ingresar el motivo del rechazo
    Dado que el usuario ha decidido rechazar una solicitud de edición de emergencia
    Cuando el usuario intenta confirmar el rechazo sin haber ingresado un motivo
    Entonces el sistema no permite confirmar el rechazo
    Y el sistema indica al usuario que debe proporcionar una justificación del motivo

  # ─── Regla de desbloqueo transversal ─────────────────────────────────────

  # RN — al resolver la solicitud, se habilitan ediciones regulares
  Escenario: Las ediciones regulares quedan desbloqueadas al resolver la solicitud (aprobar o rechazar)
    Dado que existe una solicitud de edición de emergencia en estado "Pendiente de aprobación" sobre una orden
    Cuando el usuario con permisos especiales resuelve la solicitud ya sea aprobándola o rechazándola
    Entonces el sistema habilita las ediciones regulares de esa orden independientemente del resultado
