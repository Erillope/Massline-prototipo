# language: es

Característica: Edición de emergencia de orden de compra
  Como usuario del sistema MassLine
  Quiero solicitar una edición de emergencia sobre una orden de compra
  Para corregir información crítica en situaciones excepcionales, sujeto a aprobación

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de edición de emergencia

  # ─── Flujo principal ───────────────────────────────────────────────────────

  # AC1 · AC2 · AC3
  Escenario: Solicitud de edición de emergencia enviada exitosamente
    Dado que existe una orden de compra registrada en el sistema
    Cuando el usuario visualiza el detalle de esa orden
    Y el usuario inicia una edición de emergencia
    Y el usuario edita los campos necesarios de la orden
    Y el usuario ingresa una justificación detallada para la edición de emergencia
    Y el usuario indica que desea confirmar la finalización de la edición
    Entonces el sistema muestra un resumen de los cambios realizados en la orden
    Cuando el usuario confirma el envío de la solicitud
    Entonces el sistema registra la solicitud de edición de emergencia con la fecha, hora, usuario y justificación
    Y el sistema marca la solicitud con estado "Pendiente de aprobación"
    Y el sistema bloquea cualquier intento de edición regular sobre esa orden
    Y el sistema muestra una notificación de que existe una solicitud de edición de emergencia pendiente

  # ─── Flujos alternativos ────────────────────────────────────────────────────

  # — volver a editar desde el resumen
  Escenario: El usuario no confirma el resumen y vuelve a editar
    Dado que el usuario ha editado campos de una orden de compra en modo de emergencia
    Cuando el usuario indica que desea confirmar la finalización y el sistema muestra el resumen de cambios
    Y el usuario decide no confirmar el envío y volver a editar
    Entonces el sistema permite al usuario continuar editando sin registrar ninguna solicitud

  # AC3 — bloqueo de ediciones regulares
  Escenario: Las ediciones regulares quedan bloqueadas mientras la solicitud está pendiente
    Dado que existe una solicitud de edición de emergencia en estado "Pendiente de aprobación" sobre una orden
    Cuando un usuario intenta realizar una edición regular sobre esa misma orden
    Entonces el sistema bloquea la edición
    Y el sistema informa al usuario el motivo del bloqueo indicando que existe una solicitud de emergencia pendiente
