# language: es

Característica: Historial de cambios de una orden de compra
  Como usuario del sistema MassLine
  Quiero visualizar el historial de versiones de una orden de compra
  Para rastrear todas las modificaciones, revisiones y cambios de estado registrados

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de visualización de órdenes de compra

  # ─── Flujo principal ───────────────────────────────────────────────────────

  # AC1 · AC2
  Escenario: Visualización de la lista de versiones en el historial
    Dado que existe una orden de compra con al menos una versión registrada en el historial
    Cuando el usuario visualiza el detalle de esa orden
    Y el usuario abre la vista de historial de versiones
    Entonces el sistema muestra todas las versiones registradas de la orden

  # AC2 · AC3 · AC4
  Escenario: Selección de una versión con modificaciones registradas
    Dado que existe una orden de compra con una versión en el historial que contiene modificaciones
    Cuando el usuario abre el historial de la orden
    Y el usuario selecciona esa versión
    Entonces el sistema muestra los campos de la orden tal como estaban en ese momento
    Y el sistema muestra el detalle de las modificaciones con el campo modificado, valor anterior, valor nuevo, fecha, hora y usuario responsable

  # AC3 — versión sin modificaciones
  Escenario: Selección de una versión sin modificaciones registradas
    Dado que existe una orden de compra con una versión en el historial que no contiene modificaciones
    Cuando el usuario abre el historial de la orden
    Y el usuario selecciona esa versión
    Entonces el sistema muestra los campos de la orden tal como estaban en ese momento
    Y el sistema muestra un mensaje indicando que no hay modificaciones registradas en esa versión

  # — iteración entre versiones
  Escenario: El usuario revisa múltiples versiones en la misma sesión
    Dado que existe una orden de compra con varias versiones en el historial
    Cuando el usuario abre el historial de la orden
    Y el usuario selecciona una primera versión y la revisa
    Y el usuario indica que desea revisar otra versión
    Entonces el sistema muestra nuevamente la lista de todas las versiones disponibles
    Cuando el usuario selecciona una segunda versión
    Entonces el sistema muestra los campos de la orden tal como estaban en esa segunda versión

  # AC5 — cobertura de tipos de eventos en el historial
  Escenario: El historial incluye todos los tipos de eventos registrados sobre la orden
    Dado que sobre una orden de compra se han realizado modificaciones, revisiones, valoraciones y cambios de estado
    Cuando el usuario abre el historial de esa orden
    Entonces el sistema muestra versiones correspondientes a cada uno de esos tipos de eventos registrados
