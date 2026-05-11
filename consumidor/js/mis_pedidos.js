// =============================================================
// mis_pedidos.js — UC15 (Visualizar mis pedidos) + UC16 (Confirmar llegada)
// =============================================================

// === Datos de pedidos (simulados) ===
var pedidos = [
  {
    code: 'PED-000143',
    fecha: '05/05/2026 11:45',
    status: 'enviado-anomalia',
    statusLabel: 'Enviado',
    items: [
      { code: 'R150-GY0205', desc: 'Kit de balancines I/D',         qty: 2, confirmed: 1 },
      { code: 'R180-XP0302', desc: 'Juego de retenedores',           qty: 3, confirmed: 3 }
    ]
  },
  {
    code: 'PED-000141',
    fecha: '05/05/2026 09:15',
    status: 'enviado',
    statusLabel: 'Enviado',
    items: [
      { code: 'R150-AR0507', desc: 'Cable de acelerador',          qty: 2 },
      { code: 'R150-100837', desc: 'Pastillas de freno',           qty: 1 },
      { code: 'R180-XP0302', desc: 'Juego de retenedores',         qty: 4 }
    ]
  },
  {
    code: 'PED-000140',
    fecha: '05/05/2026 07:30',
    status: 'por-despachar',
    statusLabel: 'Por despachar',
    faltanteConfirmado: true,
    items: [
      { code: 'R250-XY0619', desc: 'Cilindro kit 250cc',             qty: 2, confirmed: 1 },
      { code: 'R110-LX0923', desc: 'Empaques kit 110cc (23 piezas)', qty: 1, confirmed: 1 }
    ]
  },
  {
    code: 'PED-000139',
    fecha: '04/05/2026 17:45',
    status: 'por-despachar-anomalia',
    statusLabel: 'Por despachar',
    items: [
      { code: 'R200-GY0119', desc: 'Caja de transmisión LEP168.5',  qty: 2, confirmed: 1 },
      { code: 'R250-XY0619', desc: 'Cilindro kit 250cc',            qty: 1, confirmed: 0 }
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
  },
  {
    code: 'PED-000126',
    fecha: '27/04/2026 10:30',
    status: 'recibido-parcial',
    statusLabel: 'Recibido parcial',
    items: [
      { code: 'R150-AR0507', desc: 'Cable de acelerador',  qty: 3, confirmed: 1 },
      { code: 'R250-XY0619', desc: 'Cilindro kit 250cc',   qty: 2, confirmed: 0 }
    ]
  }
];

// === Estado ===
var tabActual     = 'todos';
var pedidoActual  = null;
var filtros       = { codigo: '', desde: '', hasta: '' };

// === Configuración de tabs ===
var tabs = [
  { key: 'todos',            label: 'Todos'                                               },
  { key: 'por-confirmar',    label: 'Por confirmar'                                       },
  { key: 'por-despachar',    label: 'Por despachar',    extra: ['por-despachar-anomalia'] },
  { key: 'enviado',         label: 'Enviado',         extra: ['enviado-anomalia']      },
  { key: 'recibido-parcial', label: 'Recibido parcial'                                   },
  { key: 'recibido',         label: 'Recibido'                                            }
];

function matchTab(p, key) {
  if (key === 'todos') return true;
  var t = tabs.find(function (t) { return t.key === key; });
  var keys = [key].concat(t && t.extra ? t.extra : []);
  return keys.indexOf(p.status) !== -1;
}

// =============================================================
// Renderizar tabs
// =============================================================
function renderTabs() {
  var container = document.getElementById('statusTabs');
  container.innerHTML = '';

  tabs.forEach(function (t) {
    var base = t.key === 'todos' ? pedidos : pedidos.filter(function (p) { return matchTab(p, t.key); });
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
    : pedidos.filter(function (p) { return matchTab(p, tabActual); });

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
    var isAnom  = p.status === 'recibido-parcial' || p.status.indexOf('-anomalia') !== -1;
    var warnSVG = isAnom
      ? '<svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>'
      : '';
    var reenvioSVG = (p.status === 'por-despachar' && p.faltanteConfirmado)
      ? '<svg class="reenvio-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>'
      : '';
    var confirmBtn = (p.status === 'enviado' || p.status === 'enviado-anomalia')
      ? ' <button class="btn-confirm-row" onclick="event.stopPropagation(); confirmarDesdeTabla(\'' + p.code + '\')">' +
          '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>' +
          '</svg>' +
        '</button>'
      : '';
    var tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.onclick = function () { showDetalle(p.code); };
    tr.innerHTML =
      '<td><code>' + p.code + '</code></td>' +
      '<td>' + p.fecha + '</td>' +
      '<td>' + p.items.length + ' ítem' + (p.items.length !== 1 ? 's' : '') + '</td>' +
      '<td>' +
        '<span class="status-badge ' + p.status + '"><span class="dot"></span> ' + p.statusLabel + (warnSVG ? ' ' + warnSVG : '') + (reenvioSVG ? ' ' + reenvioSVG : '') + '</span>' +
        confirmBtn +
      '</td>' +
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
  document.getElementById('breadcrumbMid').style.display = 'inline-flex';
  document.getElementById('breadcrumbCurrent').textContent = 'Detalle';
  document.getElementById('detallePedCode').textContent = p.code;
  document.getElementById('detalleInfoCode').textContent = p.code;
  document.getElementById('detalleFecha').textContent = p.fecha;

  // Badge de estado (header + card)
  var isWarning  = p.status === 'recibido-parcial' || p.status.indexOf('-anomalia') !== -1;
  var warnSVG    = isWarning
    ? ' <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>'
    : '';
  var reenvioSVG = (p.status === 'por-despachar' && p.faltanteConfirmado)
    ? ' <svg class="reenvio-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>'
    : '';
  var badge = document.getElementById('detalleStatusBadge');
  badge.className = 'status-badge ' + p.status;
  badge.innerHTML = '<span class="dot"></span> <span id="detalleStatusLabel">' + p.statusLabel + '</span>' + warnSVG + reenvioSVG;
  var cardBadge = document.getElementById('detalleStatusCard');
  cardBadge.className = 'status-badge ' + p.status;
  cardBadge.innerHTML = '<span class="dot"></span> <span id="detalleStatusCardLabel">' + p.statusLabel + '</span>' + warnSVG + reenvioSVG;

  // Botón confirmar en header (solo si enviado)
  document.getElementById('btnConfirmarHeader').style.display = (p.status === 'enviado' || p.status === 'enviado-anomalia') ? '' : 'none';

  // Tabla de ítems
  var thead = document.getElementById('detalleItemsThead');
  var tbody = document.getElementById('detalleItemsTbody');
  tbody.innerHTML = '';

  if (p.status === 'recibido-parcial') {
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. solicitada</th><th>Cant. confirmada</th><th>Cant. pendiente</th></tr>';
    p.items.forEach(function (item) {
      var pendiente  = item.qty - (item.confirmed || 0);
      var confirmStyle = item.confirmed === 0      ? 'color:#ef4444; font-weight:600;'
                       : item.confirmed < item.qty ? 'color:#f59e0b; font-weight:600;'
                       : 'color:#16a34a; font-weight:500;';
      var pendStyle    = pendiente === 0      ? 'color:#16a34a; font-weight:500;'
                       : item.confirmed === 0 ? 'color:#ef4444; font-weight:600;'
                       : 'color:#f59e0b; font-weight:600;';
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><code>' + item.code + '</code></td>' +
        '<td>' + item.desc + '</td>' +
        '<td>' + item.qty + ' und</td>' +
        '<td style="' + confirmStyle + '">' + (item.confirmed || 0) + ' und</td>' +
        '<td style="' + pendStyle    + '">' + pendiente + ' und</td>';
      tbody.appendChild(tr);
    });
  } else if (p.status === 'recibido') {
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. solicitada</th><th>Cant. recibida</th></tr>';
    p.items.forEach(function (item) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><code>' + item.code + '</code></td>' +
        '<td>' + item.desc + '</td>' +
        '<td>' + item.qty + ' und</td>' +
        '<td style="color:#16a34a; font-weight:500;">' + item.qty + ' und</td>';
      tbody.appendChild(tr);
    });
  } else if (p.status === 'por-despachar' && p.faltanteConfirmado) {
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. solicitada</th><th>Cant. confirmada</th><th>Cant. pendiente</th></tr>';
    p.items.forEach(function (item) {
      var conf      = item.confirmed !== undefined ? item.confirmed : item.qty;
      var pendiente = item.qty - conf;
      var confStyle = conf === 0      ? 'color:#ef4444; font-weight:600;'
                    : conf < item.qty ? 'color:#f59e0b; font-weight:600;'
                    : 'color:#16a34a; font-weight:500;';
      var pendStyle = pendiente === 0 ? 'color:#16a34a; font-weight:500;'
                    : conf === 0      ? 'color:#ef4444; font-weight:600;'
                    : 'color:#f59e0b; font-weight:600;';
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><code>' + item.code + '</code></td>' +
        '<td>' + item.desc + '</td>' +
        '<td>' + item.qty + ' und</td>' +
        '<td style="' + confStyle + '">' + conf + ' und</td>' +
        '<td style="' + pendStyle + '">' + pendiente + ' und</td>';
      tbody.appendChild(tr);
    });
  } else if (p.status === 'por-despachar' || p.status === 'por-despachar-anomalia' || p.status === 'enviado' || p.status === 'enviado-anomalia') {
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. solicitada</th><th>Cant. confirmada</th></tr>';
    p.items.forEach(function (item) {
      var conf      = item.confirmed !== undefined ? item.confirmed : item.qty;
      var confStyle = item.confirmed === undefined ? 'color:#16a34a; font-weight:500;'
                    : conf === 0      ? 'color:#ef4444; font-weight:600;'
                    : conf < item.qty ? 'color:#f59e0b; font-weight:600;'
                    : 'color:#16a34a; font-weight:500;';
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><code>' + item.code + '</code></td>' +
        '<td>' + item.desc + '</td>' +
        '<td>' + item.qty + ' und</td>' +
        '<td style="' + confStyle + '">' + conf + ' und</td>';
      tbody.appendChild(tr);
    });
  } else {
    // por-confirmar y otros
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. solicitada</th></tr>';
    p.items.forEach(function (item) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td><code>' + item.code + '</code></td>' +
        '<td>' + item.desc + '</td>' +
        '<td>' + item.qty + ' und</td>';
      tbody.appendChild(tr);
    });
  }

  // Sección confirmar llegada (UC16): solo si enviado
  document.getElementById('confirmarLlegadaCard').style.display = 'none';

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
  document.getElementById('breadcrumbMid').style.display = 'none';
  document.getElementById('breadcrumbCurrent').textContent = 'Mis pedidos';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================
// Confirmar desde tabla (sin entrar al detalle)
// =============================================================
function confirmarDesdeTabla(code) {
  pedidoActual = pedidos.find(function (p) { return p.code === code; });
  if (!pedidoActual) return;
  abrirModalConfirmar();
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

  // Si estamos en la vista detalle, actualizar sus badges
  if (document.getElementById('viewDetalle').style.display !== 'none') {
    var badge = document.getElementById('detalleStatusBadge');
    badge.className = 'status-badge recibido';
    document.getElementById('detalleStatusLabel').textContent = 'Recibido';
    document.getElementById('detalleStatusCard').className = 'status-badge recibido';
    document.getElementById('detalleStatusCardLabel').textContent = 'Recibido';
    document.getElementById('btnConfirmarHeader').style.display = 'none';
    document.getElementById('confirmarLlegadaCard').style.display = 'none';
  }

  // Toast
  showToast();

  // Actualizar tabla y contadores (siempre)
  renderPedidos();
  renderTabs();
}

// =============================================================
// Init
// =============================================================
(function () {
  var hoy    = new Date();
  var hace30 = new Date(hoy);
  hace30.setDate(hoy.getDate() - 30);
  var toISO  = function (d) { return d.toISOString().split('T')[0]; };
  document.getElementById('filterDesde').value = toISO(hace30);
  document.getElementById('filterHasta').value = toISO(hoy);
  filtros.desde = toISO(hace30);
  filtros.hasta = toISO(hoy);
})();
renderTabs();
renderPedidos();
