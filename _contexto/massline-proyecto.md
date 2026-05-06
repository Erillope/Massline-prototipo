# Proyecto MassLine - Prototipos HTML

## Estructura de archivos
```
Massline-prototipo/
├── index.html                  (UC2 — Consultar órdenes de compra)
├── ingreso_orden.html          (UC1 — Ingresar orden de compra)
├── revision_orden.html         (UC3/4 — Revisar orden de compra)
├── detalle_orden.html          (Detalle de orden)
├── solicitud_edicion.html      (UC9 — Solicitud edición emergencia)
├── pedidos_bodega.html         (UC17/18 — Pedidos repuestos bodega)
├── valoracion.html             (UC6 — Valorar orden, standalone)
├── ejemplos.json               (datos de ejemplo / referencia)
├── CONVENTIONS.instructions.md
├── CONVENTIONS-FRONT.instructions.md
├── assets/
│   ├── logo.png
│   └── favicon.svg
├── css/
│   ├── styles.css              (CSS compartido portal principal)
│   └── consumidor.css          (CSS exclusivo portal consumidor)
├── js/
│   ├── data.js                 (datos compartidos: catálogo, órdenes, historial)
│   ├── shared.js               (funciones compartidas: sidebar, toast, lightbox)
│   ├── consulta_orden.js       (JS de index.html)
│   ├── ingreso_orden.js        (JS de ingreso_orden.html)
│   ├── revision_orden.js       (JS de revision_orden.html)
│   ├── detalle_orden.js        (JS de detalle_orden.html)
│   ├── solicitud_edicion.js    (JS de solicitud_edicion.html)
│   ├── pedidos_bodega.js       (JS de pedidos_bodega.html)
│   └── valoracion.js           (JS de valoracion.html)
├── data/
│   ├── caso_uso_massline.json
│   ├── formatos.json
│   └── orden_compra/           (diagramas Mermaid .mmd UC1–UC12)
├── consumidor/
│   ├── index.html              (UC13/14 — Inventario + generar pedido)
│   ├── mis_pedidos.html        (UC15/16 — Mis pedidos + confirmar recepción)
│   └── js/
│       ├── consumidor.js       (JS de consumidor/index.html)
│       └── mis_pedidos.js      (JS de consumidor/mis_pedidos.html)
├── backup/                     (copias de seguridad HTML)
├── feature/                    (ramas/experimentos)
├── project-structure/          (documentación de estructura)
├── _contexto/                  (contexto del proyecto para Copilot)
└── .git/
```

## Stack técnico
- HTML estático con CSS y JS separados
- Google Fonts: Inter (400, 500, 600, 700)
- Diseño: sidebar fija, cards, gradientes, modern UI
- Colores primarios: #6c63ff (púrpura), #1a1a2e (dark), sidebar gradient

## Mermaid / diagramas
- Los archivos `.mmd` se guardan en `data/` (no en `docs/`)
- Usar `<br/>` para saltos de línea (nunca `\n`)
- Labels con caracteres especiales o `/` deben ir entre comillas: `|"Por llegar / En bodega"|`

## Casos de uso (caso_uso_massline.json)
- **ID 1**: Ingresar orden de compra → `index.html` ✅
- **ID 2**: Visualizar orden de compra → `consulta_orden.html` ✅
- **ID 3**: Revisar orden de compra → `index.html` ✅
- **ID 4**: Recomendación posición almacenamiento → Parcial (integrado en modal almacenamiento)
- **ID 5**: Modificar posición almacenamiento → Pendiente
- **ID 7**: Registrar llegada a bodega → `index.html` ✅
- **ID 6**: Visualizar bodega virtual → Pendiente

