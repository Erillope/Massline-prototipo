// =============================================================
// mis_pedidos.js — UC15 (Visualizar mis pedidos) + UC16 (Confirmar llegada)
// =============================================================

// === Datos de pedidos (simulados) ===
var pedidos = [
  {
    code: 'PED-000141',
    fecha: '05/05/2026 09:15',
    status: 'empacado',
    statusLabel: 'Empacado',
    items: [
      { code: 'R150-AR0507', desc: 'Cable de acelerador',          qty: 2 },
      { code: 'R150-100837', desc: 'Pastillas de freno',           qty: 1 },
      { code: 'R180-XP0302', desc: 'Juego de retenedores',         qty: 4 }
    ]
  },
  {
    code: 'PED-000138',
    fecha: '04/05/2026 14:30',
    status: 'por-despachar',
    statusLabel: 'Por despachar',
    items: [
      { code: 'R150-GY0205', desc: 'Kit de balancines I/D',        qty: 1 },
      { code: 'R180-XP0806', desc: 'Piñón de velocímetro',         qty: 2 }
    ]
  },
  {
    code: 'PED-000135',
    fecha: '03/05/2026 11:00',
    status: 'por-confirmar',
    statusLabel: 'Por confirmar',
    items: [
      { code: 'R110-LX0923', desc: 'Empaques kit 110cc (23 piezas)', qty: 2 }
    ]
  },
  {
    code: 'PED-000132',
    fecha: '02/05/2026 16:45',
    status: 'por-confirmar',
    statusLabel: 'Por confirmar',
    items: [
      { code: 'R250-XY0619', desc: 'Cilindro kit 250cc',            qty: 1 },
      { code: 'R200-GY0119', desc: 'Caja de transmisión LEP168.5',  qty: 1 }
    ]
  },
  {
    code: 'PED-000128',
    fecha: '30/04/2026 08:20',
    status: 'recibido',
    statusLabel: 'Recibido',
    items: [
      { code: 'R150-AR0508', desc: 'Cable de embrague',             qty: 3 },
      { code: 'R180-XP0903', desc: 'Llave de paso de combustible',  qty: 2 }
    ]
  }
];

// === Estado ===
var tabActual     = 'todos';
var pedidoActual  = null;
var filtros       = { codigo: '', desde: '', hasta: '' };

// === Configuración de tabs ===
var tabs = [
  { key: 'todos',         label: 'Todos'          },
  { key: 'por-confirmar', label: 'Por confirmar'  },
  { key: 'por-despachar', label: 'Por despachar'  },
  { key: 'empacado',      label: 'Empacado'       },
  { key: 'recibido',      label: 'Recibido'       }
];

// =============================================================
// Renderizar tabs
// =============================================================
function renderTabs() {
  var container = document.getElementById('statusTabs');
  container.innerHTML = '';

  tabs.forEach(function (t) {
    var base = t.key === 'todos' ? pedidos : pedidos.filter(function (p) { return p.status === t.key; });
    var count = base.length;

    var btn = document.createElement('button');
    btn.className = 'estado-tab' + (t.key === tabActual ? ' active' : '');
    btn.innerHTML = t.label + ' <span class="tab-count">' + count + '</span>';
    btn.onclick = (function (key) {
      return function () { setTab(key); };
    })(t.key);
    container.appendChild(btn);
  });
}

// =============================================================
// Parsear fecha "DD/MM/YYYY HH:MM" a Date
// =============================================================
function parseFecha(str) {
  var parts = str.split(' ');
  var d = parts[0].split('/');
  var t = parts[1] ? parts[1].split(':') : ['0','0'];
  return new Date(+d[2], +d[1]-1, +d[0], +t[0], +t[1]);
}

