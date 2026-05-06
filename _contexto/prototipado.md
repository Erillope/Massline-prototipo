# Metodología de Prototipado — MassLine

## Principios generales

> **Este proyecto es un prototipo de interfaz, no una aplicación productiva.**
> El objetivo es validar flujos y experiencia de usuario, no implementar lógica de negocio real.
> Mantener el código simple y directo. Si algo se puede simular con datos hardcodeados, así se hace.

- **Sin backend**: todos los prototipos son HTML estático con CSS y JS embebidos o en archivos separados. No hay servidor, base de datos ni peticiones HTTP reales.
- **Sin lógica compleja**: no se implementan validaciones exhaustivas, cálculos reales ni manejo de errores avanzado. Lo que importa es que el flujo visual sea claro y navegable.
- **Simulación de datos**: los datos (órdenes, productos, pedidos, usuarios) están hardcodeados en `js/data.js` o directamente en los archivos JS de cada página. No hace falta que sean dinámicos.
- **Simulación de flujos alternativos**: cada página tiene un botón oculto (opacidad 0.12, aparece al hover) en la esquina inferior derecha (o izquierda) que permite cambiar entre escenarios de prueba sin recargar la página.
- **Una página = uno o dos casos de uso**: cada HTML cubre el flujo principal de 1–2 UC relacionados. Las vistas de lista y detalle conviven en el mismo archivo, mostrando/ocultando divs.
- **Preferir simplicidad**: ante la duda, elegir la solución más simple. No agregar abstracciones, helpers ni patrones que no sean estrictamente necesarios para mostrar el flujo.

---

## Arquitectura de archivos

### CSS
- `css/styles.css` — hoja de estilos compartida por todo el portal principal (~2800 líneas). Contiene layout, sidebar, cards, tablas, tabs, filtros, badges, modales, toasts, lightbox, etc.
- `css/consumidor.css` — estilos exclusivos del portal consumidor. **Nunca duplicar** clases que ya existen en `styles.css`; solo agregar lo que es realmente nuevo.

### JS
- `js/data.js` — fuente única de datos mock: `masslineCatalog`, `orderAnomalies`, `detailProducts`, `orderBoxes`, `warehousePositions`, `defaultRecipients`, `orderHistory`, `emergencyRequests`.
- `js/shared.js` — funciones reutilizables entre páginas: `toggleSection()` (sidebar), `showToast()` / `hideToast()`, `openPhotoLightbox()` / `closePhotoLightbox()`.
- Un JS por página: `consulta_orden.js`, `ingreso_orden.js`, `revision_orden.js`, `detalle_orden.js`, `solicitud_edicion.js`, `pedidos_bodega.js`, `valoracion.js`.
- Portal consumidor: `consumidor/js/consumidor.js` y `consumidor/js/mis_pedidos.js`.

