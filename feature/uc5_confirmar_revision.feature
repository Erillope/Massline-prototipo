# language: es

Característica: Confirmar revisión de orden de compra
  Como usuario del sistema MassLine
  Quiero confirmar la revisión de una orden de compra
  Para registrar las posiciones de almacenamiento, actualizar su estado y enviar el reporte

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de confirmación de revisión

  # ─── Flujo principal ───────────────────────────────────────────────────────

  # AC1 · AC3 · AC5 · AC6 · AC7
  Escenario: Confirmación exitosa de una revisión sin anomalías
    Dado que existe una orden de compra en estado "Revisada"
    Cuando el usuario selecciona esa orden
    Entonces el sistema muestra un resumen de la revisión
    Cuando el usuario ingresa las posiciones de almacenamiento para cada caja registrada
    Y el usuario confirma la revisión
    Entonces el sistema actualiza el estado de la orden a "Por almacenar"
    Y el sistema envía el reporte de revisión a los destinatarios correspondientes
    Y el sistema registra el cambio en el historial con la fecha, hora y usuario que confirmó

  # AC1 · AC3 · AC5 · AC6 · AC7
  Escenario: Confirmación exitosa de una revisión con anomalías en PO externa
    Dado que existe una orden de compra externa en estado "Revisada con anomalías"
    Cuando el usuario selecciona esa orden
    Y el usuario ingresa las posiciones de almacenamiento para cada caja registrada
    Y el usuario confirma la revisión
    Entonces el sistema actualiza el estado de la orden a "Por almacenar"
    Y el sistema envía el reporte de revisión a los destinatarios correspondientes
    Y el sistema registra el cambio en el historial con la fecha, hora y usuario que confirmó

  # ─── Flujos alternativos — bloqueo y cancelación ──────────────────────────

  # AC2 — PO local con anomalías sin resolver
  Escenario: Bloqueo de confirmación en PO local con anomalías sin resolver
    Dado que existe una orden de compra local en estado "Revisada con anomalías"
    Y la orden tiene anomalías pendientes de resolución
    Cuando el usuario selecciona esa orden e intenta confirmar la revisión
    Entonces el sistema bloquea la confirmación
    Y el sistema informa al usuario con un mensaje claro que existen anomalías pendientes de resolución

  # AC3 — posiciones de almacenamiento incompletas
  Escenario: La confirmación no se habilita hasta completar todas las posiciones de almacenamiento
    Dado que existe una orden de compra en estado "Revisada"
    Cuando el usuario selecciona esa orden
    Y el usuario deja al menos una caja sin posición de almacenamiento asignada
    Entonces el sistema no habilita la acción de confirmar la revisión

  # AC4 — cancelación sin cambios
  Escenario: El usuario cancela la confirmación sin realizar cambios
    Dado que existe una orden de compra en estado "Revisada"
    Cuando el usuario selecciona esa orden
    Y el usuario ingresa las posiciones de almacenamiento para todas las cajas
    Y el usuario cancela la operación sin confirmar
    Entonces el sistema no realiza ningún cambio en la orden
    Y el estado de la orden permanece en "Revisada"

  # ─── Restricciones de estado ────────────────────────────────────────────────

  # AC1
  Escenario: Solo se pueden confirmar órdenes en estado "Revisada" o "Revisada con anomalías"
    Dado que existe una orden de compra que no está en estado "Revisada" ni "Revisada con anomalías"
    Cuando el usuario intenta confirmar la revisión de esa orden
    Entonces el sistema no permite realizar la operación
