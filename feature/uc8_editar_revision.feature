# language: es

Característica: Editar revisión de orden de compra
  Como usuario del sistema MassLine
  Quiero editar los detalles de una revisión ya registrada
  Para corregir cajas, cantidades o anomalías antes de avanzar en el proceso

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de edición de revisiones

  # ─── Flujo principal ───────────────────────────────────────────────────────

  # AC1 · AC2 · AC3 · AC4 · AC7 · AC8
  Escenario: Edición exitosa de una revisión confirmando el resumen
    Dado que existe una orden de compra en estado "Revisada"
    Cuando el usuario selecciona esa orden
    Entonces el sistema muestra los detalles actuales de la revisión con cajas, cantidades por ítem y anomalías
    Cuando el usuario edita las cajas, cantidades recibidas o anomalías registradas
    Y el usuario indica que desea confirmar la edición
    Entonces el sistema muestra un resumen de la revisión editada con ítems sin anomalías, faltantes, sobrantes, dañados y cajas
    Cuando el usuario confirma el resumen
    Entonces el sistema actualiza los detalles de la revisión en la orden
    Y el sistema registra el cambio en el historial con la fecha, hora y usuario que realizó la edición
    Y el sistema muestra una confirmación de éxito

  # ─── Flujos alternativos ────────────────────────────────────────────────────

  # AC4 · AC5 — volver a editar desde el resumen
  Escenario: El usuario revisa el resumen y decide volver a editar sin confirmar
    Dado que existe una orden de compra en estado "Revisada"
    Cuando el usuario selecciona esa orden y realiza cambios en la revisión
    Y el usuario indica que desea confirmar la edición
    Entonces el sistema muestra el resumen de la revisión editada
    Cuando el usuario decide no confirmar el resumen y volver a la edición
    Entonces el sistema permite al usuario seguir editando sin aplicar ningún cambio

  # AC6 — cancelación sin cambios
  Escenario: El usuario cancela la edición sin realizar cambios
    Dado que existe una orden de compra en estado "Revisada"
    Cuando el usuario selecciona esa orden y comienza a editar la revisión
    Y el usuario cancela la edición antes de confirmar
    Entonces el sistema no realiza ningún cambio en los detalles de la revisión existente

  # ─── Restricciones de estado ────────────────────────────────────────────────

  # AC1
  Escenario: Solo se pueden editar revisiones de órdenes en estado "Revisada"
    Dado que existe una orden de compra que no está en estado "Revisada"
    Cuando el usuario intenta editar la revisión de esa orden
    Entonces el sistema no permite realizar la operación