// =============================================================
// Aplicar filtros desde inputs
// =============================================================
function aplicarFiltros() {
  filtros.codigo = document.getElementById('filterCodigo').value.trim();
  filtros.desde  = document.getElementById('filterDesde').value;
  filtros.hasta  = document.getElementById('filterHasta').value;
  renderPedidos();
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
// Renderizar tabla de pedidos
// =============================================================
function renderPedidos() {
  var tbody    = document.getElementById('pedidosTbody');
  var listCard = document.getElementById('listCard');
  var noCard   = document.getElementById('noResultsCard');
  var countEl  = document.getElementById('listCount');

  // Aplicar tab
  var base = tabActual === 'todos'
    ? pedidos
    : pedidos.filter(function (p) { return p.status === tabActual; });

  // Aplicar filtros de texto y fecha
  var filtrados = base.filter(function (p) {
    var matchCod = !filtros.codigo || p.code.toLowerCase().indexOf(filtros.codigo.toLowerCase()) !== -1;
    var matchDesde = !filtros.desde || parseFecha(p.fecha) >= new Date(filtros.desde);
    var matchHasta = !filtros.hasta || parseFecha(p.fecha) <= new Date(filtros.hasta + 'T23:59:59');
    return matchCod && matchDesde && matchHasta;
  });

  tbody.innerHTML = '';
  countEl.textContent = filtrados.length + ' pedido' + (filtrados.length !== 1 ? 's' : '');
  listCard.style.display = filtrados.length === 0 ? 'none' : '';
  noCard.style.display   = filtrados.length === 0 ? '' : 'none';

  if (filtrados.length === 0) {
    document.getElementById('emptyTitle').textContent = tabActual === 'todos'
      ? 'Sin pedidos' : 'Sin pedidos en este estado';
    document.getElementById('emptyText').textContent = tabActual === 'todos'
      ? 'Aún no ha generado ningún pedido. Vaya al inventario para solicitar repuestos.'
      : 'No tiene pedidos con el estado "' + tabs.find(function (t) { return t.key === tabActual; }).label + '".';
    return;
  }

  filtrados.forEach(function (p) {
    var tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = function () { showDetalle(p.code); };
    tr.innerHTML =
      '<td><code>' + p.code + '</code></td>' +
      '<td>' + p.fecha + '</td>' +
      '<td>' + p.items.length + ' ítem' + (p.items.length !== 1 ? 's' : '') + '</td>' +
      '<td><span class="status-badge ' + p.status + '"><span class="dot"></span> ' + p.statusLabel + '</span></td>' +
      '<td style="text-align:right; padding-right: 18px;">' +
        '<svg width="16" height="16" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>' +
        '</svg>' +
      '</td>';
    tbody.appendChild(tr);
  });
}

// =============================================================
// Mostrar detalle de un pedido
// =============================================================
function showDetalle(code) {
  pedidoActual = pedidos.find(function (p) { return p.code === code; });
  if (!pedidoActual) return;

  var p = pedidoActual;

  // Cabecera
  document.getElementById('breadcrumbCurrent').textContent = p.code;
  document.getElementById('detallePedCode').textContent = p.code;
  document.getElementById('detalleFecha').textContent = p.fecha;
  document.getElementById('detalleItemsResumen').textContent =
    p.items.length + ' ítem' + (p.items.length !== 1 ? 's' : '');

  // Badge de estado
  var badge = document.getElementById('detalleStatusBadge');
  badge.className = 'status-badge ' + p.status;
  document.getElementById('detalleStatusLabel').textContent = p.statusLabel;

  // Tabla de ítems
  var tbody = document.getElementById('detalleItemsTbody');
  tbody.innerHTML = '';
  p.items.forEach(function (item) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><code>' + item.code + '</code></td>' +
      '<td>' + item.desc + '</td>' +
      '<td>' + item.qty + ' und</td>';
    tbody.appendChild(tr);
  });

  // Sección confirmar llegada (UC16): solo si empacado
  document.getElementById('confirmarLlegadaCard').style.display =
    p.status === 'empacado' ? '' : 'none';

  // Cambiar vista
  document.getElementById('viewLista').style.display    = 'none';
  document.getElementById('viewDetalle').style.display  = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================
// Volver a la lista
// =============================================================
function volverALista() {
  document.getElementById('viewDetalle').style.display = 'none';
  document.getElementById('viewLista').style.display   = '';
  document.getElementById('breadcrumbCurrent').textContent = 'Mis pedidos';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================
// Modal confirmar llegada
// =============================================================
function abrirModalConfirmar() {
  if (!pedidoActual) return;

  var tbody = document.getElementById('modalLlegadaTbody');
  tbody.innerHTML = '';
  pedidoActual.items.forEach(function (item) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><code>' + item.code + '</code></td>' +
      '<td>' + item.desc + '</td>' +
      '<td><span class="modal-qty-plain">' + item.qty + ' und</span></td>';
    tbody.appendChild(tr);
  });

  document.getElementById('confirmLlegadaModal').classList.add('active');
}

function cerrarModalConfirmar() {
  document.getElementById('confirmLlegadaModal').classList.remove('active');
}

// =============================================================
// UC16: Confirmar llegada
// =============================================================
function confirmarLlegada() {
  if (!pedidoActual) return;

  // Actualizar datos
  pedidoActual.status      = 'recibido';
  pedidoActual.statusLabel = 'Recibido';

  cerrarModalConfirmar();

  // Actualizar badge en el detalle
  var badge = document.getElementById('detalleStatusBadge');
  badge.className = 'status-badge recibido';
  document.getElementById('detalleStatusLabel').textContent = 'Recibido';

  // Ocultar tarjeta de acción
  document.getElementById('confirmarLlegadaCard').style.display = 'none';

  // Toast
  showToast();

  // Actualizar contadores de tabs en background
  renderTabs();
}

// =============================================================
// Init
// =============================================================
renderTabs();
renderPedidos();