## Datos reales integrados (de ejemplos.json — completado)
### Proveedores
- **MOTORALMOR CIA. LTDA.** (Local) → NIR1-000058, NIR1-000055, NIR1-000061
- **ECOLOGIA Y ENERGIA ECOENERGY CIA. LTDA** (Local) → NIR1-000057
- **WUXI HUAHENG INTERNATIONAL TRADE CORP.** (Externa) → NIR1-000060, NIR1-000053, NIR1-000056, NIR1-000052, NIR1-000049, NIR1-000048
### Productos (MOT-001..MOT-008, marca MOXAL - CHINA)
- MOT-001: BENDIX DE RODILLO (3) PIÑON 41 DIENTES - XY12530A(2020), qty:30, $12.500/u
- MOT-002: KIT DE BALANCINES I/D (PALILLOS) - GY200, qty:80, $8.900/u
- MOT-003: EMPAQUES KIT 110CC CB 23 PIEZAS, qty:50, $15.200/u
- MOT-004: CAJA DE TRANSMISION LEP168.5 LES173, qty:100, $45.000/u
- MOT-005: CILINDRO KIT CG D:69 250CC, qty:145, $62.000/u
- MOT-006: EMPAQUE KIT 250CC CG PALILLOS 15PCS, qty:60, $18.500/u
- MOT-007: EMBRAGUE COMPLETO 4H (3D), qty:30, $38.000/u
- MOT-008: FILTRO DE GASOLINA MFF02, qty:200, $4.200/u — Total orden: $18.427.000
### Códigos ML: ML-2001..ML-2008 (artToMassline keys: MOT-001..MOT-008)
### Anomalías: NIR1-000055 (MOT-003 faltantes + MOT-005 dañados), NIR1-000049 (MOT-002 + MOT-007 + MOT-008)

## valoracion.html (Valorar orden — página standalone externa)
- Sin sidebar — simula un link enviado al encargado externo
- Lee `code` y `proveedor` de URL params
- Formulario: "Código de valoración" input + upload zone email (mismo patrón)
- "Confirmar valoración" disabled hasta que ambos campos estén llenos
- On confirm → estado de éxito (muestra código de orden + código valoración)
- Colores: #D916A8 (rosa valoración)
- Botón sim en index.html (bottom-left): `valoracion.html?code=NIR1-000052&proveedor=Importadora+Andina+S.A.`
- simValoracionBtn ELIMINADO de detalle_orden.html y detalle_orden.js

