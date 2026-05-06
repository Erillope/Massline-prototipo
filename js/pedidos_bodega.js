/* =============================================================
   pedidos_bodega.js — UC17 Revisar pedidos / UC18 Confirmar envío
   ============================================================= */

// =============================================================
// Datos mock
// =============================================================
var pedidos = [
  { code: 'PED-000141', solicitante: 'Juan Pérez',    fecha: '05/05/2026 09:15', items: 3, status: 'por-confirmar' },
  { code: 'PED-000140', solicitante: 'María García',  fecha: '04/05/2026 14:30', items: 2, status: 'por-confirmar' },
  { code: 'PED-000138', solicitante: 'Ana López',     fecha: '04/05/2026 11:00', items: 2, status: 'por-confirmar' },
  { code: 'PED-000135', solicitante: 'Carlos Romero', fecha: '03/05/2026 11:00', items: 1, status: 'por-despachar' },
  { code: 'PED-000132', solicitante: 'Juan Pérez',    fecha: '02/05/2026 16:45', items: 2, status: 'empacado'      },
  { code: 'PED-000128', solicitante: 'María García',  fecha: '30/04/2026 08:20', items: 2, status: 'recibido'      }
];

var detalleItems = {
  'PED-000141': [
    { code: 'ML-1042', desc: 'Filtro de aceite (Cat)',   qty: 2 },
    { code: 'ML-2031', desc: 'Correa de distribución',   qty: 1 },
    { code: 'ML-3050', desc: 'Bujía NGK estándar',       qty: 4 }
  ],
  'PED-000140': [
    { code: 'ML-1042', desc: 'Filtro de aceite (Cat)',   qty: 3 },
    { code: 'ML-1089', desc: 'Filtro de combustible',    qty: 2 }
  ],
  'PED-000138': [
    { code: 'ML-2031', desc: 'Correa de distribución',   qty: 2 },
    { code: 'ML-4005', desc: 'Inyector de combustible',  qty: 1 }
  ],
  'PED-000135': [
    { code: 'ML-3050', desc: 'Bujía NGK estándar',       qty: 6 }
  ],
  'PED-000132': [
    { code: 'ML-0021', desc: 'Filtro de aire Donaldson', qty: 1 },
    { code: 'ML-5012', desc: 'Rodamiento 6205-2RS',      qty: 5 }
  ],
  'PED-000128': [
    { code: 'ML-1042', desc: 'Filtro de aceite (Cat)',   qty: 1 },
    { code: 'ML-0021', desc: 'Filtro de aire Donaldson', qty: 2 }
  ]
};

var statusLabels = {
  'por-confirmar': 'Por confirmar',
  'por-despachar': 'Por despachar',
  'empacado':      'Empacado',
  'recibido':      'Recibido'
};

// =============================================================
// Estado
// =============================================================
var tabActual    = 'todos';
var pedidoActual = null;
var filtros      = { codigo: '', solicitante: '', desde: '', hasta: '' };

var tabs = [
  { key: 'todos',          label: 'Todos'          },
  { key: 'por-confirmar',  label: 'Por confirmar'  },
  { key: 'por-despachar',  label: 'Por despachar'  },
  { key: 'empacado',       label: 'Empacado'        },
  { key: 'recibido',       label: 'Recibido'        }
];

// =============================================================
// Parsear fecha "DD/MM/YYYY HH:MM" → Date
// =============================================================
function parseFecha(str) {
  var parts = str.split(' ');
  var d     = parts[0].split('/');
  var t     = parts[1] ? parts[1].split(':') : ['0', '0'];
  return new Date(+d[2], +d[1] - 1, +d[0], +t[0], +t[1]);
}

// =============================================================
// Renderizar tabs
// =============================================================
function renderTabs() {
  var container = document.getElementById('statusTabs');
  container.innerHTML = '';

  tabs.forEach(function (t) {
    var base  = t.key === 'todos' ? pedidos : pedidos.filter(function (p) { return p.status === t.key; });
    var count = base.length;

    var btn       = document.createElement('button');
    btn.className = 'estado-tab' + (t.key === tabActual ? ' active' : '');
    btn.innerHTML = t.label + ' <span class="tab-count">' + count + '</span>';
    btn.onclick   = (function (key) { return function () { setTab(key); }; })(t.key);
    container.appendChild(btn);
  });
}

// =============================================================
// Cambiar tab activo
// =============================================================
function setTab(key) {
  tabActual = key;
  renderTabs();
  renderPedidos();
}

// =============================================================
// Aplicar filtros desde inputs
// =============================================================
function aplicarFiltros() {
  filtros.codigo      = document.getElementById('filterCodigo').value.trim();
  filtros.solicitante = document.getElementById('filterSolicitante').value.trim();
  filtros.desde       = document.getElementById('filterDesde').value;
  filtros.hasta       = document.getElementById('filterHasta').value;
  renderPedidos();
}

