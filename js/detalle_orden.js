const warningIconSVG = '<svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';

/* ===== Review Request Mode ===== */
var reviewRequestMode = false;
var reviewRequestData = null;

function formatCLP(n) {
  return '$' + n.toLocaleString('es-CL');
}

function parseDateDDMMYYYY(str) {
  const parts = str.trim().split(' ');
  const d = parts[0].split('/');
  const t = parts[1] ? parts[1].split(':') : ['0','0'];
  return new Date(parseInt(d[2]), parseInt(d[1])-1, parseInt(d[0]), parseInt(t[0]), parseInt(t[1]));
}

function calcAlmacenamientoTimeLabel(llegadaDateStr, almacenadaDateStr) {
  const from = parseDateDDMMYYYY(llegadaDateStr);
  const to = parseDateDDMMYYYY(almacenadaDateStr);
  const diffMs = to - from;
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffH = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const parts = [];
  if (diffD > 0) parts.push(diffD + (diffD === 1 ? ' día' : ' días'));
  if (diffH > 0) parts.push(diffH + ' h');
  if (diffM > 0) parts.push(diffM + ' min');
  if (!parts.length) return 'Almacenada al instante';
  return 'Almacenada en ' + parts.join(', ');
}

function calcValoracionTimeLabel(fechaStr, valoracionDateStr) {
  const from = parseDateDDMMYYYY(fechaStr);
  const to = parseDateDDMMYYYY(valoracionDateStr);
  const diffMs = to - from;
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffH = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const parts = [];
  if (diffD > 0) parts.push(diffD + (diffD === 1 ? ' día' : ' días'));
  if (diffH > 0) parts.push(diffH + ' h');
  if (diffM > 0) parts.push(diffM + ' min');
  if (!parts.length) return 'Valorada al instante';
  return 'Valorada dentro de ' + parts.join(', ');
}

let detailParams = {};
let currentDetailStatusClass = '';

/* === Inicializar vista desde URL params === */
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code') || '—';
  const catalog = (typeof orderCatalog !== 'undefined' && orderCatalog[code]) ? orderCatalog[code] : {};

  detailParams = {
    code: code,
    proveedor: params.get('proveedor') || catalog.proveedor || '—',
    fecha: params.get('fecha') || catalog.fecha || '—',
    status: params.get('status') || catalog.status || 'en-bodega',
    label: params.get('label') || catalog.label || 'En bodega',
    reviewer: params.get('reviewer') || catalog.reviewer || '',
    reviewDate: params.get('reviewDate') || catalog.reviewDate || '',
    confirmer: params.get('confirmer') || catalog.confirmer || '',
    confirmDate: params.get('confirmDate') || catalog.confirmDate || '',
    tipo: params.get('tipo') || catalog.tipo || '',
    valoracionDate: params.get('valoracionDate') || catalog.valoracionDate || '',
    valoracionCode: params.get('valoracionCode') || catalog.valoracionCode || ''
  };
  loadDetail(detailParams);

  // Review request mode (from solicitudes de edición)
  var reviewRequestId = params.get('reviewMode');
  if (reviewRequestId) {
    enterReviewMode(reviewRequestId);
  }

  // Record review edit in history if coming back from revision
  if (params.get('reviewEdited') === '1') {
    addHistoryEntry('edicion-revision', 'Revisión editada por el usuario.');
  }
});

function loadDetail(p) {
  const hasAnomalias = (p.status === 'almacenada-anomalia' || p.status === 'revisada-anomalia' || p.status === 'por-almacenar-anomalia' || p.status === 'valorada-anomalia');

  // Header
  document.getElementById('detailCode').textContent = p.code;
  const headerBadge = document.getElementById('detailStatusBadge');
  headerBadge.className = 'status-badge ' + p.status;
  document.getElementById('detailStatusText').innerHTML = p.label + (hasAnomalias ? ' ' + warningIconSVG : '');

  // Info
  document.getElementById('detailInfoCode').textContent = p.code;
  document.getElementById('detailInfoProveedor').textContent = p.proveedor;
  document.getElementById('detailInfoFecha').textContent = p.fecha;
  if (p.tipo) {
    document.getElementById('detailTipoField').style.display = '';
    document.getElementById('detailInfoTipo').textContent = p.tipo;
  } else {
    document.getElementById('detailTipoField').style.display = 'none';
  }
  const isValoradaForCode = (p.status === 'valorada' || p.status === 'valorada-anomalia');
  if (isValoradaForCode && p.valoracionCode) {
    document.getElementById('detailValoracionCodeField').style.display = '';
    document.getElementById('detailInfoValoracionCode').textContent = p.valoracionCode;
  } else {
    document.getElementById('detailValoracionCodeField').style.display = 'none';
  }
  const infoBadge = document.getElementById('detailInfoStatus');
  infoBadge.className = 'status-badge ' + p.status;
  document.getElementById('detailInfoStatusText').innerHTML = p.label + (hasAnomalias ? ' ' + warningIconSVG : '');

  // Anomaly report doc
  if (hasAnomalias) {
    document.getElementById('detailAnomalyReportDoc').style.display = 'flex';
    document.getElementById('detailAnomalyReportCode').textContent = p.code;
  } else {
    document.getElementById('detailAnomalyReportDoc').style.display = 'none';
  }

  // Doc name
  document.getElementById('docExcelName').textContent = 'orden_' + p.code + '.xlsx';

  // Action buttons
  document.getElementById('detailArrivalBtn').style.display = (p.status === 'ingresada') ? 'inline-flex' : 'none';
  document.getElementById('detailReviewBtn').style.display = (p.status === 'en-bodega') ? 'inline-flex' : 'none';
  document.getElementById('detailEditReviewBtn').style.display = (p.status === 'revisada' || p.status === 'revisada-anomalia') ? 'inline-flex' : 'none';
  document.getElementById('detailStoreBtn').style.display = (p.status === 'revisada' || p.status === 'revisada-anomalia') ? 'inline-flex' : 'none';

  // Block action buttons when emergency edit request is pending
  var _pendingMsg = 'Hay una solicitud de edición pendiente de aprobación del supervisor';
  ['detailArrivalBtn','detailReviewBtn','detailEditReviewBtn','detailStoreBtn'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      if (emergencyPendingRequest && el.style.display !== 'none') {
        el.disabled = true;
        el.title = _pendingMsg;
        el.classList.add('btn-pending-lock');
      } else {
        el.disabled = false;
        el.title = '';
        el.classList.remove('btn-pending-lock');
      }
    }
  });

  // Almacenamiento time indicator
  const isAlmacenadaStatus = (p.status === 'almacenada' || p.status === 'almacenada-anomalia' || p.status === 'valorada' || p.status === 'valorada-anomalia');
  const almTimeEl = document.getElementById('detailAlmacenamientoTime');
  const histEntries = orderHistory[p.code] || [];
  const llegadaEntry = histEntries.find(function(e) { return e.type === 'llegada'; });
  const almacenadaEntry = histEntries.slice().reverse().find(function(e) { return e.type === 'almacenada'; });
  if (isAlmacenadaStatus && llegadaEntry && almacenadaEntry) {
    document.getElementById('detailAlmacenamientoTimeText').textContent = calcAlmacenamientoTimeLabel(llegadaEntry.date, almacenadaEntry.date);
    almTimeEl.style.display = 'inline-flex';
  } else {
    almTimeEl.style.display = 'none';
  }

  // Valoración time indicator
  const isValoradaStatus = (p.status === 'valorada' || p.status === 'valorada-anomalia');
  const timeEl = document.getElementById('detailValoracionTime');
  if (isValoradaStatus && p.valoracionDate && p.fecha && p.fecha !== '—') {
    document.getElementById('detailValoracionTimeText').textContent = calcValoracionTimeLabel(p.fecha, p.valoracionDate);
    timeEl.style.display = 'inline-flex';
  } else {
    timeEl.style.display = 'none';
  }

  // Push the first visible chip to the right; status badge follows with fixed gap
  const anyChip = isAlmacenadaStatus || isValoradaStatus;
  almTimeEl.style.marginLeft = isAlmacenadaStatus ? 'auto' : '';
  timeEl.style.marginLeft = (!isAlmacenadaStatus && isValoradaStatus) ? 'auto' : '';
  headerBadge.style.marginLeft = anyChip ? '10px' : 'auto';


  currentDetailStatusClass = p.status;
  renderDetailProductTable(p.code);
  renderHistory(p.code);

  // Emergency edit button state
  var emergencyBtn = document.getElementById('detailEmergencyBtn');
  if (emergencyBtn) {
    emergencyBtn.disabled = emergencyPendingRequest;
    emergencyBtn.classList.toggle('pending', emergencyPendingRequest);
    emergencyBtn.style.display = 'inline-flex';
    if (emergencyPendingRequest) {
      emergencyBtn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Solicitud pendiente';
    } else {
      emergencyBtn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Edición de emergencia';
    }
  }
}

function goToReview() {
  var mode = (currentDetailStatusClass === 'revisada' || currentDetailStatusClass === 'revisada-anomalia') ? 'edit' : 'new';
  window.location.href = 'revision_orden.html?code=' + encodeURIComponent(detailParams.code)
    + '&proveedor=' + encodeURIComponent(detailParams.proveedor)
    + '&items=8'
    + '&mode=' + mode;
}

/* === Renderizar tabla de productos === */
let mlEditMode = false;

function renderDetailProductTable(code) {
  if (emergencyEditMode) {
    renderEmergencyProductTable(code);
    return;
  }
  if (reviewRequestMode && reviewRequestData) {
    renderReviewProductTable(reviewRequestData, code);
    return;
  }
  const tbody = document.getElementById('detailProductTableBody');
  const statusClass = currentDetailStatusClass;
  let hasBoxes = !!orderBoxes[code];
  let anomalies = orderAnomalies[code];
  let hasAnomalias = (statusClass === 'revisada-anomalia' || statusClass === 'almacenada-anomalia' || statusClass === 'por-almacenar-anomalia' || statusClass === 'valorada-anomalia');
  const isLocked = (statusClass === 'almacenada' || statusClass === 'almacenada-anomalia' || statusClass === 'por-almacenar' || statusClass === 'por-almacenar-anomalia' || statusClass === 'valorada' || statusClass === 'valorada-anomalia');
  const isValorada = (statusClass === 'valorada' || statusClass === 'valorada-anomalia');
  const isLocal = !!(detailParams.tipo && detailParams.tipo.toLowerCase() === 'local');
  const isRevisadaAnomalia = (statusClass === 'revisada-anomalia');

  // Snapshot overrides for historical view
  let snapshotMlHighlight = false;
  let snapshotUsePrev = false;
  let snapshotAnomalyNew = false;
  let snapshotBoxDiff = false;
  if (snapshotContext) {
    if (snapshotContext.currentType === 'edicion-codigos') snapshotMlHighlight = true;
    if (!snapshotContext.hasCodigosEdit) snapshotUsePrev = true;
    if (!snapshotContext.hasLlegada) hasBoxes = false;
    if (!snapshotContext.hasRevision) {
      anomalies = null;
      hasAnomalias = false;
    } else if (anomalies && anomalies.length > 1 && !snapshotContext.hasRevisionEdit) {
      anomalies = [anomalies[0]];
    }
    if (snapshotContext.currentType === 'edicion-revision') {
      // Compute merged anomaly list with diff types (new/edited/deleted/unchanged)
      var prevAnoms = (typeof orderAnomaliesPrev !== 'undefined' && orderAnomaliesPrev[code]) || [];
      var currAnoms = orderAnomalies[code] || [];
      var mergedAnoms = [];
      currAnoms.forEach(function(a) {
        var prev = prevAnoms.find(function(p) { return p.codigo === a.codigo; });
        if (!prev) {
          mergedAnoms.push(Object.assign({}, a, { _diffType: 'new' }));
        } else if (prev.recibido !== a.recibido || prev.danados !== a.danados || prev.desc !== a.desc) {
          mergedAnoms.push(Object.assign({}, a, { _diffType: 'edited', _prev: prev }));
        } else {
          mergedAnoms.push(Object.assign({}, a, { _diffType: 'unchanged' }));
        }
      });
      prevAnoms.forEach(function(p) {
        var curr = currAnoms.find(function(a) { return a.codigo === p.codigo; });
        if (!curr) {
          mergedAnoms.push(Object.assign({}, p, { _diffType: 'deleted' }));
        }
      });
      if (mergedAnoms.length > 0) {
        snapshotAnomalyNew = true;
        anomalies = mergedAnoms;
        hasAnomalias = true;
      }
    }
    if (snapshotContext.currentType === 'edicion-revision' && typeof orderBoxesPrev !== 'undefined' && orderBoxesPrev[code]) {
      snapshotBoxDiff = true;
    }
  }

  // Choose which ML catalog to use
  var mlCatalogToUse = snapshotUsePrev ? masslineCatalogPrev : masslineCatalog;

  // Show/hide box and anomaly columns
  document.getElementById('detailBoxesColHeader').style.display = hasBoxes ? '' : 'none';
  document.getElementById('detailAnomalyColHeader').style.display = hasAnomalias ? '' : 'none';
  document.getElementById('detailPriceColHeader').style.display = isValorada ? '' : 'none';
  document.getElementById('detailTotalColHeader').style.display = isValorada ? '' : 'none';
  document.getElementById('detailDescFacturaColHeader').style.display = isLocal ? '' : 'none';
  document.getElementById('detailDeleteColHeader').style.display = 'none';

  // Show/hide PO upload zone (only for revisada-anomalia local orders, and not after upload applied)
  const poZone = document.getElementById('poUploadZone');
  if (poZone) {
    poZone.style.display = (isRevisadaAnomalia && isLocal && !snapshotActive && !poUploadApplied) ? '' : 'none';
  }

  // Show/hide edit button
  const editBtn = document.getElementById('detailEditMlBtn');
  if (editBtn) {
    editBtn.style.display = (isLocked || snapshotActive || !isLocal) ? 'none' : 'inline-flex';
    if (emergencyPendingRequest) {
      editBtn.disabled = true;
      editBtn.title = 'Hay una solicitud de edición pendiente de aprobación del supervisor';
      editBtn.classList.add('btn-pending-lock');
    } else {
      editBtn.disabled = false;
      editBtn.title = '';
      editBtn.classList.remove('btn-pending-lock');
    }
  }

  let html = '';
  detailProducts.forEach((prod, idx) => {
    const mlMatch = mlCatalogToUse[idx] || null;
    const prevMatch = masslineCatalogPrev[idx] || null;
    const currMatch = masslineCatalog[idx] || null;
    const mlCode = mlMatch ? mlMatch.code : '';
    const mlDesc = mlMatch ? mlMatch.desc : '';
    const filledClass = mlMatch ? ' filled' : '';
    // Determine if this row changed during edicion-codigos
    const prevCode = prevMatch ? prevMatch.code : '';
    const currCode = currMatch ? currMatch.code : '';
    const wasChanged = snapshotMlHighlight && (prevCode !== currCode);
    html += '<tr>';
    html += '<td>' + prod.num + '</td>';
    if (isLocked || !mlEditMode) {
      // Read-only display
      const mlHlCls = wasChanged ? ' snapshot-highlight' : '';
      var mlCellContent = '';
      var mlDescContent = '';
      if (wasChanged) {
        // Stacked: new on top, old below struck
        var prevDesc = prevMatch ? prevMatch.desc : '';
        var currDesc = currMatch ? currMatch.desc : '';
        mlCellContent = '<div class="ml-diff"><code class="ml-code-badge ml-new">' + currCode + '</code><div class="ml-prev"><code class="ml-code-prev">' + prevCode + '</code></div></div>';
        mlDescContent = '<div class="ml-diff"><span class="ml-desc-readonly ml-new">' + currDesc + '</span><div class="ml-prev"><span class="ml-desc-prev">' + prevDesc + '</span></div></div>';
      } else {
        mlCellContent = mlCode ? '<code class="ml-code-badge">' + mlCode + '</code>' : '<span class="ml-empty">—</span>';
        mlDescContent = mlDesc ? '<span class="ml-desc-readonly">' + mlDesc + '</span>' : '<span class="ml-empty">—</span>';
      }
      html += '<td class="ml-readonly-cell' + mlHlCls + '">' + mlCellContent + '</td>';
      html += '<td class="ml-desc-cell ml-readonly-cell' + mlHlCls + '">' + mlDescContent + '</td>';
    } else {
      // Editable inputs
      html += '<td class="ml-ac-cell"><div class="ml-autocomplete"><input type="text" class="ml-ac-input' + filledClass + '" data-field="code" placeholder="Buscar código..." value="' + mlCode + '" onfocus="showMlDropdown(this)" oninput="filterMassline(this)"><div class="ml-ac-dropdown"></div></div></td>';
      html += '<td class="ml-desc-cell ml-ac-cell"><div class="ml-autocomplete"><input type="text" class="ml-ac-input' + filledClass + '" data-field="desc" placeholder="Buscar descripción..." value="' + mlDesc + '" onfocus="showMlDropdown(this)" oninput="filterMassline(this)"><div class="ml-ac-dropdown"></div></div></td>';
    }
    if (isLocal) html += '<td style="color:#6b7280; font-size:12px;">' + (prod.desc || '—') + '</td>';
    html += '<td>' + prod.cantidad + '</td>';
    if (isValorada) {
      const precioUnit = prod.precioUnitario || 0;
      const precioTotal = precioUnit * prod.cantidad;
      html += '<td style="text-align:right; color:#6b7280;">' + formatCLP(precioUnit) + '</td>';
      html += '<td style="text-align:right; font-weight:500;">' + formatCLP(precioTotal) + '</td>';
    }
    if (hasBoxes) {
      const prodBoxes = (orderBoxes[code] || []).find(b => b.codigo === prod.codigo);
      const prevProdBoxes = snapshotBoxDiff ? ((orderBoxesPrev[code] || []).find(b => b.codigo === prod.codigo) || null) : null;
      let boxHasChanges = false;
      if (prevProdBoxes && prodBoxes) {
        boxHasChanges = prodBoxes.cajas.some(function(c) {
          var p = prevProdBoxes.cajas.find(function(pc) { return pc.code === c.code; });
          return !p || p.qty !== c.qty;
        }) || prevProdBoxes.cajas.some(function(pc) {
          return !prodBoxes.cajas.some(function(c) { return c.code === pc.code; });
        });
      }
      if (prodBoxes) {
        html += '<td style="text-align:center;"><button class="btn-view-boxes' + (boxHasChanges ? ' snapshot-new' : '') + '" onclick="toggleDetailBoxes(\'' + prod.codigo + '\', this)" title="Ver cajas"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg><span class="detail-box-badge">' + prodBoxes.cajas.length + '</span></button>';
        if (boxHasChanges) html += '<span class="snapshot-new-badge">Editado</span>';
        html += '</td>';
      } else {
        html += '<td></td>';
      }
    }
    if (hasAnomalias) {
      const matchedAnomaly = anomalies && anomalies.find(a => a.codigo === prod.codigo);
      const anomDiffType = matchedAnomaly ? (matchedAnomaly._diffType || '') : '';
      html += '<td style="text-align:center;">';
      if (matchedAnomaly) {
        var anomBtnClass = 'btn-view-anomaly';
        if (anomDiffType === 'new') anomBtnClass += ' snapshot-new';
        else if (anomDiffType === 'edited') anomBtnClass += ' snapshot-edited';
        else if (anomDiffType === 'deleted') anomBtnClass += ' snapshot-deleted';
        html += '<button class="' + anomBtnClass + '" onclick="toggleDetailAnomaly(\'' + prod.codigo + '\', this)" title="Ver anomalía"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></button>';
        if (anomDiffType === 'new') html += '<span class="snapshot-new-badge">Nuevo</span>';
        else if (anomDiffType === 'edited') html += '<span class="snapshot-edited-badge">Editado</span>';
        else if (anomDiffType === 'deleted') html += '<span class="snapshot-deleted-badge">Eliminada</span>';
      }
      html += '</td>';
    }

    html += '</tr>';

    // Box row
    if (hasBoxes) {
      const prodBoxes2 = (orderBoxes[code] || []).find(b => b.codigo === prod.codigo);
      const prevProdBoxes2 = snapshotBoxDiff ? ((orderBoxesPrev[code] || []).find(b => b.codigo === prod.codigo) || null) : null;
      let boxHasChanges2 = false;
      if (prevProdBoxes2 && prodBoxes2) {
        boxHasChanges2 = prodBoxes2.cajas.some(function(c) {
          var p = prevProdBoxes2.cajas.find(function(pc) { return pc.code === c.code; });
          return !p || p.qty !== c.qty;
        }) || prevProdBoxes2.cajas.some(function(pc) {
          return !prodBoxes2.cajas.some(function(c) { return c.code === pc.code; });
        });
      }
      if (prodBoxes2) {
        const colSpan = (isValorada ? 6 : 4) + (isLocal ? 1 : 0) + (hasBoxes ? 1 : 0) + (hasAnomalias ? 1 : 0);
        html += '<tr class="detail-box-row' + (boxHasChanges2 ? ' snapshot-box-row' : '') + '" id="detailBoxRow-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:' + (boxHasChanges2 ? '#f0fdf4' : '#fff') + ';">' + buildDetailBoxPanel(prodBoxes2, statusClass, prevProdBoxes2) + '</td></tr>';
      }
    }

    // Anomaly row
    if (hasAnomalias && anomalies) {
      const anomaly = anomalies.find(a => a.codigo === prod.codigo);
      if (anomaly) {
        const colSpan = (isValorada ? 6 : 4) + (isLocal ? 1 : 0) + (hasBoxes ? 1 : 0) + (hasAnomalias ? 1 : 0);
        const aDiffType = anomaly._diffType || '';
        const hasADiff = (aDiffType === 'new' || aDiffType === 'edited' || aDiffType === 'deleted');
        const aRowClass = aDiffType === 'new' ? ' snapshot-new-row' : aDiffType === 'edited' ? ' snapshot-edited-row' : aDiffType === 'deleted' ? ' snapshot-deleted-row' : '';
        const aRowBg = aDiffType === 'new' ? '#fffbeb' : aDiffType === 'edited' ? '#eff6ff' : aDiffType === 'deleted' ? '#fef2f2' : '#fff';
        html += '<tr class="detail-anomaly-row' + aRowClass + '" id="detailAnomalyRow-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:' + aRowBg + ';">' + buildAnomalyViewPanel(anomaly) + '</td></tr>';
      }
    }
  });

  if (isValorada) {
    let sumaTotal = 0;
    detailProducts.forEach((prod) => {
      const precioUnit = prod.precioUnitario || 0;
      sumaTotal += precioUnit * prod.cantidad;
    });
    html += '<tr style="background:#f8fafc; font-weight:600; color:#1a1a2e;">';
    html += '<td colspan="' + (5 + (isLocal ? 1 : 0)) + '" style="text-align:right; border-top:2px solid #e5e7eb;">TOTAL ORDEN</td>';
    html += '<td style="text-align:right; border-top:2px solid #e5e7eb;">' + formatCLP(sumaTotal) + '</td>';
    if (hasBoxes) html += '<td></td>';
    if (hasAnomalias) html += '<td></td>';
    html += '</tr>';
  }

  tbody.innerHTML = html;
  const itemCountEl = document.getElementById('detailItemCount');
  if (itemCountEl) itemCountEl.textContent = detailProducts.length;
}