## Estado "Valorado" (nuevo)
- Flujo: almacenada/almacenada-anomalia → valorada/valorada-anomalia
- Modal: código de valoración (input texto) + email de valoración (file upload)
- Botón "Valorar" visible solo cuando status es almacenada o almacenada-anomalia
- CSS: tema verde esmeralda (#ecfdf5 bg, #065f46 text, #10b981 dot)
- History type: `valoracion` (label: "Valoración")
- Tab en index.html: "Valorada"

## Arquitectura multi-archivo (completada)
- `css/styles.css` — CSS unificado (~2800 líneas), todas las páginas
- `js/data.js` — masslineCatalog, orderAnomalies, detailProducts, orderBoxes, warehousePositions, defaultRecipients, orderHistory
- `js/shared.js` — toggleSection, showToast/hideToast, openPhotoLightbox/closePhotoLightbox
- Todas las páginas importan: Google Fonts Inter, css/styles.css, js/data.js, js/shared.js
- Navegación entre páginas con URL query params (?toast=..., ?code=..., etc.)
- Backups: index_backup.html (5193 líneas), ingreso_orden_backup.html (1725 líneas)

## ingreso_orden.html (Ingresar orden)
- Flujo: Paso 1 (formulario + uploads) → Guardar → Paso 3 (confirmación éxito)
- Uploads: archivo PO (Excel) + email confirmación (zona separada), single-file cada uno
- Simulación de flujos alternativos (botón oculto):
  - Válido (0), Archivo no válido (1), Datos incompletos (2), Orden existente (3), Multi-invoice (4)
- Validación: botón Guardar disabled hasta modo válido + archivo (o modo manual completo)

### Flujo de ingreso manual ✅
- Trigger: botón "Ingresar datos manualmente" en `#poErrorSection` (modo 1)
- Muestra `#poManualSection`: banner, campos info (Proveedor*, N.°PO, Fecha entrega), tabla editable
- `manualMode` flag en JS controla validación y step3 content
- Guardar habilitado cuando: proveedor + al menos 1 fila con descripción y cantidad > 0
- Step3 dinámico: IDs `step3NirCode`, `step3ProveedorVal`, `step3ProductosVal`
- `hideAllPoAlerts()` resetea manualMode y limpia campos manuales

## consulta_orden.html (Consultar órdenes)
- Dos vistas: viewList (lista) y viewDetail (detalle dinámico)

### Vista Lista
- Filtros: Código, Proveedor, Fecha ingreso + botón Buscar
- Tabs de estado (filtros simplificados):
  - **Todos (8)**: todas las órdenes
  - **En bodega (2)**: órdenes sin revisar en bodega
  - **Con anomalías (2)**: agrupa revisada-anomalia + almacenada-anomalia
  - **Revisada (2)**: agrupa revisada limpia + revisada-anomalia
  - **Almacenada (2)**: agrupa almacenada limpia + almacenada-anomalia
  - **Por llegar (1)**: órdenes ingresadas sin llegar

### Órdenes en tabla (orden de prioridad):
1. **En bodega**: PO-0460 (Textiles Oriente), PO-0458 (Logística Global)
2. **Revisada ⚠**: PO-0455 (Importadora Andina) — class `revisada-anomalia`
3. **Revisada**: PO-0457 (Distribuidora ABC), PO-0453 (Textiles Oriente)
4. **Almacenada**: PO-0452 (Importadora Andina)
5. **Almacenada ⚠**: PO-0449 (Logística Global) — class `almacenada-anomalia`
6. **Por llegar**: PO-0461 (Distribuidora ABC) — class CSS `.ingresada`

### Clases CSS de estado:
- `.en-bodega` → fondo ámbar, texto marrón
- `.revisada` → fondo verde claro, texto verde oscuro
- `.revisada-anomalia` → degradado verde→ámbar, borde verde, dot ámbar, incluye warning-icon SVG
- `.por-almacenar` → fondo naranja claro (#fef3e2), texto marrón (#7c2d12), dot naranja (#f97316)
- `.almacenada` → fondo púrpura claro, texto púrpura oscuro
- `.almacenada-anomalia` → degradado púrpura→ámbar, borde púrpura, dot ámbar, incluye warning-icon SVG
- `.ingresada` → fondo azul claro (label dice "Por llegar", clase CSS se mantiene como `.ingresada`)
- **Nota**: Se eliminó `.con-anomalias` (rojo) — ya no existe como estado visual

### Vista Detalle (dinámica)
- showDetail(code, proveedor, fecha, statusClass, statusLabel, reviewer, reviewDate)
- Campos: código, proveedor, fecha ingreso, fecha entrega estimada, ingresada por, estado
- Campos condicionales: "Revisada por" + "Fecha y hora de revisión" (si reviewer/reviewDate existen)
- Tarjeta "Anomalías registradas" (id=detailAnomaliesCard): visible si hasAnomalias (revisada-anomalia o almacenada-anomalia)
  - 2 anomalías ejemplo: "Diferencia de cantidad" (ámbar) + "Producto dañado" (rojo)
- Tabla de productos: 8 ítems, total $3.138.000
- Documentos adjuntos: Excel + PDF

### Datos de revisores:
- Carlos Méndez: PO-0457 (revisada), PO-0452 (almacenada)
- Ana López: PO-0455 (revisada-anomalia), PO-0453 (revisada), PO-0449 (almacenada-anomalia)

### Simulación flujos alternativos (botón oculto):
- Normal, No encontrada (warning icon), Sin órdenes (neutral icon, oculta tabs)

## Sidebar (portal principal — Compras+Pedidos)
- Logo: img logo.png
- Sección "Compras": Ingresar (→ingreso_orden.html), Consultar (→index.html)
- Sección "Pedidos" (badge 3): Solicitudes (→pedidos_bodega.html)
  - Archivos actualizados: index.html, ingreso_orden.html, revision_orden.html, detalle_orden.html, solicitud_edicion.html

## pedidos_bodega.html (Pedidos de repuestos — bodega)
- UC17: Lista de pedidos de consumidores con filtros (código, solicitante, desde/hasta)
- UC18: Confirmar envío → status 'por-confirmar' → 'por-despachar'
- Tabs: Todos | Por confirmar | Por despachar | Empacado | Recibido
- Tabla: Código | Solicitante | Fecha | Ítems | Estado | →
- Vista detalle: cabecera + tabla ítems + botón "Confirmar envío" (solo si por-confirmar)
- Modal confirmación + toast con mensaje dinámico
- JS: js/pedidos_bodega.js (mismo patrón que mis_pedidos.js)
- CSS: styles.css + consumidor.css (reutiliza .status-badge, .confirm-llegada-*, etc.)

## Detalle de productos (vista detalle)
- Tabla de 8 productos (detailProducts): ART-3010 a ART-3017
- Columna "Cajas" condicional: aparece si orderBoxes tiene datos para la orden
- Botón `.btn-view-boxes` por producto con badge de cantidad y panel expandible inline
- Panel `.detail-box-panel` con fondo #f8f7ff, borde #e0e2ff, estilo indigo
- Muestra posiciones solo para estados por-almacenar y almacenada
- `toggleDetailBoxes(codigo, btn)` y `buildDetailBoxPanel(prodBoxes, statusClass)`
- `currentDetailStatusClass` variable global para tracking del estado actual en detalle
- orderBoxes ahora usa códigos de detailProducts (ART-3010..ART-3017)

## Panel "Solicitudes de edición pendientes" (index.html / consulta_orden)
- `<div id="emergencyRequestsPanel"></div>` insertado entre `.page-header` y los filtros de búsqueda
- Renderizado dinámico vía `renderEmergencyRequestsPanel()` (consulta_orden.js)
- Se oculta automáticamente cuando no hay solicitudes pendientes
- Datos en `emergencyRequests[]` (data.js) — array de objetos con: id, code, proveedor, requestedBy, requestedAt, motivo, changes[], status
- Flujos: Aprobar → toast "aprobada"; Rechazar → inline textarea → Confirmar rechazo → toast "rechazada"
- Toggle "Ver N cambios" → despliega tabla diff (reusa `.emergency-diff-table`)
- CSS: `.er-panel`, `.er-panel-header`, `.er-panel-dot` (pulsing), `.er-chevron`, `.er-card`, `.er-btn-approve`, `.er-btn-reject`, `.er-btn-confirm-reject`, `.er-diff-block`, `.er-reject-form`

## Portal Consumidor (UC13–UC18)
- `consumidor/index.html` — vista Inventario + vista Éxito (pedido generado) [UC13+14]
- `consumidor/js/consumidor.js` — catálogo 13 productos, carrito, filtros, modal confirmación
- `consumidor/mis_pedidos.html` — lista + detalle de pedidos propios [UC15+16]
- `consumidor/js/mis_pedidos.js` — tabs (todos/por-confirmar/por-despachar/empacado/recibido), filtros, confirmar recepción
- `css/consumidor.css` — estilos exclusivos del portal
- Sidebar: sección "Repuestos" con Inventario y Mis pedidos. Avatar "CO"
- Estados de pedido consumidor: `por-confirmar` (ámbar) | `por-despachar` (púrpura) | `empacado` (naranja) | `recibido` (verde)
- UC16: Confirmar recepción → estado 'Recibido', modal "Confirmar recepción", toast "Recepción confirmada exitosamente"

## Decisiones de diseño importantes
- "Ingresada" se renombró a "Por llegar" en labels pero la clase CSS se mantiene `.ingresada`
- El estado "Con anomalías" (rojo) fue eliminado y reemplazado por variantes con warning: `revisada-anomalia` y `almacenada-anomalia`
- El estado "Llegado" fue renombrado a "Recibido" (clase CSS `.recibido`, label 'Recibido')
- Los tabs de filtro son inclusivos: una orden con anomalías aparece tanto en "Con anomalías" como en "Revisada" o "Almacenada"
- Todas las fechas de ingreso incluyen hora (ej: "16/04/2026 08:45")
- Los botones de simulación tienen opacidad 0.12 y aparecen al hover
