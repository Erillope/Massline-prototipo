# language: es

Característica: Ingresar orden de compra
  Como usuario del sistema MassLine
  Quiero registrar una orden de compra mediante un archivo o ingreso manual
  Para que quede registrada en el sistema con un número de ingreso único (NIR)

  Antecedentes:
    Dado que el usuario tiene acceso al módulo de ingreso de órdenes de compra

  # ─── Flujo principal ───────────────────────────────────────────────────────

  # AC1 · AC4 (todos los campos completados) · AC5 · AC7 · AC8
  Escenario: Ingreso exitoso de PO externa mediante archivo Excel
    Dado que el usuario selecciona un archivo Excel con una única PO externa
    Cuando el sistema valida que el archivo tiene formato correcto
    Y el sistema puede procesar el contenido del archivo
    Entonces el sistema extrae el proveedor, los códigos de producto, descripción y las cantidades
    Y el sistema asigna un número de ingreso con formato "NIR-XXXX"
    Y el sistema completa automáticamente todos los campos "codigo_massline" y "descripcion_massline"
    Cuando el usuario adjunta un archivo de email como evidencia de la orden
    Y el usuario confirma el ingreso
    Entonces el sistema asigna el estado "Por llegar" a la orden
    Y el sistema muestra un resumen con el NIR asignado, el proveedor y el número de items en la orden

  # AC2 · AC4 (solo reconocidos + completar pendientes) · AC5 · AC7 · AC8
  Escenario: Ingreso exitoso de PO local mediante archivo XML con productos parcialmente reconocidos
    Dado que el usuario selecciona un archivo XML con una única PO local
    Cuando el sistema valida que el archivo tiene formato correcto
    Y el sistema puede procesar el contenido del archivo
    Entonces el sistema extrae el proveedor, los códigos de producto y las cantidades
    Y el sistema asigna un número de ingreso con formato "NIR-XXXX"
    Y el sistema completa automáticamente los campos "codigo_massline" y "descripcion_massline" solo para los productos reconocidos
    Y el sistema deja pendientes los campos "codigo_massline" y "descripcion_massline" de los productos no reconocidos
    Cuando el usuario completa manualmente los campos pendientes de los productos no reconocidos
    Y el usuario adjunta un archivo de email como evidencia de la orden
    Y el usuario confirma el ingreso
    Entonces el sistema asigna el estado "Por llegar" a la orden
    Y el sistema muestra un resumen con el NIR asignado, el proveedor y el número de items en la orden

  # AC2 · AC4 (todos reconocidos) · AC5 · AC7 · AC8
  Escenario: Ingreso exitoso de PO local mediante archivo XML con todos los productos reconocidos
    Dado que el usuario selecciona un archivo XML con una única PO local
    Cuando el sistema valida que el archivo tiene formato correcto
    Y el sistema puede procesar el contenido del archivo
    Y todos los productos del archivo son reconocidos por el sistema
    Entonces el sistema asigna un número de ingreso con formato "NIR-XXXX"
    Y el sistema completa automáticamente los campos "codigo_massline" y "descripcion_massline" de todos los productos
    Y el sistema no deja ningún campo pendiente de completar manualmente
    Cuando el usuario adjunta un archivo de email como evidencia de la orden
    Y el usuario confirma el ingreso
    Entonces el sistema asigna el estado "Por llegar" a la orden
    Y el sistema muestra un resumen con el NIR asignado, el proveedor y el número de items en la orden

  # ─── Flujos alternativos ────────────────────────────────────────────────────

  # AC3 — primer caso: formato de archivo no válido
  Escenario: Rechazo de archivo con formato no válido
    Dado que el usuario selecciona un archivo cuyo formato no corresponde al esperado
    Cuando el sistema valida el formato del archivo
    Entonces el sistema muestra un mensaje de error indicando que el archivo no es válido o no tiene el formato esperado
    Y el sistema no procesa el contenido del archivo
    Y el sistema permite al usuario seleccionar un nuevo archivo sin abandonar el flujo

  # AC3 — segundo caso: formato válido pero no procesable → ingreso manual
  Escenario: Ingreso manual cuando el formato del archivo no puede ser procesado automáticamente
    Dado que el usuario selecciona un archivo con formato válido que el sistema no puede procesar automáticamente
    Cuando el sistema detecta que no puede extraer los datos del archivo
    Entonces el sistema muestra la opción de ingresar los datos manualmente
    Cuando el usuario ingresa manualmente el proveedor, los códigos, las descripciones y las cantidades de los productos
    Y el usuario adjunta un archivo de email como evidencia de la orden
    Y el usuario confirma el ingreso
    Entonces el sistema asigna un número de ingreso con formato "NIR-XXXX"
    Y el sistema asigna el estado "Por llegar" a la orden
    Y el sistema muestra un resumen con el NIR asignado, el proveedor y el número de items en la orden

  # AC6
  Escenario: Selección de PO al detectar múltiples órdenes en el archivo
    Dado que el usuario selecciona un archivo Excel que contiene múltiples órdenes de compra
    Cuando el sistema valida y procesa el archivo correctamente
    Entonces el sistema muestra un resumen de cada PO detectada en el archivo
    Cuando el usuario selecciona una de las POs para registrar
    Entonces el sistema continúa el ingreso solo con los datos de la PO seleccionada
    Y el sistema no registra las demás POs del archivo

  # ─── Reglas de negocio transversales ────────────────────────────────────────

  # AC7 — unicidad del NIR
  Escenario: El NIR asignado a cada orden registrada es único
    Dado que ya existe en el sistema una orden registrada con el número "NIR-0015"
    Cuando el usuario registra correctamente una nueva orden de compra
    Entonces el sistema asigna a la nueva orden un NIR distinto al de todas las órdenes ya registradas