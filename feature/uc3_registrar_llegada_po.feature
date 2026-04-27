# language: es

Característica: Registrar llegada de PO a bodega
  Como usuario del sistema MassLine
  Quiero registrar la llegada de una orden de compra a la bodega
  Para actualizar su estado y activar el proceso de revisión

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de órdenes de compra

  # ─── Flujo principal ───────────────────────────────────────────────────────

  # AC2 · AC3 · AC4 · AC5
  Escenario: Registro exitoso de llegada de una PO
    Dado que existe una orden de compra en estado "Por llegar"
    Cuando el usuario selecciona esa orden
    Entonces el sistema muestra un resumen de la orden antes de confirmar
    Cuando el usuario confirma la llegada a bodega
    Entonces el sistema actualiza el estado de la orden a "En bodega"
    Y el sistema registra el cambio en el historial con la fecha, hora y usuario que confirmó la llegada
    Y el sistema muestra una confirmación del registro exitoso

  # ─── Flujos alternativos ────────────────────────────────────────────────────

  # AC3 — cancelación sin cambios
  Escenario: El usuario cancela el registro de llegada
    Dado que existe una orden de compra en estado "Por llegar"
    Cuando el usuario selecciona esa orden
    Entonces el sistema muestra un resumen de la orden antes de confirmar
    Cuando el usuario cancela la operación sin confirmar
    Entonces el sistema no realiza ningún cambio en la orden
    Y el estado de la orden permanece en "Por llegar"

  # ─── Restricciones de estado ────────────────────────────────────────────────

  # AC1 — solo órdenes "Por llegar"
  Escenario: No se puede registrar la llegada de una orden que no está en estado "Por llegar"
    Dado que existe una orden de compra que no está en estado "Por llegar"
    Cuando el usuario intenta registrar la llegada de esa orden
    Entonces el sistema no permite realizar la operación