function deleteDetailProduct(idx) {
  detailProducts.splice(idx, 1);
  detailProducts.forEach(function(p, i) { p.num = i + 1; });
  renderDetailProductTable(detailParams.code);
}

function updateDetailQuantity(idx, value) {
  const val = parseInt(value, 10);
  if (!isNaN(val) && val >= 1) {
    detailProducts[idx].cantidad = val;
  }
}

function buildDetailBoxPanel(prodBoxes, statusClass, prevProdBoxes) {
  const showPositions = (statusClass === 'revisada' || statusClass === 'revisada-anomalia' || statusClass === 'por-almacenar' || statusClass === 'por-almacenar-anomalia' || statusClass === 'almacenada' || statusClass === 'almacenada-anomalia' || statusClass === 'valorada' || statusClass === 'valorada-anomalia');
  let html = '<div class="detail-box-panel">';
  html += '<div class="detail-box-panel-header">';
  html += '<div class="detail-box-panel-title"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg> Distribución en cajas — ' + prodBoxes.producto + '</div>';
  html += '<span class="detail-box-count">' + prodBoxes.cajas.length + (prodBoxes.cajas.length === 1 ? ' caja' : ' cajas') + '</span>';
  html += '</div>';
  html += '<div class="detail-box-list">';
  prodBoxes.cajas.forEach(caja => {
    const pos = getRecommendedPosition(caja.code);
    // Check if this box changed vs previous or is new
    var prevCaja = prevProdBoxes ? prevProdBoxes.cajas.find(function(pc) { return pc.code === caja.code; }) : null;
    var isNewBox = prevProdBoxes && !prevCaja;
    var qtyChanged = prevCaja && prevCaja.qty !== caja.qty;
    var hasChange = qtyChanged;
    var boxClass = isNewBox ? ' box-new' : hasChange ? ' box-changed' : '';
    html += '<div class="detail-box-item' + boxClass + '">';
    html += '<span class="storage-box-code">' + caja.code + '</span>';
    if (qtyChanged) {
      html += '<span class="storage-box-qty box-qty-new">' + caja.qty + ' uds</span>';
      html += '<span class="storage-box-qty-prev">antes: ' + prevCaja.qty + ' uds</span>';
    } else {
      html += '<span class="storage-box-qty">' + caja.qty + ' uds</span>';
    }
    if (showPositions) {
      html += '<span class="storage-box-position"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ' + pos + '</span>';
    }
    if (isNewBox) html += '<span class="snapshot-new-badge" style="margin-left:auto;">Nueva</span>';
    html += '</div>';
  });
  // Show deleted boxes (existed in previous version but removed in current)
  if (prevProdBoxes) {
    prevProdBoxes.cajas.forEach(function(prevCaja) {
      var stillExists = prodBoxes.cajas.find(function(c) { return c.code === prevCaja.code; });
      if (!stillExists) {
        html += '<div class="detail-box-item box-deleted">';
        html += '<span class="storage-box-code">' + prevCaja.code + '</span>';
        html += '<span class="storage-box-qty">' + prevCaja.qty + ' uds</span>';
        html += '<span class="snapshot-deleted-badge" style="margin-left:auto;">Eliminada</span>';
        html += '</div>';
      }
    });
  }
  html += '</div></div>';
  return html;
}

