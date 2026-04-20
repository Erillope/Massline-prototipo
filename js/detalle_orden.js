const warningIconSVG = '<svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';

let detailParams = {};
let currentDetailStatusClass = '';

/* === Inicializar vista desde URL params === */
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  detailParams = {
    code: params.get('code') || '—',
    proveedor: params.get('proveedor') || '—',
    fecha: params.get('fecha') || '—',
    status: params.get('status') || 'en-bodega',
    label: params.get('label') || 'En bodega',
    reviewer: params.get('reviewer') || '',
    reviewDate: params.get('reviewDate') || ''
  };
  loadDetail(detailParams);
});

function loadDetail(p) {
  const hasAnomalias = (p.status === 'almacenada-anomalia' || p.status === 'revisada-anomalia' || p.status === 'por-almacenar-anomalia');

  // Header
  document.getElementById('detailCode').textContent = p.code;
  const headerBadge = document.getElementById('detailStatusBadge');
  headerBadge.className = 'status-badge ' + p.status;
  document.getElementById('detailStatusText').innerHTML = p.label + (hasAnomalias ? ' ' + warningIconSVG : '');

  // Info
  document.getElementById('detailInfoCode').textContent = p.code;
  document.getElementById('detailInfoProveedor').textContent = p.proveedor;
  document.getElementById('detailInfoFecha').textContent = p.fecha;
  const infoBadge = document.getElementById('detailInfoStatus');
  infoBadge.className = 'status-badge ' + p.status;
  document.getElementById('detailInfoStatusText').innerHTML = p.label + (hasAnomalias ? ' ' + warningIconSVG : '');

  // Reviewer
  if (p.reviewer && p.reviewDate) {
    document.getElementById('detailReviewerField').style.display = '';
    document.getElementById('detailReviewDateField').style.display = '';
    document.getElementById('detailReviewer').textContent = p.reviewer;
    document.getElementById('detailReviewDate').textContent = p.reviewDate;
  } else {
    document.getElementById('detailReviewerField').style.display = 'none';
    document.getElementById('detailReviewDateField').style.display = 'none';
  }

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
  document.getElementById('detailStoreBtn').style.display = (p.status === 'revisada' || p.status === 'revisada-anomalia') ? 'inline-flex' : 'none';

  currentDetailStatusClass = p.status;
  renderDetailProductTable(p.code);
}

function goToReview() {
  window.location.href = 'revision_orden.html?code=' + encodeURIComponent(detailParams.code)
    + '&proveedor=' + encodeURIComponent(detailParams.proveedor)
    + '&items=8';
}

