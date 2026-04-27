# language: es

Característica: Revisar orden de compra
  Como usuario del sistema MassLine
  Quiero revisar los productos de una orden de compra recibida en bodega
  Para registrar cajas, cantidades recibidas, anomalías y generar el reporte de revisión

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de revisión de órdenes de compra

  # ─── Flujo principal — sin anomalías ──────────────────────────────────────

  # AC1 · AC2 · AC6 · AC7 · AC8 · AC9
  Escenario: Revisión exitosa de una orden sin anomalías
    Dado que existe una orden de compra en estado "En bodega"
    Cuando el usuario selecciona esa orden para revisarla
    Entonces el sistema muestra el detalle de la orden con los productos esperados, proveedor y código NIR
    Cuando el usuario registra las cajas con su cantidad y contenido
    Y el usuario verifica que todos los ítems corresponden con la PO sin diferencias ni daños
    Y el usuario indica que desea confirmar la revisión
    Entonces el sistema muestra un resumen de la revisión con ítems sin anomalías, faltantes, sobrantes, dañados y cajas registradas
    Y el sistema muestra la lista de destinatarios del reporte de revisión
    Cuando el usuario confirma el envío del reporte
    Entonces el sistema actualiza el estado de la orden a "Revisada"
    Y el sistema registra la revisión en el historial con la fecha, hora y usuario responsable

  # ─── Flujo con anomalías ───────────────────────────────────────────────────

  # AC3 — faltantes
  Escenario: Revisión con productos faltantes
    Dado que existe una orden de compra en estado "En bodega"
    Cuando el usuario selecciona esa orden para revisarla
    Y el usuario registra la cantidad recibida de un ítem menor a la cantidad esperada
    Entonces el sistema calcula la diferencia y la categoriza como "faltante"
    Cuando el usuario confirma la revisión y el sistema muestra el resumen
    Entonces el resumen incluye los ítems faltantes registrados
    Y el sistema actualiza el estado de la orden a "Revisada con anomalías"

  # AC3 — sobrantes por cantidad
  Escenario: Revisión con sobrantes por cantidad
    Dado que existe una orden de compra en estado "En bodega"
    Cuando el usuario selecciona esa orden para revisarla
    Y el usuario registra la cantidad recibida de un ítem mayor a la cantidad esperada
    Entonces el sistema calcula la diferencia y la categoriza como "sobrante por cantidad"
    Cuando el usuario confirma la revisión y el sistema muestra el resumen
    Entonces el resumen incluye los ítems sobrantes registrados
    Y el sistema actualiza el estado de la orden a "Revisada con anomalías"

  # AC4 — productos no pertenecientes a la PO
  Escenario: Revisión con productos recibidos que no pertenecen a la PO
    Dado que existe una orden de compra en estado "En bodega"
    Cuando el usuario selecciona esa orden para revisarla
    Y el usuario registra productos recibidos que no forman parte de la PO
    Entonces el sistema categoriza esos productos como "sobrantes por producto no perteneciente"
    Cuando el usuario confirma la revisión y el sistema muestra el resumen
    Entonces el resumen incluye los productos no pertenecientes registrados
    Y el sistema actualiza el estado de la orden a "Revisada con anomalías"

  # AC5 — productos dañados
  Escenario: Revisión con productos dañados
    Dado que existe una orden de compra en estado "En bodega"
    Cuando el usuario selecciona esa orden para revisarla
    Y el usuario registra la cantidad de productos dañados de un ítem
    Cuando el usuario confirma la revisión y el sistema muestra el resumen
    Entonces el resumen incluye los ítems dañados registrados
    Y el sistema actualiza el estado de la orden a "Revisada con anomalías"

  # ─── Contenido del resumen previo a confirmación ──────────────────────────

  # AC6 · AC7
  Escenario: El resumen previo a la confirmación incluye toda la información requerida
    Dado que el usuario ha completado la revisión de una orden en estado "En bodega"
    Cuando el usuario indica que desea confirmar la revisión
    Entonces el sistema muestra un resumen que incluye los ítems sin anomalías
    Y el resumen incluye los faltantes registrados
    Y el resumen incluye los sobrantes registrados
    Y el resumen incluye los dañados registrados
    Y el resumen incluye las cajas registradas
    Y el sistema muestra la lista de destinatarios a los que se enviará el reporte

  # ─── Restricciones de estado ────────────────────────────────────────────────

  # AC1
  Escenario: No se puede revisar una orden que no está en estado "En bodega"
    Dado que existe una orden de compra que no está en estado "En bodega"
    Cuando el usuario intenta iniciar la revisión de esa orden
    Entonces el sistema no permite realizar la operación
