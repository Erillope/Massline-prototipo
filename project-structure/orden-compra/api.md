# API — Módulo Orden de Compra

## Endpoints

| # | Método | Ruta | Caso de uso |
|---|--------|------|-------------|
| 1 | `POST` | `/api/v1/purchase-orders/parse` | UC1 — Procesar archivo de PO |
| 2 | `POST` | `/api/v1/purchase-orders` | UC1 — Registrar orden de compra |
| 3 | `GET` | `/api/v1/purchase-orders` | UC2 — Listar órdenes de compra |
| 4 | `GET` | `/api/v1/purchase-orders/{nir}` | UC2 — Obtener detalle de una orden |
| 5 | `POST` | `/api/v1/purchase-orders/{nir}/arrival` | UC3 — Registrar llegada de PO a bodega |
| 6 | `POST` | `/api/v1/purchase-orders/{nir}/review` | UC4 — Registrar revisión de orden |
| 7 | `POST` | `/api/v1/purchase-orders/{nir}/review/confirm` | UC5 — Confirmar revisión |
| 8 | `GET` | `/api/v1/purchase-orders/{nir}/valuation` | UC6 — Obtener estado de valoración |
| 9 | `POST` | `/api/v1/purchase-orders/{nir}/valuation` | UC6 — Registrar o corregir valoración |
| 10 | `PATCH` | `/api/v1/purchase-orders/{nir}/review` | UC8 — Editar revisión |
| 11 | `POST` | `/api/v1/purchase-orders/{nir}/emergency-edit-requests` | UC9 — Solicitar edición de emergencia |
| 12 | `GET` | `/api/v1/purchase-orders/emergency-edit-requests` | UC10 — Listar solicitudes de edición de emergencia |
| 13 | `GET` | `/api/v1/purchase-orders/emergency-edit-requests/{requestId}` | UC10 — Obtener detalle de solicitud de emergencia |
| 14 | `POST` | `/api/v1/purchase-orders/emergency-edit-requests/{requestId}/approve` | UC10 — Aprobar solicitud de emergencia |
| 15 | `POST` | `/api/v1/purchase-orders/emergency-edit-requests/{requestId}/reject` | UC10 — Rechazar solicitud de emergencia |
| 16 | `GET` | `/api/v1/purchase-orders/{nir}/history` | UC11 — Ver historial de cambios de una orden |

---

## UC1 — Ingresar orden de compra

El ingreso ocurre en dos pasos desde el frontend:

1. **Parsear** el archivo → el sistema extrae los datos y completa los códigos massline (sin crear nada en BD)
2. **Registrar** la orden → el usuario confirma los datos y adjunta el email → el sistema crea el NIR

> El ingreso manual omite el paso 1 por completo; el frontend envía los datos directamente al paso 2.

---

### 1. `POST /api/v1/purchase-orders/parse`

Procesa un archivo Excel (PO externa) o XML (PO local), extrae los datos y completa automáticamente los campos `masslineCode` / `masslineDescription` según el catálogo interno.

No crea ningún registro en base de datos.

**Request**

