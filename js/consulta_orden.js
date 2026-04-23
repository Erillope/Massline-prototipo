/* === Tabs de estado === */
function setTab(tab) {
  document.querySelectorAll('.estado-tab').forEach(function(t) { t.classList.remove('active'); });
  tab.classList.add('active');
}

/* === Navegación a detalle === */
function goToDetail(code, proveedor, fecha, statusClass, statusLabel, reviewer, reviewDate, confirmer, confirmDate, tipo, valoracionDate, valoracionCode) {
  var url = 'detalle_orden.html?code=' + encodeURIComponent(code)
    + '&proveedor=' + encodeURIComponent(proveedor)
    + '&fecha=' + encodeURIComponent(fecha)
    + '&status=' + encodeURIComponent(statusClass)
    + '&label=' + encodeURIComponent(statusLabel);
  if (reviewer) url += '&reviewer=' + encodeURIComponent(reviewer);
  if (reviewDate) url += '&reviewDate=' + encodeURIComponent(reviewDate);
  if (confirmer) url += '&confirmer=' + encodeURIComponent(confirmer);
  if (confirmDate) url += '&confirmDate=' + encodeURIComponent(confirmDate);
  if (tipo) url += '&tipo=' + encodeURIComponent(tipo);
  if (valoracionDate) url += '&valoracionDate=' + encodeURIComponent(valoracionDate);
  if (valoracionCode) url += '&valoracionCode=' + encodeURIComponent(valoracionCode);
  window.location.href = url;
}

/* === Navegación a revisión === */
function startReview(code, proveedor, items) {
  window.location.href = 'revision_orden.html?code=' + encodeURIComponent(code)
    + '&proveedor=' + encodeURIComponent(proveedor);
}

/* === Registrar llegada a bodega === */
var arrivalOrderCode = '';

function openArrivalModal(code, proveedor, items) {
  arrivalOrderCode = code;
  document.getElementById('modalOrderCode').textContent = code;
  document.getElementById('modalOrderProveedor').textContent = proveedor;
  document.getElementById('modalOrderItems').textContent = items;
  document.getElementById('arrivalModal').classList.add('active');
}

function closeArrivalModal() {
  document.getElementById('arrivalModal').classList.remove('active');
  arrivalOrderCode = '';
}

function confirmArrival() {
  var code = arrivalOrderCode;
  closeArrivalModal();

  // Actualizar fila en la tabla
  var rows = document.querySelectorAll('#ordersTableCard .data-table tbody tr');
  rows.forEach(function(row) {
    var codeCell = row.querySelector('td:first-child code');
    if (codeCell && codeCell.textContent === code) {
      var badge = row.querySelector('.status-badge');
      var statusTd = badge.closest('td');
      statusTd.innerHTML = '<span class="status-badge en-bodega"><span class="dot"></span> En bodega</span> <button class="btn-review" onclick="event.stopPropagation(); startReview(\'' + code + '\',\'' + document.getElementById('modalOrderProveedor').textContent + '\',\'5\')"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg></button>';
      row.setAttribute('onclick', row.getAttribute('onclick').replace("'ingresada','Por llegar'", "'en-bodega','En bodega'"));
    }
  });

  updateTabCounts();

  document.getElementById('toastMessage').textContent = 'La orden ' + code + ' fue registrada en bodega.';
  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Llegada registrada';
  showToast();
}

/* === Confirmar almacenamiento === */
var storageOrderCode = '';

