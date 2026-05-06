# Casos de uso — cómo trabajamos

## Metodología y etapas

El trabajo en este proyecto sigue un orden de etapas definido. **No se avanza a una etapa siguiente hasta que la anterior esté suficientemente consolidada.**

| # | Etapa | Qué se hace |
|---|-------|-------------|
| 1 | **Definición de casos de uso** | Se redactan los CU en `caso_uso_massline.json`: actores, precondiciones, postcondiciones, reglas de negocio y criterios de aceptación. |
| 2 | **Prototipado** | Se construyen las páginas HTML que simulan el flujo del usuario. El prototipo puede revelar ambigüedades o casos no contemplados. |
| 3 | **Diagramas de flujo y ajuste de CUs** | Se modelan los flujos en archivos `.mmd` y se actualizan los casos de uso según lo aprendido en el prototipado. |
| 4 | **Diseño de la API** | Solo cuando todos los casos de uso de un módulo están estables se diseña el `api.md` con los endpoints REST. |

### Instrucción para asistencia con IA

Cuando se trabaja en una etapa, la IA debe **limitarse estrictamente a esa etapa**:

- Si se está definiendo o ajustando casos de uso → solo modificar el JSON, no proponer endpoints ni prototipos.
- Si se está prototipando → solo trabajar en HTML/CSS/JS, no adelantar flujos ni API.
- Si se están diseñando diagramas → solo editar los `.mmd` y el JSON relacionado.
- Si se está diseñando la API → solo trabajar en `api.md`, sin reabrir decisiones de CUs ya cerradas.

La IA no debe proponer, sugerir ni generar artefactos de una etapa posterior sin que el usuario lo solicite explícitamente.

---

## Archivos involucrados

| Archivo | Propósito |
|---------|-----------|
| `data/caso_uso_massline.json` | Fuente de verdad. Contiene todos los casos de uso con su estructura completa. |
| `data/{modulo}/uc{id}_{slug}.mmd` | Diagrama de flujo Mermaid por cada caso de uso, dentro de la subcarpeta del módulo correspondiente. |
| `project-structure/{modulo}/api.md` | Especificación REST de todos los endpoints del módulo, organizada por caso de uso. |

---

## Estructura del JSON

Todos los casos de uso viven en `caso_uso_massline.json`, agrupados por módulo:

```
{
  "orden_compra": [ CU1 … CU12 ],
  "pedidos":      [ CU13 … CU18 ]
}
```

Cada caso de uso tiene estos campos:

| Campo | Descripción |
|-------|-------------|
| `id` | Identificador numérico único |
| `nombre` | Nombre corto del caso de uso |
| `descripcion` | Descripción general en lenguaje natural |
| `actores_principales` | Lista de actores que inician el flujo |
| `actores_secundarios` | Lista de actores que participan de forma secundaria |
| `precondiciones` | Condiciones que deben cumplirse antes de ejecutar el CU |
| `postcondiciones` | Estado del sistema tras la ejecución exitosa |
| `reglas_negocio` | Restricciones y reglas que el sistema debe aplicar |
| `criterios_aceptacion` | Lista de condiciones verificables que definen si el CU está correctamente implementado |
| `prioridad` | Prioridad de implementación (`null` si no asignada) |
| `estado` | Estado de implementación (`Pendiente`, `En progreso`, `Completado`) |
| `estado_prototipo` | Estado del prototipo HTML asociado |
| `estimacion_hrs` | Estimación de horas de desarrollo |
| `dependencias` | Lista de nombres de otros CUs que deben estar implementados primero |

---

## Diagramas de flujo (`.mmd`)

Los archivos Mermaid se ubican en una subcarpeta por módulo dentro de `data/`. Por ejemplo, los CU del módulo `orden_compra` están en `data/orden_compra/`:

```
uc1_ingreso_orden.mmd
uc2_visualizar_ordenes.mmd
uc3_registrar_llegado_compra.mmd
uc4_revisar_orden.mmd
uc5_confirmar_revision.mmd
uc6_valorar_orden_compra.mmd
uc7_edicion_codigos.mmd
uc8_edicion_revision.mmd
uc9_edicion_emergencia.mmd
uc10_revisar_solicitud_edicion_emergencia.mmd
uc11_historial_cambios.mmd
uc12_refacturacion_orden.mmd
```

