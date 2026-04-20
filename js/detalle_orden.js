const warningIconSVG = '<svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';

function formatCLP(n) {
  return '$' + n.toLocaleString('es-CL');
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
    tipo: params.get('tipo') || catalog.tipo || ''
  };
  loadDetail(detailParams);

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
  document.getElementById('detailValorateBtn').style.display = (p.status === 'almacenada' || p.status === 'almacenada-anomalia') ? 'inline-flex' : 'none';

  currentDetailStatusClass = p.status;
  renderDetailProductTable(p.code);
  renderHistory(p.code);
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
  const tbody = document.getElementById('detailProductTableBody');
  const statusClass = currentDetailStatusClass;
  let hasBoxes = !!orderBoxes[code];
  let anomalies = orderAnomalies[code];
  let hasAnomalias = (statusClass === 'revisada-anomalia' || statusClass === 'almacenada-anomalia' || statusClass === 'por-almacenar-anomalia' || statusClass === 'valorada-anomalia');
  const isLocked = (statusClass === 'almacenada' || statusClass === 'almacenada-anomalia' || statusClass === 'por-almacenar' || statusClass === 'por-almacenar-anomalia' || statusClass === 'valorada' || statusClass === 'valorada-anomalia');

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
        } else if (prev.severity !== a.severity || prev.recibido !== a.recibido || prev.danados !== a.danados || prev.desc !== a.desc) {
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

  // Show/hide edit button
  const editBtn = document.getElementById('detailEditMlBtn');
  if (editBtn) {
    editBtn.style.display = (isLocked || snapshotActive) ? 'none' : 'inline-flex';
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
    html += '<td><code>' + prod.codigo + '</code></td>';
    html += '<td>' + prod.desc + '</td>';
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
      html += '<td class="ml-ac-cell' + mlHlCls + '">' + mlCellContent + '</td>';
      html += '<td class="ml-desc-cell ml-ac-cell' + mlHlCls + '">' + mlDescContent + '</td>';
    } else {
      // Editable inputs
      html += '<td class="ml-ac-cell"><div class="ml-autocomplete"><input type="text" class="ml-ac-input' + filledClass + '" data-field="code" placeholder="Buscar código..." value="' + mlCode + '" onfocus="showMlDropdown(this)" oninput="filterMassline(this)"><div class="ml-ac-dropdown"></div></div></td>';
      html += '<td class="ml-desc-cell ml-ac-cell"><div class="ml-autocomplete"><input type="text" class="ml-ac-input' + filledClass + '" data-field="desc" placeholder="Buscar descripción..." value="' + mlDesc + '" onfocus="showMlDropdown(this)" oninput="filterMassline(this)"><div class="ml-ac-dropdown"></div></div></td>';
    }
    html += '<td>' + prod.unidad + '</td>';
    html += '<td>' + prod.cantidad + '</td>';
    const precioUnit = prod.precioUnitario || 0;
    const precioTotal = precioUnit * prod.cantidad;
    html += '<td style="text-align:right; color:#6b7280;">' + formatCLP(precioUnit) + '</td>';
    html += '<td style="text-align:right; font-weight:500;">' + formatCLP(precioTotal) + '</td>';
    if (hasBoxes) {
      const prodBoxes = (orderBoxes[code] || []).find(b => b.codigo === prod.codigo);
      const prevProdBoxes = snapshotBoxDiff ? ((orderBoxesPrev[code] || []).find(b => b.codigo === prod.codigo) || null) : null;
      let boxHasChanges = false;
      if (prevProdBoxes && prodBoxes) {
        boxHasChanges = prodBoxes.cajas.some(function(c) {
          var p = prevProdBoxes.cajas.find(function(pc) { return pc.code === c.code; });
          return !p || p.qty !== c.qty || p.size !== c.size;
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
      html += '<td>';
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
          return !p || p.qty !== c.qty || p.size !== c.size;
        }) || prevProdBoxes2.cajas.some(function(pc) {
          return !prodBoxes2.cajas.some(function(c) { return c.code === pc.code; });
        });
      }
      if (prodBoxes2) {
        const colSpan = 9 + (hasBoxes ? 1 : 0) + (hasAnomalias ? 1 : 0);
        html += '<tr class="detail-box-row' + (boxHasChanges2 ? ' snapshot-box-row' : '') + '" id="detailBoxRow-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:' + (boxHasChanges2 ? '#f0fdf4' : '#fff') + ';">' + buildDetailBoxPanel(prodBoxes2, statusClass, prevProdBoxes2) + '</td></tr>';
      }
    }

    // Anomaly row
    if (hasAnomalias && anomalies) {
      const anomaly = anomalies.find(a => a.codigo === prod.codigo);
      if (anomaly) {
        const colSpan = 9 + (hasBoxes ? 1 : 0) + (hasAnomalias ? 1 : 0);
        const aDiffType = anomaly._diffType || '';
        const hasADiff = (aDiffType === 'new' || aDiffType === 'edited' || aDiffType === 'deleted');
        const aRowClass = aDiffType === 'new' ? ' snapshot-new-row' : aDiffType === 'edited' ? ' snapshot-edited-row' : aDiffType === 'deleted' ? ' snapshot-deleted-row' : '';
        const aRowBg = aDiffType === 'new' ? '#fffbeb' : aDiffType === 'edited' ? '#eff6ff' : aDiffType === 'deleted' ? '#fef2f2' : '#fff';
        html += '<tr class="detail-anomaly-row' + aRowClass + '" id="detailAnomalyRow-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:' + aRowBg + ';">' + buildAnomalyViewPanel(anomaly) + '</td></tr>';
      }
    }
  });

  // Suma total
  let sumaTotal = 0;
  detailProducts.forEach((prod) => {
    const precioUnit = prod.precioUnitario || 0;
    sumaTotal += precioUnit * prod.cantidad;
  });
  html += '<tr style="background:#f8fafc; font-weight:600; color:#1a1a2e;">';
  html += '<td colspan="8" style="text-align:right; border-top:2px solid #e5e7eb;">TOTAL ORDEN</td>';
  html += '<td style="text-align:right; border-top:2px solid #e5e7eb;">' + formatCLP(sumaTotal) + '</td>';
  if (hasBoxes) html += '<td></td>';
  if (hasAnomalias) html += '<td></td>';
  html += '</tr>';

  tbody.innerHTML = html;
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
    const sizeLabel = caja.size === 'grande' ? 'Grande' : caja.size === 'mediano' ? 'Mediana' : 'Pequeña';
    const sizeClass = 'box-size-' + caja.size;
    // Check if this box changed vs previous or is new
    var prevCaja = prevProdBoxes ? prevProdBoxes.cajas.find(function(pc) { return pc.code === caja.code; }) : null;
    var isNewBox = prevProdBoxes && !prevCaja;
    var qtyChanged = prevCaja && prevCaja.qty !== caja.qty;
    var sizeChanged = prevCaja && prevCaja.size !== caja.size;
    var hasChange = qtyChanged || sizeChanged;
    var boxClass = isNewBox ? ' box-new' : hasChange ? ' box-changed' : '';
    html += '<div class="detail-box-item' + boxClass + '">';
    html += '<span class="storage-box-code">' + caja.code + '</span>';
    if (sizeChanged) {
      var prevSizeLabel = prevCaja.size === 'grande' ? 'Grande' : prevCaja.size === 'mediano' ? 'Mediana' : 'Pequeña';
      html += '<span class="storage-box-size ' + sizeClass + ' box-qty-new">' + sizeLabel + '</span>';
      html += '<span class="storage-box-qty-prev">antes: ' + prevSizeLabel + '</span>';
    } else {
      html += '<span class="storage-box-size ' + sizeClass + '">' + sizeLabel + '</span>';
    }
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
        var sLabel = prevCaja.size === 'grande' ? 'Grande' : prevCaja.size === 'mediano' ? 'Mediana' : 'Pequeña';
        var sClass = 'box-size-' + prevCaja.size;
        html += '<div class="detail-box-item box-deleted">';
        html += '<span class="storage-box-code">' + prevCaja.code + '</span>';
        html += '<span class="storage-box-size ' + sClass + '">' + sLabel + '</span>';
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
  const severityLabel = anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1);

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
  html += '<span class="anomaly-view-severity ' + anomaly.severity + '">' + severityLabel + '</span>';
  html += '</div>';
  html += tagsHTML;

  // Show edit comparison for edited anomalies
  if (isEdited && prevAnomaly) {
    html += '<div class="anomaly-edit-comparison">';
    html += '<div class="anomaly-edit-comparison-title"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg> Cambios realizados:</div>';
    if (prevAnomaly.severity !== anomaly.severity) {
      var prevSevLabel = prevAnomaly.severity.charAt(0).toUpperCase() + prevAnomaly.severity.slice(1);
      html += '<div class="anomaly-edit-change"><span class="anomaly-edit-field">Severidad:</span> <span class="anomaly-edit-prev">' + prevSevLabel + '</span> <span class="anomaly-edit-arrow">→</span> <span class="anomaly-edit-new">' + severityLabel + '</span></div>';
    }
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
      anomHtml += '<span class="storage-anomaly-severity ' + a.severity + '">' + a.severity.charAt(0).toUpperCase() + a.severity.slice(1) + '</span>';
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
  currentDetailStatusClass = newStatus;

  addHistoryEntry('valoracion', 'Orden valorada con código ' + codigoVal + '.');

  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Valoración registrada';
  document.getElementById('toastMessage').textContent = 'La orden ' + code + ' fue valorada exitosamente.';
  showToast();

  mlEditMode = false;
  renderDetailProductTable(code);
}