function openStorageModal(code, proveedor, items, tipo) {
  storageOrderCode = code;
  document.getElementById('storageModalCode').textContent = code;
  document.getElementById('storageModalProveedor').textContent = proveedor;
  document.getElementById('storageModalTipo').textContent = tipo || 'Local';
  document.getElementById('storageModalItems').textContent = items;

  // Renderizar productos y cajas
  var container = document.getElementById('storageProductsList');
  var boxes = orderBoxes[code];

  if (!boxes || boxes.length === 0) {
    container.innerHTML = '<div class="storage-no-boxes">No hay datos de cajas disponibles para esta orden.</div>';
  } else {
    var totalBoxes = boxes.reduce(function(s, p) { return s + p.cajas.length; }, 0);
    var html = '<div class="storage-anomalies-header" style="background:#f0f4ff; border-bottom:1.5px solid #dde3f0; color:#3730a3; margin-bottom:10px; border-radius:10px 10px 0 0;">';
    html += '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>';
    html += 'Cajas y posiciones recomendadas (' + totalBoxes + ' cajas)';
    html += '</div>';
    boxes.forEach(function(prod) {
      var totalQty = prod.cajas.reduce(function(s, c) { return s + c.qty; }, 0);
      html += '<div class="storage-product-item">';
      html += '<div class="storage-product-header">';
      var mlInfo = (typeof artToMassline !== 'undefined' && artToMassline[prod.codigo]) ? artToMassline[prod.codigo] : null;
      var mlCode = mlInfo ? mlInfo.code : prod.codigo;
      var mlDesc = mlInfo ? mlInfo.desc : '';
      html += '<span class="storage-product-code ml-code-badge">' + mlCode + '</span>';
      if (mlDesc) html += '<span class="storage-product-name">' + mlDesc + '</span>';
      html += '<span class="storage-product-qty">' + totalQty + ' uds · ' + prod.cajas.length + ' caja' + (prod.cajas.length > 1 ? 's' : '') + '</span>';
      html += '</div>';
      html += '<div class="storage-box-list">';
      prod.cajas.forEach(function(caja) {
        var pos = getRecommendedPosition(caja.code);
        html += '<div class="storage-box-row">';
        html += '<span class="storage-box-code">' + caja.code + '</span>';
        html += '<span class="storage-box-qty">' + caja.qty + ' uds</span>';
        html += '<span class="storage-box-position"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ' + pos + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
  }

  // Renderizar anomalías si existen
  var anomSection = document.getElementById('storageAnomaliesSection');
  var anomalies = orderAnomalies[code];
  if (anomalies && anomalies.length > 0) {
    var anomHtml = '<div class="storage-anomalies-section">';
    anomHtml += '<div class="storage-anomalies-header">';
    anomHtml += '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
    anomHtml += 'Anomalías registradas (' + anomalies.length + ')';
    anomHtml += '</div>';
    anomalies.forEach(function(a) {
      var faltante = a.esperado - a.recibido;
      anomHtml += '<div class="storage-anomaly-item">';
      anomHtml += '<div class="storage-anomaly-product">';
      anomHtml += '<div class="storage-anomaly-product-name">' + a.codigo + ' — ' + a.producto + '</div>';
      anomHtml += '<div class="storage-anomaly-desc">' + a.desc + '</div>';
      if (a.fotos && a.fotos.length > 0) {
        anomHtml += '<div class="storage-anomaly-photos">';
        a.fotos.forEach(function(f, i) {
          anomHtml += '<div class="storage-anomaly-photo-thumb" onclick="event.stopPropagation(); openPhotoLightbox(\'' + f.replace(/'/g, "\\'") + '\')"><img src="' + f + '" alt="Foto ' + (i+1) + '"></div>';
        });
        anomHtml += '</div>';
      }
      anomHtml += '</div>';
      anomHtml += '<div class="storage-anomaly-stats">';
      if (faltante > 0) {
        anomHtml += '<span class="storage-anomaly-stat faltante"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg> ' + faltante + ' faltantes</span>';
      }
      if (a.danados > 0) {
        anomHtml += '<span class="storage-anomaly-stat danado"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg> ' + a.danados + ' dañados</span>';
      }
      if (a.fotos && a.fotos.length > 0) {
        anomHtml += '<button class="storage-anomaly-photo-btn" onclick="event.stopPropagation(); openPhotoLightbox(\'' + a.fotos[0].replace(/'/g, "\\'") + '\')"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> ' + a.fotos.length + ' foto' + (a.fotos.length > 1 ? 's' : '') + '</button>';
      }
      anomHtml += '</div>';
      anomHtml += '</div>';
    });
    anomHtml += '</div>';
    anomSection.innerHTML = anomHtml;
    anomSection.style.display = '';
  } else {
    anomSection.innerHTML = '';
    anomSection.style.display = 'none';
  }

  // Bloquear confirmación si es Local con anomalías
  var confirmBtn = document.querySelector('#storageModal .btn-modal-confirm');
  var blockedMsg = document.getElementById('storageBlockedMsg');
  var isLocalWithAnomalies = (tipo === 'Local') && anomalies && anomalies.length > 0;

  if (isLocalWithAnomalies) {
    confirmBtn.disabled = true;
    confirmBtn.style.opacity = '0.45';
    confirmBtn.style.cursor = 'not-allowed';
    if (!blockedMsg) {
      blockedMsg = document.createElement('div');
      blockedMsg.id = 'storageBlockedMsg';
      confirmBtn.parentNode.insertBefore(blockedMsg, confirmBtn);
    }
    blockedMsg.className = 'storage-blocked-msg';
    blockedMsg.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg> Las anomalías deben resolverse antes de almacenar órdenes locales.';
    blockedMsg.style.display = '';
  } else {
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = '';
    confirmBtn.style.cursor = '';
    if (blockedMsg) blockedMsg.style.display = 'none';
  }

  document.getElementById('storageModal').classList.add('active');
}

function closeStorageModal() {
  document.getElementById('storageModal').classList.remove('active');
  storageOrderCode = '';
}

function confirmStorage() {
  var code = storageOrderCode;
  closeStorageModal();

  var hadAnomaly = false;

  // Actualizar fila en la tabla
  var rows = document.querySelectorAll('#ordersTableCard .data-table tbody tr');
  rows.forEach(function(row) {
    var codeCell = row.querySelector('td:first-child code');
    if (codeCell && codeCell.textContent === code) {
      var oldBadge = row.querySelector('.status-badge');
      hadAnomaly = oldBadge && oldBadge.classList.contains('revisada-anomalia');
      var statusTd = oldBadge.closest('td');
      if (hadAnomaly) {
        statusTd.innerHTML = '<span class="status-badge por-almacenar-anomalia"><span class="dot"></span> Por almacenar <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></span>';
      } else {
        statusTd.innerHTML = '<span class="status-badge por-almacenar"><span class="dot"></span> Por almacenar</span>';
      }

      var newStatus = hadAnomaly ? 'por-almacenar-anomalia' : 'por-almacenar';
      var onclick = row.getAttribute('onclick');
      row.setAttribute('onclick', onclick
        .replace(/'revisada-anomalia'/g, "'" + newStatus + "'")
        .replace(/'revisada'/g, "'" + newStatus + "'")
        .replace(/'Revisada'/g, "'Por almacenar'"));
    }
  });

  updateTabCounts();

  document.getElementById('toastMessage').textContent = 'La orden ' + code + ' fue marcada para almacenar.';
  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Almacenamiento confirmado';
  showToast();
}

/* === Valorar orden desde lista === */
var listValoracionOrderCode = '';
var listValoracionFileUploaded = false;

function openListValoracionModal(code, proveedor) {
  listValoracionOrderCode = code;
  listValoracionFileUploaded = false;
  document.getElementById('listValoracionCode').textContent = code;
  document.getElementById('listValoracionProveedor').textContent = proveedor;
  document.getElementById('listValoracionCodigo').value = '';
  document.getElementById('listValoracionUploadContent').style.display = '';
  document.getElementById('listValoracionFileInfo').style.display = 'none';
  document.getElementById('listValoracionConfirmBtn').disabled = true;
  document.getElementById('listValoracionModal').classList.add('active');
}

function closeListValoracionModal() {
  document.getElementById('listValoracionModal').classList.remove('active');
  listValoracionOrderCode = '';
  listValoracionFileUploaded = false;
}

function handleListValoracionFile(input) {
  if (input.files && input.files[0]) {
    listValoracionFileUploaded = true;
    document.getElementById('listValoracionFileName').textContent = input.files[0].name;
    document.getElementById('listValoracionUploadContent').style.display = 'none';
    document.getElementById('listValoracionFileInfo').style.display = 'flex';
    var zone = document.getElementById('listValoracionUploadZone');
    zone.style.borderColor = '#D916A8';
    zone.style.background = '#fdf4ff';
    checkListValoracionForm();
  }
}

function removeListValoracionFile() {
  listValoracionFileUploaded = false;
  document.getElementById('listValoracionFileInput').value = '';
  document.getElementById('listValoracionUploadContent').style.display = '';
  document.getElementById('listValoracionFileInfo').style.display = 'none';
  var zone = document.getElementById('listValoracionUploadZone');
  zone.style.borderColor = '';
  zone.style.background = '';
  checkListValoracionForm();
}

function checkListValoracionForm() {
  var code = document.getElementById('listValoracionCodigo').value.trim();
  document.getElementById('listValoracionConfirmBtn').disabled = !(code.length > 0 && listValoracionFileUploaded);
}

function confirmListValoracion() {
  var code = listValoracionOrderCode;
  var valCode = document.getElementById('listValoracionCodigo').value.trim();
  closeListValoracionModal();

  // Agregar entrada al historial
  if (typeof orderHistory !== 'undefined' && orderHistory[code]) {
    var now = new Date();
    var dd = String(now.getDate()).padStart(2, '0');
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var yyyy = now.getFullYear();
    var hh = String(now.getHours()).padStart(2, '0');
    var mi = String(now.getMinutes()).padStart(2, '0');
    var dateStr = dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + mi;
    orderHistory[code].push({
      type: 'valoracion',
      date: dateStr,
      user: 'Usuario Sistema',
      desc: 'Orden valorada con código ' + valCode + '.'
    });
  }

  // Actualizar fila en la tabla
  var rows = document.querySelectorAll('#ordersTableCard .data-table tbody tr');
  rows.forEach(function(row) {
    var codeCell = row.querySelector('td:first-child code');
    if (codeCell && codeCell.textContent === code) {
      var oldBadge = row.querySelector('.status-badge');
      var hadAnomaly = oldBadge && (oldBadge.classList.contains('almacenada-anomalia'));
      var statusTd = oldBadge.closest('td');
      if (hadAnomaly) {
        statusTd.innerHTML = '<span class="status-badge valorada-anomalia"><span class="dot"></span> Valorada <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></span>';
      } else {
        statusTd.innerHTML = '<span class="status-badge valorada"><span class="dot"></span> Valorada</span>';
      }

      var newStatus = hadAnomaly ? 'valorada-anomalia' : 'valorada';
      var onclick = row.getAttribute('onclick');
      row.setAttribute('onclick', onclick
        .replace(/'almacenada-anomalia'/g, "'" + newStatus + "'")
        .replace(/'almacenada'/g, "'" + newStatus + "'")
        .replace(/'Almacenada'/g, "'Valorada'"));
    }
  });

  updateTabCounts();

  document.getElementById('toastMessage').textContent = 'La orden ' + code + ' fue valorada exitosamente.';
  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Valoración confirmada';
  showToast();
}

/* === Contadores de tabs === */
function updateTabCounts() {
  var rows = document.querySelectorAll('#ordersTableCard .data-table tbody tr');
  var total = 0, enBodega = 0, conAnomalias = 0, revisada = 0, porAlmacenar = 0, almacenada = 0, valorada = 0, porLlegar = 0;
  rows.forEach(function(row) {
    var badge = row.querySelector('.status-badge');
    if (!badge) return;
    total++;
    var cls = badge.className;
    if (cls.includes('en-bodega')) enBodega++;
    if (cls.includes('revisada-anomalia') || cls.includes('almacenada-anomalia') || cls.includes('por-almacenar-anomalia') || cls.includes('valorada-anomalia')) conAnomalias++;
    if (cls.includes('revisada')) revisada++;
    if (cls.includes('por-almacenar')) porAlmacenar++;
    if (cls.includes('almacenada') && !cls.includes('almacenada-anomalia')) almacenada++;
    if (cls.includes('almacenada-anomalia')) almacenada++;
    if (cls.includes('valorada') && !cls.includes('valorada-anomalia')) valorada++;
    if (cls.includes('valorada-anomalia')) valorada++;
    if (cls.includes('ingresada')) porLlegar++;
  });

  var tabs = document.querySelectorAll('.estado-tab');
  tabs.forEach(function(tab) {
    var text = tab.childNodes[0].textContent.trim();
    var countEl = tab.querySelector('.tab-count');
    if (!countEl) return;
    if (text.startsWith('Todos')) countEl.textContent = total;
    else if (text.startsWith('En bodega')) countEl.textContent = enBodega;
    else if (text.startsWith('Con anomalías')) countEl.textContent = conAnomalias;
    else if (text.startsWith('Revisada')) countEl.textContent = revisada;
    else if (text.startsWith('Por almacenar')) countEl.textContent = porAlmacenar;
    else if (text.startsWith('Almacenada')) countEl.textContent = almacenada;
    else if (text.startsWith('Valorada')) countEl.textContent = valorada;
    else if (text.startsWith('Por llegar')) countEl.textContent = porLlegar;
  });
}

/* === Modo simulación de flujos === */
var simMode = 0;
var modeLabels = ['Normal', 'No encontrada', 'Sin órdenes'];
var modeClasses = ['', 'mode-1', 'mode-2'];

function applySimMode() {
  var tableCard = document.getElementById('ordersTableCard');
  var notFoundCard = document.getElementById('notFoundCard');
  var noOrdersCard = document.getElementById('noOrdersCard');
  var headerRight = document.querySelector('.card-header-right');
  var estadoTabs = document.querySelector('.estado-tabs');

  tableCard.style.display = 'none';
  notFoundCard.style.display = 'none';
  noOrdersCard.style.display = 'none';

  if (simMode === 0) {
    tableCard.style.display = '';
    headerRight.textContent = '9 órdenes encontradas';
    estadoTabs.style.display = '';
  } else if (simMode === 1) {
    notFoundCard.style.display = '';
    headerRight.textContent = '0 órdenes encontradas';
    estadoTabs.style.display = '';
  } else if (simMode === 2) {
    noOrdersCard.style.display = '';
    headerRight.textContent = '0 órdenes encontradas';
    estadoTabs.style.display = 'none';
  }
}

function toggleSimMode() {
  simMode = (simMode + 1) % 3;
  var btn = document.getElementById('btnToggleMode');
  btn.className = 'toggle-error-mode ' + modeClasses[simMode];
  btn.querySelector('.mode-label').textContent = modeLabels[simMode];
  btn.title = 'Modo: ' + modeLabels[simMode] + ' (clic para cambiar)';
  applySimMode();
}

/* === Leer toast desde URL params (retorno de otras páginas) === */
document.addEventListener('DOMContentLoaded', function() {
  var params = new URLSearchParams(window.location.search);
  var toast = params.get('toast');
  var code = params.get('code');
  var anomalies = params.get('anomalies');

  if (toast && code) {
    var title = '';
    var msg = '';
    if (toast === 'arrival') {
      title = 'Llegada registrada';
      msg = 'La orden ' + code + ' fue registrada en bodega.';
    } else if (toast === 'review') {
      title = 'Revisión completada';
      if (anomalies && parseInt(anomalies) > 0) {
        msg = 'La orden ' + code + ' fue revisada con ' + anomalies + ' anomalía(s) registrada(s).';
      } else {
        msg = 'La orden ' + code + ' fue revisada correctamente.';
      }
    } else if (toast === 'storage') {
      title = 'Almacenamiento confirmado';
      msg = 'La orden ' + code + ' fue almacenada exitosamente.';
    }

    if (title) {
      document.getElementById('arrivalToast').querySelector('.toast-title').textContent = title;
      document.getElementById('toastMessage').textContent = msg;
      showToast();
    }

    window.history.replaceState({}, '', window.location.pathname);
  }
});