function buildAnomalyViewPanel(anomaly) {
  const diffType = anomaly._diffType || '';
  const prevAnomaly = anomaly._prev || null;
  const isDeleted = diffType === 'deleted';
  const isEdited = diffType === 'edited';
  const faltantes = Math.max(0, anomaly.esperado - anomaly.recibido);
  const hasFaltantes = faltantes > 0;
  const hasDanados = anomaly.danados > 0;
  const severityLabel = '';

  let tagsHTML = '';
  if (hasFaltantes || hasDanados) {
    tagsHTML = '<div class="detail-anomaly-tags" style="margin-bottom:12px;">';
    if (hasFaltantes) tagsHTML += '<span class="detail-anomaly-tag faltantes">📦 Esperado: ' + anomaly.esperado + ' · Recibido: ' + anomaly.recibido + ' · Faltantes: ' + faltantes + '</span>';
    if (hasDanados) tagsHTML += '<span class="detail-anomaly-tag danados">⚠️ ' + anomaly.danados + ' dañado' + (anomaly.danados !== 1 ? 's' : '') + '</span>';
    tagsHTML += '</div>';
  }

  var panelClass = 'anomaly-view-panel';
  if (isDeleted) panelClass += ' anomaly-panel-deleted';
  if (isEdited) panelClass += ' anomaly-panel-edited';

  let html = '<div class="' + panelClass + '">';

  // Diff type banner
  if (isDeleted) {
    html += '<div class="anomaly-diff-banner deleted"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg> Anomalía eliminada en esta edición</div>';
  } else if (isEdited) {
    html += '<div class="anomaly-diff-banner edited"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Anomalía editada en esta edición</div>';
  }

  html += '<div class="anomaly-view-header">';
  html += '<div class="anomaly-view-title">';
  html += '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
  html += 'Anomalía — ' + anomaly.codigo + ' ' + anomaly.producto;
  html += '</div>';
  html += '</div>';
  html += tagsHTML;

  // Show edit comparison for edited anomalies
  if (isEdited && prevAnomaly) {
    html += '<div class="anomaly-edit-comparison">';
    html += '<div class="anomaly-edit-comparison-title"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg> Cambios realizados:</div>';
    if (prevAnomaly.recibido !== anomaly.recibido) {
      html += '<div class="anomaly-edit-change"><span class="anomaly-edit-field">Recibido:</span> <span class="anomaly-edit-prev">' + prevAnomaly.recibido + '</span> <span class="anomaly-edit-arrow">→</span> <span class="anomaly-edit-new">' + anomaly.recibido + '</span></div>';
    }
    if (prevAnomaly.danados !== anomaly.danados) {
      html += '<div class="anomaly-edit-change"><span class="anomaly-edit-field">Dañados:</span> <span class="anomaly-edit-prev">' + prevAnomaly.danados + '</span> <span class="anomaly-edit-arrow">→</span> <span class="anomaly-edit-new">' + anomaly.danados + '</span></div>';
    }
    if (prevAnomaly.desc !== anomaly.desc) {
      html += '<div class="anomaly-edit-change desc-change"><span class="anomaly-edit-field">Descripción anterior:</span><div class="anomaly-edit-prev-desc">' + prevAnomaly.desc + '</div></div>';
    }
    html += '</div>';
  }

  html += '<div class="anomaly-view-field">';
  html += '<span class="anomaly-view-label">' + (isEdited ? 'Descripción actual' : 'Descripción') + '</span>';
  html += '<div class="anomaly-view-value">' + anomaly.desc + '</div>';
  html += '</div>';
  if (anomaly.fotos && anomaly.fotos.length > 0) {
    html += '<div class="anomaly-view-field" style="margin-top:12px;">';
    html += '<span class="anomaly-view-label">Evidencia fotográfica (' + anomaly.fotos.length + ')</span>';
    html += '<div class="photo-gallery-view">';
    anomaly.fotos.forEach(function(src, i) {
      html += '<div class="photo-view-thumb" onclick="openPhotoLightbox(\'' + src.replace(/'/g, "\\'") + '\')"><img src="' + src + '" alt="Foto ' + (i+1) + '"></div>';
    });
    html += '</div></div>';
  }
  html += '</div>';
  return html;
}

function toggleDetailAnomaly(codigo, btn) {
  const row = document.getElementById('detailAnomalyRow-' + codigo);
  const isVisible = row.style.display !== 'none';
  document.querySelectorAll('.detail-anomaly-row').forEach(r => r.style.display = 'none');
  document.querySelectorAll('.btn-view-anomaly').forEach(b => b.classList.remove('expanded'));
  if (!isVisible) {
    row.style.display = '';
    btn.classList.add('expanded');
  }
}

function toggleDetailBoxes(codigo, btn) {
  const row = document.getElementById('detailBoxRow-' + codigo);
  const isVisible = row.style.display !== 'none';
  document.querySelectorAll('.detail-box-row').forEach(r => r.style.display = 'none');
  document.querySelectorAll('.btn-view-boxes').forEach(b => b.classList.remove('expanded'));
  if (!isVisible) {
    row.style.display = '';
    btn.classList.add('expanded');
  }
}

/* === Arrival modal (from detail) === */
function openArrivalModal(code, proveedor, items) {
  document.getElementById('modalOrderCode').textContent = code;
  document.getElementById('modalOrderProveedor').textContent = proveedor;
  document.getElementById('modalOrderItems').textContent = items;
  document.getElementById('arrivalModal').classList.add('active');
}

function closeArrivalModal() {
  document.getElementById('arrivalModal').classList.remove('active');
}

function confirmArrival() {
  closeArrivalModal();
  // Update detail view
  const headerBadge = document.getElementById('detailStatusBadge');
  headerBadge.className = 'status-badge en-bodega';
  document.getElementById('detailStatusText').textContent = 'En bodega';
  const infoBadge = document.getElementById('detailInfoStatus');
  infoBadge.className = 'status-badge en-bodega';
  document.getElementById('detailInfoStatusText').textContent = 'En bodega';
  document.getElementById('detailArrivalBtn').style.display = 'none';
  document.getElementById('detailReviewBtn').style.display = 'inline-flex';
  detailParams.status = 'en-bodega';
  detailParams.label = 'En bodega';
  currentDetailStatusClass = 'en-bodega';

  addHistoryEntry('llegada', 'Orden recibida en bodega.');

  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Llegada registrada';
  document.getElementById('toastMessage').textContent = 'La orden ' + detailParams.code + ' fue registrada en bodega.';
  showToast();
}

/* === Storage modal (from detail) === */
function openStorageModal(code, proveedor, items) {
  document.getElementById('storageModalCode').textContent = code;
  document.getElementById('storageModalProveedor').textContent = proveedor;
  document.getElementById('storageModalItems').textContent = items;

  // Renderizar productos y cajas
  const container = document.getElementById('storageProductsList');
  const boxes = orderBoxes[code];

  if (!boxes || boxes.length === 0) {
    container.innerHTML = '<div class="storage-no-boxes">No hay datos de cajas disponibles para esta orden.</div>';
  } else {
    const totalBoxes = boxes.reduce((s, p) => s + p.cajas.length, 0);
    let html = '<div class="storage-anomalies-header" style="background:#f0f4ff; border-bottom:1.5px solid #dde3f0; color:#3730a3; margin-bottom:10px; border-radius:10px 10px 0 0;">';
    html += '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>';
    html += 'Cajas y posiciones recomendadas (' + totalBoxes + ' cajas)';
    html += '</div>';
    boxes.forEach(prod => {
      const totalQty = prod.cajas.reduce((s, c) => s + c.qty, 0);
      html += '<div class="storage-product-item">';
      html += '<div class="storage-product-header">';
      html += '<span class="storage-product-code">' + prod.codigo + '</span>';
      html += '<span class="storage-product-name">' + prod.producto + '</span>';
      html += '<span class="storage-product-qty">' + totalQty + ' uds · ' + prod.cajas.length + ' caja' + (prod.cajas.length > 1 ? 's' : '') + '</span>';
      html += '</div>';
      html += '<div class="storage-box-list">';
      prod.cajas.forEach(caja => {
        const pos = getRecommendedPosition(caja.code);
        const sizeLabel = caja.size === 'grande' ? 'Grande' : caja.size === 'mediano' ? 'Mediana' : 'Pequeña';
        const sizeClass = 'box-size-' + caja.size;
        html += '<div class="storage-box-row">';
        html += '<span class="storage-box-code">' + caja.code + '</span>';
        html += '<span class="storage-box-size ' + sizeClass + '">' + sizeLabel + '</span>';
        html += '<span class="storage-box-qty">' + caja.qty + ' uds</span>';
        html += '<span class="storage-box-position"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ' + pos + '</span>';
        html += '</div>';
      });
      html += '</div></div>';
    });
    container.innerHTML = html;
  }

  // Renderizar anomalías si existen
  const anomSection = document.getElementById('storageAnomaliesSection');
  const anomalies = orderAnomalies[code];
  if (anomalies && anomalies.length > 0) {
    let anomHtml = '<div class="storage-anomalies-section">';
    anomHtml += '<div class="storage-anomalies-header">';
    anomHtml += '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
    anomHtml += 'Anomalías registradas (' + anomalies.length + ')';
    anomHtml += '</div>';
    anomalies.forEach(a => {
      const faltante = a.esperado - a.recibido;
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

  document.getElementById('storageModal').classList.add('active');
}

function closeStorageModal() {
  document.getElementById('storageModal').classList.remove('active');
}

function confirmStorage() {
  const code = detailParams.code;
  const hasAnomalias = !!orderAnomalies[code];
  const newStatus = hasAnomalias ? 'por-almacenar-anomalia' : 'por-almacenar';
  closeStorageModal();

  // Update detail view
  const headerBadge = document.getElementById('detailStatusBadge');
  headerBadge.className = 'status-badge ' + newStatus;
  document.getElementById('detailStatusText').innerHTML = 'Por almacenar' + (hasAnomalias ? ' ' + warningIconSVG : '');
  const infoBadge = document.getElementById('detailInfoStatus');
  infoBadge.className = 'status-badge ' + newStatus;
  document.getElementById('detailInfoStatusText').innerHTML = 'Por almacenar' + (hasAnomalias ? ' ' + warningIconSVG : '');
  document.getElementById('detailStoreBtn').style.display = 'none';
  detailParams.status = newStatus;
  detailParams.label = 'Por almacenar';
  currentDetailStatusClass = newStatus;

  addHistoryEntry('confirmacion', 'Confirmación de almacenamiento. Productos asignados a posiciones de bodega.');

  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Almacenamiento confirmado';
  document.getElementById('toastMessage').textContent = 'La orden ' + code + ' fue enviada a almacenamiento.';
  showToast();

  mlEditMode = false;
  renderDetailProductTable(code);
}

/* === Valoración modal === */
var valoracionFileUploaded = false;

function openValoracionModal() {
  document.getElementById('valoracionModalCode').textContent = detailParams.code;
  document.getElementById('valoracionModalProveedor').textContent = detailParams.proveedor;
  document.getElementById('valoracionCodigo').value = '';
  removeValoracionFile();
  document.getElementById('valoracionConfirmBtn').disabled = true;
  document.getElementById('valoracionModal').classList.add('active');
}


function closeValoracionModal() {
  document.getElementById('valoracionModal').classList.remove('active');
}

function handleValoracionFile(input) {
  if (input.files && input.files.length > 0) {
    valoracionFileUploaded = true;
    document.getElementById('valoracionFileName').textContent = input.files[0].name;
    document.getElementById('valoracionUploadContent').style.display = 'none';
    document.getElementById('valoracionFileInfo').style.display = 'flex';
    document.getElementById('valoracionUploadZone').style.borderColor = '#D916A8';
    document.getElementById('valoracionUploadZone').style.background = '#fdf4ff';
    checkValoracionForm();
  }
}

function removeValoracionFile() {
  valoracionFileUploaded = false;
  document.getElementById('valoracionFileInput').value = '';
  document.getElementById('valoracionUploadContent').style.display = '';
  document.getElementById('valoracionFileInfo').style.display = 'none';
  document.getElementById('valoracionUploadZone').style.borderColor = '#d1d5db';
  document.getElementById('valoracionUploadZone').style.background = '';
  checkValoracionForm();
}

function checkValoracionForm() {
  var codigo = document.getElementById('valoracionCodigo').value.trim();
  var btn = document.getElementById('valoracionConfirmBtn');
  btn.disabled = !(codigo && valoracionFileUploaded);
}

function confirmValoracion() {
  const code = detailParams.code;
  const codigoVal = document.getElementById('valoracionCodigo').value.trim();
  const hasAnomalias = !!(orderAnomalies[code] && orderAnomalies[code].length);
  const newStatus = hasAnomalias ? 'valorada-anomalia' : 'valorada';
  closeValoracionModal();

  // Update detail view
  const headerBadge = document.getElementById('detailStatusBadge');
  headerBadge.className = 'status-badge ' + newStatus;
  document.getElementById('detailStatusText').innerHTML = 'Valorada' + (hasAnomalias ? ' ' + warningIconSVG : '');
  const infoBadge = document.getElementById('detailInfoStatus');
  infoBadge.className = 'status-badge ' + newStatus;
  document.getElementById('detailInfoStatusText').innerHTML = 'Valorada' + (hasAnomalias ? ' ' + warningIconSVG : '');
  document.getElementById('detailValorateBtn').style.display = 'none';
  detailParams.status = newStatus;
  detailParams.label = 'Valorada';
  detailParams.valoracionCode = codigoVal;
  currentDetailStatusClass = newStatus;

  // Show valoración code in info card
  document.getElementById('detailValoracionCodeField').style.display = '';
  document.getElementById('detailInfoValoracionCode').textContent = codigoVal;

  addHistoryEntry('valoracion', 'Orden valorada con código ' + codigoVal + '.');

  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Valoración registrada';
  document.getElementById('toastMessage').textContent = 'La orden ' + code + ' fue valorada exitosamente.';
  showToast();

  mlEditMode = false;
  renderDetailProductTable(code);
}

/* === Toggle ML edit mode === */
let mlEditSnapshot = null; // snapshot before entering edit mode

function toggleMlEdit() {
  if (mlEditMode) {
    // Show confirmation modal instead of saving immediately
    document.getElementById('confirmEditModal').classList.add('active');
    return;
  }
  // Save snapshot before entering edit mode
  mlEditSnapshot = {
    products: detailProducts.map(p => Object.assign({}, p)),
    catalog: masslineCatalog.map(c => c ? Object.assign({}, c) : null)
  };
  mlEditMode = true;
  const btn = document.getElementById('detailEditMlBtn');
  btn.classList.add('active');
  btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Listo';
  renderDetailProductTable(detailParams.code);
}

function confirmMlEdit() {
  document.getElementById('confirmEditModal').classList.remove('active');
  // Capture current input values
  const rows = document.querySelectorAll('#detailProductTableBody tr:not(.detail-box-row):not(.detail-anomaly-row)');
  let changedCount = 0;
  rows.forEach((row, idx) => {
    const inputs = row.querySelectorAll('.ml-ac-input');
    if (inputs.length === 2) {
      const code = inputs[0].value.trim();
      const desc = inputs[1].value.trim();
      if (code || desc) {
        masslineCatalog[idx] = { code: code, desc: desc };
        changedCount++;
      } else {
        masslineCatalog[idx] = null;
      }
    }
  });
  addHistoryEntry('edicion-codigos', 'Códigos Massline actualizados en ' + changedCount + ' producto' + (changedCount !== 1 ? 's' : '') + '.');
  mlEditMode = false;
  const btn = document.getElementById('detailEditMlBtn');
  btn.classList.remove('active');
  btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Editar c&#243;digos';
  renderDetailProductTable(detailParams.code);
}

function cancelMlEdit() {
  document.getElementById('confirmEditModal').classList.remove('active');
  // Restore snapshot
  if (mlEditSnapshot) {
    detailProducts.splice(0, detailProducts.length, ...mlEditSnapshot.products);
    masslineCatalog.splice(0, masslineCatalog.length, ...mlEditSnapshot.catalog);
    mlEditSnapshot = null;
  }
  mlEditMode = false;
  const btn = document.getElementById('detailEditMlBtn');
  btn.classList.remove('active');
  btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Editar c&#243;digos';
  renderDetailProductTable(detailParams.code);
}

/* === Actualizar PO desde archivo === */
let poUploadSnapshot = null;
let pendingPoFile = null;
let poUploadApplied = false;

function handlePoUpload(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  pendingPoFile = { name: file.name, sizeKB: (file.size / 1024).toFixed(1) };
  input.value = '';
  // Show confirmation modal
  document.getElementById('confirmPoFileName').textContent = file.name;
  document.getElementById('confirmPoFileSize').textContent = pendingPoFile.sizeKB + ' KB';
  document.getElementById('confirmPoModal').classList.add('active');
}

function cancelPoUpload() {
  pendingPoFile = null;
  document.getElementById('confirmPoModal').classList.remove('active');
}

function applyPoUpload() {
  document.getElementById('confirmPoModal').classList.remove('active');
  if (!pendingPoFile) return;
  const name = pendingPoFile.name;
  const sizeKB = pendingPoFile.sizeKB;
  pendingPoFile = null;

  // Save snapshot for restore
  poUploadSnapshot = {
    products: detailProducts.map(p => Object.assign({}, p)),
    catalog: masslineCatalog.map(c => c ? Object.assign({}, c) : null)
  };

  // Simulate PO update: modify quantities on some rows, remove rows 6 and 3
  const qtyChanges = { 0: 180, 1: 85, 4: 120, 5: 175 };
  detailProducts.forEach(function(prod, idx) {
    if (qtyChanges[idx] !== undefined) prod.cantidad = qtyChanges[idx];
  });
  [6, 3].forEach(function(idx) {
    if (idx < detailProducts.length) {
      detailProducts.splice(idx, 1);
      masslineCatalog.splice(idx, 1);
    }
  });
  detailProducts.forEach(function(p, i) { p.num = i + 1; });

  // Hide upload zone and inject file into docs section
  poUploadApplied = true;
  renderDetailProductTable(detailParams.code);

  const ext = name.split('.').pop().toUpperCase();
  const poDoc = document.getElementById('poUpdatedDoc');
  if (poDoc) {
    poDoc.innerHTML =
      '<div style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; font-size:13px; width:100%;">' +
      '<div style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;background:#dcfce7;color:#16a34a;">' + ext + '</div>' +
      '<div style="flex:1; min-width:0;">' +
      '<div style="font-weight:500; color:#1a1a2e; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + name + '</div>' +
      '<div style="color:#8b8fa3; font-size:12px;">' + sizeKB + ' KB</div>' +
      '</div>' +
      '<span style="font-size:11px; font-weight:600; padding:3px 8px; background:#bbf7d0; color:#15803d; border-radius:6px; flex-shrink:0;">PO actualizada</span>' +
      '<button class="btn-download" title="Descargar" onclick="return false"><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg></button>' +
      '</div>';
    poDoc.style.display = 'block';
  }

  addHistoryEntry('actualizacion-po', 'PO actualizada con archivo "' + name + '". Cantidades y líneas modificadas.');

  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'PO actualizada';
  document.getElementById('toastMessage').textContent = 'Se aplicaron los cambios del archivo "' + name + '".';
  showToast();
}

function removePoUpload() {
  // Remove file from docs section
  const poDoc = document.getElementById('poUpdatedDoc');
  if (poDoc) { poDoc.innerHTML = ''; poDoc.style.display = 'none'; }
  // Restore snapshot
  if (poUploadSnapshot) {
    detailProducts.splice(0, detailProducts.length, ...poUploadSnapshot.products);
    masslineCatalog.splice(0, masslineCatalog.length, ...poUploadSnapshot.catalog);
    poUploadSnapshot = null;
  }
  poUploadApplied = false;
  renderDetailProductTable(detailParams.code);
}

/* === Historial de cambios === */
let historyOpen = false;
let snapshotActive = false;
let snapshotIdx = -1;
let snapshotContext = null;

function toggleHistoryPanel() {
  historyOpen = !historyOpen;
  document.getElementById('historyBody').style.display = historyOpen ? '' : 'none';
  document.getElementById('historyChevron').style.transform = historyOpen ? 'rotate(180deg)' : '';
}

function renderHistory(code) {
  const entries = orderHistory[code] || [];
  const card = document.getElementById('historyCard');
  if (entries.length === 0) {
    card.style.display = 'none';
    return;
  }
  card.style.display = '';
  document.getElementById('historyCount').textContent = entries.length;

  const container = document.getElementById('historyTimeline');
  let html = '';
  // Show most recent first
  const sorted = entries.slice().reverse();
  var typeConfig = {
    ingreso:             { label: 'Ingreso',                      icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>' },
    llegada:             { label: 'Llegada',                      icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>' },
    revision:            { label: 'Revisión',                     icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>' },
    'edicion-revision':  { label: 'Edición revisión',             icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>' },
    'edicion-codigos':   { label: 'Edición códigos',   icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>' },
    confirmacion:        { label: 'Confirmación almacenamiento',  icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' },
    almacenada:          { label: 'Almacenada',                   icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>' },
    valoracion:          { label: 'Valorada',                    icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' },
    'actualizacion-po':  { label: 'PO actualizada',               icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>' },
    'edicion-emergencia': { label: 'Solicitud de edición',        icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>' }
  };
  sorted.forEach(function(entry, i) {
    var cfg = typeConfig[entry.type] || { label: entry.type, icon: '' };
    const iconClass = entry.type;
    const iconSVG = cfg.icon;
    const typeLabel = cfg.label;
    const isLast = i === sorted.length - 1;
    const origIdx = entries.length - 1 - i;
    const isCurrent = (i === 0 && !snapshotActive);
    const isSelected = (snapshotActive && snapshotIdx === origIdx);

    html += '<div class="history-entry' + (isLast ? ' last' : '') + (isCurrent ? ' current' : '') + (isSelected ? ' selected' : '') + '" onclick="viewHistoricalState(' + origIdx + ')" title="Ver orden en este estado">';
    html += '<div class="history-dot ' + iconClass + '">' + iconSVG + '</div>';
    html += '<div class="history-content">';
    html += '<div class="history-entry-header">';
    html += '<span class="history-type-badge ' + iconClass + '">' + typeLabel + '</span>';
    html += '<span class="history-date">' + entry.date + '</span>';
    html += '</div>';
    html += '<div class="history-desc">' + entry.desc + '</div>';
    html += '<div class="history-user"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> ' + entry.user + '</div>';
    html += '</div></div>';
  });
  container.innerHTML = html;
}

function addHistoryEntry(type, desc) {
  const code = detailParams.code;
  if (!orderHistory[code]) orderHistory[code] = [];
  const now = new Date();
  const dateStr = String(now.getDate()).padStart(2, '0') + '/' + String(now.getMonth() + 1).padStart(2, '0') + '/' + now.getFullYear()
    + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  orderHistory[code].push({
    type: type,
    date: dateStr,
    user: 'Usuario Sistema',
    desc: desc
  });
  renderHistory(code);
}

/* === Snapshot: ver estado histórico === */
function getStateForHistoryType(type, code) {
  var hasAnom = !!(typeof orderAnomalies !== 'undefined' && orderAnomalies[code] && orderAnomalies[code].length);
  var stateMap = {
    'ingreso':           { status: 'ingresada',                                       label: 'Por llegar' },
    'llegada':           { status: 'en-bodega',                                       label: 'En bodega' },
    'revision':          { status: hasAnom ? 'revisada-anomalia' : 'revisada',        label: 'Revisada' },
    'edicion-revision':  { status: hasAnom ? 'revisada-anomalia' : 'revisada',        label: 'Revisada' },
    'edicion-codigos':   { status: hasAnom ? 'revisada-anomalia' : 'revisada',        label: 'Revisada' },
    'confirmacion':      { status: hasAnom ? 'por-almacenar-anomalia' : 'por-almacenar', label: 'Por almacenar' },
    'almacenada':        { status: hasAnom ? 'almacenada-anomalia' : 'almacenada',    label: 'Almacenada' },
    'valoracion':        { status: hasAnom ? 'valorada-anomalia' : 'valorada',        label: 'Valorada' },
    'actualizacion-po':  { status: hasAnom ? 'revisada-anomalia' : 'revisada',        label: 'Revisada' },
    'edicion-emergencia': { status: currentDetailStatusClass || 'en-bodega',          label: detailParams.label || 'En bodega' }
  };
  return stateMap[type] || { status: 'en-bodega', label: 'En bodega' };
}

function viewHistoricalState(entryIndex) {
  var code = detailParams.code;
  var entries = orderHistory[code] || [];
  if (entryIndex < 0 || entryIndex >= entries.length) return;

  var entry = entries[entryIndex];
  var isLatest = (entryIndex === entries.length - 1);

  // If clicking the latest entry while no snapshot is active, do nothing
  if (isLatest && !snapshotActive) return;

  // If clicking the latest entry while snapshot IS active, restore
  if (isLatest && snapshotActive) {
    restoreCurrentState();
    return;
  }

  snapshotActive = true;
  snapshotIdx = entryIndex;

  // Compute snapshot context for product table rendering
  var stepsUpToNow = entries.slice(0, entryIndex + 1);
  snapshotContext = {
    hasLlegada: stepsUpToNow.some(function(e) { return e.type === 'llegada'; }),
    hasRevision: stepsUpToNow.some(function(e) { return e.type === 'revision'; }),
    hasCodigosEdit: stepsUpToNow.some(function(e) { return e.type === 'edicion-codigos'; }),
    hasRevisionEdit: stepsUpToNow.some(function(e) { return e.type === 'edicion-revision'; }),
    currentType: entry.type
  };

  // Determine historical state
  var typeLabels = {
    ingreso: 'Ingreso', llegada: 'Llegada', revision: 'Revisión',
    'edicion-revision': 'Edición revisión', 'edicion-codigos': 'Edición códigos',
    confirmacion: 'Confirmación almacenamiento', almacenada: 'Almacenada',
    valoracion: 'Valorada'
  };
  var state = getStateForHistoryType(entry.type, code);
  var hasAnomalias = (state.status.indexOf('anomalia') !== -1);

  // Show banner
  document.getElementById('snapshotLabel').textContent = typeLabels[entry.type] || entry.type;
  document.getElementById('snapshotDate').textContent = entry.date;
  document.getElementById('snapshotBanner').style.display = '';

  // Update status badges
  var headerBadge = document.getElementById('detailStatusBadge');
  headerBadge.className = 'status-badge ' + state.status;
  document.getElementById('detailStatusText').innerHTML = state.label + (hasAnomalias ? ' ' + warningIconSVG : '');
  var infoBadge = document.getElementById('detailInfoStatus');
  infoBadge.className = 'status-badge ' + state.status;
  document.getElementById('detailInfoStatusText').innerHTML = state.label + (hasAnomalias ? ' ' + warningIconSVG : '');

  // Hide time chips based on snapshot state
  var isSnapshotValorada = (state.status === 'valorada' || state.status === 'valorada-anomalia');
  var isSnapshotAlmacenada = isSnapshotValorada || (state.status === 'almacenada' || state.status === 'almacenada-anomalia');
  var timeEl = document.getElementById('detailValoracionTime');
  var almTimeEl = document.getElementById('detailAlmacenamientoTime');
  timeEl.style.display = isSnapshotValorada ? 'inline-flex' : 'none';
  almTimeEl.style.display = isSnapshotAlmacenada ? 'inline-flex' : 'none';
  var anySnapshotChip = isSnapshotAlmacenada || isSnapshotValorada;
  almTimeEl.style.marginLeft = isSnapshotAlmacenada ? 'auto' : '';
  timeEl.style.marginLeft = (!isSnapshotAlmacenada && isSnapshotValorada) ? 'auto' : '';
  headerBadge.style.marginLeft = anySnapshotChip ? '10px' : 'auto';
  document.getElementById('detailValoracionCodeField').style.display = isSnapshotValorada ? '' : 'none';

  // Hide all action buttons during snapshot
  ['detailArrivalBtn','detailReviewBtn','detailEditReviewBtn','detailStoreBtn','detailValorateBtn','detailEditMlBtn','detailEmergencyBtn'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Anomaly report doc
  if (hasAnomalias && entryIndex >= entries.findIndex(function(e) { return e.type === 'revision'; })) {
    document.getElementById('detailAnomalyReportDoc').style.display = 'flex';
  } else {
    document.getElementById('detailAnomalyReportDoc').style.display = 'none';
  }

  // Show change detail for edicion types
  var changeDetail = document.getElementById('snapshotChangeDetail');
  if (entry.type === 'edicion-codigos') {
    changeDetail.textContent = '→ Se actualizaron los códigos Massline en la tabla de productos';
    changeDetail.style.display = '';
  } else if (entry.type === 'edicion-revision') {
    // Build descriptive change detail
    var prevAnoms = (typeof orderAnomaliesPrev !== 'undefined' && orderAnomaliesPrev[code]) || [];
    var currAnoms = orderAnomalies[code] || [];
    var newCount = 0, editedCount = 0, deletedCount = 0;
    currAnoms.forEach(function(a) {
      var prev = prevAnoms.find(function(p) { return p.codigo === a.codigo; });
      if (!prev) newCount++;
      else if (prev.recibido !== a.recibido || prev.danados !== a.danados || prev.desc !== a.desc) editedCount++;
    });
    prevAnoms.forEach(function(p) {
      if (!currAnoms.find(function(a) { return a.codigo === p.codigo; })) deletedCount++;
    });
    var parts = [];
    if (newCount) parts.push(newCount + ' anomalía' + (newCount > 1 ? 's' : '') + ' nueva' + (newCount > 1 ? 's' : ''));
    if (editedCount) parts.push(editedCount + ' editada' + (editedCount > 1 ? 's' : ''));
    if (deletedCount) parts.push(deletedCount + ' eliminada' + (deletedCount > 1 ? 's' : ''));
    var anomText = parts.length > 0 ? parts.join(', ') : 'sin cambios en anomalías';
    changeDetail.textContent = '→ Se editó la revisión: ' + anomText + ' + ajustes en distribución de cajas';
    changeDetail.style.display = '';
  } else {
    changeDetail.style.display = 'none';
  }

  // Update product table for historical state
  currentDetailStatusClass = state.status;
  renderDetailProductTable(code);

  // Re-render history to highlight selected entry
  renderHistory(code);

  // Open history panel if closed
  if (!historyOpen) {
    historyOpen = true;
    document.getElementById('historyBody').style.display = '';
    document.getElementById('historyChevron').style.transform = 'rotate(180deg)';
  }
}

function restoreCurrentState() {
  snapshotActive = false;
  snapshotIdx = -1;
  snapshotContext = null;

  // Hide banner
  document.getElementById('snapshotBanner').style.display = 'none';

  // Reload original state
  loadDetail(detailParams);
}

/* ===== Emergency Edit Mode ===== */
let emergencyEditMode = false;
let emergencyEditReason = '';
let emergencyPendingRequest = false;
let emergencyEditSnapshot = null;
let emergencyNewRows = [];
let emergencyDeletedIndices = [];
let emergencyWorkingBoxes = null;
let emergencyWorkingAnomalies = null;
let emergencyWorkingMlCodes = null;
let emergencyWorkingQty = null;

function openEmergencyReasonModal() {
  if (emergencyPendingRequest) {
    document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Solicitud pendiente';
    document.getElementById('toastMessage').textContent = 'Ya existe una solicitud de cambio pendiente de aprobación del supervisor.';
    showToast();
    return;
  }
  if (snapshotActive) {
    document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'No disponible';
    document.getElementById('toastMessage').textContent = 'Vuelva al estado actual antes de editar.';
    showToast();
    return;
  }
  document.getElementById('emergencyReasonInput').value = '';
  document.getElementById('emergencyReasonConfirmBtn').disabled = true;
  document.getElementById('emergencyReasonModal').classList.add('active');
}

function closeEmergencyReasonModal() {
  document.getElementById('emergencyReasonModal').classList.remove('active');
}

function checkEmergencyReasonBtn() {
  var val = (document.getElementById('emergencyReasonInput').value || '').trim();
  document.getElementById('emergencyReasonConfirmBtn').disabled = val.length < 5;
}

function startEmergencyEdit() {
  emergencyEditReason = (document.getElementById('emergencyReasonInput').value || '').trim();
  closeEmergencyReasonModal();

  emergencyEditMode = true;
  emergencyNewRows = [];
  emergencyDeletedIndices = [];

  // Snapshot current state
  var snapBoxes = JSON.parse(JSON.stringify(orderBoxes[detailParams.code] || []));
  var snapAnoms = JSON.parse(JSON.stringify(orderAnomalies[detailParams.code] || []));
  emergencyEditSnapshot = {
    code: detailParams.code,
    proveedor: detailParams.proveedor,
    fecha: detailParams.fecha,
    status: detailParams.status,
    label: detailParams.label,
    tipo: detailParams.tipo || '',
    mlCodes: masslineCatalog.map(function(c) { return c ? Object.assign({}, c) : null; }),
    products: detailProducts.map(function(p) { return Object.assign({}, p); }),
    boxes: snapBoxes,
    anomalies: snapAnoms
  };
  emergencyWorkingBoxes = JSON.parse(JSON.stringify(snapBoxes));
  emergencyWorkingAnomalies = JSON.parse(JSON.stringify(snapAnoms));
  emergencyWorkingMlCodes = emergencyEditSnapshot.mlCodes.map(function(c) { return c ? Object.assign({}, c) : null; });
  emergencyWorkingQty = emergencyEditSnapshot.products.map(function(p) { return p.cantidad; });

  // Show banner and bottom bar
  document.getElementById('emergencyEditBanner').style.display = '';
  document.getElementById('emergencyEditBar').style.display = '';

  // Hide action buttons and emergency button while in edit mode
  ['detailArrivalBtn','detailReviewBtn','detailEditReviewBtn','detailStoreBtn'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  var emergencyBtn = document.getElementById('detailEmergencyBtn');
  if (emergencyBtn) emergencyBtn.style.display = 'none';

  // Transform info fields to editable inputs
  transformInfoFieldsToEditable();

  // Re-render product table in emergency edit mode
  renderDetailProductTable(detailParams.code);

  updateEmergencyChangeCount();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function restoreInfoFieldsFromEditable() {
  // Restore tipo field innerHTML (select was injected into detailInfoTipo)
  var tipoEl = document.getElementById('detailInfoTipo');
  if (!tipoEl) {
    // outerHTML-replaced via ee-tipo? handle that path too
    var eeTipo = document.getElementById('ee-tipo');
    if (eeTipo) {
      var tipoSpan = document.createElement('span');
      tipoSpan.className = 'detail-value';
      tipoSpan.id = 'detailInfoTipo';
      tipoSpan.textContent = '—';
      eeTipo.parentNode.replaceChild(tipoSpan, eeTipo);
    }
  } else if (tipoEl.querySelector('#ee-tipo')) {
    tipoEl.innerHTML = '—';
  }
  // #detailInfoStatus was replaced via outerHTML — restore the span before loadDetail
  var eeStatus = document.getElementById('ee-status');
  if (eeStatus) {
    var newSpan = document.createElement('span');
    newSpan.id = 'detailInfoStatus';
    newSpan.className = 'status-badge en-bodega';
    newSpan.innerHTML = '<span class="dot"></span> <span id="detailInfoStatusText">—</span>';
    eeStatus.parentNode.replaceChild(newSpan, eeStatus);
  }
  // emergencyAddRowBtn: hide here too in case loadDetail doesn't reach it
  var addBtn = document.getElementById('emergencyAddRowBtn');
  if (addBtn) addBtn.style.display = 'none';
  emergencyWorkingBoxes = null;
  emergencyWorkingAnomalies = null;
  emergencyWorkingMlCodes = null;
  emergencyWorkingQty = null;
}

function cancelEmergencyEdit() {
  emergencyEditMode = false;
  emergencyNewRows = [];
  emergencyDeletedIndices = [];
  emergencyWorkingQty = null;

  document.getElementById('emergencyEditBanner').style.display = 'none';
  document.getElementById('emergencyEditBar').style.display = 'none';

  restoreInfoFieldsFromEditable();
  loadDetail(detailParams);
}

function transformInfoFieldsToEditable() {
  var p = emergencyEditSnapshot;

  var BADGE_HTML = '<div class="ee-info-change-row" style="display:none;flex-direction:row;align-items:center;gap:8px;margin-top:4px;"><span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span><span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></span></div>';
  function makeEditableContainer(el) {
    if (el) { el.style.display = 'flex'; el.style.flexDirection = 'column'; el.style.alignItems = 'flex-start'; }
  }

  var codeEl = document.getElementById('detailInfoCode');
  if (codeEl) { codeEl.innerHTML = '<input type="text" id="ee-code" class="emergency-edit-input" value="' + escEEAttr(p.code) + '" oninput="onEmergencyFieldChange()">' + BADGE_HTML; makeEditableContainer(codeEl); }

  var provEl = document.getElementById('detailInfoProveedor');
  if (provEl) { provEl.innerHTML = '<input type="text" id="ee-proveedor" class="emergency-edit-input" value="' + escEEAttr(p.proveedor) + '" oninput="onEmergencyFieldChange()">' + BADGE_HTML; makeEditableContainer(provEl); }

  var fechaEl = document.getElementById('detailInfoFecha');
  if (fechaEl) { fechaEl.innerHTML = '<input type="datetime-local" id="ee-fecha" class="emergency-edit-input" value="' + escEEAttr(ddmmToDatetimeLocal(p.fecha)) + '" oninput="onEmergencyFieldChange()">' + BADGE_HTML; makeEditableContainer(fechaEl); }

  // Tipo de orden (Externa / Local) — always shown in edit mode
  var tipoEl = document.getElementById('detailInfoTipo');
  var tipoFieldEl = document.getElementById('detailTipoField');
  if (tipoEl && tipoFieldEl) {
    tipoFieldEl.style.display = '';
    var tipoOpts = ['Externa', 'Local'].map(function(t) {
      return '<option value="' + t + '"' + (t === p.tipo ? ' selected' : '') + '>' + t + '</option>';
    }).join('');
    tipoEl.innerHTML = '<select id="ee-tipo" class="emergency-edit-input emergency-edit-select" onchange="onEmergencyFieldChange()">' + tipoOpts + '</select>' + BADGE_HTML;
    makeEditableContainer(tipoEl);
  }

  // Replace status badge span with a select (only 6 base states — anomaly is derived)
  var statusBadgeEl = document.getElementById('detailInfoStatus');
  if (statusBadgeEl) {
    var allStatuses = [
      { value: 'ingresada',     label: 'Por llegar' },
      { value: 'en-bodega',     label: 'En bodega' },
      { value: 'revisada',      label: 'Revisada' },
      { value: 'por-almacenar', label: 'Por almacenar' },
      { value: 'almacenada',    label: 'Almacenada' },
      { value: 'valorada',      label: 'Valorada' }
    ];
    var baseStatus = p.status.replace('-anomalia', '');
    var opts = allStatuses.map(function(s) {
      return '<option value="' + s.value + '"' + (s.value === baseStatus ? ' selected' : '') + '>' + s.label + '</option>';
    }).join('');
    statusBadgeEl.outerHTML = '<select id="ee-status" class="emergency-edit-input emergency-edit-select" onchange="onEmergencyFieldChange(); applyEeStatusColor(this);">' + opts + '</select>';
    var eeStatusEl = document.getElementById('ee-status');
    if (eeStatusEl) {
      applyEeStatusColor(eeStatusEl);
      var statusRow = document.createElement('div');
      statusRow.className = 'ee-info-change-row';
      statusRow.style.cssText = 'display:none;flex-direction:row;align-items:center;gap:8px;margin-top:4px;';
      var statusBadgeSpan = document.createElement('span');
      statusBadgeSpan.className = 'ee-row-state-badge ee-badge-edited';
      statusBadgeSpan.style.margin = '0';
      statusBadgeSpan.style.flexShrink = '0';
      statusBadgeSpan.textContent = 'EDITADO';
      var statusOrigSpan = document.createElement('span');
      statusOrigSpan.className = 'ee-original-val';
      statusOrigSpan.style.cssText = 'font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
      statusRow.appendChild(statusBadgeSpan);
      statusRow.appendChild(statusOrigSpan);
      eeStatusEl.insertAdjacentElement('afterend', statusRow);
      makeEditableContainer(eeStatusEl.parentNode);
    }
  }
}

function escEEAttr(str) {
  return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Date format converters for emergency edit fecha field
function ddmmToDatetimeLocal(str) {
  if (!str) return '';
  var m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!m) return '';
  return m[3] + '-' + m[2] + '-' + m[1] + 'T' + m[4] + ':' + m[5];
}
function datetimeLocalToDdmm(str) {
  if (!str) return '';
  var m = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!m) return '';
  return m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] + ':' + m[5];
}

var eeStatusColors = {
  'ingresada':    { bg: '#dbeafe', color: '#075985', border: '#bfdbfe' },
  'en-bodega':    { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  'revisada':     { bg: '#ecfdf5', color: '#065f46', border: '#a7f3d0' },
  'por-almacenar':{ bg: '#eef0ff', color: '#4338ca', border: '#c7d2fe' },
  'almacenada':   { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' },
  'valorada':     { bg: '#fdf4ff', color: '#86198f', border: '#f0abfc' }
};

function applyEeStatusColor(sel) {
  var c = eeStatusColors[sel.value] || { bg: '#fff', color: '#1a1a2e', border: '#d1d5db' };
  sel.style.backgroundColor = c.bg;
  sel.style.color = c.color;
  sel.style.borderColor = c.border;
}

function syncEmergencyWorkingQty() {
  if (!emergencyWorkingQty || !emergencyEditSnapshot) return;
  emergencyEditSnapshot.products.forEach(function(_, idx) {
    var el = document.getElementById('ee-qty-' + idx);
    if (el) {
      var v = parseInt(el.value);
      if (!isNaN(v)) emergencyWorkingQty[idx] = v;
    }
  });
}

function isQtyEdited(idx) {
  if (!emergencyEditSnapshot) return false;
  var origProd = emergencyEditSnapshot.products[idx];
  if (!origProd) return false;
  var qtyEl = document.getElementById('ee-qty-' + idx);
  var liveQty = qtyEl ? (parseInt(qtyEl.value) || 0) : null;
  var workingQty = (emergencyWorkingQty && emergencyWorkingQty[idx] !== undefined) ? emergencyWorkingQty[idx] : origProd.cantidad;
  var currentQty = liveQty !== null ? liveQty : workingQty;
  return currentQty !== origProd.cantidad;
}

function isBoxesEdited(codigo) {
  if (!emergencyWorkingBoxes || !emergencyEditSnapshot || !emergencyEditSnapshot.boxes) return false;
  var workBoxProd = emergencyWorkingBoxes.find(function(b) { return b.codigo === codigo; });
  var snapBoxProd = emergencyEditSnapshot.boxes.find(function(b) { return b.codigo === codigo; });
  if (!workBoxProd || !snapBoxProd) return false;
  for (var ci = 0; ci < workBoxProd.cajas.length; ci++) {
    var caja = workBoxProd.cajas[ci];
    if (caja._isNew || caja._deleted) return true;
    var snapCaja = snapBoxProd.cajas.find(function(sc) { return sc.code === caja.code; });
    if (snapCaja && snapCaja.qty !== caja.qty) return true;
  }
  return false;
}

function isAnomalyEdited(codigo) {
  if (!emergencyWorkingAnomalies || !emergencyEditSnapshot) return false;
  var workAnom = emergencyWorkingAnomalies.find(function(a) { return a.codigo === codigo; });
  var snapAnom = emergencyEditSnapshot.anomalies ? emergencyEditSnapshot.anomalies.find(function(a) { return a.codigo === codigo; }) : null;
  if (workAnom && (workAnom._isNew || workAnom._deleted)) return true;
  if (!workAnom && snapAnom) return true;
  if (workAnom && snapAnom) {
    if (workAnom.esperado !== snapAnom.esperado || workAnom.recibido !== snapAnom.recibido ||
        workAnom.danados !== snapAnom.danados || workAnom.desc !== snapAnom.desc) return true;
    var sFotos = snapAnom.fotos ? snapAnom.fotos.length : 0;
    var wFotos = workAnom.fotos ? workAnom.fotos.length : 0;
    var pFotos = workAnom._pendingDeleteFotos ? workAnom._pendingDeleteFotos.length : 0;
    if (wFotos !== sFotos || pFotos > 0) return true;
  }
  return false;
}

function isExistingRowEdited(idx) {
  if (!emergencyEditSnapshot) return false;
  var origProd = emergencyEditSnapshot.products[idx];
  if (!origProd) return false;

  // Quantity changed — check DOM input first, then working state
  var qtyEl = document.getElementById('ee-qty-' + idx);
  var liveQty = qtyEl ? (parseInt(qtyEl.value) || 0) : null;
  var workingQty = (emergencyWorkingQty && emergencyWorkingQty[idx] !== undefined) ? emergencyWorkingQty[idx] : origProd.cantidad;
  var currentQty = liveQty !== null ? liveQty : workingQty;
  if (currentQty !== origProd.cantidad) return true;

  // ML code changed
  var snapMl = emergencyEditSnapshot.mlCodes ? emergencyEditSnapshot.mlCodes[idx] : null;
  var workMl = emergencyWorkingMlCodes ? emergencyWorkingMlCodes[idx] : null;
  if ((snapMl ? snapMl.code : '') !== (workMl ? workMl.code : '')) return true;

  // Anomaly changed for this product
  if (emergencyWorkingAnomalies && emergencyEditSnapshot.anomalies) {
    var workAnom = emergencyWorkingAnomalies.find(function(a) { return a.codigo === origProd.codigo; });
    var snapAnom = emergencyEditSnapshot.anomalies.find(function(a) { return a.codigo === origProd.codigo; });
    if (workAnom && (workAnom._isNew || workAnom._deleted)) return true;
    if (!workAnom && snapAnom) return true;
    if (workAnom && snapAnom) {
      if (workAnom.esperado !== snapAnom.esperado || workAnom.recibido !== snapAnom.recibido ||
          workAnom.danados !== snapAnom.danados || workAnom.desc !== snapAnom.desc) return true;
      var sFotos = snapAnom.fotos ? snapAnom.fotos.length : 0;
      var wFotos = workAnom.fotos ? workAnom.fotos.length : 0;
      var pFotos = workAnom._pendingDeleteFotos ? workAnom._pendingDeleteFotos.length : 0;
      if (wFotos !== sFotos || pFotos > 0) return true;
    }
  }

  // Box changes for this product
  if (emergencyWorkingBoxes && emergencyEditSnapshot.boxes) {
    var workBoxProd = emergencyWorkingBoxes.find(function(b) { return b.codigo === origProd.codigo; });
    var snapBoxProd = emergencyEditSnapshot.boxes.find(function(b) { return b.codigo === origProd.codigo; });
    if (workBoxProd && snapBoxProd) {
      for (var ci = 0; ci < workBoxProd.cajas.length; ci++) {
        var caja = workBoxProd.cajas[ci];
        if (caja._isNew || caja._deleted) return true;
        var snapCaja = snapBoxProd.cajas.find(function(sc) { return sc.code === caja.code; });
        if (snapCaja && snapCaja.qty !== caja.qty) return true;
      }
    }
  }

  return false;
}

function onEmergencyFieldChange() {
  syncEmergencyWorkingQty();
  updateEmergencyChangeCount();
  updateInfoFieldBadges();
}

function updateInfoFieldBadges() {
  if (!emergencyEditSnapshot) return;
  var p = emergencyEditSnapshot;
  function setBadge(inputId, changed, originalVal) {
    var el = document.getElementById(inputId);
    if (!el) return;
    var row = el.parentNode.querySelector('.ee-info-change-row');
    if (!row) return;
    row.style.display = changed ? 'flex' : 'none';
    if (changed && originalVal !== undefined) {
      var origSpan = row.querySelector('.ee-original-val');
      if (origSpan) origSpan.textContent = originalVal;
    }
  }
  var codeEl  = document.getElementById('ee-code');      if (codeEl)   setBadge('ee-code',      codeEl.value !== p.code,               p.code);
  var provEl  = document.getElementById('ee-proveedor'); if (provEl)   setBadge('ee-proveedor', provEl.value !== p.proveedor,           p.proveedor);
  var fechaEl = document.getElementById('ee-fecha');     if (fechaEl)  setBadge('ee-fecha',     fechaEl.value !== ddmmToDatetimeLocal(p.fecha), p.fecha);
  var tipoEl  = document.getElementById('ee-tipo');      if (tipoEl)   setBadge('ee-tipo',      tipoEl.value !== (p.tipo || ''),       p.tipo || '');
  var statEl  = document.getElementById('ee-status');
  if (statEl) {
    var baseStatus = p.status.replace('-anomalia', '');
    var changed = statEl.value !== baseStatus;
    var statRow = statEl.nextElementSibling;
    if (statRow && statRow.classList.contains('ee-info-change-row')) {
      statRow.style.display = changed ? 'flex' : 'none';
      if (changed) {
        var statusLabels = { 'ingresada': 'Por llegar', 'en-bodega': 'En bodega', 'revisada': 'Revisada', 'por-almacenar': 'Por almacenar', 'almacenada': 'Almacenada', 'valorada': 'Valorada' };
        var origSpan = statRow.querySelector('.ee-original-val');
        if (origSpan) origSpan.textContent = statusLabels[baseStatus] || baseStatus;
      }
    }
  }
}

function updateEmergencyChangeCount() {
  var count = countEmergencyChanges();
  document.getElementById('emergencyChangeCount').textContent = count + (count === 1 ? ' cambio' : ' cambios');
  document.getElementById('emergencySubmitBtn').disabled = (count === 0);
  updateEmergencyRowBadges();
}

function updateEmergencyRowBadges() {
  if (!emergencyEditSnapshot) return;

  function patchBadge(td, show, cls, label) {
    if (!td) return;
    td.style.textAlign = 'center';
    var existing = td.querySelector('.ee-row-state-badge');
    if (show) {
      if (!existing) {
        var span = document.createElement('span');
        span.className = 'ee-row-state-badge ' + cls;
        span.textContent = label;
        td.appendChild(span);
      } else {
        existing.className = 'ee-row-state-badge ' + cls;
        existing.textContent = label;
      }
    } else {
      if (existing) existing.remove();
    }
  }

  emergencyEditSnapshot.products.forEach(function(prod, idx) {
    var qtyInput = document.getElementById('ee-qty-' + idx);
    if (!qtyInput) return;
    var row = qtyInput.closest('tr');
    if (!row) return;
    var isDeleted = emergencyDeletedIndices.indexOf(idx) !== -1;
    row.className = isDeleted ? 'ee-deleted-row' : (isExistingRowEdited(idx) ? 'ee-edited-row' : '');

    // Qty badge
    patchBadge(qtyInput.parentNode, !isDeleted && isQtyEdited(idx), 'ee-badge-edited', 'EDITADO');

    // Boxes badge
    var boxesBtn = document.getElementById('ee-boxes-btn-' + prod.codigo);
    if (boxesBtn) patchBadge(boxesBtn.parentNode, !isDeleted && isBoxesEdited(prod.codigo), 'ee-badge-edited', 'EDITADO');

    // Anomaly badge
    var anomBtn = document.getElementById('ee-anom-btn-' + prod.codigo);
    if (anomBtn) {
      var workAnom = emergencyWorkingAnomalies ? emergencyWorkingAnomalies.find(function(a) { return a.codigo === prod.codigo; }) : null;
      var snapAnom = emergencyEditSnapshot.anomalies ? emergencyEditSnapshot.anomalies.find(function(a) { return a.codigo === prod.codigo; }) : null;
      var anomCls = 'ee-badge-edited', anomLabel = 'EDITADO';
      if (workAnom && workAnom._deleted) { anomCls = 'ee-badge-deleted'; anomLabel = 'ELIMINADO'; }
      else if (workAnom && workAnom._isNew) { anomCls = 'ee-badge-new'; anomLabel = 'NUEVO'; }
      else if (!workAnom && snapAnom) { anomCls = 'ee-badge-deleted'; anomLabel = 'ELIMINADO'; }
      patchBadge(anomBtn.parentNode, !isDeleted && isAnomalyEdited(prod.codigo), anomCls, anomLabel);
    }

    // Delete column — ELIMINADO badge only
    var lastTd = row.cells[row.cells.length - 1];
    if (lastTd) {
      var lastBadge = lastTd.querySelector('.ee-row-state-badge');
      if (isDeleted && !lastBadge) {
        var span = document.createElement('span');
        span.className = 'ee-row-state-badge ee-badge-deleted';
        span.textContent = 'ELIMINADO';
        lastTd.style.textAlign = 'center';
        lastTd.appendChild(span);
      } else if (!isDeleted && lastBadge) {
        lastBadge.remove();
        lastTd.style.textAlign = '';
      }
    }
  });
}

function countEmergencyChanges() {
  if (!emergencyEditSnapshot) return 0;
  var p = emergencyEditSnapshot;
  var count = 0;

  // Info field changes
  var codeInput = document.getElementById('ee-code');
  var provInput = document.getElementById('ee-proveedor');
  var fechaInput = document.getElementById('ee-fecha');
  var statusInput = document.getElementById('ee-status');
  var tipoInput = document.getElementById('ee-tipo');
  if (codeInput && codeInput.value.trim() !== p.code) count++;
  if (provInput && provInput.value.trim() !== p.proveedor) count++;
  if (fechaInput && datetimeLocalToDdmm(fechaInput.value) !== p.fecha) count++;
  if (statusInput && statusInput.value !== p.status.replace('-anomalia', '')) count++;
  if (tipoInput && tipoInput.value !== p.tipo) count++;

  // Deleted rows
  count += emergencyDeletedIndices.length;

  // New rows (each counts as 1)
  count += emergencyNewRows.length;

  // Modified existing rows
  p.products.forEach(function(origProd, idx) {
    if (emergencyDeletedIndices.indexOf(idx) !== -1) return;
    var qtyInput = document.getElementById('ee-qty-' + idx);
    var descInput = document.getElementById('ee-desc-' + idx);
    if (qtyInput && parseInt(qtyInput.value) !== origProd.cantidad) count++;
    else if (descInput && descInput.value.trim() !== origProd.desc) count++;
    // ML code change
    var snapMl = p.mlCodes ? p.mlCodes[idx] : null;
    var workMl = emergencyWorkingMlCodes ? emergencyWorkingMlCodes[idx] : null;
    var snapCode = snapMl ? snapMl.code : '';
    var workCode = workMl ? workMl.code : '';
    if (workCode !== snapCode) count++;
  });

  // Box changes
  if (emergencyWorkingBoxes && p.boxes) {
    emergencyWorkingBoxes.forEach(function(prodBoxes) {
      var snapProd = p.boxes.find(function(b) { return b.codigo === prodBoxes.codigo; });
      if (!snapProd) return;
      prodBoxes.cajas.forEach(function(caja) {
        if (caja._isNew || caja._deleted) { count++; return; }
        var snapCaja = snapProd.cajas.find(function(sc) { return sc.code === caja.code; });
        if (snapCaja && snapCaja.qty !== caja.qty) count++;
      });
    });
  }

  // Anomaly changes
  if (emergencyWorkingAnomalies && p.anomalies) {
    emergencyWorkingAnomalies.forEach(function(anom) {
      if (anom._isNew || anom._deleted) { count++; return; }
      var snapAnom = p.anomalies.find(function(sa) { return sa.codigo === anom.codigo; });
      if (!snapAnom) return;
      if (anom.esperado !== snapAnom.esperado) count++;
      else if (anom.recibido !== snapAnom.recibido) count++;
      else if (anom.danados !== snapAnom.danados) count++;
      else if (anom.desc !== snapAnom.desc) count++;
      var snapFotos = snapAnom.fotos ? snapAnom.fotos.length : 0;
      var workFotos = anom.fotos ? anom.fotos.length : 0;
      var pendingFotos = anom._pendingDeleteFotos ? anom._pendingDeleteFotos.length : 0;
      if (workFotos !== snapFotos || pendingFotos > 0) count += Math.abs(workFotos - snapFotos) + pendingFotos;
    });
  }

  return count;
}

/* === Emergency product table rendering === */
function eeGetColSpan() {
  var hasEEBoxes = emergencyWorkingBoxes && emergencyWorkingBoxes.length > 0;
  // # + MLCode + Desc + Qty + [Boxes] + Anomaly + Delete
  return 5 + (hasEEBoxes ? 1 : 0) + 1;
}

function renderEmergencyProductTable(code) {
  var tbody = document.getElementById('detailProductTableBody');
  var hasEEBoxes = emergencyWorkingBoxes && emergencyWorkingBoxes.length > 0;
  var colSpan = eeGetColSpan();

  // Column visibility
  document.getElementById('detailBoxesColHeader').style.display = hasEEBoxes ? '' : 'none';
  document.getElementById('detailAnomalyColHeader').style.display = '';
  document.getElementById('detailPriceColHeader').style.display = 'none';
  document.getElementById('detailTotalColHeader').style.display = 'none';
  document.getElementById('detailDescFacturaColHeader').style.display = 'none';
  document.getElementById('detailDeleteColHeader').style.display = '';

  // Show add-row button, hide edit-ML button
  var addRowBtn = document.getElementById('emergencyAddRowBtn');
  if (addRowBtn) addRowBtn.style.display = 'inline-flex';
  var editMlBtn = document.getElementById('detailEditMlBtn');
  if (editMlBtn) editMlBtn.style.display = 'none';

  // Hide PO upload zone
  var poZone = document.getElementById('poUploadZone');
  if (poZone) poZone.style.display = 'none';

  var html = '';
  emergencyEditSnapshot.products.forEach(function(prod, idx) {
    var isDeleted = emergencyDeletedIndices.indexOf(idx) !== -1;
    var mlMatch = emergencyWorkingMlCodes ? (emergencyWorkingMlCodes[idx] || null) : (masslineCatalog[idx] || null);
    var mlCode = mlMatch ? mlMatch.code : '';
    var mlDesc = mlMatch ? mlMatch.desc : '';
    var workAnom = emergencyWorkingAnomalies ? emergencyWorkingAnomalies.find(function(a) { return a.codigo === prod.codigo && !a._deleted; }) : null;
    var isAnomalyDeleted = emergencyWorkingAnomalies ? emergencyWorkingAnomalies.find(function(a) { return a.codigo === prod.codigo && a._deleted; }) : null;

    var isEdited = !isDeleted && isExistingRowEdited(idx);
    var rowClass = isDeleted ? ' class="ee-deleted-row"' : (isEdited ? ' class="ee-edited-row"' : '');
    html += '<tr' + rowClass + '>';
    html += '<td>' + prod.num + '</td>'; // # column — badge goes in delete/restore column
    // ML Code — autocomplete
    html += '<td class="ml-ac-cell" style="min-width:120px;"><div class="ml-autocomplete">' +
      '<input type="text" class="ml-ac-input' + (mlCode ? ' filled' : '') + '" data-field="code" data-ee-idx="' + idx + '" ' +
      'value="' + escEEAttr(mlCode) + '" placeholder="Cód. ML..." ' +
      (isDeleted ? 'disabled ' : 'onfocus="eeShowMlDropdown(this)" oninput="eeFilterMassline(this)"') + '>' +
      '<div class="ml-ac-dropdown"></div></div></td>';
    // Description — autocomplete
    html += '<td class="ml-ac-cell ml-desc-cell"><div class="ml-autocomplete">' +
      '<input type="text" class="ml-ac-input' + (prod.desc ? ' filled' : '') + '" data-field="desc" data-ee-idx="' + idx + '" ' +
      'id="ee-desc-' + idx + '" value="' + escEEAttr(prod.desc) + '" placeholder="Descripción ML..." ' +
      (isDeleted ? 'disabled ' : 'onfocus="eeShowMlDropdown(this)" oninput="eeFilterMassline(this)"') + ' style="min-width:160px;">' +
      '<div class="ml-ac-dropdown"></div></div></td>';
    var currentQty = (emergencyWorkingQty && emergencyWorkingQty[idx] !== undefined) ? emergencyWorkingQty[idx] : prod.cantidad;
    var isQtyChanged = !isDeleted && isQtyEdited(idx);
    html += '<td style="text-align:center;"><input type="number" id="ee-qty-' + idx + '" class="emergency-edit-input" style="width:70px;text-align:right;" value="' + currentQty + '" min="1"' + (isDeleted ? ' disabled' : ' oninput="onEmergencyFieldChange()"') + '>';
    if (isQtyChanged) html += '<span class="ee-row-state-badge ee-badge-edited">EDITADO</span>';
    html += '</td>';

    // Boxes button
    if (hasEEBoxes) {
      var prodBoxes = emergencyWorkingBoxes.find(function(b) { return b.codigo === prod.codigo; });
      var activeCajas = prodBoxes ? prodBoxes.cajas.filter(function(c) { return !c._deleted; }) : [];
      if (prodBoxes) {
        var isBoxesChanged = !isDeleted && isBoxesEdited(prod.codigo);
        html += '<td style="text-align:center;"><button class="btn-view-boxes" id="ee-boxes-btn-' + prod.codigo + '" onclick="toggleEmergencyBoxPanel(\'' + escEEAttr(prod.codigo) + '\')" title="Editar cajas">';
        html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>';
        html += '<span class="detail-box-badge">' + activeCajas.length + '</span>';
        html += '</button>';
        if (isBoxesChanged) html += '<span class="ee-row-state-badge ee-badge-edited">EDITADO</span>';
        html += '</td>';
      } else {
        html += '<td></td>';
      }
    }

    // Anomaly button
    var isAnomChanged = !isDeleted && isAnomalyEdited(prod.codigo);
    html += '<td style="text-align:center;">';
    if (workAnom) {
      var anomBtnCls = 'btn-view-anomaly' + (workAnom._isNew ? ' snapshot-new' : '');
      html += '<button class="' + anomBtnCls + '" id="ee-anom-btn-' + prod.codigo + '" onclick="toggleEmergencyAnomalyPanel(\'' + escEEAttr(prod.codigo) + '\',\'' + escEEAttr(prod.desc) + '\')" title="Editar anomalía">';
      html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
      html += '</button>';
    } else if (isAnomalyDeleted) {
      html += '<button class="btn-view-anomaly snapshot-deleted" id="ee-anom-btn-' + prod.codigo + '" onclick="toggleEmergencyAnomalyPanel(\'' + escEEAttr(prod.codigo) + '\',\'' + escEEAttr(prod.desc) + '\')" title="Anomalía marcada para eliminar">';
      html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
      html += '</button>';
    } else {
      html += '<button class="btn-add-anomaly-ee" id="ee-anom-btn-' + prod.codigo + '" onclick="toggleEmergencyAnomalyPanel(\'' + escEEAttr(prod.codigo) + '\',\'' + escEEAttr(prod.desc) + '\')" title="Agregar anomalía">';
      html += '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';
      html += '</button>';
    }
    if (isAnomChanged) html += '<span class="ee-row-state-badge ee-badge-edited">EDITADO</span>';
    html += '</td>';

    // Delete / Restore button — ELIMINADO badge only for deleted rows
    if (isDeleted) {
      html += '<td style="text-align:center;"><button class="ee-restore-btn" onclick="restoreEmergencyRow(' + idx + ')" title="Restaurar ítem"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg></button>';
      html += '<span class="ee-row-state-badge ee-badge-deleted">ELIMINADO</span></td>';
    } else {
      html += '<td><button class="manual-row-remove" onclick="deleteEmergencyRow(' + idx + ', false)" title="Eliminar ítem"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></td>';
    }
    html += '</tr>';

    // Expandable boxes row (only if not deleted)
    if (!isDeleted && hasEEBoxes && emergencyWorkingBoxes.find(function(b) { return b.codigo === prod.codigo; })) {
      html += '<tr class="detail-box-row" id="ee-boxes-row-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:#f8f7ff;"></td></tr>';
    }

    // Expandable anomaly row (only if not deleted)
    if (!isDeleted) {
      html += '<tr class="detail-anomaly-row" id="ee-anom-row-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:#fffbeb;"></td></tr>';
    }
  });

  // New rows
  emergencyNewRows.forEach(function(newRow, nIdx) {
    var newCajas = newRow.cajas || [];
    var activeCajas = newCajas.filter(function(c) { return !c._deleted; });
    var hasNewAnomaly = !!newRow.anomaly;
    html += '<tr class="emergency-new-row">';
    html += '<td>' + (nIdx + 1) + '</td>'; // # column for new rows
    // ML Code autocomplete
    html += '<td class="ml-ac-cell" style="min-width:120px;"><div class="ml-autocomplete">' +
      '<input type="text" class="ml-ac-input' + (newRow.mlCode ? ' filled' : '') + '" data-field="code" data-ee-new-idx="' + nIdx + '" ' +
      'value="' + escEEAttr(newRow.mlCode || '') + '" placeholder="Cód. ML..." ' +
      'onfocus="eeShowMlDropdown(this)" oninput="eeFilterMassline(this)">' +
      '<div class="ml-ac-dropdown"></div></div></td>';
    // ML Desc autocomplete
    html += '<td class="ml-ac-cell ml-desc-cell"><div class="ml-autocomplete">' +
      '<input type="text" class="ml-ac-input' + (newRow.desc ? ' filled' : '') + '" data-field="desc" data-ee-new-idx="' + nIdx + '" ' +
      'id="ee-newdesc-' + nIdx + '" value="' + escEEAttr(newRow.desc || '') + '" placeholder="Descripción del producto..." ' +
      'onfocus="eeShowMlDropdown(this)" oninput="eeFilterMassline(this); syncEmergencyNewRow(' + nIdx + ')" style="min-width:160px;">' +
      '<div class="ml-ac-dropdown"></div></div></td>';
    html += '<td><input type="number" id="ee-newqty-' + nIdx + '" class="emergency-edit-input" style="width:70px;text-align:right;" placeholder="0" value="' + escEEAttr(String(newRow.qty || '')) + '" min="1" oninput="syncEmergencyNewRow(' + nIdx + ')"></td>';
    // Boxes button
    if (hasEEBoxes) {
      html += '<td style="text-align:center;"><button class="btn-view-boxes" id="ee-newboxes-btn-' + nIdx + '" onclick="toggleEmergencyNewBoxPanel(' + nIdx + ')" title="Cajas">';
      html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>';
      html += '<span class="detail-box-badge">' + activeCajas.length + '</span>';
      html += '</button></td>';
    }
    // Anomaly button
    html += '<td style="text-align:center;">';
    if (hasNewAnomaly) {
      html += '<button class="btn-view-anomaly snapshot-new" id="ee-newanom-btn-' + nIdx + '" onclick="toggleEmergencyNewAnomalyPanel(' + nIdx + ')" title="Anomalía">';
      html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
      html += '</button>';
    } else {
      html += '<button class="btn-add-anomaly-ee" id="ee-newanom-btn-' + nIdx + '" onclick="toggleEmergencyNewAnomalyPanel(' + nIdx + ')" title="Agregar anomalía">';
      html += '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';
      html += '</button>';
    }
    html += '</td>';
    html += '<td style="text-align:center;"><button class="manual-row-remove" onclick="deleteEmergencyRow(' + nIdx + ', true)" title="Eliminar ítem"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';
    html += '<span class="ee-row-state-badge ee-badge-new">NUEVO</span></td>';
    html += '</tr>';
    // Boxes expandable row
    if (hasEEBoxes) {
      html += '<tr class="detail-box-row" id="ee-newboxes-row-' + nIdx + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:#f8f7ff;"></td></tr>';
    }
    // Anomaly expandable row
    html += '<tr class="detail-anomaly-row" id="ee-newanom-row-' + nIdx + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:#fffbeb;"></td></tr>';
  });

  tbody.innerHTML = html;

  // Update item count
  var visibleCount = emergencyEditSnapshot.products.length - emergencyDeletedIndices.length + emergencyNewRows.length;
  var itemCountEl = document.getElementById('detailItemCount');
  if (itemCountEl) itemCountEl.textContent = visibleCount;
}

function addEmergencyRow() {
  emergencyNewRows.push({ desc: '', qty: '', mlCode: '', mlDesc: '', cajas: [], anomaly: null });
  renderEmergencyProductTable(detailParams.code);
  var lastIdx = emergencyNewRows.length - 1;
  var input = document.getElementById('ee-newdesc-' + lastIdx);
  if (input) input.focus();
}

/* === EE Autocomplete (Massline catalog) for emergency product table === */
function filterEeMasslineCatalog(qCode, qDesc) {
  var catalog = masslineCatalog.filter(Boolean);
  if (!qCode && !qDesc) return catalog;
  return catalog.filter(function(item) {
    var matchCode = !qCode || item.code.toLowerCase().includes(qCode) || item.desc.toLowerCase().includes(qCode);
    var matchDesc = !qDesc || item.desc.toLowerCase().includes(qDesc) || item.code.toLowerCase().includes(qDesc);
    return matchCode && matchDesc;
  });
}

function eeRenderMlOptions(dropdown, filtered) {
  dropdown.innerHTML = filtered.map(function(item) {
    return '<div class="ml-ac-option" onmousedown="eeSelectMassline(this,\'' +
      item.code.replace(/\\/g,'\\\\').replace(/'/g,"\\'") + '\',\'' +
      item.desc.replace(/\\/g,'\\\\').replace(/'/g,"\\'") + '\')">' +
      '<span class="ml-ac-option-code">' + item.code + '</span>' +
      '<span class="ml-ac-option-desc">' + item.desc + '</span>' +
      '</div>';
  }).join('');
  if (filtered.length === 0) {
    dropdown.innerHTML = '<div style="padding:8px 10px;color:#8b8fa3;font-size:12px;">Sin resultados</div>';
  }
}

function eeShowMlDropdown(input) {
  document.querySelectorAll('.ml-ac-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
  var row = input.closest('tr');
  var codeInput = row.querySelector('[data-field="code"]');
  var descInput = row.querySelector('[data-field="desc"]');
  var qCode = codeInput ? codeInput.value.toLowerCase().trim() : '';
  var qDesc = descInput ? descInput.value.toLowerCase().trim() : '';
  var filtered = filterEeMasslineCatalog(qCode, qDesc);
  var dropdown = input.nextElementSibling;
  eeRenderMlOptions(dropdown, filtered);
  dropdown.classList.add('open');
}

function eeFilterMassline(input) {
  var row = input.closest('tr');
  var codeInput = row.querySelector('[data-field="code"]');
  var descInput = row.querySelector('[data-field="desc"]');
  var qCode = codeInput ? codeInput.value.toLowerCase().trim() : '';
  var qDesc = descInput ? descInput.value.toLowerCase().trim() : '';
  var filtered = filterEeMasslineCatalog(qCode, qDesc);
  var dropdown = input.nextElementSibling;
  eeRenderMlOptions(dropdown, filtered);
  dropdown.classList.add('open');
  // Sync sibling dropdown if open
  var sibField = input.dataset.field === 'code' ? 'desc' : 'code';
  var sibInput = row.querySelector('[data-field="' + sibField + '"]');
  if (sibInput) {
    var sibDropdown = sibInput.nextElementSibling;
    if (sibDropdown && sibDropdown.classList.contains('open')) eeRenderMlOptions(sibDropdown, filtered);
  }
  // Clear filled state when input is emptied
  if (!input.value.trim()) {
    input.classList.remove('filled');
    if (sibInput) sibInput.classList.remove('filled');
  }
  onEmergencyFieldChange();
}

function eeSelectMassline(option, code, desc) {
  var dropdown = option.closest('.ml-ac-dropdown');
  dropdown.classList.remove('open');
  var input = dropdown.previousElementSibling;
  var row = input.closest('tr');
  var codeInput = row.querySelector('[data-field="code"]');
  var descInput = row.querySelector('[data-field="desc"]');
  if (codeInput) { codeInput.value = code; codeInput.classList.add('filled'); }
  if (descInput) { descInput.value = desc; descInput.classList.add('filled'); }
  // Existing row: update working ML codes
  var idx = codeInput ? parseInt(codeInput.dataset.eeIdx) : NaN;
  if (!isNaN(idx) && emergencyWorkingMlCodes) {
    emergencyWorkingMlCodes[idx] = { code: code, desc: desc };
  }
  // New row: update emergencyNewRows
  var newIdx = codeInput ? parseInt(codeInput.dataset.eeNewIdx) : NaN;
  if (!isNaN(newIdx) && emergencyNewRows[newIdx]) {
    emergencyNewRows[newIdx].mlCode = code;
    emergencyNewRows[newIdx].mlDesc = desc;
    emergencyNewRows[newIdx].desc = desc;
  }
  onEmergencyFieldChange();
}

function syncEmergencyNewRow(nIdx) {
  var descInput = document.getElementById('ee-newdesc-' + nIdx);
  var qtyInput = document.getElementById('ee-newqty-' + nIdx);
  if (emergencyNewRows[nIdx]) {
    emergencyNewRows[nIdx].desc = descInput ? descInput.value : '';
    emergencyNewRows[nIdx].qty = qtyInput ? qtyInput.value : '';
  }
  updateEmergencyChangeCount();
}

function deleteEmergencyRow(idx, isNew) {
  if (isNew) {
    emergencyNewRows.splice(idx, 1);
  } else {
    emergencyDeletedIndices.push(idx);
  }
  renderEmergencyProductTable(detailParams.code);
  updateEmergencyChangeCount();
}

function restoreEmergencyRow(idx) {
  var pos = emergencyDeletedIndices.indexOf(idx);
  if (pos !== -1) emergencyDeletedIndices.splice(pos, 1);
  renderEmergencyProductTable(detailParams.code);
  updateEmergencyChangeCount();
}

/* ===== Emergency New Row — Boxes ===== */

function toggleEmergencyNewBoxPanel(nIdx) {
  var row = document.getElementById('ee-newboxes-row-' + nIdx);
  if (!row) return;
  var isVisible = row.style.display !== 'none';
  document.querySelectorAll('[id^="ee-boxes-row-"],[id^="ee-newboxes-row-"],[id^="ee-anom-row-"],[id^="ee-newanom-row-"]').forEach(function(r) { r.style.display = 'none'; });
  document.querySelectorAll('[id^="ee-boxes-btn-"],[id^="ee-newboxes-btn-"],[id^="ee-anom-btn-"],[id^="ee-newanom-btn-"]').forEach(function(b) { b.classList.remove('expanded'); });
  if (!isVisible) {
    refreshEmergencyNewBoxPanel(nIdx);
    row.style.display = '';
    var btn = document.getElementById('ee-newboxes-btn-' + nIdx);
    if (btn) btn.classList.add('expanded');
  }
}

function refreshEmergencyNewBoxPanel(nIdx) {
  var row = document.getElementById('ee-newboxes-row-' + nIdx);
  if (!row) return;
  var td = row.querySelector('td');
  if (td) td.innerHTML = buildEmergencyNewBoxPanel(nIdx);
}

function buildEmergencyNewBoxPanel(nIdx) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow) return '';
  var cajas = newRow.cajas || [];
  var activeCajas = cajas.filter(function(c) { return !c._deleted; });
  var prodDesc = newRow.mlDesc || newRow.desc || 'Nuevo ítem';
  var html = '<div class="detail-box-panel" style="margin:8px 0;">';
  html += '<div class="detail-box-panel-header">';
  html += '<div class="detail-box-panel-title"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg> Distribución en cajas — ' + prodDesc + '</div>';
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  html += '<span class="detail-box-count">' + activeCajas.length + (activeCajas.length === 1 ? ' caja' : ' cajas') + '</span>';
  html += '<button class="btn-add-emergency-row" style="font-size:11px; padding:3px 10px;" onclick="addEmergencyNewBox(' + nIdx + ')">';
  html += '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Agregar caja</button>';
  html += '</div></div>';
  html += '<div class="detail-box-list">';
  if (cajas.length === 0) {
    html += '<div class="storage-no-boxes">Sin cajas. Agrega una usando el botón.</div>';
  }
  cajas.forEach(function(caja, ci) {
    html += '<div class="detail-box-item box-new">';
    html += '<span class="emergency-new-badge" style="margin-left:2px;">Nueva</span>';
    html += '<input type="text" class="emergency-edit-input" style="width:100px; flex-shrink:0;" value="' + escEEAttr(caja.code) + '" placeholder="CAJA-001" oninput="syncEmergencyNewBox(' + nIdx + ',' + ci + ',\'code\',this.value)">';
    html += '<input type="number" class="emergency-edit-input" style="width:72px; text-align:right; flex-shrink:0;" value="' + caja.qty + '" min="0" oninput="syncEmergencyNewBox(' + nIdx + ',' + ci + ',\'qty\',this.value)">';
    html += '<span style="font-size:12px; color:#9ca3af; flex-shrink:0;">uds</span>';
    html += '<input type="text" class="ee-box-position-input" placeholder="A-00-00" value="' + escEEAttr(caja.position || '') + '" oninput="syncEmergencyNewBox(' + nIdx + ',' + ci + ',\'position\',this.value)" title="Posición">';
    html += '<button class="manual-row-remove" onclick="deleteEmergencyNewBox(' + nIdx + ',' + ci + ')" title="Eliminar caja"><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

function addEmergencyNewBox(nIdx) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow) return;
  if (!newRow.cajas) newRow.cajas = [];
  var newCount = newRow.cajas.length + 1;
  newRow.cajas.push({ code: 'CAJA-' + String(newCount).padStart(3, '0'), qty: 0, position: '' });
  refreshEmergencyNewBoxPanel(nIdx);
  var activeCajas = newRow.cajas.filter(function(c) { return !c._deleted; });
  var btn = document.getElementById('ee-newboxes-btn-' + nIdx);
  if (btn) { var badge = btn.querySelector('.detail-box-badge'); if (badge) badge.textContent = activeCajas.length; }
  updateEmergencyChangeCount();
}

function syncEmergencyNewBox(nIdx, cajaIdx, field, value) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow || !newRow.cajas || !newRow.cajas[cajaIdx]) return;
  if (field === 'qty') newRow.cajas[cajaIdx].qty = parseInt(value) || 0;
  else if (field === 'code') newRow.cajas[cajaIdx].code = value.trim();
  else if (field === 'position') newRow.cajas[cajaIdx].position = value.trim();
  updateEmergencyChangeCount();
}

function deleteEmergencyNewBox(nIdx, cajaIdx) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow || !newRow.cajas || !newRow.cajas[cajaIdx]) return;
  newRow.cajas.splice(cajaIdx, 1);
  refreshEmergencyNewBoxPanel(nIdx);
  var activeCajas = (newRow.cajas || []).filter(function(c) { return !c._deleted; });
  var btn = document.getElementById('ee-newboxes-btn-' + nIdx);
  if (btn) { var badge = btn.querySelector('.detail-box-badge'); if (badge) badge.textContent = activeCajas.length; }
  updateEmergencyChangeCount();
}

/* ===== Emergency New Row — Anomaly ===== */

function toggleEmergencyNewAnomalyPanel(nIdx) {
  var row = document.getElementById('ee-newanom-row-' + nIdx);
  if (!row) return;
  var isVisible = row.style.display !== 'none';
  document.querySelectorAll('[id^="ee-boxes-row-"],[id^="ee-newboxes-row-"],[id^="ee-anom-row-"],[id^="ee-newanom-row-"]').forEach(function(r) { r.style.display = 'none'; });
  document.querySelectorAll('[id^="ee-boxes-btn-"],[id^="ee-newboxes-btn-"],[id^="ee-anom-btn-"],[id^="ee-newanom-btn-"]').forEach(function(b) { b.classList.remove('expanded'); });
  if (!isVisible) {
    refreshEmergencyNewAnomalyPanel(nIdx);
    row.style.display = '';
    var btn = document.getElementById('ee-newanom-btn-' + nIdx);
    if (btn) btn.classList.add('expanded');
  }
}

function refreshEmergencyNewAnomalyPanel(nIdx) {
  var row = document.getElementById('ee-newanom-row-' + nIdx);
  if (!row) return;
  var td = row.querySelector('td');
  if (td) td.innerHTML = buildEmergencyNewAnomalyPanel(nIdx);
}

function buildEmergencyNewAnomalyPanel(nIdx) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow) return '';
  var anom = newRow.anomaly;
  var prodDesc = newRow.mlDesc || newRow.desc || 'Nuevo ítem';

  if (!anom) {
    return '<div class="emergency-sub-panel">' +
      '<div class="emergency-sub-panel-header">' +
      '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>' +
      '<span>Anomalía — ' + prodDesc + '</span>' +
      '<button class="btn-add-emergency-row" style="margin-left:auto; font-size:11px; padding:3px 10px;" onclick="addEmergencyNewAnomaly(' + nIdx + ')">' +
      '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Agregar anomalía</button>' +
      '</div></div>';
  }

  var html = '<div class="emergency-sub-panel">';
  html += '<div class="emergency-sub-panel-header">';
  html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
  html += '<span>Nueva anomalía — ' + prodDesc + '</span>';
  html += '<span class="emergency-new-badge" style="margin-left:8px;">Nueva</span>';
  html += '<button class="manual-row-remove" style="margin-left:auto; color:#ef4444; width:28px; height:28px; border-radius:7px; border:1.5px solid #fecaca; background:#fff5f5; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;" onclick="deleteEmergencyNewAnomaly(' + nIdx + ')" title="Cancelar anomalía">';
  html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
  html += '</button></div>';
  html += '<div class="emergency-anomaly-fields">';
  html += '<div class="emergency-anomaly-field"><label style="font-size:11px;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Esperado</label>';
  html += '<input type="number" class="emergency-edit-input" style="width:80px;" id="ee-newanom-esp-' + nIdx + '" value="' + (anom.esperado || 0) + '" min="0" oninput="syncEmergencyNewAnomaly(' + nIdx + ')"></div>';
  html += '<div class="emergency-anomaly-field"><label style="font-size:11px;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Recibido</label>';
  html += '<input type="number" class="emergency-edit-input" style="width:80px;" id="ee-newanom-rec-' + nIdx + '" value="' + (anom.recibido || 0) + '" min="0" oninput="syncEmergencyNewAnomaly(' + nIdx + ')"></div>';
  html += '<div class="emergency-anomaly-field"><label style="font-size:11px;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Dañados</label>';
  html += '<input type="number" class="emergency-edit-input" style="width:80px;" id="ee-newanom-dan-' + nIdx + '" value="' + (anom.danados || 0) + '" min="0" oninput="syncEmergencyNewAnomaly(' + nIdx + ')"></div>';
  html += '<div class="emergency-anomaly-field" style="flex:1; min-width:200px;"><label style="font-size:11px;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Descripción</label>';
  html += '<input type="text" class="emergency-edit-input" style="width:100%;" id="ee-newanom-desc-' + nIdx + '" value="' + escEEAttr(anom.desc || '') + '" oninput="syncEmergencyNewAnomaly(' + nIdx + ')"></div>';
  html += '</div>';
  // Photos
  var fotos = anom.fotos || [];
  html += '<div class="ee-photo-zone">';
  html += '<div class="ee-photo-zone-header"><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Fotos de evidencia</div>';
  if (fotos.length > 0) {
    html += '<div class="ee-photo-thumbs" id="ee-newanom-thumbs-' + nIdx + '">';
    fotos.forEach(function(src, pIdx) {
      html += '<div class="ee-photo-thumb"><img src="' + src + '" alt="foto ' + (pIdx+1) + '"><button class="ee-photo-remove" onclick="removeEmergencyNewAnomalyPhoto(' + nIdx + ',' + pIdx + ')" title="Eliminar foto">\u00d7</button></div>';
    });
    html += '</div>';
  } else {
    html += '<div class="ee-photo-thumbs ee-photo-thumbs-empty" id="ee-newanom-thumbs-' + nIdx + '"><span>Sin fotos adjuntas</span></div>';
  }
  html += '<label class="ee-photo-add-btn">';
  html += '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Adjuntar fotos';
  html += '<input type="file" accept="image/*" multiple style="display:none;" onchange="addEmergencyNewAnomalyPhoto(' + nIdx + ',this)">';
  html += '</label></div>';
  html += '</div></div>';
  return html;
}

function addEmergencyNewAnomaly(nIdx) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow) return;
  newRow.anomaly = { esperado: parseInt(newRow.qty) || 0, recibido: parseInt(newRow.qty) || 0, danados: 0, desc: '', fotos: [] };
  refreshEmergencyNewAnomalyPanel(nIdx);
  var row = document.getElementById('ee-newanom-row-' + nIdx);
  if (row) row.style.display = '';
  var btn = document.getElementById('ee-newanom-btn-' + nIdx);
  if (btn) {
    btn.className = 'btn-view-anomaly snapshot-new expanded';
    btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
  }
  updateEmergencyChangeCount();
}

function deleteEmergencyNewAnomaly(nIdx) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow) return;
  newRow.anomaly = null;
  var btn = document.getElementById('ee-newanom-btn-' + nIdx);
  if (btn) {
    btn.className = 'btn-add-anomaly-ee';
    btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';
    btn.classList.remove('expanded');
  }
  refreshEmergencyNewAnomalyPanel(nIdx);
  updateEmergencyChangeCount();
}

function syncEmergencyNewAnomaly(nIdx) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow || !newRow.anomaly) return;
  var esp = document.getElementById('ee-newanom-esp-' + nIdx);
  var rec = document.getElementById('ee-newanom-rec-' + nIdx);
  var dan = document.getElementById('ee-newanom-dan-' + nIdx);
  var desc = document.getElementById('ee-newanom-desc-' + nIdx);
  if (esp) newRow.anomaly.esperado = parseInt(esp.value) || 0;
  if (rec) newRow.anomaly.recibido = parseInt(rec.value) || 0;
  if (dan) newRow.anomaly.danados = parseInt(dan.value) || 0;
  if (desc) newRow.anomaly.desc = desc.value;
  updateEmergencyChangeCount();
}

function addEmergencyNewAnomalyPhoto(nIdx, input) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow || !newRow.anomaly || !input.files || !input.files.length) return;
  var files = Array.from(input.files);
  var remaining = files.length;
  files.forEach(function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      newRow.anomaly.fotos.push(e.target.result);
      remaining--;
      if (remaining === 0) refreshEmergencyNewAnomalyPanel(nIdx);
      updateEmergencyChangeCount();
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function removeEmergencyNewAnomalyPhoto(nIdx, pIdx) {
  var newRow = emergencyNewRows[nIdx];
  if (!newRow || !newRow.anomaly || !newRow.anomaly.fotos) return;
  newRow.anomaly.fotos.splice(pIdx, 1);
  refreshEmergencyNewAnomalyPanel(nIdx);
  updateEmergencyChangeCount();
}

/* === Diff confirmation modal === */
function openEmergencyDiffModal() {
  var p = emergencyEditSnapshot;
  var diffs = [];

  var statusLabels = {
    'ingresada': 'Por llegar', 'en-bodega': 'En bodega',
    'revisada': 'Revisada', 'por-almacenar': 'Por almacenar',
    'almacenada': 'Almacenada', 'valorada': 'Valorada'
  };

  var codeInput = document.getElementById('ee-code');
  var provInput = document.getElementById('ee-proveedor');
  var fechaInput = document.getElementById('ee-fecha');
  var statusInput = document.getElementById('ee-status');
  var tipoInput = document.getElementById('ee-tipo');

  if (codeInput && codeInput.value.trim() !== p.code)
    diffs.push({ campo: 'Código', antes: p.code, despues: codeInput.value.trim() });
  if (provInput && provInput.value.trim() !== p.proveedor)
    diffs.push({ campo: 'Proveedor', antes: p.proveedor, despues: provInput.value.trim() });
  if (fechaInput) {
    var newFecha = datetimeLocalToDdmm(fechaInput.value);
    if (newFecha && newFecha !== p.fecha)
      diffs.push({ campo: 'Fecha de ingreso', antes: p.fecha, despues: newFecha });
  }
  if (statusInput && statusInput.value !== p.status.replace('-anomalia', ''))
    diffs.push({ campo: 'Estado', antes: (statusLabels[p.status.replace('-anomalia','')] || p.status), despues: (statusLabels[statusInput.value] || statusInput.value) });
  if (tipoInput && tipoInput.value !== p.tipo)
    diffs.push({ campo: 'Tipo de orden', antes: p.tipo || '—', despues: tipoInput.value });

  // Product diffs
  p.products.forEach(function(origProd, idx) {
    if (emergencyDeletedIndices.indexOf(idx) !== -1) {
      diffs.push({ campo: 'Ítem #' + origProd.num, antes: origProd.desc + ' (×' + origProd.cantidad + ')', despues: '—', type: 'deleted' });
      return;
    }
    var qtyInput = document.getElementById('ee-qty-' + idx);
    var descInput = document.getElementById('ee-desc-' + idx);
    if (qtyInput && parseInt(qtyInput.value) !== origProd.cantidad)
      diffs.push({ campo: 'Ítem #' + origProd.num + ' — cantidad', antes: String(origProd.cantidad), despues: qtyInput.value });
    if (descInput && descInput.value.trim() !== origProd.desc)
      diffs.push({ campo: 'Ítem #' + origProd.num + ' — descripción', antes: origProd.desc, despues: descInput.value.trim() });
    // ML code diff
    var snapMl = p.mlCodes ? p.mlCodes[idx] : null;
    var workMl = emergencyWorkingMlCodes ? emergencyWorkingMlCodes[idx] : null;
    var snapCode = snapMl ? snapMl.code : '—';
    var workCode = workMl ? workMl.code : '—';
    if (workCode !== snapCode)
      diffs.push({ campo: 'Ítem #' + origProd.num + ' — código Massline', antes: snapCode, despues: workCode });
  });

  emergencyNewRows.forEach(function(newRow, nIdx) {
    var itemLabel = 'Nuevo ítem #' + (nIdx + 1);
    var mlInfo = newRow.mlCode ? ' [' + newRow.mlCode + ']' : '';
    diffs.push({ campo: itemLabel, antes: '—', despues: (newRow.desc || '(sin descripción)') + mlInfo + ' ×' + (newRow.qty || '0'), type: 'added' });
    (newRow.cajas || []).forEach(function(caja) {
      diffs.push({ campo: itemLabel + ' — ' + caja.code + ' — caja', antes: '—', despues: caja.qty + ' uds' + (caja.position ? ' · ' + caja.position : ''), type: 'added' });
    });
    if (newRow.anomaly) {
      diffs.push({ campo: itemLabel + ' — anomalía', antes: '—', despues: 'Esp: ' + newRow.anomaly.esperado + ' · Rec: ' + newRow.anomaly.recibido + ' · Dañados: ' + newRow.anomaly.danados + (newRow.anomaly.desc ? ' · ' + newRow.anomaly.desc : ''), type: 'added' });
    }
  });

  // Box diffs
  if (emergencyWorkingBoxes && p.boxes) {
    emergencyWorkingBoxes.forEach(function(prodBoxes) {
      var snapProd = p.boxes.find(function(b) { return b.codigo === prodBoxes.codigo; });
      if (!snapProd) return;
      var prodMeta = p.products.find(function(pr) { return pr.codigo === prodBoxes.codigo; });
      var itemPrefix = prodMeta ? 'Item #' + prodMeta.num : prodBoxes.codigo;
      prodBoxes.cajas.forEach(function(caja) {
        if (caja._isNew) {
          diffs.push({ campo: itemPrefix + ' — ' + caja.code + ' — nueva', antes: '—', despues: caja.code + ' · ' + caja.qty + ' uds', type: 'added' });
          return;
        }
        if (caja._deleted) {
          var sc = snapProd.cajas.find(function(c) { return c.code === caja.code; });
          diffs.push({ campo: itemPrefix + ' — ' + caja.code, antes: sc ? sc.qty + ' uds' : '—', despues: '—', type: 'deleted' });
          return;
        }
        var snapCaja = snapProd.cajas.find(function(c) { return c.code === caja.code; });
        if (snapCaja && snapCaja.qty !== caja.qty)
          diffs.push({ campo: itemPrefix + ' — ' + caja.code + ' — cantidad', antes: snapCaja.qty + ' uds', despues: caja.qty + ' uds' });
        if (snapCaja && (caja.position !== undefined) && caja.position !== snapCaja.position)
          diffs.push({ campo: itemPrefix + ' — ' + caja.code + ' — posición', antes: snapCaja.position || '—', despues: caja.position });
      });
    });
  }

  // Anomaly diffs
  if (emergencyWorkingAnomalies && p.anomalies) {
    emergencyWorkingAnomalies.forEach(function(anom) {
      var anomProdMeta = p.products.find(function(pr) { return pr.codigo === anom.codigo; });
      var anomPrefix = anomProdMeta ? 'Item #' + anomProdMeta.num : anom.codigo;
      if (anom._isNew) {
        diffs.push({ campo: anomPrefix + ' — ' + anom.codigo + ' — nueva', antes: '—', despues: 'Esp: ' + anom.esperado + ' · Rec: ' + anom.recibido + ' · Dañados: ' + anom.danados, type: 'added' });
        return;
      }
      if (anom._deleted) {
        var snapA = p.anomalies.find(function(sa) { return sa.codigo === anom.codigo; });
        diffs.push({ campo: anomPrefix + ' — ' + anom.codigo, antes: snapA ? snapA.desc.substring(0, 50) + (snapA.desc.length > 50 ? '...' : '') : '—', despues: '—', type: 'deleted' });
        return;
      }
      var snapAnom = p.anomalies.find(function(sa) { return sa.codigo === anom.codigo; });
      if (!snapAnom) return;
      if (anom.esperado !== snapAnom.esperado)
        diffs.push({ campo: anomPrefix + ' — ' + anom.codigo + ' — esperado', antes: String(snapAnom.esperado), despues: String(anom.esperado) });
      if (anom.recibido !== snapAnom.recibido)
        diffs.push({ campo: anomPrefix + ' — ' + anom.codigo + ' — recibido', antes: String(snapAnom.recibido), despues: String(anom.recibido) });
      if (anom.danados !== snapAnom.danados)
        diffs.push({ campo: anomPrefix + ' — ' + anom.codigo + ' — dañados', antes: String(snapAnom.danados), despues: String(anom.danados) });
      if (anom.desc !== snapAnom.desc)
        diffs.push({ campo: anomPrefix + ' — ' + anom.codigo + ' — descripción', antes: snapAnom.desc, despues: anom.desc });
      var snapFotosArr = snapAnom.fotos || [];
      var workFotosArr = anom.fotos || [];
      var pendingDeleteArr = anom._pendingDeleteFotos || [];
      // Fotos eliminadas (en _pendingDeleteFotos)
      pendingDeleteArr.forEach(function(src, i) {
        diffs.push({ campo: anomPrefix + ' — ' + anom.codigo + ' — foto ' + (i + 1),
          antesHtml: '<img src="' + src + '" class="diff-photo-thumb">',
          despuesHtml: '<span class="diff-none">—</span>', type: 'deleted' });
      });
      // Fotos nuevas: están en working pero no en snap
      workFotosArr.forEach(function(src) {
        if (snapFotosArr.indexOf(src) === -1)
          diffs.push({ campo: anomPrefix + ' — ' + anom.codigo + ' — foto nueva',
            antesHtml: '<span class="diff-none">—</span>',
            despuesHtml: '<img src="' + src + '" class="diff-photo-thumb">', type: 'added' });
      });
    });
  }

  // Render diff table
  document.getElementById('emergencyDiffCode').textContent = p.code;
  document.getElementById('emergencyDiffReason').textContent = '"' + emergencyEditReason + '"';

  if (diffs.length === 0) {
    document.getElementById('emergencyDiffTable').innerHTML = '<div style="text-align:center; color:#9ca3af; padding:20px; font-size:13px;">Sin cambios detectados</div>';
  } else {
    var html = '<table class="emergency-diff-table">';
    html += '<thead><tr><th>Campo</th><th>Valor actual</th><th>Nuevo valor</th><th>Acción</th></tr></thead>';
    html += '<tbody>';
    diffs.forEach(function(d) {
      var rowClass = d.type === 'deleted' ? 'diff-deleted' : d.type === 'added' ? 'diff-added' : '';
      var accionLabel, accionClass;
      if (d.type === 'deleted') { accionLabel = 'Eliminado'; accionClass = 'diff-accion-deleted'; }
      else if (d.type === 'added') { accionLabel = 'Agregado'; accionClass = 'diff-accion-added'; }
      else { accionLabel = 'Editado'; accionClass = 'diff-accion-edited'; }
      html += '<tr class="' + rowClass + '">';
      html += '<td class="diff-campo">' + d.campo + '</td>';
      html += '<td class="diff-antes">' + (d.antesHtml !== undefined ? d.antesHtml : (d.antes === '—' ? '<span class="diff-none">—</span>' : d.antes)) + '</td>';
      html += '<td class="diff-despues">' + (d.despuesHtml !== undefined ? d.despuesHtml : (d.despues === '—' ? '<span class="diff-none">—</span>' : d.despues)) + '</td>';
      html += '<td><span class="diff-accion-badge ' + accionClass + '">' + accionLabel + '</span></td>';
      html += '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('emergencyDiffTable').innerHTML = html;
  }

  document.getElementById('emergencyDiffModal').classList.add('active');
}

function closeEmergencyDiffModal() {
  document.getElementById('emergencyDiffModal').classList.remove('active');
}

/* === Send request === */
function sendEmergencyRequest() {
  closeEmergencyDiffModal();

  emergencyEditMode = false;
  emergencyPendingRequest = true;
  emergencyNewRows = [];
  emergencyDeletedIndices = [];
  emergencyWorkingBoxes = null;
  emergencyWorkingAnomalies = null;
  emergencyWorkingQty = null;

  // Hide banner and bar
  document.getElementById('emergencyEditBanner').style.display = 'none';
  document.getElementById('emergencyEditBar').style.display = 'none';

  // Add history entry before restoring state
  addHistoryEntry('edicion-emergencia', 'Solicitud de edición enviada. Motivo: "' + emergencyEditReason + '".');

  // Restore read-only view (loadDetail will set button to pending state)
  restoreInfoFieldsFromEditable();
  loadDetail(detailParams);

  // Toast
  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Solicitud enviada';
  document.getElementById('toastMessage').textContent = 'La solicitud fue enviada al supervisor y está pendiente de aprobación.';
  showToast();
}

/* ===== Review Request Mode (supervisor: revisar solicitud de edición desde detalle_orden.html) ===== */

function enterReviewMode(id) {
  var req = (typeof emergencyRequests !== 'undefined')
    ? emergencyRequests.find(function(r) { return r.id === id; })
    : null;
  if (!req) return;

  reviewRequestMode = true;
  reviewRequestData = req;

  // Update breadcrumb
  var breadcrumb = document.querySelector('.breadcrumb');
  if (breadcrumb) {
    breadcrumb.innerHTML =
      '<a href="index.html">Compras</a><span>›</span>' +
      '<a href="solicitud_edicion.html">Solicitudes de edición</a><span>›</span>' +
      '<span class="current">Revisando ' + req.id + '</span>';
  }

  // Update back button
  var backBtn = document.querySelector('.detail-back');
  if (backBtn) backBtn.setAttribute('onclick', "window.location.href='solicitud_edicion.html'");

  // Show review banner (repurpose emergencyEditBanner)
  var banner = document.getElementById('emergencyEditBanner');
  if (banner) {
    var motivoShort = req.motivo.length > 120 ? req.motivo.substring(0, 120) + '…' : req.motivo;
    banner.innerHTML =
      '<div class="emergency-edit-banner-content" style="flex:1; min-width:0; flex-direction:column; align-items:flex-start; gap:2px;">' +
        '<div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">' +
          '<div class="emergency-edit-banner-icon">' +
            '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>' +
          '</div>' +
          '<strong>Revisando solicitud ' + req.id + '</strong>' +
          '<span style="font-size:12px; color:#92400e;">Solicitado por <strong>' + req.requestedBy + '</strong> · ' + req.requestedAt + '</span>' +
        '</div>' +
        '<span style="font-size:12px; color:#92400e; padding-left:26px;">' + motivoShort + '</span>' +
      '</div>' +
      '<a href="solicitud_edicion.html" class="emergency-edit-banner-cancel" style="flex-shrink:0;">' +
        '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>' +
        'Volver' +
      '</a>';
    banner.style.display = '';
  }

  // Show review bottom bar (repurpose emergencyEditBar)
  renderReviewBar(id, req);

  // Hide all action/edit buttons — this is read-only review
  ['detailArrivalBtn','detailReviewBtn','detailEditReviewBtn','detailStoreBtn','detailValorateBtn',
   'detailEmergencyBtn','detailEditMlBtn','emergencyAddRowBtn'].forEach(function(btnId) {
    var el = document.getElementById(btnId);
    if (el) el.style.display = 'none';
  });

  // Re-render product table in review mode
  renderDetailProductTable(detailParams.code);
}

function renderReviewBar(id, req) {
  var bar = document.getElementById('emergencyEditBar');
  if (!bar) return;
  bar.style.flexDirection = '';
  bar.style.alignItems = '';
  bar.style.gap = '';
  bar.innerHTML =
    '<span id="reviewChangeCount" class="emergency-change-count">' +
      req.changes.length + ' cambio' + (req.changes.length !== 1 ? 's' : '') + ' propuesto' + (req.changes.length !== 1 ? 's' : '') +
    '</span>' +
    '<div style="display:flex; gap:8px; align-items:center;">' +
      '<button class="er-btn-reject" style="display:inline-flex; align-items:center; gap:6px; padding:8px 16px; font-size:13px; font-family:inherit; cursor:pointer;" onclick="reviewReject(\'' + id + '\')">' +
        '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> Rechazar' +
      '</button>' +
      '<button class="er-btn-approve" style="display:inline-flex; align-items:center; gap:6px; padding:8px 20px; font-size:13px; font-family:inherit; cursor:pointer;" onclick="reviewApprove(\'' + id + '\')">' +
        '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Aprobar' +
      '</button>' +
    '</div>';
  bar.style.display = '';
}

function renderReviewProductTable(request, code) {
  var tbody = document.getElementById('detailProductTableBody');
  var statusClass = currentDetailStatusClass;
  var hasBoxes = !!orderBoxes[code];
  var anomalies = orderAnomalies[code];
  var hasAnomalias = (statusClass === 'revisada-anomalia' || statusClass === 'almacenada-anomalia' || statusClass === 'por-almacenar-anomalia' || statusClass === 'valorada-anomalia');
  var isValorada = (statusClass === 'valorada' || statusClass === 'valorada-anomalia');
  var isLocal = !!(detailParams.tipo && detailParams.tipo.toLowerCase() === 'local');

  // Parse changes into lookup tables
  var qtyChanges = {};   // productCodigo → { campo, antes, despues }
  var addedRows  = [];   // { campo, antes, despues }
  var deletedCodes = {}; // productCodigo → change

  request.changes.forEach(function(ch) {
    if (ch.type === 'added') {
      addedRows.push(ch);
    } else if (ch.type === 'deleted') {
      var m = ch.campo.match(/\(([A-Z0-9-]+)\)/);
      if (m) deletedCodes[m[1]] = ch;
    } else {
      // Quantity or other product change — extract code from parentheses
      var m = ch.campo.match(/\(([A-Z0-9-]+)\)/);
      if (m) qtyChanges[m[1]] = ch;
    }
  });

  // Column visibility
  document.getElementById('detailBoxesColHeader').style.display = hasBoxes ? '' : 'none';
  document.getElementById('detailAnomalyColHeader').style.display = hasAnomalias ? '' : 'none';
  document.getElementById('detailPriceColHeader').style.display = isValorada ? '' : 'none';
  document.getElementById('detailTotalColHeader').style.display = isValorada ? '' : 'none';
  document.getElementById('detailDescFacturaColHeader').style.display = isLocal ? '' : 'none';
  document.getElementById('detailDeleteColHeader').style.display = 'none';

  var poZone = document.getElementById('poUploadZone');
  if (poZone) poZone.style.display = 'none';
  var editBtn = document.getElementById('detailEditMlBtn');
  if (editBtn) editBtn.style.display = 'none';

  var colSpan = (isValorada ? 6 : 4) + (isLocal ? 1 : 0) + (hasBoxes ? 1 : 0) + (hasAnomalias ? 1 : 0);

  var html = '';

  detailProducts.forEach(function(prod, idx) {
    var mlMatch = masslineCatalog[idx] || null;
    var mlCode = mlMatch ? mlMatch.code : '';
    var mlDesc = mlMatch ? mlMatch.desc : '';

    var qtyChange = qtyChanges[prod.codigo] || null;
    var isDeleted = !!deletedCodes[prod.codigo];

    // Row classes
    var rowClass = isDeleted ? ' class="review-deleted-row"' : (qtyChange ? ' class="review-edited-row"' : '');
    html += '<tr' + rowClass + '>';

    // # column — with ELIMINADO badge for deleted rows
    if (isDeleted) {
      html += '<td style="text-align:center;">' + prod.num + '<br><span class="ee-row-state-badge ee-badge-deleted" style="margin:2px 0 0 0;">ELIMINADO</span></td>';
    } else {
      html += '<td>' + prod.num + '</td>';
    }

    // ML Code
    html += '<td class="ml-readonly-cell">' + (mlCode ? '<code class="ml-code-badge">' + mlCode + '</code>' : '<span class="ml-empty">—</span>') + '</td>';
    // ML Desc
    html += '<td class="ml-desc-cell ml-readonly-cell">' + (mlDesc ? '<span class="ml-desc-readonly">' + mlDesc + '</span>' : '<span class="ml-empty">—</span>') + '</td>';
    // Desc. factura (local)
    if (isLocal) html += '<td style="color:#6b7280; font-size:12px;">' + (prod.desc || '—') + '</td>';

    // Quantity — show proposed value with EDITADO badge and original strikethrough
    if (qtyChange && !isDeleted) {
      html += '<td>';
      html += '<div style="display:flex;flex-direction:column;align-items:flex-start;">';
      html += '<span style="font-weight:600;">' + qtyChange.despues + '</span>';
      html += '<div class="ee-info-change-row" style="display:flex;flex-direction:row;align-items:center;gap:6px;margin-top:4px;">';
      html += '<span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span>';
      html += '<span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;">' + qtyChange.antes + '</span>';
      html += '</div>';
      html += '</div></td>';
    } else {
      html += '<td>' + (isDeleted ? '<span style="color:#9ca3af;">' + prod.cantidad + '</span>' : prod.cantidad) + '</td>';
    }

    // Price columns
    if (isValorada) {
      var precioUnit = prod.precioUnitario || 0;
      var precioTotal = precioUnit * prod.cantidad;
      html += '<td style="text-align:right; color:#6b7280;">' + formatCLP(precioUnit) + '</td>';
      html += '<td style="text-align:right; font-weight:500;">' + formatCLP(precioTotal) + '</td>';
    }

    // Boxes column
    if (hasBoxes) {
      var prodBoxes = (orderBoxes[code] || []).find(function(b) { return b.codigo === prod.codigo; });
      if (prodBoxes && !isDeleted) {
        html += '<td style="text-align:center;"><button class="btn-view-boxes" onclick="toggleDetailBoxes(\'' + prod.codigo + '\', this)" title="Ver cajas"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg><span class="detail-box-badge">' + prodBoxes.cajas.length + '</span></button></td>';
      } else {
        html += '<td></td>';
      }
    }

    // Anomaly column
    if (hasAnomalias) {
      var matchedAnomaly = anomalies && anomalies.find(function(a) { return a.codigo === prod.codigo; });
      html += '<td style="text-align:center;">';
      if (matchedAnomaly && !isDeleted) {
        html += '<button class="btn-view-anomaly" onclick="toggleDetailAnomaly(\'' + prod.codigo + '\', this)" title="Ver anomalía"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></button>';
      }
      html += '</td>';
    }

    html += '</tr>';

    // Expandable box row
    if (hasBoxes && !isDeleted) {
      var prodBoxes2 = (orderBoxes[code] || []).find(function(b) { return b.codigo === prod.codigo; });
      if (prodBoxes2) {
        html += '<tr class="detail-box-row" id="detailBoxRow-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px;">' + buildDetailBoxPanel(prodBoxes2, statusClass, null) + '</td></tr>';
      }
    }

    // Expandable anomaly row
    if (hasAnomalias && anomalies && !isDeleted) {
      var anomaly = anomalies.find(function(a) { return a.codigo === prod.codigo; });
      if (anomaly) {
        html += '<tr class="detail-anomaly-row" id="detailAnomalyRow-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px;">' + buildAnomalyViewPanel(anomaly) + '</td></tr>';
      }
    }
  });

  // NUEVO rows — added items from the request
  var newItemNum = detailProducts.length + 1;
  addedRows.forEach(function(ch) {
    // Parse: "DESCRIPCION (ML-CODE) × QTY"
    var parsed = ch.despues.match(/^(.+?)\s*(?:\(([^)]+)\))?\s*[×xX]\s*(\d+)$/);
    var itemDesc = parsed ? parsed[1].trim() : ch.despues;
    var itemMlCode = parsed ? (parsed[2] || '') : '';
    var itemQty   = parsed ? parsed[3] : '—';

    html += '<tr class="review-new-row">';
    // # column with NUEVO badge
    html += '<td style="text-align:center;">' + newItemNum++ + '<br><span class="ee-row-state-badge ee-badge-new" style="margin:2px 0 0 0;">NUEVO</span></td>';
    // ML Code (from parsed)
    html += '<td class="ml-readonly-cell">' + (itemMlCode ? '<code class="ml-code-badge">' + itemMlCode + '</code>' : '<span class="ml-empty">—</span>') + '</td>';
    // Description
    html += '<td class="ml-desc-cell ml-readonly-cell"><span class="ml-desc-readonly" style="font-weight:500;">' + itemDesc + '</span></td>';
    if (isLocal) html += '<td style="color:#6b7280; font-size:12px;">—</td>';
    // Quantity
    html += '<td style="font-weight:600;">' + itemQty + '</td>';
    if (isValorada) { html += '<td>—</td><td>—</td>'; }
    if (hasBoxes) html += '<td></td>';
    if (hasAnomalias) html += '<td></td>';
    html += '</tr>';
  });

  tbody.innerHTML = html;

  var itemCountEl = document.getElementById('detailItemCount');
  if (itemCountEl) itemCountEl.textContent = detailProducts.length + addedRows.length;
}

function reviewApprove(id) {
  var req = reviewRequestData;
  if (!req) return;
  var bar = document.getElementById('emergencyEditBar');
  if (!bar) return;
  bar.style.flexDirection = 'column';
  bar.style.alignItems = 'stretch';
  bar.style.gap = '12px';
  bar.innerHTML =
    '<div style="display:flex; align-items:center; gap:8px;">' +
      '<span style="font-size:13px; font-weight:700; color:#166534; display:flex; align-items:center; gap:6px;">' +
        '<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' +
        'Confirmar cambios' +
      '</span>' +
      '<span style="font-size:12px; color:#6b7280; font-weight:400;">Revisa los cambios propuestos antes de aprobar</span>' +
    '</div>' +
    buildReviewDiffTable(req) +
    '<div style="display:flex; gap:8px; justify-content:flex-end;">' +
      '<button class="btn-modal-cancel" style="font-family:inherit; cursor:pointer;" onclick="renderReviewBar(\'' + id + '\', reviewRequestData)">Cancelar</button>' +
      '<button class="er-btn-approve" style="display:inline-flex; align-items:center; gap:6px; padding:8px 20px; font-size:13px; font-family:inherit; cursor:pointer;" onclick="reviewConfirmApprove(\'' + id + '\')">' +
        '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Confirmar cambios' +
      '</button>' +
    '</div>';
}

function reviewConfirmApprove(id) {
  var req = (typeof emergencyRequests !== 'undefined')
    ? emergencyRequests.find(function(r) { return r.id === id; })
    : null;
  if (!req) return;
  req.status = 'aprobada';
  var bar = document.getElementById('emergencyEditBar');
  if (bar) {
    bar.style.flexDirection = '';
    bar.style.alignItems = '';
    bar.style.gap = '';
    bar.innerHTML = '<span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:#15803d;">' +
      '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' +
      'Solicitud aprobada. Redirigiendo…</span>';
  }
  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Solicitud aprobada';
  document.getElementById('toastMessage').textContent = 'Los cambios de ' + req.code + ' han sido aprobados y están pendientes de aplicación.';
  showToast();
  setTimeout(function() { window.location.href = 'solicitud_edicion.html'; }, 2200);
}

function reviewReject(id) {
  var req = reviewRequestData;
  if (!req) return;
  var bar = document.getElementById('emergencyEditBar');
  if (!bar) return;
  bar.style.flexDirection = 'column';
  bar.style.alignItems = 'stretch';
  bar.style.gap = '12px';
  bar.innerHTML =
    '<div style="display:flex; align-items:center; gap:8px;">' +
      '<span style="font-size:13px; font-weight:700; color:#dc2626; display:flex; align-items:center; gap:6px;">' +
        '<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
        'Confirmar rechazo' +
      '</span>' +
      '<span style="font-size:12px; color:#6b7280; font-weight:400;">Los siguientes cambios serán rechazados</span>' +
    '</div>' +
    buildReviewDiffTable(req) +
    '<div>' +
      '<label style="font-size:12px; font-weight:600; color:#6b7280; display:block; margin-bottom:5px;">Motivo del rechazo <span style="font-weight:400; color:#9ca3af;">(opcional)</span></label>' +
      '<textarea id="reviewRejectReason" class="modal-form-input" style="resize:vertical; min-height:60px; font-family:inherit;" placeholder="Indique al solicitante el motivo del rechazo..."></textarea>' +
    '</div>' +
    '<div style="display:flex; gap:8px; justify-content:flex-end;">' +
      '<button class="btn-modal-cancel" style="font-family:inherit; cursor:pointer;" onclick="renderReviewBar(\'' + id + '\', reviewRequestData)">Cancelar</button>' +
      '<button class="er-btn-confirm-reject" style="display:inline-flex; align-items:center; gap:6px; font-family:inherit; cursor:pointer;" onclick="reviewConfirmReject(\'' + id + '\')">' +
        '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg> Confirmar rechazo' +
      '</button>' +
    '</div>';
  var ta = document.getElementById('reviewRejectReason');
  if (ta) ta.focus();
}

function buildReviewDiffTable(req) {
  var html = '<div class="er-diff-block" style="overflow-x:auto;"><table class="emergency-diff-table" style="margin:0; width:100%;">';
  html += '<thead><tr><th class="diff-campo">Campo</th><th class="diff-antes">Valor actual</th><th class="diff-despues">Nuevo valor</th><th>Acción</th></tr></thead><tbody>';
  req.changes.forEach(function(ch) {
    var rowClass = ch.type === 'added' ? 'diff-added' : ch.type === 'deleted' ? 'diff-deleted' : '';
    var accionLabel, accionClass;
    if (ch.type === 'deleted')    { accionLabel = 'Eliminado'; accionClass = 'diff-accion-deleted'; }
    else if (ch.type === 'added') { accionLabel = 'Agregado';  accionClass = 'diff-accion-added'; }
    else                          { accionLabel = 'Editado';   accionClass = 'diff-accion-edited'; }
    var antesHtml   = ch.antes   === '—' ? '<span class="diff-none">—</span>' : (ch.antes   || '<span class="diff-none">—</span>');
    var despuesHtml = ch.despues  === '—' ? '<span class="diff-none">—</span>' : (ch.despues || '<span class="diff-none">—</span>');
    html += '<tr' + (rowClass ? ' class="' + rowClass + '"' : '') + '>';
    html += '<td class="diff-campo">' + ch.campo + '</td>';
    html += '<td class="diff-antes">' + antesHtml + '</td>';
    html += '<td class="diff-despues">' + despuesHtml + '</td>';
    html += '<td><span class="diff-accion-badge ' + accionClass + '">' + accionLabel + '</span></td>';
    html += '</tr>';
  });
  html += '</tbody></table></div>';
  return html;
}

function reviewConfirmReject(id) {
  var req = (typeof emergencyRequests !== 'undefined')
    ? emergencyRequests.find(function(r) { return r.id === id; })
    : null;
  if (!req) return;
  req.status = 'rechazada';
  var bar = document.getElementById('emergencyEditBar');
  if (bar) {
    bar.style.flexDirection = '';
    bar.style.alignItems = '';
    bar.style.gap = '';
    bar.innerHTML = '<span style="display:flex; align-items:center; gap:8px; font-size:13px; font-weight:500; color:#dc2626;">' +
      '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
      'Solicitud rechazada. Redirigiendo…</span>';
  }
  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Solicitud rechazada';
  document.getElementById('toastMessage').textContent = 'La solicitud ' + req.id + ' de ' + req.code + ' fue rechazada.';
  showToast();
  setTimeout(function() { window.location.href = 'solicitud_edicion.html'; }, 2200);
}

/* ===== Emergency Boxes Edit ===== */

function toggleEmergencyBoxPanel(codigo) {
  var row = document.getElementById('ee-boxes-row-' + codigo);
  if (!row) return;
  var isVisible = row.style.display !== 'none';
  document.querySelectorAll('[id^="ee-boxes-row-"],[id^="ee-newboxes-row-"],[id^="ee-anom-row-"],[id^="ee-newanom-row-"]').forEach(function(r) { r.style.display = 'none'; });
  document.querySelectorAll('[id^="ee-boxes-btn-"],[id^="ee-newboxes-btn-"],[id^="ee-anom-btn-"],[id^="ee-newanom-btn-"]').forEach(function(b) { b.classList.remove('expanded'); });
  if (!isVisible) {
    refreshEmergencyBoxRow(codigo);
    row.style.display = '';
    var btn = document.getElementById('ee-boxes-btn-' + codigo);
    if (btn) btn.classList.add('expanded');
  }
}

function refreshEmergencyBoxRow(codigo) {
  var row = document.getElementById('ee-boxes-row-' + codigo);
  if (!row) return;
  var td = row.querySelector('td');
  if (td) td.innerHTML = buildEmergencyBoxEditPanel(codigo);
}

function buildEmergencyBoxEditPanel(codigo) {
  var prodBoxes = emergencyWorkingBoxes ? emergencyWorkingBoxes.find(function(b) { return b.codigo === codigo; }) : null;
  if (!prodBoxes) return '<div style="padding:12px; color:#9ca3af; font-size:13px;">Sin cajas para este producto.</div>';

  var activeCajas = prodBoxes.cajas.filter(function(c) { return !c._deleted; });

  var html = '<div class="detail-box-panel" style="margin:8px 0;">';
  html += '<div class="detail-box-panel-header">';
  html += '<div class="detail-box-panel-title"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg> Distribución en cajas — ' + prodBoxes.producto + '</div>';
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  html += '<span class="detail-box-count">' + activeCajas.length + (activeCajas.length === 1 ? ' caja' : ' cajas') + '</span>';
  html += '<button class="btn-add-emergency-row" style="font-size:11px; padding:3px 10px;" onclick="addEmergencyBox(\'' + escEEAttr(codigo) + '\')">';
  html += '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Agregar caja</button>';
  html += '</div></div>';

  html += '<div class="detail-box-list">';
  if (activeCajas.length === 0) {
    html += '<div class="storage-no-boxes">Sin cajas activas.</div>';
  }

  prodBoxes.cajas.forEach(function(caja, ci) {
    var isBoxDeleted = !!caja._deleted;
    var pos = caja.position !== undefined ? caja.position : getRecommendedPosition(caja.code);
    var itemClass = 'detail-box-item' + (isBoxDeleted ? ' ee-box-deleted' : caja._isNew ? ' box-new' : '');
    html += '<div class="' + itemClass + '">';
    if (caja._isNew && !isBoxDeleted) html += '<span class="emergency-new-badge" style="margin-left:2px;">Nueva</span>';
    if (isBoxDeleted) {
      html += '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">';
      html += '<span class="storage-box-code ee-strikethrough">' + caja.code + '</span>';
      html += '<span class="ee-row-state-badge ee-badge-deleted">ELIMINADO</span>';
      html += '</div>';
      html += '<span class="ee-box-deleted-info ee-strikethrough">' + caja.qty + ' uds</span>';
      html += '<span class="ee-box-deleted-info ee-strikethrough">' + escEEAttr(pos) + '</span>';
      html += '<button class="ee-restore-btn" style="margin-left:auto;" onclick="restoreEmergencyBox(\'' + escEEAttr(codigo) + '\',' + ci + ')" title="Restaurar caja"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg></button>';
    } else {
      var snapBoxProd2 = (emergencyEditSnapshot && emergencyEditSnapshot.boxes) ? emergencyEditSnapshot.boxes.find(function(b) { return b.codigo === codigo; }) : null;
      var snapCaja2 = snapBoxProd2 ? snapBoxProd2.cajas.find(function(sc) { return sc.code === (caja._originalCode || caja.code); }) : null;
      var boxCodeChanged = !caja._isNew && snapCaja2 && caja.code !== (caja._originalCode || snapCaja2.code);
      var boxQtyChanged = !caja._isNew && snapCaja2 && caja.qty !== snapCaja2.qty;
      var snapPos2 = snapCaja2 ? (snapCaja2.position !== undefined ? snapCaja2.position : getRecommendedPosition(snapCaja2.code)) : '';
      var boxPosChanged = !caja._isNew && snapCaja2 && pos.trim() !== snapPos2.trim();
      html += '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">';
      html += '<input type="text" class="ee-box-code-input" value="' + escEEAttr(caja.code) + '" oninput="syncEmergencyBox(\'' + escEEAttr(codigo) + '\',' + ci + ',\'code\',this.value)" title="Código de caja">';
      html += '<div id="ee-boxcode-badge-' + codigo + '-' + ci + '" class="ee-info-change-row" style="' + (boxCodeChanged ? 'display:flex;' : 'display:none;') + 'flex-direction:row;align-items:center;gap:8px;margin-top:4px;"><span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span><span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (snapCaja2 ? escEEAttr(caja._originalCode || snapCaja2.code) : '') + '</span></div>';
      html += '</div>';
      html += '<div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">';
      html += '<input type="number" class="emergency-edit-input" style="width:72px; text-align:right;" value="' + caja.qty + '" min="0" oninput="syncEmergencyBox(\'' + escEEAttr(codigo) + '\',' + ci + ',\'qty\',this.value)">';
      html += '<div id="ee-boxqty-badge-' + codigo + '-' + ci + '" class="ee-info-change-row" style="' + (boxQtyChanged ? 'display:flex;' : 'display:none;') + 'flex-direction:row;align-items:center;gap:8px;margin-top:4px;"><span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span><span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;">' + (snapCaja2 ? escEEAttr(String(snapCaja2.qty)) : '') + '</span></div>';
      html += '</div>';
      html += '<span style="font-size:12px; color:#9ca3af; flex-shrink:0;">uds</span>';
      html += '<div style="display:flex;flex-direction:column;align-items:center;flex:1;">';
      html += '<input type="text" class="ee-box-position-input" style="align-self:stretch;" placeholder="A-00-00" value="' + escEEAttr(pos) + '" oninput="syncEmergencyBox(\'' + escEEAttr(codigo) + '\',' + ci + ',\'position\',this.value)" title="Posición de almacenamiento">';
      html += '<div id="ee-boxpos-badge-' + codigo + '-' + ci + '" class="ee-info-change-row" style="' + (boxPosChanged ? 'display:flex;' : 'display:none;') + 'flex-direction:row;align-items:center;gap:8px;margin-top:4px;"><span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span><span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (snapCaja2 ? escEEAttr(snapPos2) : '') + '</span></div>';
      html += '</div>';
      html += '<button class="manual-row-remove" onclick="deleteEmergencyBox(\'' + escEEAttr(codigo) + '\',' + ci + ')" title="Eliminar caja"><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>';
    }
    html += '</div>';
  });

  html += '</div></div>';
  return html;
}

function addEmergencyBox(codigo) {
  var prodBoxes = emergencyWorkingBoxes ? emergencyWorkingBoxes.find(function(b) { return b.codigo === codigo; }) : null;
  if (!prodBoxes) return;
  var newCount = prodBoxes.cajas.filter(function(c) { return c._isNew; }).length + 1;
  prodBoxes.cajas.push({ code: 'NUEVA-' + String(newCount).padStart(3, '0'), qty: 0, size: 'mediano', _isNew: true });
  refreshEmergencyBoxRow(codigo);
  var activeCajas = prodBoxes.cajas.filter(function(c) { return !c._deleted; });
  var btn = document.getElementById('ee-boxes-btn-' + codigo);
  if (btn) { var badge = btn.querySelector('.detail-box-badge'); if (badge) badge.textContent = activeCajas.length; }
  updateEmergencyChangeCount();
}

function syncEmergencyBox(codigo, cajaIdx, field, value) {
  var prodBoxes = emergencyWorkingBoxes ? emergencyWorkingBoxes.find(function(b) { return b.codigo === codigo; }) : null;
  if (!prodBoxes || !prodBoxes.cajas[cajaIdx]) return;
  var caja = prodBoxes.cajas[cajaIdx];
  if (field === 'qty') {
    caja.qty = parseInt(value) || 0;
    if (!caja._isNew) {
      var badgeRow = document.getElementById('ee-boxqty-badge-' + codigo + '-' + cajaIdx);
      if (badgeRow) {
        var snapBP = (emergencyEditSnapshot && emergencyEditSnapshot.boxes) ? emergencyEditSnapshot.boxes.find(function(b) { return b.codigo === codigo; }) : null;
        var snapC = snapBP ? snapBP.cajas.find(function(sc) { return sc.code === (caja._originalCode || caja.code); }) : null;
        badgeRow.style.display = (snapC && caja.qty !== snapC.qty) ? 'flex' : 'none';
      }
    }
  } else if (field === 'code') {
    if (!caja._originalCode) caja._originalCode = caja.code;
    caja.code = value.trim();
    if (!caja._isNew) {
      var badgeRow = document.getElementById('ee-boxcode-badge-' + codigo + '-' + cajaIdx);
      if (badgeRow) {
        badgeRow.style.display = (caja.code !== caja._originalCode) ? 'flex' : 'none';
      }
    }
  } else if (field === 'position') {
    caja.position = value.trim();
    if (!caja._isNew) {
      var badgeRow = document.getElementById('ee-boxpos-badge-' + codigo + '-' + cajaIdx);
      if (badgeRow) {
        var snapBP = (emergencyEditSnapshot && emergencyEditSnapshot.boxes) ? emergencyEditSnapshot.boxes.find(function(b) { return b.codigo === codigo; }) : null;
        var snapC = snapBP ? snapBP.cajas.find(function(sc) { return sc.code === (caja._originalCode || caja.code); }) : null;
        var snapPos = snapC ? (snapC.position !== undefined ? snapC.position : getRecommendedPosition(snapC.code)) : '';
        badgeRow.style.display = (snapC && value.trim() !== snapPos.trim()) ? 'flex' : 'none';
      }
    }
  }
  updateEmergencyChangeCount();
}

function deleteEmergencyBox(codigo, cajaIdx) {
  var prodBoxes = emergencyWorkingBoxes ? emergencyWorkingBoxes.find(function(b) { return b.codigo === codigo; }) : null;
  if (!prodBoxes || !prodBoxes.cajas[cajaIdx]) return;
  var caja = prodBoxes.cajas[cajaIdx];
  if (caja._isNew) { prodBoxes.cajas.splice(cajaIdx, 1); } else { caja._deleted = true; }
  refreshEmergencyBoxRow(codigo);
  var activeCajas = prodBoxes.cajas.filter(function(c) { return !c._deleted; });
  var btn = document.getElementById('ee-boxes-btn-' + codigo);
  if (btn) { var badge = btn.querySelector('.detail-box-badge'); if (badge) badge.textContent = activeCajas.length; }
  updateEmergencyChangeCount();
}

function restoreEmergencyBox(codigo, cajaIdx) {
  var prodBoxes = emergencyWorkingBoxes ? emergencyWorkingBoxes.find(function(b) { return b.codigo === codigo; }) : null;
  if (!prodBoxes || !prodBoxes.cajas[cajaIdx]) return;
  prodBoxes.cajas[cajaIdx]._deleted = false;
  refreshEmergencyBoxRow(codigo);
  var activeCajas = prodBoxes.cajas.filter(function(c) { return !c._deleted; });
  var btn = document.getElementById('ee-boxes-btn-' + codigo);
  if (btn) { var badge = btn.querySelector('.detail-box-badge'); if (badge) badge.textContent = activeCajas.length; }
  updateEmergencyChangeCount();
}

/* ===== Emergency Anomalies Edit ===== */

function toggleEmergencyAnomalyPanel(codigo, prodDesc) {
  var row = document.getElementById('ee-anom-row-' + codigo);
  if (!row) return;
  var isVisible = row.style.display !== 'none';
  document.querySelectorAll('[id^="ee-boxes-row-"],[id^="ee-newboxes-row-"],[id^="ee-anom-row-"],[id^="ee-newanom-row-"]').forEach(function(r) { r.style.display = 'none'; });
  document.querySelectorAll('[id^="ee-boxes-btn-"],[id^="ee-newboxes-btn-"],[id^="ee-anom-btn-"],[id^="ee-newanom-btn-"]').forEach(function(b) { b.classList.remove('expanded'); });
  if (!isVisible) {
    refreshEmergencyAnomalyRow(codigo, prodDesc);
    row.style.display = '';
    var btn = document.getElementById('ee-anom-btn-' + codigo);
    if (btn) btn.classList.add('expanded');
  }
}

function refreshEmergencyAnomalyRow(codigo, prodDesc) {
  var row = document.getElementById('ee-anom-row-' + codigo);
  if (!row) return;
  var td = row.querySelector('td');
  if (td) td.innerHTML = buildEmergencyAnomalyEditPanel(codigo, prodDesc);
}

function buildEmergencyAnomalyEditPanel(codigo, prodDesc) {
  var anom = emergencyWorkingAnomalies ? emergencyWorkingAnomalies.find(function(a) { return a.codigo === codigo; }) : null;
  var isDeleted = anom && anom._deleted;

  if (!anom || isDeleted) {
    var reactivateLabel = isDeleted ? 'Reactivar anomalía' : 'Agregar anomalía';
    return '<div class="emergency-sub-panel">' +
      '<div class="emergency-sub-panel-header">' +
      '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>' +
      '<span>Anomalía — ' + codigo + (isDeleted ? ' <span style="color:#ef4444;font-weight:500;">(marcada para eliminar)</span>' : '') + '</span>' +
      '<button class="btn-add-emergency-row" style="margin-left:auto; font-size:11px; padding:3px 10px;" onclick="addEmergencyAnomaly(\'' + escEEAttr(codigo) + '\',\'' + escEEAttr(prodDesc) + '\')">' +
      '<svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> ' + reactivateLabel + '</button>' +
      '</div></div>';
  }

  var html = '<div class="emergency-sub-panel">';
  html += '<div class="emergency-sub-panel-header">';
  html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
  html += '<span>' + (anom._isNew ? 'Nueva anomalía — ' : 'Anomalía — ') + codigo + '</span>';
  if (anom._isNew) html += '<span class="emergency-new-badge" style="margin-left:8px;">Nueva</span>';
  html += '<button class="manual-row-remove" style="margin-left:auto; color:#ef4444; width:28px; height:28px; border-radius:7px; border:1.5px solid #fecaca; background:#fff5f5; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;" onclick="deleteEmergencyAnomaly(\'' + escEEAttr(codigo) + '\',\'' + escEEAttr(prodDesc) + '\')" title="' + (anom._isNew ? 'Cancelar anomalía' : 'Eliminar anomalía') + '">';
  html += '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>';
  html += '</button>';
  html += '</div>';

  var snapAnom = (emergencyEditSnapshot && emergencyEditSnapshot.anomalies) ? emergencyEditSnapshot.anomalies.find(function(a) { return a.codigo === codigo; }) : null;
  var espChanged  = !anom._isNew && snapAnom && anom.esperado !== snapAnom.esperado;
  var recChanged  = !anom._isNew && snapAnom && anom.recibido !== snapAnom.recibido;
  var danChanged  = !anom._isNew && snapAnom && anom.danados  !== snapAnom.danados;
  var descChanged = !anom._isNew && snapAnom && (anom.desc || '') !== (snapAnom.desc || '');

  html += '<div class="emergency-anomaly-fields">';
  html += '<div class="emergency-anomaly-field"><label style="font-size:11px;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Esperado</label>';
  html += '<div style="display:flex;flex-direction:column;align-items:flex-start;">';
  html += '<input type="number" class="emergency-edit-input" style="width:80px;" id="ee-anom-esp-' + codigo + '" value="' + (anom.esperado || 0) + '" min="0" oninput="syncEmergencyAnomaly(\'' + escEEAttr(codigo) + '\')">';
  html += '<div id="ee-anom-esp-badge-' + codigo + '" class="ee-info-change-row" style="' + (espChanged ? 'display:flex;' : 'display:none;') + 'flex-direction:row;align-items:center;gap:8px;margin-top:4px;"><span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span><span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;">' + (snapAnom ? escEEAttr(String(snapAnom.esperado || 0)) : '') + '</span></div>';
  html += '</div></div>';
  html += '<div class="emergency-anomaly-field"><label style="font-size:11px;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Recibido</label>';
  html += '<div style="display:flex;flex-direction:column;align-items:flex-start;">';
  html += '<input type="number" class="emergency-edit-input" style="width:80px;" id="ee-anom-rec-' + codigo + '" value="' + anom.recibido + '" min="0" oninput="syncEmergencyAnomaly(\'' + escEEAttr(codigo) + '\')">';
  html += '<div id="ee-anom-rec-badge-' + codigo + '" class="ee-info-change-row" style="' + (recChanged ? 'display:flex;' : 'display:none;') + 'flex-direction:row;align-items:center;gap:8px;margin-top:4px;"><span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span><span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;">' + (snapAnom ? escEEAttr(String(snapAnom.recibido || 0)) : '') + '</span></div>';
  html += '</div></div>';
  html += '<div class="emergency-anomaly-field"><label style="font-size:11px;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Dañados</label>';
  html += '<div style="display:flex;flex-direction:column;align-items:flex-start;">';
  html += '<input type="number" class="emergency-edit-input" style="width:80px;" id="ee-anom-dan-' + codigo + '" value="' + anom.danados + '" min="0" oninput="syncEmergencyAnomaly(\'' + escEEAttr(codigo) + '\')">';
  html += '<div id="ee-anom-dan-badge-' + codigo + '" class="ee-info-change-row" style="' + (danChanged ? 'display:flex;' : 'display:none;') + 'flex-direction:row;align-items:center;gap:8px;margin-top:4px;"><span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span><span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;">' + (snapAnom ? escEEAttr(String(snapAnom.danados || 0)) : '') + '</span></div>';
  html += '</div></div>';
  html += '<div class="emergency-anomaly-field" style="flex:1; min-width:200px;"><label style="font-size:11px;font-weight:600;color:#6b7280;display:block;margin-bottom:4px;">Descripción</label>';
  html += '<div style="display:flex;flex-direction:column;align-items:flex-start;">';
  html += '<input type="text" class="emergency-edit-input" style="width:100%;" id="ee-anom-desc-' + codigo + '" value="' + escEEAttr(anom.desc || '') + '" oninput="syncEmergencyAnomaly(\'' + escEEAttr(codigo) + '\')">';
  html += '<div id="ee-anom-desc-badge-' + codigo + '" class="ee-info-change-row" style="' + (descChanged ? 'display:flex;' : 'display:none;') + 'flex-direction:row;align-items:center;gap:8px;margin-top:4px;"><span class="ee-row-state-badge ee-badge-edited" style="margin:0;flex-shrink:0;">EDITADO</span><span class="ee-original-val" style="font-size:11px;color:#9ca3af;text-decoration:line-through;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (snapAnom ? escEEAttr(snapAnom.desc || '') : '') + '</span></div>';
  html += '</div></div>';
  html += '</div>';

  // Photo upload section
  var fotos = anom.fotos || [];
  var pending = anom._pendingDeleteFotos || [];
  var photoChanged = !anom._isNew && snapAnom && ((anom.fotos ? anom.fotos.length : 0) !== (snapAnom.fotos ? snapAnom.fotos.length : 0) || pending.length > 0);
  html += '<div class="ee-photo-zone">';
  html += '<div class="ee-photo-zone-header"><svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Fotos de evidencia<span id="ee-anom-photo-badge-' + codigo + '" class="ee-row-state-badge ee-badge-edited" style="' + (photoChanged ? '' : 'display:none;') + 'margin-left:8px;">EDITADO</span></div>';
  if (fotos.length > 0 || pending.length > 0) {
    var snapFotosCount0 = snapAnom && snapAnom.fotos ? snapAnom.fotos.length : 0;
    html += '<div class="ee-photo-thumbs" id="ee-photo-thumbs-' + codigo + '">';
    fotos.forEach(function(src, pIdx) {
      var isNew0 = !anom._isNew && pIdx >= snapFotosCount0;
      var badge0 = isNew0 ? '<span style="position:absolute;bottom:0;left:0;right:0;background:rgba(21,128,61,0.82);color:#fff;font-size:8px;font-weight:700;text-align:center;padding:2px 0;letter-spacing:0.04em;">NUEVO</span>' : '';
      html += '<div class="ee-photo-thumb" style="position:relative;">' +
        '<img src="' + src + '" alt="foto ' + (pIdx+1) + '">' +
        '<button class="ee-photo-remove" onclick="removeEmergencyAnomalyPhoto(\'' + escEEAttr(codigo) + '\',' + pIdx + ')" title="Eliminar foto">\u00d7</button>' +
        badge0 +
        '</div>';
    });
    pending.forEach(function(src, i) {
      var badge0del = !anom._isNew ? '<span style="position:absolute;bottom:0;left:0;right:0;background:rgba(185,28,28,0.82);color:#fff;font-size:8px;font-weight:700;text-align:center;padding:2px 0;letter-spacing:0.04em;">ELIMINADO</span>' : '';
      html += '<div class="ee-photo-thumb ee-photo-thumb-deleted" style="position:relative;">' +
        '<img src="' + src + '" alt="foto eliminada">' +
        '<button class="ee-photo-restore" onclick="restoreEmergencyAnomalyPhoto(\'' + escEEAttr(codigo) + '\',' + i + ')" title="Restaurar foto">' +
        '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>' +
        '</button>' +
        badge0del +
        '</div>';
    });
    html += '</div>';
  } else {
    html += '<div class="ee-photo-thumbs ee-photo-thumbs-empty" id="ee-photo-thumbs-' + codigo + '"><span>Sin fotos adjuntas</span></div>';
  }
  html += '<label class="ee-photo-add-btn">';
  html += '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Adjuntar fotos';
  html += '<input type="file" accept="image/*" multiple style="display:none;" onchange="addEmergencyAnomalyPhoto(\'' + escEEAttr(codigo) + '\',this)">';
  html += '</label>';
  html += '</div>';

  html += '</div></div>';
  return html;
}

function addEmergencyAnomaly(codigo, prodDesc) {
  if (!emergencyWorkingAnomalies) return;
  var existing = emergencyWorkingAnomalies.find(function(a) { return a.codigo === codigo; });
  if (existing) {
    existing._deleted = false;
  } else {
    var prodInfo = emergencyEditSnapshot.products.find(function(p) { return p.codigo === codigo; });
    emergencyWorkingAnomalies.push({
      item: prodInfo ? prodInfo.num : 0,
      producto: prodDesc,
      codigo: codigo,
      esperado: prodInfo ? prodInfo.cantidad : 0,
      recibido: prodInfo ? prodInfo.cantidad : 0,
      danados: 0,
      severity: 'leve',
      desc: '',
      fotos: [],
      _isNew: true
    });
  }
  refreshEmergencyAnomalyRow(codigo, prodDesc);
  var row = document.getElementById('ee-anom-row-' + codigo);
  if (row) row.style.display = '';
  var btn = document.getElementById('ee-anom-btn-' + codigo);
  if (btn) {
    btn.className = 'btn-view-anomaly snapshot-new expanded';
    btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
  }
  updateEmergencyChangeCount();
}

function deleteEmergencyAnomaly(codigo, prodDesc) {
  if (!emergencyWorkingAnomalies) return;
  var anom = emergencyWorkingAnomalies.find(function(a) { return a.codigo === codigo; });
  if (!anom) return;
  if (anom._isNew) {
    var idx = emergencyWorkingAnomalies.indexOf(anom);
    emergencyWorkingAnomalies.splice(idx, 1);
  } else {
    anom._deleted = true;
  }
  refreshEmergencyAnomalyRow(codigo, prodDesc);
  var row = document.getElementById('ee-anom-row-' + codigo);
  if (row) row.style.display = '';
  var btn = document.getElementById('ee-anom-btn-' + codigo);
  if (btn) {
    if (anom._deleted) {
      btn.className = 'btn-view-anomaly snapshot-deleted';
      btn.title = 'Anomalía marcada para eliminar';
      btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
    } else {
      btn.className = 'btn-add-anomaly-ee';
      btn.title = 'Agregar anomalía';
      btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>';
    }
  }
  updateEmergencyChangeCount();
}

function syncEmergencyAnomaly(codigo) {
  var anom = emergencyWorkingAnomalies ? emergencyWorkingAnomalies.find(function(a) { return a.codigo === codigo && !a._deleted; }) : null;
  if (!anom) return;
  var espInput  = document.getElementById('ee-anom-esp-'  + codigo);
  var recInput  = document.getElementById('ee-anom-rec-'  + codigo);
  var danInput  = document.getElementById('ee-anom-dan-'  + codigo);
  var descInput = document.getElementById('ee-anom-desc-' + codigo);
  if (espInput)  anom.esperado = parseInt(espInput.value)  || 0;
  if (recInput)  anom.recibido = parseInt(recInput.value)  || 0;
  if (danInput)  anom.danados  = parseInt(danInput.value)  || 0;
  if (descInput) anom.desc     = descInput.value;
  if (!anom._isNew && emergencyEditSnapshot && emergencyEditSnapshot.anomalies) {
    var snap = emergencyEditSnapshot.anomalies.find(function(a) { return a.codigo === codigo; });
    if (snap) {
      var espB = document.getElementById('ee-anom-esp-badge-'  + codigo);
      var recB = document.getElementById('ee-anom-rec-badge-'  + codigo);
      var danB = document.getElementById('ee-anom-dan-badge-'  + codigo);
      var dscB = document.getElementById('ee-anom-desc-badge-' + codigo);
      if (espB) espB.style.display = (anom.esperado !== snap.esperado) ? 'flex' : 'none';
      if (recB) recB.style.display = (anom.recibido !== snap.recibido) ? 'flex' : 'none';
      if (danB) danB.style.display = (anom.danados  !== snap.danados)  ? 'flex' : 'none';
      if (dscB) dscB.style.display = ((anom.desc || '') !== (snap.desc || '')) ? 'flex' : 'none';
    }
  }
  updateEmergencyChangeCount();
}

function renderAnomalyPhotoThumbs(codigo, anom) {
  var thumbsEl = document.getElementById('ee-photo-thumbs-' + codigo);
  if (!thumbsEl) return;
  var active = anom.fotos || [];
  var pending = anom._pendingDeleteFotos || [];
  if (active.length === 0 && pending.length === 0) {
    thumbsEl.classList.add('ee-photo-thumbs-empty');
    thumbsEl.innerHTML = '<span>Sin fotos adjuntas</span>';
    return;
  }
  thumbsEl.classList.remove('ee-photo-thumbs-empty');
  var snapFotosCount = 0;
  if (!anom._isNew && emergencyEditSnapshot && emergencyEditSnapshot.anomalies) {
    var _snapA = emergencyEditSnapshot.anomalies.find(function(a) { return a.codigo === codigo; });
    snapFotosCount = (_snapA && _snapA.fotos) ? _snapA.fotos.length : 0;
  }
  var html = active.map(function(src, i) {
    var isNew = !anom._isNew && i >= snapFotosCount;
    var badge = isNew ? '<span style="position:absolute;bottom:0;left:0;right:0;background:rgba(21,128,61,0.82);color:#fff;font-size:8px;font-weight:700;text-align:center;padding:2px 0;letter-spacing:0.04em;">NUEVO</span>' : '';
    return '<div class="ee-photo-thumb" style="position:relative;">' +
      '<img src="' + src + '" alt="foto ' + (i+1) + '">' +
      '<button class="ee-photo-remove" onclick="removeEmergencyAnomalyPhoto(\'' + escEEAttr(codigo) + '\',' + i + ')" title="Eliminar foto">\u00d7</button>' +
      badge +
      '</div>';
  }).join('');
  html += pending.map(function(src, i) {
    var badge = !anom._isNew ? '<span style="position:absolute;bottom:0;left:0;right:0;background:rgba(185,28,28,0.82);color:#fff;font-size:8px;font-weight:700;text-align:center;padding:2px 0;letter-spacing:0.04em;">ELIMINADO</span>' : '';
    return '<div class="ee-photo-thumb ee-photo-thumb-deleted" style="position:relative;">' +
      '<img src="' + src + '" alt="foto eliminada">' +
      '<button class="ee-photo-restore" onclick="restoreEmergencyAnomalyPhoto(\'' + escEEAttr(codigo) + '\',' + i + ')" title="Restaurar foto">' +
      '<svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>' +
      '</button>' +
      badge +
      '</div>';
  }).join('');
  thumbsEl.innerHTML = html;
  var photoBadge = document.getElementById('ee-anom-photo-badge-' + codigo);
  if (photoBadge && !anom._isNew && emergencyEditSnapshot && emergencyEditSnapshot.anomalies) {
    var snapA = emergencyEditSnapshot.anomalies.find(function(a) { return a.codigo === codigo; });
    if (snapA) {
      var pChanged = (anom.fotos ? anom.fotos.length : 0) !== (snapA.fotos ? snapA.fotos.length : 0) || (anom._pendingDeleteFotos && anom._pendingDeleteFotos.length > 0);
      photoBadge.style.display = pChanged ? '' : 'none';
    }
  }
}

function addEmergencyAnomalyPhoto(codigo, input) {
  var anom = emergencyWorkingAnomalies ? emergencyWorkingAnomalies.find(function(a) { return a.codigo === codigo && !a._deleted; }) : null;
  if (!anom) return;
  if (!anom.fotos) anom.fotos = [];
  var files = input.files;
  if (!files || files.length === 0) return;
  var remaining = files.length;
  Array.from(files).forEach(function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      anom.fotos.push(e.target.result);
      remaining--;
      updateEmergencyChangeCount();
      if (remaining === 0) renderAnomalyPhotoThumbs(codigo, anom);
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function removeEmergencyAnomalyPhoto(codigo, pIdx) {
  var anom = emergencyWorkingAnomalies ? emergencyWorkingAnomalies.find(function(a) { return a.codigo === codigo && !a._deleted; }) : null;
  if (!anom || !anom.fotos) return;
  if (!anom._pendingDeleteFotos) anom._pendingDeleteFotos = [];
  var src = anom.fotos.splice(pIdx, 1)[0];
  anom._pendingDeleteFotos.push(src);
  renderAnomalyPhotoThumbs(codigo, anom);
  updateEmergencyChangeCount();
}

function restoreEmergencyAnomalyPhoto(codigo, pendingIdx) {
  var anom = emergencyWorkingAnomalies ? emergencyWorkingAnomalies.find(function(a) { return a.codigo === codigo && !a._deleted; }) : null;
  if (!anom || !anom._pendingDeleteFotos) return;
  var src = anom._pendingDeleteFotos.splice(pendingIdx, 1)[0];
  if (!anom.fotos) anom.fotos = [];
  anom.fotos.push(src);
  renderAnomalyPhotoThumbs(codigo, anom);
  updateEmergencyChangeCount();
}