/* === Toggle ML edit mode === */
function toggleMlEdit() {
  if (mlEditMode) {
    // Capture current input values before leaving edit mode
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
    // Record in history
    addHistoryEntry('edicion-codigos', 'Códigos Massline actualizados en ' + changedCount + ' producto' + (changedCount !== 1 ? 's' : '') + '.');
  }
  mlEditMode = !mlEditMode;
  const btn = document.getElementById('detailEditMlBtn');
  if (mlEditMode) {
    btn.classList.add('active');
    btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Listo';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg> Editar códigos';
  }
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
    'edicion-codigos':   { label: 'Edición códigos Massline',     icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>' },
    confirmacion:        { label: 'Confirmación almacenamiento',  icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>' },
    almacenada:          { label: 'Almacenada',                   icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>' },
    valoracion:          { label: 'Valorada',                    icon: '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' }
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
    'valoracion':        { status: hasAnom ? 'valorada-anomalia' : 'valorada',        label: 'Valorada' }
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
    'edicion-revision': 'Edición revisión', 'edicion-codigos': 'Edición códigos Massline',
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

  // Hide all action buttons during snapshot
  document.getElementById('detailArrivalBtn').style.display = 'none';
  document.getElementById('detailReviewBtn').style.display = 'none';
  document.getElementById('detailEditReviewBtn').style.display = 'none';
  document.getElementById('detailStoreBtn').style.display = 'none';
  document.getElementById('detailValorateBtn').style.display = 'none';
  var editMlBtn = document.getElementById('detailEditMlBtn');
  if (editMlBtn) editMlBtn.style.display = 'none';

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
      else if (prev.severity !== a.severity || prev.recibido !== a.recibido || prev.danados !== a.danados || prev.desc !== a.desc) editedCount++;
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
