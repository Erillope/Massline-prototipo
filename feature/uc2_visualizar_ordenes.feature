# language: es

Característica: Visualizar órdenes de compra
  Como usuario del sistema MassLine
  Quiero consultar y visualizar las órdenes de compra registradas
  Para revisar su detalle, estado y documentos asociados

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de visualización de órdenes de compra

  # ─── Flujo principal ───────────────────────────────────────────────────────

  # AC1 · AC3
  Escenario: Visualización del detalle de una orden sin anomalías
    Dado que existen órdenes de compra registradas en el sistema
    Cuando el usuario accede a la sección de órdenes de compra
    Entonces el sistema muestra la lista de órdenes ordenada por prioridad
    Cuando el usuario selecciona una orden de la lista
    Entonces el sistema muestra el detalle completo de la orden seleccionada
    Y el sistema muestra los documentos adjuntos de la orden
    Y el sistema no muestra una sección de anomalías

  # AC1 · AC3
  Escenario: Visualización del detalle de una orden con anomalías registradas
    Dado que existen órdenes de compra registradas en el sistema
    Y al menos una de ellas tiene anomalías registradas
    Cuando el usuario accede a la sección de órdenes de compra
    Y el usuario selecciona una orden que tiene anomalías
    Entonces el sistema muestra el detalle completo de la orden seleccionada
    Y el sistema muestra los documentos adjuntos de la orden
    Y el sistema muestra el detalle de las anomalías registradas en la orden

  # AC3 — orden de prioridad de la lista
  Escenario: La lista de órdenes se muestra ordenada por prioridad
    Dado que existen órdenes de compra en distintos estados registradas en el sistema
    Cuando el usuario accede a la sección de órdenes de compra sin aplicar filtros
    Entonces la lista muestra primero las órdenes en estado "En bodega" sin revisar
    Y a continuación las órdenes en estado "Revisada con anomalías"
    Y a continuación las órdenes ingresadas más recientemente aún no almacenadas
    Y al final las órdenes en estado "Almacenada"

  # ─── Flujos alternativos — búsqueda y filtros ──────────────────────────────

  # AC2 · AC1 — búsqueda por código
  Escenario: Búsqueda exitosa de una orden por código
    Dado que existen órdenes de compra registradas en el sistema
    Cuando el usuario accede a la sección de órdenes de compra
    Y el usuario ingresa el código de una orden existente como criterio de búsqueda
    Y el usuario ejecuta la búsqueda
    Entonces el sistema muestra únicamente las órdenes cuyo código coincide con el criterio ingresado
    Cuando el usuario selecciona una orden de la lista resultante
    Entonces el sistema muestra el detalle completo de la orden seleccionada

  # AC2 · AC1 — búsqueda por proveedor
  Escenario: Búsqueda exitosa de órdenes por proveedor
    Dado que existen órdenes de compra registradas en el sistema
    Cuando el usuario accede a la sección de órdenes de compra
    Y el usuario ingresa el nombre de un proveedor como criterio de búsqueda
    Y el usuario ejecuta la búsqueda
    Entonces el sistema muestra únicamente las órdenes asociadas al proveedor indicado

  # AC2 · AC1 — búsqueda por fecha de ingreso
  Escenario: Búsqueda exitosa de órdenes por fecha de ingreso
    Dado que existen órdenes de compra registradas en el sistema
    Cuando el usuario accede a la sección de órdenes de compra
    Y el usuario ingresa una fecha de ingreso como criterio de búsqueda
    Y el usuario ejecuta la búsqueda
    Entonces el sistema muestra únicamente las órdenes ingresadas en esa fecha

  # AC2 · AC1 — filtro por estado
  Escenario: Filtrado exitoso de órdenes por estado
    Dado que existen órdenes de compra en distintos estados registradas en el sistema
    Cuando el usuario accede a la sección de órdenes de compra
    Y el usuario selecciona un estado como filtro de búsqueda
    Y el usuario ejecuta la búsqueda
    Entonces el sistema muestra únicamente las órdenes que se encuentran en el estado seleccionado

  # ─── Flujos alternativos — sin resultados ─────────────────────────────────

  # AC4 — búsqueda sin resultados
  Escenario: Búsqueda que no arroja resultados
    Dado que existen órdenes de compra registradas en el sistema
    Cuando el usuario accede a la sección de órdenes de compra
    Y el usuario ingresa criterios de búsqueda que no coinciden con ninguna orden
    Y el usuario ejecuta la búsqueda
    Entonces el sistema informa al usuario que no se encontraron órdenes con los criterios indicados
    Y el sistema no muestra ninguna orden en la lista

  # AC4 — el usuario modifica la búsqueda tras no encontrar resultados
  Escenario: El usuario modifica los criterios de búsqueda tras no encontrar resultados
    Dado que existen órdenes de compra registradas en el sistema
    Cuando el usuario accede a la sección de órdenes de compra
    Y el usuario realiza una búsqueda que no arroja resultados
    Entonces el sistema informa que no se encontraron órdenes con los criterios indicados
    Cuando el usuario modifica los criterios de búsqueda con datos que sí coinciden con una orden
    Y el usuario ejecuta la búsqueda nuevamente
    Entonces el sistema muestra las órdenes que coinciden con los nuevos criterios

  # AC5 — sistema sin órdenes registradas
  Escenario: No existen órdenes registradas en el sistema
    Dado que no existe ninguna orden de compra registrada en el sistema
    Cuando el usuario accede a la sección de órdenes de compra
    Entonces el sistema muestra un mensaje indicando que no hay órdenes registradas
    Y el sistema no muestra ninguna lista de órdenes