### Imports estándar (portal principal)
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
<script src="js/data.js"></script>
<script src="js/shared.js"></script>
<script src="js/[pagina].js" defer></script>
```

### Imports estándar (portal consumidor)
```html
<!-- igual que arriba pero con rutas relativas -->
<link rel="stylesheet" href="../css/styles.css">
<link rel="stylesheet" href="../css/consumidor.css">
<script src="../js/shared.js"></script>
<script src="js/[pagina].js" defer></script>
```

---

## Patrones de componentes

### Sidebar
- Gradiente `linear-gradient(180deg, #1a1a2e, #16213e)`, logo `assets/logo.png`.
- Secciones colapsables con `toggleSection(header)` de `shared.js`.
- Portal principal: secciones **Compras** (Ingresar, Consultar) + **Pedidos** (Solicitudes).
- Portal consumidor: sección **Repuestos** (Inventario, Mis pedidos). Avatar "CO".
- Links deshabilitados (próximamente): clase `nav-link-soon`.

### Tabs de estado
- Contenedor: `<div class="estado-tabs" id="statusTabs">`.
- Clase de cada tab: `estado-tab` (nunca `status-tab`). Estado activo: `estado-tab active`.
- Conteo: `<span class="tab-count">N</span>` dentro del botón.
- Los tabs se renderizan dinámicamente desde JS con `renderTabs()`.
- Los tabs son **inclusivos**: una orden con anomalía aparece en "Con anomalías" Y en "Revisada".

### Filtros de búsqueda
- Contenedor: `<div class="search-row">`, grupos: `<div class="filter-group">`.
- Clases reutilizables de `styles.css`: `.filter-label`, `.filter-input`.
- Campos comunes: código (texto), proveedor o solicitante (texto), desde/hasta (date).
- La función `aplicarFiltros()` usa un objeto `filtros` con estado local; `parseFecha()` convierte `"DD/MM/YYYY HH:MM"` → `Date`.

### Vista lista + vista detalle
- Dos divs hermanos: `id="viewLista"` y `id="viewDetalle"` (o `id="viewList"` / `id="viewDetail"`).
- La función `showDetail(...)` oculta la lista y muestra el detalle con datos inyectados dinámicamente.
- El botón "← Volver" llama a `goBack()` que revierte la vista.

### Modales
- Estructura: `.modal-overlay` + div interior con clase `.modal-content` o similar.
- Apertura/cierre: toggle de clase `active` en `.modal-overlay`.
- Confirmaciones destructivas o importantes usan modal; acciones menores usan toast.

### Toasts
- Definidos en `shared.js`: `showToast(msg)` / `hideToast()` sobre el elemento `id="arrivalToast"`.
- En `pedidos_bodega.js` el toast tiene un `<span id="toastMsg">` para texto dinámico.
- Auto-oculta tras 4000 ms.

### Botones de simulación (flujos alternativos)
- Posición: `position: fixed`, esquina inferior derecha o izquierda.
- Visibilidad: `opacity: 0.12`, sube a `0.85` en hover.
- Cada botón llama a una función `setSim(n)` o `setMode(n)` que cambia el estado global y re-renderiza la vista.

---

## Convención de estados (badges y clases CSS)

### Portal principal (órdenes de compra)
| Estado            | Clase CSS            | Color base      |
|-------------------|----------------------|-----------------|
| Por llegar        | `.ingresada`         | Azul claro      |
| En bodega         | `.en-bodega`         | Ámbar           |
| Por almacenar     | `.por-almacenar`     | Naranja claro   |
| Revisada          | `.revisada`          | Verde claro     |
| Revisada ⚠        | `.revisada-anomalia` | Degradado verde→ámbar |
| Almacenada        | `.almacenada`        | Púrpura claro   |
| Almacenada ⚠      | `.almacenada-anomalia` | Degradado púrpura→ámbar |
| Valorada          | `.valorada`          | Esmeralda       |

### Portal consumidor (pedidos de repuestos)
| Estado        | Clase CSS         | Color base    |
|---------------|-------------------|---------------|
| Por confirmar | `.por-confirmar`  | Ámbar         |
| Por despachar | `.por-despachar`  | Púrpura       |
| Empacado      | `.empacado`       | Naranja       |
| Recibido      | `.recibido`       | Verde         |

---

## Navegación entre páginas

- Se usan URL query params para pasar contexto entre páginas: `?code=NIR1-000058`, `?toast=guardado`.
- Al cargar, cada JS lee `new URLSearchParams(window.location.search)` para mostrar toasts de confirmación o pre-seleccionar un registro.

---

## Flujo típico para crear una nueva página

1. Copiar la estructura de sidebar del HTML más cercano (mismo portal).
2. Definir las vistas necesarias (lista, detalle, éxito) como divs hermanos.
3. Agregar filtros con `.search-row` / `.filter-group` si hay lista.
4. Agregar tabs con `id="statusTabs"` renderizados desde JS.
5. Crear el JS de la página: datos mock → `renderTabs()` → `renderTabla()` → `aplicarFiltros()`.
6. Reutilizar clases de `styles.css` antes de agregar CSS nuevo.
7. Agregar botón de simulación oculto para flujos alternativos.
8. Actualizar el sidebar de las demás páginas del mismo portal para incluir el nuevo link.
 
