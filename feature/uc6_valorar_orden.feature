# language: es

Característica: Valorar orden de compra
  Como usuario del sistema MassLine
  Quiero registrar el código de valoración de una orden de compra
  Para actualizar su estado y notificar a los usuarios relacionados

  Antecedentes:
    Dado que el usuario tiene acceso al link de valoración recibido por correo electrónico

  # ─── Flujo principal — primera valoración ─────────────────────────────────

  # AC1 · AC2 · AC3 · AC6 · AC7 · AC8
  Escenario: Valoración exitosa de una orden sin valoración previa
    Dado que existe una orden de compra en estado "Almacenada" sin valoración registrada
    Cuando el usuario accede al link de valoración recibido por correo
    Entonces el sistema muestra un formulario de valoración vacío
    Cuando el usuario ingresa un código de valoración con formato "VAL-XXX"
    Y el usuario confirma la valoración
    Entonces el sistema registra el código de valoración en la orden
    Y el sistema actualiza el estado de la orden a "Valorada"
    Y el sistema registra el cambio en el historial con la fecha, hora, usuario y código de valoración
    Y el sistema envía una notificación por correo electrónico a los usuarios relacionados con la orden
    Y el sistema muestra una confirmación con el código de la orden y el código de valoración registrado

  # ─── Flujo alternativo — corrección de valoración ─────────────────────────

  # AC4 · AC9
  Escenario: Corrección de una valoración ya registrada
    Dado que existe una orden de compra en estado "Valorada" con un código de valoración registrado
    Cuando el usuario accede al link de valoración de esa orden
    Entonces el sistema muestra el código de valoración actual en modo de corrección
    Cuando el usuario modifica el código de valoración por uno nuevo con formato "VAL-XXX"
    Y el usuario confirma la corrección
    Entonces el sistema actualiza el código de valoración en la orden
    Y el sistema registra el cambio en el historial con la fecha, hora, usuario y nuevo código de valoración

  # AC9 — link permanece activo
  Escenario: El link de valoración permanece activo después de registrar una valoración
    Dado que el usuario ha confirmado exitosamente la valoración de una orden
    Entonces el link de valoración recibido por correo permanece activo
    Y el usuario puede acceder nuevamente al link para realizar una corrección del código de valoración

  # ─── Flujos alternativos — cancelación ────────────────────────────────────

  # AC5
  Escenario: El usuario cancela la valoración sin realizar cambios
    Dado que existe una orden de compra en estado "Almacenada"
    Cuando el usuario accede al link de valoración
    Y el usuario ingresa un código de valoración
    Y el usuario cancela la operación sin confirmar
    Entonces el sistema no realiza ningún cambio en la valoración existente

  # ─── Restricciones de estado ────────────────────────────────────────────────

  # AC1
  Escenario: Solo se pueden valorar órdenes en estado "Almacenada"
    Dado que existe una orden de compra que no está en estado "Almacenada"
    Cuando el usuario intenta valorar esa orden
    Entonces el sistema no permite realizar la operación