```
Content-Type: multipart/form-data
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `file` | `File` | ✅ | Archivo `.xlsx` (PO externa) o `.xml` (PO local) |

**Respuestas**

#### `200 OK` — PO única extraída

```json
{
  "result": "single",
  "order": {
    "invoiceCode": "PROV-001",
    "proveedorName": "Motoralmor Cia. Ltda.",
    "poType": "external",     // "external" | "local"
    "items": [
      {
        "proveedorDescription": "BENDIX DE RODILLO (3) PIÑON 41 DIENTES - XY12530A(2020)",
        "masslineCode": "ML-2001",             // null si el sistema no reconoce el producto
        "masslineDescription": "BENDIX DE RODILLO (3) PIÑON 41 DIENTES",  // null si no reconocido
        "quantity": 30
      },
      {
        "proveedorDescription": "PRODUCTO DESCONOCIDO XYZ",
        "masslineCode": null,                  // el usuario debe completar este campo
        "masslineDescription": null,            // el usuario debe completar este campo
        "quantity": 10
      }
    ]
  }
}
```

#### `200 OK` — Múltiples POs detectadas en el archivo

```json
{
  "result": "multiple",
  "orders": [
    {
      "invoiceCode": "PROV-001",
      "proveedorName": "Motoralmor Cia. Ltda.",
      "poType": "external",
      "itemCount": 8,
      "items": [ ... ]
    },
    {
      "invoiceCode": "PROV-002",
      "proveedorName": "Ecoenergy Cia. Ltda.",
      "poType": "external",
      "itemCount": 3,
      "items": [ ... ]
    }
  ]
}
```

> El frontend muestra el resumen de cada orden (proveedor + cantidad de ítems) para que el usuario seleccione cuál registrar. Los `items` completos de cada orden ya están incluidos en la respuesta — no se necesita una llamada adicional.

#### `422 Unprocessable Entity` — Formato de archivo no reconocido

```json
{
  "timestamp": "2026-05-02T10:30:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "INVALID_FILE_FORMAT",
  "message": "El archivo no tiene el formato esperado. Se acepta .xlsx para PO externas y .xml para PO locales.",
  "path": "/api/v1/purchase-orders/parse"
}
```

> El frontend muestra el error y permite al usuario seleccionar otro archivo.

#### `422 Unprocessable Entity` — Archivo válido pero no procesable

```json
{
  "timestamp": "2026-05-02T10:30:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "UNPROCESSABLE_FILE",
  "message": "El archivo tiene un formato reconocido pero no se pueden extraer los datos automáticamente.",
  "path": "/api/v1/purchase-orders/parse"
}
```

> El frontend habilita el modo de ingreso manual al recibir `UNPROCESSABLE_FILE`.

---

### 2. `POST /api/v1/purchase-orders`

Registra la orden de compra en el sistema. Asigna un NIR único y establece el estado `por_llegar`.

Aplica tanto para órdenes provenientes de archivo (paso 2 del flujo normal) como para ingresos manuales.

**Request**

```
Content-Type: multipart/form-data
```

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `order` | `JSON` (string) | ✅ | Datos de la orden (ver estructura abajo) |
| `emailFile` | `File` | ✅ | Archivo de email como evidencia de la orden |

**Estructura del campo `order` (JSON)**

```json
{
  "invoiceCode": "PROV-001",
  "proveedorName": "Motoralmor Cia. Ltda.",
  "poType": "external",     // "external" | "local"
  "source": "file",         // "file" | "manual"
  "items": [
    {
      "proveedorDescription": "BENDIX DE RODILLO (3) PIÑON 41 DIENTES - XY12530A(2020)",
      "masslineCode": "ML-2001",
      "masslineDescription": "BENDIX DE RODILLO (3) PIÑON 41 DIENTES",
      "quantity": 30
    }
  ]
}
```

**Respuestas**

#### `201 Created`

```json
{
  "nir": "NIR1-000062",
  "proveedorName": "Motoralmor Cia. Ltda.",
  "status": "por_llegar",
  "itemCount": 8,
  "fechaIngreso": "2026-05-02T10:30:00",
  "createdBy": "Carlos Méndez"
}
```

#### `409 Conflict` — La orden ya existe

```json
{
  "timestamp": "2026-05-02T10:30:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "DUPLICATE_ORDER",
  "message": "Ya existe una orden registrada con los mismos datos.",
  "path": "/api/v1/purchase-orders"
}
```

#### `422 Unprocessable Entity` — Datos incompletos o inválidos

```json
{
  "timestamp": "2026-05-02T10:30:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "VALIDATION_ERROR",
  "message": "La orden debe contener al menos un producto. Todos los ítems deben tener masslineCode y masslineDescription.",
  "path": "/api/v1/purchase-orders"
}
```

---

## UC2 — Visualizar órdenes de compra

---

### 3. `GET /api/v1/purchase-orders`

Retorna la lista de órdenes de compra. Sin filtros, aplica el orden de prioridad por defecto. Acepta parámetros de búsqueda opcionales.

**Query params**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `code` | `string` | No | Busca por código NIR (coincidencia parcial) |
| `proveedor` | `string` | No | Busca por nombre de proveedor (coincidencia parcial) |
| `fechaIngreso` | `string` | No | Filtra por fecha de ingreso exacta. Formato: `YYYY-MM-DD` |
| `status` | `string` | No | Filtra por estado (ver valores en tabla de estados abajo) |
| `hasAnomalies` | `boolean` | No | `true` muestra solo órdenes con anomalías; `false` solo sin anomalías. Omitir para no filtrar |
| `page` | `number` | No | Número de página (base 0). Por defecto: `0` |
| `size` | `number` | No | Cantidad de resultados por página. Por defecto: `20` |

**Estados disponibles (`status`)**

| Valor | Descripción |
|-------|-------------|
| `por_llegar` | Orden registrada, aún no ha llegado a bodega |
| `en_bodega` | Llegó a bodega, pendiente de revisión |
| `revisada` | Revisada (puede o no tener anomalías) |
| `por_almacenar` | Revisión confirmada, pendiente de almacenamiento |
| `almacenada` | Almacenada (puede o no tener anomalías) |
| `valorada` | Valorada (puede o no tener anomalías) |

> Las anomalías se indican mediante el campo `hasAnomalies`: `true` con anomalías, `false` sin anomalías, `null` si el estado aún no implica una revisión (`por_llegar`, `en_bodega`).

> El estado `por_almacenar` se asigna al confirmar la revisión. A efectos de `hasAnomalies`, mantiene el valor que tenía en `revisada`.

**Orden de prioridad por defecto** (cuando no se aplican filtros):
1. `en_bodega`
2. `revisada` con `hasAnomalies: true`
3. Resto de estados no almacenados, por fecha de ingreso descendente
4. `almacenada`, `valorada`

**Respuestas**

#### `200 OK`

```json
{
  "content": [
    {
      "nir": "NIR1-000060",
      "proveedorName": "Motoralmor Cia. Ltda.",
      "poType": "external",   // "external" | "local"
      "status": "en_bodega",
      "hasAnomalies": null,    // null cuando es por_llegar o en_bodega
      "fechaIngreso": "2026-04-16T08:45:00",
      "itemCount": 8,
      "totalPrice": null       // null si la orden aún no está valorada
    },
    {
      "nir": "NIR1-000055",
      "proveedorName": "Ecoenergy Cia. Ltda.",
      "poType": "local",
      "status": "revisada",
      "hasAnomalies": true,
      "fechaIngreso": "2026-04-14T11:20:00",
      "itemCount": 5,
      "totalPrice": null       // null si la orden aún no está valorada
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 8,
  "totalPages": 1
}
```

#### `200 OK` — Sin órdenes registradas en el sistema

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

> El frontend muestra el mensaje "no hay órdenes registradas" cuando `totalElements` es `0`.

#### `200 OK` — Búsqueda sin resultados

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

> Mismo cuerpo que sin órdenes; el frontend distingue el contexto por si había parámetros de búsqueda activos.

---

### 4. `GET /api/v1/purchase-orders/{nir}`

Retorna el detalle completo de una orden de compra: datos generales, ítems, documentos adjuntos y anomalías (si las tiene).

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000060` |

**Respuestas**

#### `200 OK`

```json
{
  "nir": "NIR1-000055",
  "proveedorName": "Ecoenergy Cia. Ltda.",
  "poType": "local",          // "external" | "local"
  "status": "revisada",
  "hasAnomalies": true,       // true | false | null (null cuando es por_llegar o en_bodega)
  "fechaIngreso": "2026-04-14T11:20:00",
  "items": [
    {
      "masslineCode": "ML-2001",
      "masslineDescription": "BENDIX DE RODILLO (3) PIÑON 41 DIENTES",
      "proveedorDescription": "BENDIX DE RODILLO (3) PIÑON 41 DIENTES - XY12530A(2020)",
      "quantity": 30,
      "unitPrice": 12500.00,  // null si aún no valorada
      "totalPrice": 375000.00, // null si aún no valorada
      "boxes": [
        {
          "boxCode": "CAJA-001",
          "units": 15,
          "position": "B-01-01"  // null si aún no tiene posición asignada
        },
        {
          "boxCode": "CAJA-002",
          "units": 15,
          "position": null
        }
      ],
      "anomaly": {
        "expected": 30,
        "received": 25,
        "missing": 5,
        "description": "Se recibieron 25 unidades en lugar de 30",  // null si no se especificó
        "photos": [
          "/files/NIR1-000055/anomalia-1.jpg"
        ]
      }
    },
    {
      "masslineCode": "ML-2002",
      "masslineDescription": "KIT DE BALANCINES I/D (PALILLOS)",
      "proveedorDescription": "KIT DE BALANCINES I/D (PALILLOS) - GY200",
      "quantity": 80,
      "unitPrice": 8900.00,
      "totalPrice": 712000.00,
      "boxes": [
        {
          "boxCode": "CAJA-003",
          "units": 80,
          "position": "B-02-03"
        }
      ],
      "anomaly": null          // null si el ítem no tiene anomalía
    }
  ],
  "extraItems": [             // productos recibidos que no pertenecen a la PO; [] si ninguno
    {
      "id": "ei-001",
      "description": "PRODUCTO EXTRA - REF XYZ",
      "quantity": 3
    }
  ],
  "documents": [
    {
      "type": "po_file",      // "po_file" | "email"
      "filename": "PO-ECOENERGY-2026.xlsx",
      "fileSize": 24576,      // tamaño en bytes
      "url": "/files/NIR1-000055/po_file.xlsx"
    },
    {
      "type": "email",
      "filename": "confirmacion-orden.pdf",
      "fileSize": 102400,
      "url": "/files/NIR1-000055/email.pdf"
    }
  ],
  "valuationCode": null,    // null si aún no está valorada; "VAL-001" si está valorada
  "changeCount": 3          // número de modificaciones registradas sobre la orden
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T10:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000099",
  "path": "/api/v1/purchase-orders/NIR1-000099"
}
```

---

## UC3 — Registrar llegada de PO a bodega

---

### 5. `POST /api/v1/purchase-orders/{nir}/arrival`

Registra la llegada de una orden de compra a bodega. Transiciona el estado de `por_llegar` a `en_bodega` y registra el evento en el historial de la orden.

La cancelación de la operación ocurre únicamente en el frontend — si el usuario no confirma, no se realiza ninguna llamada a este endpoint.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000060` |

**Request**

Sin body.

**Respuestas**

#### `200 OK`

```json
{
  "nir": "NIR1-000060",
  "status": "en_bodega",
  "fechaLlegada": "2026-05-02T14:15:00",
  "registeredBy": "Carlos Méndez"
}
```

#### `409 Conflict` — La orden no está en estado `por_llegar`

```json
{
  "timestamp": "2026-05-02T14:15:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "INVALID_STATUS_TRANSITION",
  "message": "La orden NIR1-000060 no puede registrar llegada porque su estado actual es 'en_bodega'.",
  "path": "/api/v1/purchase-orders/NIR1-000060/arrival"
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T14:15:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000060",
  "path": "/api/v1/purchase-orders/NIR1-000060/arrival"
}
```

---

## UC4 — Revisar orden de compra

---

### 6. `POST /api/v1/purchase-orders/{nir}/review`

Registra la revisión de una orden en bodega. El frontend acumula toda la información de la revisión (cajas, cantidades recibidas, dañados, productos extra) y la envía en una sola llamada al confirmar.

El backend calcula las anomalías por ítem a partir de los datos recibidos:
- `received < expected` → faltante
- `received > expected` → sobrante por cantidad
- `damaged > 0` → producto dañado
- `extraItems` con elementos → sobrante por producto no perteneciente a la PO

Si existe al menos una anomalía, `hasAnomalies` queda en `true`.

Las fotos de evidencia se adjuntan mediante un endpoint separado después de confirmar la revisión.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000055` |

**Request**

```
Content-Type: application/json
```

```json
{
  "items": [
    {
      "masslineCode": "ML-2001",
      "expected": 30,          // cantidad esperada según la PO
      "received": 25,          // unidades físicamente recibidas
      "damaged": 2,            // unidades dañadas (0 si ninguna)
      "description": "Se recibieron 25 unidades, 2 con golpes visibles",  // null si no hay nota
      "boxes": [
        { "boxCode": "CAJA-001", "units": 15 },
        { "boxCode": "CAJA-002", "units": 10 }
      ]
    },
    {
      "masslineCode": "ML-2002",
      "expected": 80,
      "received": 80,
      "damaged": 0,
      "description": null,
      "boxes": [
        { "boxCode": "CAJA-003", "units": 80 }
      ]
    }
  ],
  "extraItems": [             // productos recibidos que no pertenecen a la PO
    {
      "description": "PRODUCTO EXTRA - REF XYZ",
      "quantity": 3
    }
  ],
  "recipients": [            // destinatarios del reporte de revisión
    "ana.lopez@massline.com",
    "carlos.mendez@massline.com"
  ]
}
```

> `extraItems` puede ser un array vacío `[]` si no hay productos extra.

**Respuestas**

#### `200 OK`

```json
{
  "nir": "NIR1-000055",
  "status": "revisada",
  "hasAnomalies": true,
  "reviewedAt": "2026-05-02T15:30:00",
  "reviewedBy": "Ana López"
}
```

#### `409 Conflict` — La orden no está en estado `en_bodega`

```json
{
  "timestamp": "2026-05-02T15:30:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "INVALID_STATUS_TRANSITION",
  "message": "La orden NIR1-000055 no puede ser revisada porque su estado actual es 'revisada'.",
  "path": "/api/v1/purchase-orders/NIR1-000055/review"
}
```

#### `422 Unprocessable Entity` — Datos inválidos

```json
{
  "timestamp": "2026-05-02T15:30:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "VALIDATION_ERROR",
  "message": "El ítem ML-9999 no pertenece a la orden NIR1-000055.",
  "path": "/api/v1/purchase-orders/NIR1-000055/review"
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T15:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000055",
  "path": "/api/v1/purchase-orders/NIR1-000055/review"
}
```

---

## UC5 — Confirmar revisión

---

### 7. `POST /api/v1/purchase-orders/{nir}/review/confirm`

Confirma la revisión de una orden y transiciona su estado de `revisada` a `por_almacenar`. El usuario debe asignar una posición de almacenamiento a cada caja registrada durante la revisión antes de poder confirmar.

Si la orden es una PO local y tiene anomalías (`hasAnomalies: true`), la confirmación queda bloqueada hasta que las anomalías sean resueltas.

La cancelación ocurre únicamente en el frontend; si el usuario no confirma, no se realiza ninguna llamada a este endpoint.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000055` |

**Request**

```
Content-Type: application/json
```

```json
{
  "boxes": [
    {
      "boxCode": "CAJA-001",
      "position": "A-12-3"   // posición de almacenamiento asignada
    },
    {
      "boxCode": "CAJA-002",
      "position": "A-12-4"
    }
  ]
}
```

> Todas las cajas registradas durante la revisión deben estar presentes con una posición asignada. El frontend no habilita el botón de confirmar hasta que todas las posiciones estén completas.

**Respuestas**

#### `200 OK`

```json
{
  "nir": "NIR1-000055",
  "status": "por_almacenar",
  "confirmedAt": "2026-05-02T16:00:00",
  "confirmedBy": "Ana López"
}
```

#### `409 Conflict` — PO local con anomalías sin resolver

```json
{
  "timestamp": "2026-05-02T16:00:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "LOCAL_ORDER_ANOMALIES_PENDING",
  "message": "La orden NIR1-000055 no puede confirmarse porque es una PO local con anomalías pendientes de resolución.",
  "path": "/api/v1/purchase-orders/NIR1-000055/review/confirm"
}
```

#### `409 Conflict` — La orden no está en estado `revisada`

```json
{
  "timestamp": "2026-05-02T16:00:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "INVALID_STATUS_TRANSITION",
  "message": "La orden NIR1-000055 no puede confirmar revisión porque su estado actual es 'por_almacenar'.",
  "path": "/api/v1/purchase-orders/NIR1-000055/review/confirm"
}
```

#### `422 Unprocessable Entity` — Posiciones incompletas o cajas inválidas

```json
{
  "timestamp": "2026-05-02T16:00:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "VALIDATION_ERROR",
  "message": "Todas las cajas registradas deben tener una posición de almacenamiento asignada.",
  "path": "/api/v1/purchase-orders/NIR1-000055/review/confirm"
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T16:00:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000055",
  "path": "/api/v1/purchase-orders/NIR1-000055/review/confirm"
}
```

---

## UC6 — Valorar orden de compra

La valoración ocurre fuera del flujo interno: el sistema envía un link por correo al encargado. Desde ese link se accede a una página standalone que carga los datos de la orden y permite registrar o corregir el código de valoración.

El link permanece activo indefinidamente para permitir correcciones posteriores.

---

### 8. `GET /api/v1/purchase-orders/{nir}/valuation`

Retorna la información necesaria para renderizar la página de valoración: datos básicos de la orden y el código de valoración actual (si ya existe).

No requiere autenticación de sesión — está pensado para ser accedido desde el link enviado por correo.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000052` |

**Respuestas**

#### `200 OK` — Sin valoración previa (orden `almacenada`)

```json
{
  "nir": "NIR1-000052",
  "proveedorName": "Importadora Andina S.A.",
  "status": "almacenada",
  "valuationCode": null    // null → formulario vacío
}
```

#### `200 OK` — Con valoración registrada (orden `valorada`, modo corrección)

```json
{
  "nir": "NIR1-000052",
  "proveedorName": "Importadora Andina S.A.",
  "status": "valorada",
  "valuationCode": "VAL-001"   // código actual, pre-cargado en el formulario
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T17:00:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000052",
  "path": "/api/v1/purchase-orders/NIR1-000052/valuation"
}
```

---

### 9. `POST /api/v1/purchase-orders/{nir}/valuation`

Registra o corrige el código de valoración de una orden. Si la orden está en `almacenada`, transiciona a `valorada`. Si ya está `valorada`, actualiza el código y permanece en `valorada`.

Tras confirmar, el sistema envía una notificación por correo a los usuarios relacionados con la orden.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000052` |

**Request**

```
Content-Type: application/json
```

```json
{
  "valuationCode": "VAL-001"
}
```

**Respuestas**

#### `200 OK`

```json
{
  "nir": "NIR1-000052",
  "status": "valorada",
  "valuationCode": "VAL-001",
  "valuedAt": "2026-05-02T17:10:00"
}
```

#### `409 Conflict` — La orden no está en estado `almacenada` ni `valorada`

```json
{
  "timestamp": "2026-05-02T17:10:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "INVALID_STATUS_TRANSITION",
  "message": "La orden NIR1-000052 no puede ser valorada porque su estado actual es 'revisada'.",
  "path": "/api/v1/purchase-orders/NIR1-000052/valuation"
}
```

#### `422 Unprocessable Entity` — Código de valoración inválido

```json
{
  "timestamp": "2026-05-02T17:10:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "VALIDATION_ERROR",
  "message": "El código de valoración no tiene el formato esperado.",
  "path": "/api/v1/purchase-orders/NIR1-000052/valuation"
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T17:10:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000052",
  "path": "/api/v1/purchase-orders/NIR1-000052/valuation"
}
```

---

## UC8 — Editar revisión

---

### 10. `PATCH /api/v1/purchase-orders/{nir}/review`

Actualiza parcialmente los datos de revisión de una orden ya revisada. Solo se envían los campos que cambian; lo que no se incluye permanece sin modificar.

Campos editables por ítem: `received`, `damaged`, `description`, `boxes`. Los campos `masslineCode` y `expected` son inmutables — `masslineCode` actúa como identificador del ítem dentro del array.

Las cajas y los `extraItems` usan el campo `op` para declarar la intención de cada operación, con fines de auditoría. El backend recalcula `hasAnomalies` a partir del estado final de la revisión tras aplicar los cambios.

La confirmación en dos pasos (editar → resumen → confirmar resumen) ocurre completamente en el frontend. El backend recibe la llamada solo cuando el usuario confirma el resumen final.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000055` |

**Request**

```
Content-Type: application/json
```

```json
{
  "items": [
    {
      "masslineCode": "ML-2003",        // identificador del ítem — no editable
      "received": 47,                    // omitir si no cambia
      "damaged": 1,                      // omitir si no cambia
      "description": "Corregido.",       // omitir si no cambia; null para borrar la nota
      "boxes": [                         // omitir si no hay cambios en cajas
        { "op": "added",   "boxCode": "CJ-003", "units": 10 },
        { "op": "edited",  "boxCode": "CJ-001", "units": 30 },
        { "op": "deleted", "boxCode": "CJ-002" }
      ]
    }
  ],
  "extraItems": [
    { "op": "added",   "description": "Producto desconocido XYZ", "quantity": 2 },
    { "op": "edited",  "id": "ei-001", "description": "Descripción corregida", "quantity": 5 },
    { "op": "deleted", "id": "ei-002" }
  ],
  "recipients": ["ana.lopez@massline.com"]  // omitir si no cambia; reemplazo completo si se incluye
}
```

**Reglas del payload**

| Campo | Comportamiento |
|-------|----------------|
| `items[]` | Solo incluir ítems que cambian. Los no enviados permanecen intactos. |
| `items[].masslineCode` | Requerido como identificador. No editable. |
| `items[].expected` | No editable. No debe incluirse. |
| `items[].received`, `damaged`, `description` | Parciales — solo enviar si cambian. |
| `items[].boxes[].op` | `added` (nueva caja) · `edited` (cambia `units` — único campo editable; `boxCode` es inmutable) · `deleted` (elimina la caja). Las cajas no mencionadas no se tocan. |
| `extraItems[].op` | `added` → sin `id`; `edited` / `deleted` → requieren `id` (obtenido del `GET /{nir}`). |
| `recipients` | Reemplazo completo si se incluye. Omitir si no cambia. |

**Respuestas**

#### `200 OK`

```json
{
  "nir": "NIR1-000055",
  "status": "revisada",
  "hasAnomalies": true,
  "editedAt": "2026-05-02T16:30:00",
  "editedBy": "Ana López"
}
```

> El estado permanece `revisada`. `hasAnomalies` refleja el resultado del recálculo sobre los nuevos datos.

#### `409 Conflict` — Existe una solicitud de edición de emergencia pendiente

```json
{
  "timestamp": "2026-05-02T16:30:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "EMERGENCY_EDIT_PENDING",
  "message": "La orden NIR1-000055 tiene una solicitud de edición de emergencia pendiente de aprobación. No se pueden realizar ediciones regulares hasta que sea resuelta.",
  "path": "/api/v1/purchase-orders/NIR1-000055/review"
}
```

#### `409 Conflict` — La orden no está en estado `revisada`

```json
{
  "timestamp": "2026-05-02T16:30:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "INVALID_STATUS_TRANSITION",
  "message": "La revisión de la orden NIR1-000055 no puede editarse porque su estado actual es 'por_almacenar'.",
  "path": "/api/v1/purchase-orders/NIR1-000055/review"
}
```

#### `422 Unprocessable Entity` — Datos inválidos

```json
{
  "timestamp": "2026-05-02T16:30:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "VALIDATION_ERROR",
  "message": "El campo 'received' no puede ser negativo.",
  "path": "/api/v1/purchase-orders/NIR1-000055/review"
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T16:30:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000055",
  "path": "/api/v1/purchase-orders/NIR1-000055/review"
}
```

---

## UC9 — Edición de emergencia

---

### 11. `POST /api/v1/purchase-orders/{nir}/emergency-edit-requests`

Crea una solicitud de edición de emergencia sobre una orden registrada en el sistema, independientemente de su estado. Los cambios propuestos **no se aplican de forma inmediata** — quedan en estado `pending_approval` hasta que sean aprobados o rechazados en UC10.

Mientras exista una solicitud pendiente, los endpoints de edición regular (`PATCH /review`) quedan bloqueados sobre esa orden.

La confirmación en dos pasos (editar → resumen de cambios → enviar solicitud) ocurre en el frontend. El backend recibe la llamada solo cuando el usuario confirma el envío.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000055` |

**Request**

```
Content-Type: application/json
```

```json
{
  "justification": "El proveedor notificó un error en las cantidades despachadas tras el cierre de la revisión.",
  "items": [
    {
      "op": "added",
      "masslineCode": "ML-2010",
      "masslineDescription": "FILTRO DE AIRE DOBLE ETAPA",
      "proveedorDescription": "FILTRO DOBLE - REF FA-2010",
      "quantity": 20
    },
    {
      "op": "edited",
      "masslineCode": "ML-2001",      // identificador — no editable
      "masslineDescription": "BENDIX DE RODILLO (3) PIÑON 41 DIENTES V2",  // omitir si no cambia
      "quantity": 28,                                                          // omitir si no cambia
      "anomaly": {                                                             // omitir si no cambia; null para borrar la anomalía
        "received": 26,          // omitir si no cambia
        "damaged": 1,            // omitir si no cambia
        "description": "Corregido por el proveedor."  // omitir si no cambia; null para borrar la nota
      },
      "boxes": [                 // omitir si no hay cambios en cajas
        { "op": "added",   "boxCode": "CJ-010", "units": 5 },
        { "op": "edited",  "boxCode": "CJ-001", "units": 30 },
        { "op": "deleted", "boxCode": "CJ-002" }
      ]
    },
    {
      "op": "deleted",
      "masslineCode": "ML-2003"
    }
  ]
}
```

**Reglas del payload**

| Campo | Comportamiento |
|-------|----------------|
| `justification` | Requerido. Texto libre que explica el motivo de la emergencia. |
| `items[]` | Al menos un ítem requerido. |
| `items[].op` | `added` (ítem nuevo en la orden) · `edited` (cambia campos del ítem) · `deleted` (elimina el ítem). |
| `items[].masslineCode` | Identificador para `edited` y `deleted`. Para `added`, es el nuevo código. Inmutable — para cambiar el código de un ítem existente: `deleted` + `added`. |
| `items[].masslineDescription` | Editable en `edited`. Requerido en `added`. |
| `items[].proveedorDescription` | Solo requerido en `added`. No se incluye en `edited`. |
| `items[].quantity` | Editable en `edited`. Requerido en `added`. |
| `items[].anomaly` | Solo aplicable en `edited`. Omitir si no cambia. `null` para borrar la anomalía completa. Campos internos (`received`, `damaged`, `description`) son parciales — omitir los que no cambian. `expected` no es editable. |
| `items[].boxes[].op` | Solo aplicable en `edited`. Mismo comportamiento que en UC8: `added` (nueva caja) · `edited` (cambia `units`; `boxCode` inmutable) · `deleted`. Las cajas no mencionadas no se tocan. |

**Respuestas**

#### `201 Created`

```json
{
  "requestId": "EER-001",
  "nir": "NIR1-000055",
  "status": "pending_approval",
  "requestedAt": "2026-05-02T18:00:00",
  "requestedBy": "Carlos Méndez"
}
```

#### `409 Conflict` — Ya existe una solicitud pendiente sobre esta orden

```json
{
  "timestamp": "2026-05-02T18:00:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "EMERGENCY_EDIT_ALREADY_PENDING",
  "message": "La orden NIR1-000055 ya tiene una solicitud de edición de emergencia pendiente de aprobación.",
  "path": "/api/v1/purchase-orders/NIR1-000055/emergency-edit-requests"
}
```

#### `422 Unprocessable Entity` — Datos inválidos

```json
{
  "timestamp": "2026-05-02T18:00:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "VALIDATION_ERROR",
  "message": "La justificación es obligatoria para una edición de emergencia.",
  "path": "/api/v1/purchase-orders/NIR1-000055/emergency-edit-requests"
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T18:00:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000055",
  "path": "/api/v1/purchase-orders/NIR1-000055/emergency-edit-requests"
}
```

---

## UC10 — Revisar solicitud de edición de emergencia

---

### 12. `GET /api/v1/purchase-orders/emergency-edit-requests`

Retorna la lista de solicitudes de edición de emergencia pendientes de aprobación.

**Respuestas**

#### `200 OK`

```json
[
  {
    "requestId": "EER-001",
    "nir": "NIR1-000055",
    "proveedorName": "Ecoenergy Cia. Ltda.",
    "requestedBy": "Carlos Méndez",
    "requestedAt": "2026-05-02T18:00:00",
    "changesCount": 3,
    "justification": "El proveedor notificó un error en las cantidades despachadas tras el cierre de la revisión."
  }
]
```

> `changesCount` indica el número de cambios propuestos (ítems con `op: added`, `edited` o `deleted`). Retorna `[]` si no hay solicitudes pendientes.

---

### 13. `GET /api/v1/purchase-orders/emergency-edit-requests/{requestId}`

Retorna el detalle de una solicitud de edición de emergencia. Para facilitar la revisión, incluye los ítems de la orden con el mismo formato de snapshot del historial — campos sin cambio con `operation: null`, campos que serían modificados con su descriptor.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `requestId` | `string` | Identificador de la solicitud. Ej: `EER-001` |

**Respuestas**

#### `200 OK`

```json
{
  "requestId": "EER-001",
  "nir": "NIR1-000055",
  "status": "pending_approval",
  "justification": "El proveedor notificó un error en las cantidades despachadas tras el cierre de la revisión.",
  "requestedAt": "2026-05-02T18:00:00",
  "requestedBy": "Carlos Méndez",
  "changesCount": 3,
  "items": [
    {
      "masslineCode": { "value": "ML-2010", "operation": "added" },
      "masslineDescription": { "value": "FILTRO DE AIRE DOBLE ETAPA", "operation": "added" },
      "proveedorDescription": { "value": "FILTRO DOBLE - REF FA-2010", "operation": "added" },
      "quantity": { "value": 20, "operation": "added" }
    },
    {
      "masslineCode": { "value": "ML-2001", "operation": null },
      "masslineDescription": { "value": "BENDIX DE RODILLO (3) PIÑON 41 DIENTES V2", "operation": null },
      "quantity": { "value": 28, "previousValue": 30, "operation": "edited" },
      "anomaly": {
        "received": { "value": 26, "previousValue": 25, "operation": "edited" },
        "damaged": { "value": 1, "previousValue": 0, "operation": "edited" },
        "description": { "value": "Corregido por el proveedor.", "operation": "added" }
      },
      "boxes": {
        "CJ-010": {
          "units": { "value": 5, "operation": "added" }
        },
        "CJ-001": {
          "units": { "value": 30, "previousValue": 15, "operation": "edited" },
          "position": { "value": "A-01-03", "operation": null }
        },
        "CJ-002": {
          "previousValue": { "units": 10, "position": "A-01-04" },
          "operation": "deleted"
        }
      }
    },
    {
      "previousValue": { "masslineCode": "ML-2003", "quantity": 50, "received": 50 },
      "operation": "deleted"
    }
  ]
}
```

> Los ítems afectados por la solicitud aparecen con todos sus campos. Los campos con `operation: null` están sin cambio y se muestran como contexto. Los ítems de la orden no involucrados en la solicitud no aparecen.

#### `404 Not Found` — Solicitud no encontrada

```json
{
  "timestamp": "2026-05-02T19:00:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "REQUEST_NOT_FOUND",
  "message": "No se encontró una solicitud con el identificador: EER-001",
  "path": "/api/v1/purchase-orders/emergency-edit-requests/EER-001"
}
```

---

### 14. `POST /api/v1/purchase-orders/emergency-edit-requests/{requestId}/approve`

Aprueba una solicitud de edición de emergencia. Aplica los cambios propuestos a la orden, actualiza el estado de la solicitud a `approved`, registra la aprobación en el historial de la orden y habilita nuevamente las ediciones regulares.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `requestId` | `string` | Identificador de la solicitud. Ej: `EER-001` |

**Request**

Sin body.

**Respuestas**

#### `200 OK`

```json
{
  "requestId": "EER-001",
  "nir": "NIR1-000055",
  "status": "approved",
  "resolvedAt": "2026-05-02T19:00:00",
  "resolvedBy": "Ana López"
}
```

#### `409 Conflict` — La solicitud ya fue resuelta

```json
{
  "timestamp": "2026-05-02T19:00:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "REQUEST_ALREADY_RESOLVED",
  "message": "La solicitud EER-001 ya fue resuelta y no puede aprobarse nuevamente.",
  "path": "/api/v1/purchase-orders/emergency-edit-requests/EER-001/approve"
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T19:00:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "REQUEST_NOT_FOUND",
  "message": "No se encontró una solicitud con el identificador: EER-001",
  "path": "/api/v1/purchase-orders/emergency-edit-requests/EER-001/approve"
}
```

---

### 15. `POST /api/v1/purchase-orders/emergency-edit-requests/{requestId}/reject`

Rechaza una solicitud de edición de emergencia. Mantiene la orden sin aplicar los cambios propuestos, actualiza el estado de la solicitud a `rejected` con el motivo indicado, registra el rechazo en el historial de la orden y habilita nuevamente las ediciones regulares.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `requestId` | `string` | Identificador de la solicitud. Ej: `EER-001` |

**Request**

```
Content-Type: application/json
```

```json
{
  "rejectionReason": "Los cambios propuestos no corresponden a la documentación oficial del proveedor."
}
```

**Respuestas**

#### `200 OK`

```json
{
  "requestId": "EER-001",
  "nir": "NIR1-000055",
  "status": "rejected",
  "rejectionReason": "Los cambios propuestos no corresponden a la documentación oficial del proveedor.",
  "resolvedAt": "2026-05-02T19:00:00",
  "resolvedBy": "Ana López"
}
```

#### `409 Conflict` — La solicitud ya fue resuelta

```json
{
  "timestamp": "2026-05-02T19:00:00",
  "status": 409,
  "error": "Conflict",
  "errorCode": "REQUEST_ALREADY_RESOLVED",
  "message": "La solicitud EER-001 ya fue resuelta y no puede rechazarse nuevamente.",
  "path": "/api/v1/purchase-orders/emergency-edit-requests/EER-001/reject"
}
```

#### `422 Unprocessable Entity` — Motivo de rechazo no proporcionado

```json
{
  "timestamp": "2026-05-02T19:00:00",
  "status": 422,
  "error": "Unprocessable Entity",
  "errorCode": "VALIDATION_ERROR",
  "message": "El motivo del rechazo es obligatorio.",
  "path": "/api/v1/purchase-orders/emergency-edit-requests/EER-001/reject"
}
```

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T19:00:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "REQUEST_NOT_FOUND",
  "message": "No se encontró una solicitud con el identificador: EER-001",
  "path": "/api/v1/purchase-orders/emergency-edit-requests/EER-001/reject"
}
```

---

## UC11 — Historial de cambios

---

### 16. `GET /api/v1/purchase-orders/{nir}/history`

Retorna el historial completo de eventos registrados sobre una orden de compra, ordenado del más reciente al más antiguo. Cada evento incluye quién lo realizó, cuándo, y un objeto `changes` que refleja la estructura de la orden — solo con los campos que fueron afectados en ese evento.

Los eventos sin modificaciones de campos (ej: ingreso, llegada, confirmación) retornan `changes: {}`.

**Path params**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `nir` | `string` | Código NIR de la orden. Ej: `NIR1-000055` |

**Tipos de evento (`type`)**

| Valor | Descripción |
|-------|-------------|
| `ingreso` | Orden registrada en el sistema |
| `llegada` | Llegada registrada a bodega |
| `revision` | Revisión registrada |
| `confirmacion_revision` | Revisión confirmada |
| `edicion_revision` | Revisión editada (UC8) |
| `solicitud_emergencia` | Solicitud de edición de emergencia creada (UC9) |
| `aprobacion_emergencia` | Solicitud de emergencia aprobada (UC10) |
| `rechazo_emergencia` | Solicitud de emergencia rechazada (UC10) |
| `valoracion` | Valoración registrada o corregida |

**Estructura de un campo en el snapshot**

Cada evento incluye directamente los campos de la PO con su estado en ese momento. Todos los campos llevan un objeto descriptor con `operation`:

| Operación | Campos presentes | Descripción |
|-----------|-----------------|-------------|
| `null` | `value`, `operation` | Campo sin cambio en este evento |
| `"edited"` | `value`, `previousValue`, `operation` | Campo modificado en este evento |
| `"deleted"` | `previousValue`, `operation` | Campo o subentidad eliminado |
| `"added"` | `value`, `operation` | Campo o subentidad creado |

Los ítems que no fueron tocados en ese evento no aparecen en `items`.

**Respuestas**

#### `200 OK`

```json
[
  {
    "eventId": "EVT-009",
    "type": "edicion_revision",
    "timestamp": "2026-05-02T16:30:00",
    "performedBy": "Ana López",
    "items": [
      {
        "masslineCode": { "value": "ML-2001", "operation": null },
        "quantity": { "value": 30, "operation": null },
        "received": { "value": 28, "previousValue": 25, "operation": "edited" },
        "boxes": {
          "CJ-001": {
            "units": { "value": 30, "previousValue": 15, "operation": "edited" },
            "position": { "value": "A-01-03", "operation": null }
          },
          "CJ-002": {
            "previousValue": { "units": 10, "position": "A-01-04" },
            "operation": "deleted"
          }
        }
      }
    ]
  },
  {
    "eventId": "EVT-008",
    "type": "aprobacion_emergencia",
    "timestamp": "2026-05-02T19:00:00",
    "performedBy": "Ana López",
    "requestId": "EER-001",
    "items": [
      {
        "previousValue": { "masslineCode": "ML-2003", "quantity": 50, "received": 50 },
        "operation": "deleted"
      },
      {
        "masslineCode": { "value": "ML-2001", "operation": null },
        "quantity": { "value": 28, "previousValue": 30, "operation": "edited" },
        "received": { "value": 28, "operation": null },
        "boxes": {
          "CJ-001": {
            "units": { "value": 30, "operation": null },
            "position": { "value": "A-01-03", "operation": null }
          }
        }
      }
    ]
  },
  {
    "eventId": "EVT-007",
    "type": "solicitud_emergencia",
    "timestamp": "2026-05-02T18:00:00",
    "performedBy": "Carlos Méndez",
    "requestId": "EER-001"
  },
  {
    "eventId": "EVT-006",
    "type": "confirmacion_revision",
    "timestamp": "2026-05-02T16:00:00",
    "performedBy": "Ana López"
  },
  {
    "eventId": "EVT-005",
    "type": "revision",
    "timestamp": "2026-05-02T15:30:00",
    "performedBy": "Ana López"
  },
  {
    "eventId": "EVT-004",
    "type": "rechazo_emergencia",
    "timestamp": "2026-04-20T11:00:00",
    "performedBy": "Carlos Méndez",
    "requestId": "EER-000",
    "rejectionReason": "Los cambios propuestos no corresponden a la documentación oficial del proveedor."
  },
  {
    "eventId": "EVT-002",
    "type": "llegada",
    "timestamp": "2026-04-16T08:45:00",
    "performedBy": "Carlos Méndez"
  },
  {
    "eventId": "EVT-001",
    "type": "ingreso",
    "timestamp": "2026-04-14T11:20:00",
    "performedBy": "Carlos Méndez"
  }
]
```

> `items` aparece solo en eventos que afectan ítems de la orden. Los eventos sin modificaciones (llegada, confirmación, etc.) no incluyen `items`.
> Solo los ítems afectados en ese evento aparecen en `items`. Cada ítem afectado muestra todos sus campos con su descriptor.
> `requestId` aparece solo en eventos de tipo `solicitud_emergencia`, `aprobacion_emergencia` y `rechazo_emergencia`.
> `rejectionReason` aparece solo en eventos de tipo `rechazo_emergencia`.

#### `404 Not Found`

```json
{
  "timestamp": "2026-05-02T20:00:00",
  "status": 404,
  "error": "Not Found",
  "errorCode": "ORDER_NOT_FOUND",
  "message": "No se encontró una orden con el código: NIR1-000055",
  "path": "/api/v1/purchase-orders/NIR1-000055/history"
}
```
