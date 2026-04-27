# language: es

Característica: Edición de códigos massline
  Como usuario del sistema MassLine
  Quiero corregir los códigos massline y sus descripciones en una orden de compra
  Para mantener la información de productos correcta antes de su procesamiento

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de edición de códigos massline

  # ─── Flujo principal ───────────────────────────────────────────────────────

  # AC1 · AC2 · AC3 · AC7 · AC8
  Escenario: Edición exitosa de un código massline por código directo
    Dado que existe una orden de compra en estado "Por llegar"
    Cuando el usuario selecciona esa orden
    Entonces el sistema muestra el detalle de la orden con los códigos massline actuales de cada producto
    Cuando el usuario selecciona un producto con código incorrecto
    Y el usuario elige corregirlo ingresando el nuevo código massline directamente
    Y el usuario indica que no hay más productos a corregir
    Y el usuario confirma los cambios
    Entonces el sistema actualiza el código massline del producto en la orden
    Y el sistema registra el cambio en el historial con la fecha, hora y usuario que realizó la edición
    Y el sistema muestra una confirmación de éxito

  # AC1 · AC2 · AC4 · AC7 · AC8
  Escenario: Edición exitosa de un código massline por búsqueda de descripción
    Dado que existe una orden de compra en estado "En bodega"
    Cuando el usuario selecciona esa orden
    Y el usuario selecciona un producto con código incorrecto
    Y el usuario elige corregirlo buscando por descripción del producto
    Y el usuario selecciona el código correcto de los resultados de búsqueda
    Y el usuario confirma los cambios
    Entonces el sistema actualiza el código massline del producto en la orden
    Y el sistema registra el cambio en el historial con la fecha, hora y usuario que realizó la edición

  # AC5 — múltiples productos en la misma sesión
  Escenario: Edición de múltiples productos en la misma sesión
    Dado que existe una orden de compra en estado "Por llegar" con varios productos con códigos incorrectos
    Cuando el usuario selecciona esa orden
    Y el usuario corrige el código massline del primer producto
    Y el usuario indica que hay más productos a corregir
    Y el usuario corrige el código massline de un segundo producto
    Y el usuario indica que no hay más productos a corregir
    Y el usuario confirma los cambios
    Entonces el sistema actualiza los códigos massline de todos los productos corregidos en la orden
    Y el sistema registra la edición en el historial con la fecha, hora y usuario responsable

  # ─── Flujos alternativos — cancelación ────────────────────────────────────

  # AC6
  Escenario: El usuario cancela la edición sin realizar cambios
    Dado que existe una orden de compra en estado "Por llegar"
    Cuando el usuario selecciona esa orden
    Y el usuario selecciona un producto y modifica su código massline
    Y el usuario cancela la edición sin confirmar
    Entonces el sistema no realiza ningún cambio en los códigos massline de la orden

  # ─── Restricciones de estado ────────────────────────────────────────────────

  # AC1
  Escenario: Solo se pueden editar códigos massline de órdenes en estado "Por llegar" o "En bodega"
    Dado que existe una orden de compra que no está en estado "Por llegar" ni "En bodega"
    Cuando el usuario intenta editar los códigos massline de esa orden
    Entonces el sistema no permite realizar la operación
