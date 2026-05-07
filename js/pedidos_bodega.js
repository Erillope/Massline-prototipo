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
  { code: 'PED-000134', solicitante: 'Luis Torres',   fecha: '03/05/2026 08:30', items: 2, status: 'por-despachar' },
  { code: 'PED-000132', solicitante: 'Juan Pérez',    fecha: '02/05/2026 16:45', items: 2, status: 'empacado'      },
  { code: 'PED-000131', solicitante: 'Ana López',     fecha: '01/05/2026 10:15', items: 3, status: 'empacado'      },
  { code: 'PED-000128', solicitante: 'María García',  fecha: '30/04/2026 08:20', items: 2, status: 'recibido'      },
  { code: 'PED-000127', solicitante: 'Carlos Romero', fecha: '28/04/2026 15:30', items: 3, status: 'recibido-parcial' },
  { code: 'PED-000126', solicitante: 'Marta Díaz',    fecha: '27/04/2026 10:30', items: 2, status: 'recibido-parcial' }
];

var detalleItems = {
  'PED-000141': [
    { code: 'ML-1042', desc: 'Filtro de aceite (Cat)',   qty: 2, stock: 15 },
    { code: 'ML-2031', desc: 'Correa de distribución',   qty: 1, stock: 0  },
    { code: 'ML-3050', desc: 'Bujía NGK estándar',       qty: 4, stock: 3  }
  ],
  'PED-000140': [
    { code: 'ML-1042', desc: 'Filtro de aceite (Cat)',   qty: 3, stock: 15 },
    { code: 'ML-1089', desc: 'Filtro de combustible',    qty: 2, stock: 8  }
  ],
  'PED-000138': [
    { code: 'ML-2031', desc: 'Correa de distribución',   qty: 2, stock: 0  },
    { code: 'ML-4005', desc: 'Inyector de combustible',  qty: 1, stock: 5  }
  ],
  'PED-000135': [
    { code: 'ML-3050', desc: 'Bujía NGK estándar',       qty: 6, stock: 10, confirmed: 6 }
  ],
  'PED-000134': [
    { code: 'ML-1089', desc: 'Filtro de combustible',    qty: 3, stock: 8,  confirmed: 2 },
    { code: 'ML-4005', desc: 'Inyector de combustible',  qty: 2, stock: 0,  confirmed: 0 }
  ],
  'PED-000132': [
    { code: 'ML-0021', desc: 'Filtro de aire Donaldson', qty: 1, stock: 7,  confirmed: 1 },
    { code: 'ML-5012', desc: 'Rodamiento 6205-2RS',      qty: 5, stock: 12, confirmed: 5 }
  ],
  'PED-000131': [
    { code: 'ML-2031', desc: 'Correa de distribución',   qty: 3, stock: 0,  confirmed: 0 },
    { code: 'ML-3050', desc: 'Bujía NGK estándar',       qty: 5, stock: 3,  confirmed: 3 },
    { code: 'ML-5012', desc: 'Rodamiento 6205-2RS',      qty: 2, stock: 12, confirmed: 2 }
  ],
  'PED-000128': [
    { code: 'ML-1042', desc: 'Filtro de aceite (Cat)',   qty: 1, stock: 15, confirmed: 1 },
    { code: 'ML-0021', desc: 'Filtro de aire Donaldson', qty: 2, stock: 7,  confirmed: 2 }
  ],
  'PED-000127': [
    { code: 'ML-1042', desc: 'Filtro de aceite (Cat)',   qty: 4, stock: 15, confirmed: 2 },
    { code: 'ML-0021', desc: 'Filtro de aire Donaldson', qty: 3, stock: 7,  confirmed: 0 },
    { code: 'ML-5012', desc: 'Rodamiento 6205-2RS',      qty: 2, stock: 12, confirmed: 2 }
  ],
  'PED-000126': [
    { code: 'ML-2031', desc: 'Correa de distribución',   qty: 2, stock: 0,  confirmed: 0 },
    { code: 'ML-4005', desc: 'Inyector de combustible',  qty: 3, stock: 0,  confirmed: 1 }
  ]
};

var statusLabels = {
  'por-confirmar':  'Por confirmar',
  'por-despachar':  'Por despachar',
  'empacado':       'Empacado',
  'recibido-parcial': 'Recibido parcial',
  'recibido':       'Recibido'
};

// =============================================================
// Estado
// =============================================================
var tabActual    = 'todos';
var pedidoActual = null;
var filtros      = { codigo: '', solicitante: '', desde: '', hasta: '' };