/* === Renderizar tabla de productos === */
function renderDetailProductTable(code) {
  const tbody = document.getElementById('detailProductTableBody');
  const statusClass = currentDetailStatusClass;
  const hasBoxes = !!orderBoxes[code];
  const anomalies = orderAnomalies[code];
  const hasAnomalias = (statusClass === 'revisada-anomalia' || statusClass === 'almacenada-anomalia' || statusClass === 'por-almacenar-anomalia');

  // Show/hide box and anomaly columns
  document.getElementById('detailBoxesColHeader').style.display = hasBoxes ? '' : 'none';
  document.getElementById('detailAnomalyColHeader').style.display = hasAnomalias ? '' : 'none';

  let html = '';
  detailProducts.forEach((prod, idx) => {
    const mlMatch = masslineCatalog[idx] || null;
    const mlCode = mlMatch ? mlMatch.code : '';
    const mlDesc = mlMatch ? mlMatch.desc : '';
    const filledClass = mlMatch ? ' filled' : '';
    html += '<tr>';
    html += '<td>' + prod.num + '</td>';
    html += '<td><code>' + prod.codigo + '</code></td>';
    html += '<td>' + prod.desc + '</td>';
    html += '<td class="ml-ac-cell"><div class="ml-autocomplete"><input type="text" class="ml-ac-input' + filledClass + '" data-field="code" placeholder="Buscar código..." value="' + mlCode + '" onfocus="showMlDropdown(this)" oninput="filterMassline(this)"><div class="ml-ac-dropdown"></div></div></td>';
    html += '<td class="ml-desc-cell ml-ac-cell"><div class="ml-autocomplete"><input type="text" class="ml-ac-input' + filledClass + '" data-field="desc" placeholder="Buscar descripción..." value="' + mlDesc + '" onfocus="showMlDropdown(this)" oninput="filterMassline(this)"><div class="ml-ac-dropdown"></div></div></td>';
    html += '<td>' + prod.unidad + '</td>';
    html += '<td>' + prod.cantidad + '</td>';
    if (hasBoxes) {
      const prodBoxes = (orderBoxes[code] || []).find(b => b.codigo === prod.codigo);
      if (prodBoxes) {
        html += '<td style="text-align:center;"><button class="btn-view-boxes" onclick="toggleDetailBoxes(\'' + prod.codigo + '\', this)" title="Ver cajas"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg><span class="detail-box-badge">' + prodBoxes.cajas.length + '</span></button></td>';
      } else {
        html += '<td></td>';
      }
    }
    if (hasAnomalias) {
      const hasAnomaly = anomalies && anomalies.some(a => a.codigo === prod.codigo);
      html += '<td>';
      if (hasAnomaly) {
        html += '<button class="btn-view-anomaly" onclick="toggleDetailAnomaly(\'' + prod.codigo + '\', this)" title="Ver anomalía"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg></button>';
      }
      html += '</td>';
    }
    html += '</tr>';

    // Box row
    if (hasBoxes) {
      const prodBoxes = (orderBoxes[code] || []).find(b => b.codigo === prod.codigo);
      if (prodBoxes) {
        const colSpan = 7 + (hasBoxes ? 1 : 0) + (hasAnomalias ? 1 : 0);
        html += '<tr class="detail-box-row" id="detailBoxRow-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:#fff;">' + buildDetailBoxPanel(prodBoxes, statusClass) + '</td></tr>';
      }
    }

    // Anomaly row
    if (hasAnomalias && anomalies) {
      const anomaly = anomalies.find(a => a.codigo === prod.codigo);
      if (anomaly) {
        const colSpan = 7 + (hasBoxes ? 1 : 0) + (hasAnomalias ? 1 : 0);
        html += '<tr class="detail-anomaly-row" id="detailAnomalyRow-' + prod.codigo + '" style="display:none;"><td colspan="' + colSpan + '" style="padding:0 16px 12px; background:#fff;">' + buildAnomalyViewPanel(anomaly) + '</td></tr>';
      }
    }
  });

  tbody.innerHTML = html;
}

function buildDetailBoxPanel(prodBoxes, statusClass) {
  const showPositions = (statusClass === 'revisada' || statusClass === 'revisada-anomalia' || statusClass === 'por-almacenar' || statusClass === 'por-almacenar-anomalia' || statusClass === 'almacenada' || statusClass === 'almacenada-anomalia');
  let html = '<div class="detail-box-panel">';
  html += '<div class="detail-box-panel-header">';
  html += '<div class="detail-box-panel-title"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg> Distribución en cajas — ' + prodBoxes.producto + '</div>';
  html += '<span class="detail-box-count">' + prodBoxes.cajas.length + (prodBoxes.cajas.length === 1 ? ' caja' : ' cajas') + '</span>';
  html += '</div>';
  html += '<div class="detail-box-list">';
  prodBoxes.cajas.forEach(caja => {
    const pos = getRecommendedPosition(caja.code);
    html += '<div class="detail-box-item">';
    html += '<span class="storage-box-code">' + caja.code + '</span>';
    html += '<span class="storage-box-qty">' + caja.qty + ' uds</span>';
    if (showPositions) {
      html += '<span class="storage-box-position"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg> ' + pos + '</span>';
    }
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

function buildAnomalyViewPanel(anomaly) {
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

  let html = '<div class="anomaly-view-panel">';
  html += '<div class="anomaly-view-header">';
  html += '<div class="anomaly-view-title">';
  html += '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>';
  html += 'Anomalía — ' + anomaly.codigo + ' ' + anomaly.producto;
  html += '</div>';
  html += '<span class="anomaly-view-severity ' + anomaly.severity + '">' + severityLabel + '</span>';
  html += '</div>';
  html += tagsHTML;
  html += '<div class="anomaly-view-field">';
  html += '<span class="anomaly-view-label">Descripción</span>';
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

  document.getElementById('arrivalToast').querySelector('.toast-title').textContent = 'Almacenamiento confirmado';
  document.getElementById('toastMessage').textContent = 'La orden ' + code + ' fue enviada a almacenamiento.';
  showToast();
}