// =============================================================
// Renderizar tabla de pedidos
// =============================================================
function renderPedidos() {
  var tbody   = document.getElementById('pedidosTbody');
  var listCard = document.getElementById('listCard');
  var noCard  = document.getElementById('noResultsCard');
  var countEl = document.getElementById('listCount');

  // Aplicar tab
  var base = tabActual === 'todos'
    ? pedidos
    : pedidos.filter(function (p) { return p.status === tabActual; });

  // Aplicar filtros de texto y fecha
  var filtrados = base.filter(function (p) {
    var matchCod  = !filtros.codigo      || p.code.toLowerCase().indexOf(filtros.codigo.toLowerCase()) !== -1;
    var matchSol  = !filtros.solicitante || p.solicitante.toLowerCase().indexOf(filtros.solicitante.toLowerCase()) !== -1;
    var matchDes  = !filtros.desde       || parseFecha(p.fecha) >= new Date(filtros.desde);
    var matchHas  = !filtros.hasta       || parseFecha(p.fecha) <= new Date(filtros.hasta + 'T23:59:59');
    return matchCod && matchSol && matchDes && matchHas;
  });

  if (filtrados.length === 0) {
    listCard.style.display = 'none';
    noCard.style.display   = '';
    var hayFiltros = filtros.codigo || filtros.solicitante || filtros.desde || filtros.hasta;
    document.getElementById('emptyTitle').textContent = hayFiltros ? 'Sin resultados' : 'Sin solicitudes';
    document.getElementById('emptyText').textContent  = hayFiltros
      ? 'No hay pedidos que coincidan con los criterios de búsqueda.'
      : 'No hay pedidos registrados en este estado.';
    return;
  }

  listCard.style.display = '';
  noCard.style.display   = 'none';
  countEl.textContent    = filtrados.length + (filtrados.length === 1 ? ' solicitud encontrada' : ' solicitudes encontradas');

  tbody.innerHTML = filtrados.map(function (p) {
    var label   = statusLabels[p.status] || p.status;
    var itemsTxt = p.items + (p.items === 1 ? ' ítem' : ' ítems');
    return '<tr onclick="showDetalle(\'' + p.code + '\')" style="cursor:pointer;">' +
      '<td><code>' + p.code + '</code></td>' +
      '<td>' + p.solicitante + '</td>' +
      '<td>' + p.fecha + '</td>' +
      '<td>' + itemsTxt + '</td>' +
      '<td><span class="status-badge ' + p.status + '"><span class="dot"></span> ' + label + '</span></td>' +
      '<td><svg width="16" height="16" fill="none" stroke="#8b8fa3" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>' +
      '</svg></td>' +
    '</tr>';
  }).join('');
}

// =============================================================
// Mostrar detalle de un pedido (UC17)
// =============================================================
function showDetalle(code) {
  var p = pedidos.find(function (x) { return x.code === code; });
  if (!p) return;
  pedidoActual = p;

  // Actualizar breadcrumb
  document.getElementById('breadcrumbCurrent').textContent = code;

  // Cabecera
  document.getElementById('detallePedCode').textContent = p.code;
  document.getElementById('detalleSolicitante').textContent = p.solicitante;
  document.getElementById('detalleFecha').textContent = p.fecha;
  var itemsTxt = p.items + (p.items === 1 ? ' ítem' : ' ítems');
  document.getElementById('detalleItemsResumen').textContent = itemsTxt;

  var badge = document.getElementById('detalleStatusBadge');
  badge.className = 'status-badge ' + p.status;
  document.getElementById('detalleStatusLabel').textContent = statusLabels[p.status] || p.status;

  // Tabla de ítems
  var items  = detalleItems[p.code] || [];
  var tbody  = document.getElementById('detalleItemsTbody');
  tbody.innerHTML = items.map(function (it) {
    return '<tr>' +
      '<td><code>' + it.code + '</code></td>' +
      '<td>' + it.desc + '</td>' +
      '<td>' + it.qty + ' und</td>' +
    '</tr>';
  }).join('');

  // Mostrar/ocultar tarjeta de acción (UC18)
  var envioCard = document.getElementById('confirmEnvioCard');
  envioCard.style.display = p.status === 'por-confirmar' ? '' : 'none';

  // Cambiar vistas
  document.getElementById('viewLista').style.display   = 'none';
  document.getElementById('viewDetalle').style.display = '';
  window.scrollTo(0, 0);
}

// =============================================================
// Volver al listado
// =============================================================
function volverALista() {
  pedidoActual = null;
  document.getElementById('breadcrumbCurrent').textContent = 'Solicitudes de repuestos';
  document.getElementById('viewDetalle').style.display = 'none';
  document.getElementById('viewLista').style.display   = '';
}

// =============================================================
// Modal confirmar envío (UC18)
// =============================================================
function abrirModalConfirmar() {
  if (!pedidoActual) return;

  // Poblar tabla del modal
  var items = detalleItems[pedidoActual.code] || [];
  document.getElementById('modalEnvioTbody').innerHTML = items.map(function (it) {
    return '<tr>' +
      '<td><code>' + it.code + '</code></td>' +
      '<td>' + it.desc + '</td>' +
      '<td>' + it.qty + ' und</td>' +
    '</tr>';
  }).join('');

  document.getElementById('confirmEnvioModal').classList.add('active');
}

function cerrarModalConfirmar() {
  document.getElementById('confirmEnvioModal').classList.remove('active');
}

// =============================================================
// Confirmar envío → estado pasa a "por-despachar" (UC18)
// =============================================================
function confirmarEnvio() {
  if (!pedidoActual) return;

  // Actualizar estado en memoria
  pedidoActual.status = 'por-despachar';

  // Cerrar modal
  cerrarModalConfirmar();

  // Actualizar vista detalle
  var badge = document.getElementById('detalleStatusBadge');
  badge.className = 'status-badge por-despachar';
  document.getElementById('detalleStatusLabel').textContent = 'Por despachar';
  document.getElementById('confirmEnvioCard').style.display = 'none';

  // Mostrar toast
  document.getElementById('toastMsg').textContent = 'Envío confirmado · ' + pedidoActual.code + ' marcado como Por despachar';
  showToast();

  // Re-renderizar tabs con nuevos conteos
  renderTabs();
}

// =============================================================
// Init
// =============================================================
document.addEventListener('DOMContentLoaded', function () {
  renderTabs();
  renderPedidos();
});