var tabs = [
  { key: 'todos',             label: 'Todos'             },
  { key: 'por-confirmar',     label: 'Por confirmar'     },
  { key: 'por-despachar',     label: 'Por despachar'     },
  { key: 'empacado',          label: 'Empacado'          },
  { key: 'recibido-parcial',  label: 'Recibido parcial'  },
  { key: 'recibido',          label: 'Recibido'          }
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
// Detectar si un pedido tiene ítems con stock insuficiente
// =============================================================
function hasStockAnomalia(code) {
  var items = detalleItems[code] || [];
  return items.some(function (it) { return it.stock < it.qty; });
}

// Detectar si un pedido confirmado tiene ítems con cant. confirmada < solicitada
function hasConfirmedAnomalia(code) {
  var items = detalleItems[code] || [];
  return items.some(function (it) { return it.confirmed !== undefined && it.confirmed < it.qty; });
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
    var label      = statusLabels[p.status] || p.status;
    var itemsTxt   = p.items + (p.items === 1 ? ' ítem' : ' ítems');
    var isAnomalia = (p.status === 'por-confirmar' && hasStockAnomalia(p.code)) ||
                     ((p.status === 'por-despachar' || p.status === 'empacado') && !p.faltanteConfirmado && hasConfirmedAnomalia(p.code)) ||
                     p.status === 'recibido-parcial';
    var badgeClass = (isAnomalia && p.status !== 'recibido-parcial') ? p.status + '-anomalia' : p.status;
    var warnSVG    = isAnomalia
      ? '<svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>'
      : '';
    var reenvioSVG = (p.status === 'por-despachar' && p.faltanteConfirmado)
      ? '<svg class="reenvio-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>'
      : '';
    return '<tr onclick="showDetalle(\'' + p.code + '\')" style="cursor:pointer;">' +
      '<td><code>' + p.code + '</code></td>' +
      '<td>' + p.solicitante + '</td>' +
      '<td>' + p.fecha + '</td>' +
      '<td>' + itemsTxt + '</td>' +
      '<td>' +
        '<span class="status-badge ' + badgeClass + '"><span class="dot"></span> ' + label + (warnSVG ? ' ' + warnSVG : '') + (reenvioSVG ? ' ' + reenvioSVG : '') + '</span>' +
        (p.status === 'por-confirmar'
          ? ' <button class="btn-confirm-row-envio" onclick="event.stopPropagation(); confirmarDesdeTabla(\'' + p.code + '\')">' +
              '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>' +
              '</svg>' +
            '</button>'
          : p.status === 'recibido-parcial'
          ? ' <button class="btn-confirm-row-reenvio" onclick="event.stopPropagation(); confirmarDesdeTabla(\'' + p.code + '\')">' +
              '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>' +
              '</svg>' +
            '</button>'
          : '') +
      '</td>' +
      '<td><svg width="16" height="16" fill="none" stroke="#8b8fa3" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>' +
      '</svg></td>' +
    '</tr>'
  }).join('');
}