### Convenciones de los diagramas

- Tipo: `flowchart TD`
- Tema oscuro con `classDef` explícitos en cada archivo:

| Clase | Color | Uso |
|-------|-------|-----|
| `terminal` | Azul muy oscuro | Nodos Inicio / Fin (`([texto])`) |
| `usuario` | Índigo oscuro | Acciones realizadas por el usuario |
| `sistema` | Púrpura oscuro | Acciones realizadas por el sistema |
| `success` | Verde esmeralda | Confirmaciones y estados finales exitosos |
| `alt` | Ámbar oscuro | Flujos alternativos o de error recuperable |
| `error` | Rojo oscuro | Errores que bloquean el flujo |

- Saltos de línea en labels: `<br/>` (nunca `\n`)
- Texto enriquecido: se permiten `<b>`, `<i>` dentro de los labels
- Formas usadas: `[texto]` rectangular, `{texto}` diamante (decisión), `/texto/` paralelogramo (I/O), `([texto])` terminal
- Flechas opcionales o de reintento: `-.label.->` (punteada)
- Los caracteres especiales como `¿`, `—`, `⚠` se escriben directamente, **no como escapes Unicode** (`\u00bf`, etc.)

---

## Especificación API (`api.md`)

Cada módulo tiene su propia carpeta en `project-structure/` con su `api.md`. El archivo `project-structure/orden-compra/api.md` documenta los endpoints REST del módulo de órdenes de compra. Está organizado en secciones por caso de uso (`## UC1`, `## UC2`, etc.) y contiene:

- Tabla de todos los endpoints al inicio (método, ruta, CU asociado)
- Por cada endpoint: descripción, path params, query params, estructura del request, y todas las respuestas posibles con ejemplos JSON
- Código de error semántico en cada respuesta (`errorCode`) además del HTTP status
- Convención: `multipart/form-data` para endpoints que reciben archivos; `application/json` para el resto

### Endpoints actuales (CU1–CU12)

| # | Método | Ruta | CU |
|---|--------|------|----|
| 1 | POST | `/api/v1/purchase-orders/parse` | UC1 |
| 2 | POST | `/api/v1/purchase-orders` | UC1 |
| 3 | GET | `/api/v1/purchase-orders` | UC2 |
| 4 | GET | `/api/v1/purchase-orders/{nir}` | UC2 |
| 5 | POST | `/api/v1/purchase-orders/{nir}/arrive` | UC3 |
| 6 | POST | `/api/v1/purchase-orders/{nir}/review` | UC4 |
| 7 | POST | `/api/v1/purchase-orders/{nir}/confirm-review` | UC5 |
| 8 | GET | `/api/v1/purchase-orders/{nir}/valuation` | UC6 |
| 9 | POST | `/api/v1/purchase-orders/{nir}/valuation` | UC6 |
| 10 | PATCH | `/api/v1/purchase-orders/{nir}/massline-codes` | UC7 |
| 11 | PUT | `/api/v1/purchase-orders/{nir}/review` | UC8 |
| 12 | POST | `/api/v1/purchase-orders/emergency-edit-requests` | UC9 |
| 13 | GET | `/api/v1/purchase-orders/emergency-edit-requests` | UC10 |
| 14 | GET | `/api/v1/purchase-orders/emergency-edit-requests/{requestId}` | UC10 |
| 15 | POST | `/api/v1/purchase-orders/emergency-edit-requests/{requestId}/approve` | UC10 |
| 16 | POST | `/api/v1/purchase-orders/emergency-edit-requests/{requestId}/reject` | UC10 |
| 17 | GET | `/api/v1/purchase-orders/{nir}/history` | UC11 |
| 18 | POST | `/api/v1/purchase-orders/{nir}/reinvoice/preview` | UC12 |
| 19 | POST | `/api/v1/purchase-orders/{nir}/reinvoice` | UC12 |

---

## Módulos y cobertura

| Módulo | CUs | Diagramas | API |
|--------|-----|-----------|-----|
| Orden de compra | CU1–CU12 | ✅ todos | ✅ todos |
| Pedidos | CU13–CU18 | ❌ pendiente | ❌ pendiente |