// =============================================================
// Mostrar detalle de un pedido (UC17)
// =============================================================
function showDetalle(code) {
  var p = pedidos.find(function (x) { return x.code === code; });
  if (!p) return;
  pedidoActual = p;

  // Breadcrumb 3 niveles
  document.getElementById('breadcrumbMid').style.display = 'inline-flex';
  document.getElementById('breadcrumbCurrent').textContent = code;

  // Cabecera
  document.getElementById('detallePedCode').textContent = p.code;
  document.getElementById('detalleSolicitante').textContent = p.solicitante;
  document.getElementById('detalleFecha').textContent = p.fecha;

  // Badge de estado (header + card)
  var hasAnomalia = (p.status === 'por-confirmar' && hasStockAnomalia(p.code)) ||
                    ((p.status === 'por-despachar' || p.status === 'empacado') && !p.faltanteConfirmado && hasConfirmedAnomalia(p.code)) ||
                    p.status === 'recibido-parcial';
  var badgeClass  = (hasAnomalia && p.status !== 'recibido-parcial') ? p.status + '-anomalia' : p.status;
  var badgeLabel  = statusLabels[p.status] || p.status;
  var warnSVG     = hasAnomalia
    ? '<svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>'
    : '';
  var reenvioSVG  = (p.status === 'por-despachar' && p.faltanteConfirmado)
    ? ' <svg class="reenvio-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>'
    : '';

  var badge = document.getElementById('detalleStatusBadge');
  badge.className = 'status-badge ' + badgeClass;
  badge.innerHTML = '<span class="dot"></span> <span id="detalleStatusLabel">' + badgeLabel + '</span>' + (warnSVG ? ' ' + warnSVG : '') + reenvioSVG;
  var cardBadge = document.getElementById('detalleStatusCard');
  cardBadge.className = 'status-badge ' + badgeClass;
  cardBadge.innerHTML = '<span class="dot"></span> <span id="detalleStatusCardLabel">' + badgeLabel + '</span>' + (warnSVG ? ' ' + warnSVG : '') + reenvioSVG;

  // Botones de acción en header
  document.getElementById('btnConfirmarHeader').style.display = p.status === 'por-confirmar'   ? '' : 'none';
  document.getElementById('btnReenviarHeader').style.display  = p.status === 'recibido-parcial' ? '' : 'none';

  // Tabla de ítems
  var items = detalleItems[p.code] || [];
  var thead  = document.getElementById('detalleItemsThead');
  var tbody  = document.getElementById('detalleItemsTbody');

  if (p.status === 'por-confirmar') {
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cantidad sol.</th><th>Stock disponible</th></tr>';
    tbody.innerHTML = items.map(function (it) {
      var stockStyle, stockText;
      if (it.stock === 0) {
        stockStyle = 'color:#ef4444; font-weight:600;';
        stockText  = '0 und';
      } else if (it.stock < it.qty) {
        stockStyle = 'color:#f59e0b; font-weight:600;';
        stockText  = it.stock + ' und';
      } else {
        stockStyle = 'color:#16a34a; font-weight:500;';
        stockText  = it.stock + ' und';
      }
      return '<tr>' +
        '<td><code>' + it.code + '</code></td>' +
        '<td>' + it.desc + '</td>' +
        '<td>' + it.qty + ' und</td>' +
        '<td style="' + stockStyle + '">' + stockText + '</td>' +
      '</tr>';
    }).join('');
  } else if (p.status === 'recibido-parcial') {
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. sol.</th><th>Cant. recibida</th><th>Cant. pendiente</th></tr>';
    tbody.innerHTML = items.map(function (it) {
      var pendiente  = it.qty - (it.confirmed || 0);
      var recibStyle = it.confirmed === 0   ? 'color:#ef4444; font-weight:600;'
                     : it.confirmed < it.qty ? 'color:#f59e0b; font-weight:600;'
                     : 'color:#16a34a; font-weight:500;';
      var pendStyle  = pendiente === 0   ? 'color:#16a34a; font-weight:500;'
                     : it.confirmed === 0 ? 'color:#ef4444; font-weight:600;'
                     : 'color:#f59e0b; font-weight:600;';
      return '<tr>' +
        '<td><code>' + it.code + '</code></td>' +
        '<td>' + it.desc + '</td>' +
        '<td>' + it.qty + ' und</td>' +
        '<td style="' + recibStyle + '">' + (it.confirmed || 0) + ' und</td>' +
        '<td style="' + pendStyle  + '">' + pendiente + ' und</td>' +
      '</tr>';
    }).join('');
  } else if (p.faltanteConfirmado) {
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. sol.</th><th>Cant. recibida</th><th>Cant. pendiente confirmada</th></tr>';
    tbody.innerHTML = items.map(function (it) {
      var pendiente  = it.qty - (it.confirmed || 0);
      var recibStyle = it.confirmed === 0   ? 'color:#ef4444; font-weight:600;'
                     : it.confirmed < it.qty ? 'color:#f59e0b; font-weight:600;'
                     : 'color:#16a34a; font-weight:500;';
      return '<tr>' +
        '<td><code>' + it.code + '</code></td>' +
        '<td>' + it.desc + '</td>' +
        '<td>' + it.qty + ' und</td>' +
        '<td style="' + recibStyle + '">' + (it.confirmed || 0) + ' und</td>' +
        '<td style="color:#16a34a; font-weight:500;">' + (pendiente > 0 ? pendiente + ' und' : '—') + '</td>' +
      '</tr>';
    }).join('');
  } else {
    thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. solicitada</th><th>Cant. confirmada</th></tr>';
    tbody.innerHTML = items.map(function (it) {
      var confStyle, confText;
      if (it.confirmed === undefined) {
        confStyle = ''; confText = '—';
      } else if (it.confirmed === 0) {
        confStyle = 'color:#ef4444; font-weight:600;'; confText = '0 und';
      } else if (it.confirmed < it.qty) {
        confStyle = 'color:#f59e0b; font-weight:600;'; confText = it.confirmed + ' und';
      } else {
        confStyle = 'color:#16a34a; font-weight:500;'; confText = it.confirmed + ' und';
      }
      return '<tr>' +
        '<td><code>' + it.code + '</code></td>' +
        '<td>' + it.desc + '</td>' +
        '<td>' + it.qty + ' und</td>' +
        '<td style="' + confStyle + '">' + confText + '</td>' +
      '</tr>';
    }).join('');
  }

  // Tarjeta de acción siempre oculta (botón está en el header)
  document.getElementById('confirmEnvioCard').style.display = 'none';

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
  document.getElementById('breadcrumbMid').style.display = 'none';
  document.getElementById('breadcrumbCurrent').textContent = 'Solicitudes de repuestos';
  document.getElementById('viewDetalle').style.display = 'none';
  document.getElementById('viewLista').style.display   = '';
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
// Modal confirmar envío (UC18)
// =============================================================
function abrirModalConfirmar() {
  if (!pedidoActual) return;

  var items     = detalleItems[pedidoActual.code] || [];
  var isReenvio = pedidoActual.status === 'recibido-parcial';

  // Actualizar textos del modal
  document.getElementById('modalConfirmTitle').textContent    = isReenvio
    ? 'Confirmar envío faltante'
    : 'Confirmar envío del pedido';
  document.getElementById('modalConfirmSubtitle').textContent = isReenvio
    ? 'Verifique los ítems pendientes antes de confirmar el nuevo despacho'
    : 'Verifique los ítems antes de confirmar el despacho';
  document.getElementById('modalConfirmBtnText').textContent  = isReenvio
    ? 'Confirmar envío faltante'
    : 'Confirmar envío';

  // Actualizar ícono y color del botón confirm
  var btnConfirm = document.getElementById('btnModalConfirm');
  if (isReenvio) {
    btnConfirm.style.background  = 'linear-gradient(135deg, #0284c7, #0369a1)';
    btnConfirm.style.boxShadow   = '0 4px 12px rgba(2,132,199,0.35)';
    btnConfirm.querySelector('svg path').setAttribute('d', 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15');
  } else {
    btnConfirm.style.background  = 'linear-gradient(135deg, #6c63ff, #5a50dc)';
    btnConfirm.style.boxShadow   = '0 4px 12px rgba(108,99,255,0.35)';
    btnConfirm.querySelector('svg path').setAttribute('d', 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4');
  }

  // Actualizar ícono del header del modal
  var modalHeaderIcon = document.querySelector('#confirmEnvioModal .modal-header-icon');
  if (isReenvio) {
    modalHeaderIcon.style.background = 'linear-gradient(135deg, rgba(2,132,199,0.12), rgba(3,105,161,0.08))';
    modalHeaderIcon.style.color      = '#0284c7';
    modalHeaderIcon.querySelector('svg path').setAttribute('d', 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15');
  } else {
    modalHeaderIcon.style.background = 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(90,80,220,0.08))';
    modalHeaderIcon.style.color      = '#6c63ff';
    modalHeaderIcon.querySelector('svg path').setAttribute('d', 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4');
  }

  if (isReenvio) {
    // Solo ítems con entrega pendiente
    var pending = items.filter(function (it) { return (it.confirmed || 0) < it.qty; });
    document.getElementById('modalEnvioThead').innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. pendiente</th><th>Stock disponible</th></tr>';
    document.getElementById('modalEnvioTbody').innerHTML = pending.map(function (it) {
      var pendiente = it.qty - (it.confirmed || 0);
      var stockStyle, stockText;
      if (it.stock === 0) {
        stockStyle = 'color:#ef4444; font-weight:600;'; stockText = '0 und';
      } else if (it.stock < pendiente) {
        stockStyle = 'color:#f59e0b; font-weight:600;'; stockText = it.stock + ' und';
      } else {
        stockStyle = 'color:#16a34a; font-weight:500;'; stockText = it.stock + ' und';
      }
      return '<tr>' +
        '<td><code>' + it.code + '</code></td>' +
        '<td>' + it.desc + '</td>' +
        '<td>' + pendiente + ' und</td>' +
        '<td style="' + stockStyle + '">' + stockText + '</td>' +
      '</tr>';
    }).join('');
  } else {
    document.getElementById('modalEnvioThead').innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. solicitada</th><th>Stock disponible</th></tr>';
    document.getElementById('modalEnvioTbody').innerHTML = items.map(function (it) {
      var stockStyle, stockText;
      if (it.stock === 0) {
        stockStyle = 'color:#ef4444; font-weight:600;'; stockText = '0 und';
      } else if (it.stock < it.qty) {
        stockStyle = 'color:#f59e0b; font-weight:600;'; stockText = it.stock + ' und';
      } else {
        stockStyle = 'color:#16a34a; font-weight:500;'; stockText = it.stock + ' und';
      }
      return '<tr>' +
        '<td><code>' + it.code + '</code></td>' +
        '<td>' + it.desc + '</td>' +
        '<td>' + it.qty + ' und</td>' +
        '<td style="' + stockStyle + '">' + stockText + '</td>' +
      '</tr>';
    }).join('');
  }

  // Bloquear botón si todos los ítems pendientes tienen stock 0
  var sinStock = isReenvio && pending && pending.length > 0 &&
    pending.every(function (it) { return it.stock === 0; });
  btnConfirm.disabled = sinStock;
  document.getElementById('modalStockAlert').style.display = sinStock ? 'flex' : 'none';

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

  var wasReenvio = pedidoActual.status === 'recibido-parcial';

  // Actualizar estado en memoria
  pedidoActual.status = 'por-despachar';
  if (wasReenvio) pedidoActual.faltanteConfirmado = true;

  // Cerrar modal
  cerrarModalConfirmar();

  // Si estamos en la vista detalle, actualizar sus badges y botones
  if (document.getElementById('viewDetalle').style.display !== 'none') {
    var badge = document.getElementById('detalleStatusBadge');
    var reenvioSVG = wasReenvio
      ? ' <svg class="reenvio-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>'
      : '';
    badge.className = 'status-badge por-despachar';
    badge.innerHTML = '<span class="dot"></span> <span id="detalleStatusLabel">Por despachar</span>' + reenvioSVG;
    var cardBadge = document.getElementById('detalleStatusCard');
    cardBadge.className = 'status-badge por-despachar';
    cardBadge.innerHTML = '<span class="dot"></span> <span id="detalleStatusCardLabel">Por despachar</span>' + reenvioSVG;
    document.getElementById('btnConfirmarHeader').style.display = 'none';
    document.getElementById('btnReenviarHeader').style.display  = 'none';
    document.getElementById('confirmEnvioCard').style.display   = 'none';

    // Actualizar tabla de ítems si era faltante
    if (wasReenvio) {
      var items    = detalleItems[pedidoActual.code] || [];
      var thead    = document.getElementById('detalleItemsThead');
      var tbody    = document.getElementById('detalleItemsTbody');
      thead.innerHTML = '<tr><th>Código</th><th>Descripción</th><th>Cant. sol.</th><th>Cant. recibida</th><th>Cant. pendiente confirmada</th></tr>';
      tbody.innerHTML = items.map(function (it) {
        var pendiente  = it.qty - (it.confirmed || 0);
        var recibStyle = it.confirmed === 0   ? 'color:#ef4444; font-weight:600;'
                       : it.confirmed < it.qty ? 'color:#f59e0b; font-weight:600;'
                       : 'color:#16a34a; font-weight:500;';
        return '<tr>' +
          '<td><code>' + it.code + '</code></td>' +
          '<td>' + it.desc + '</td>' +
          '<td>' + it.qty + ' und</td>' +
          '<td style="' + recibStyle + '">' + (it.confirmed || 0) + ' und</td>' +
          '<td style="color:#16a34a; font-weight:500;">' + (pendiente > 0 ? pendiente + ' und' : '—') + '</td>' +
        '</tr>';
      }).join('');
    }
  }

  // Mostrar toast
  var toastText = wasReenvio
    ? 'Envío faltante confirmado · ' + pedidoActual.code + ' marcado como Por despachar'
    : 'Envío confirmado · '           + pedidoActual.code + ' marcado como Por despachar';
  document.getElementById('toastMsg').textContent = toastText;
  showToast();

  // Re-renderizar tabla y tabs
  renderPedidos();
  renderTabs();
}

// =============================================================
// Init
// =============================================================
document.addEventListener('DOMContentLoaded', function () {
  var hoy    = new Date();
  var hace30 = new Date(hoy);
  hace30.setDate(hoy.getDate() - 30);
  var toISO  = function (d) { return d.toISOString().split('T')[0]; };
  document.getElementById('filterDesde').value = toISO(hace30);
  document.getElementById('filterHasta').value = toISO(hoy);
  renderTabs();
  renderPedidos();
});
