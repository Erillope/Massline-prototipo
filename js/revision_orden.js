let reviewOrderCode = '';
let reviewProveedor = '';
let reviewAnomalies = {};
let reviewSimMode = 0;
let anomalyPhotos = {};
let extraRecipients = [];
let reviewBoxes = {};
let boxCounter = 1;

/* === Inicializar desde URL params === */
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  reviewOrderCode = params.get('code') || '—';
  reviewProveedor = params.get('proveedor') || '—';

  document.getElementById('reviewCode').textContent = reviewOrderCode;
  document.getElementById('reviewProveedor').textContent = reviewProveedor;

  initReview();
});

function initReview() {
  reviewAnomalies = {};
  anomalyPhotos = {};
  reviewBoxes = {};
  boxCounter = 1;

  const inputs = document.querySelectorAll('#reviewTableBody .qty-input');
  inputs.forEach(inp => { inp.value = ''; inp.classList.remove('mismatch'); });
  document.querySelectorAll('#reviewTableBody .dmg-input').forEach(inp => { inp.value = '0'; inp.classList.remove('has-damaged'); });
  const statusCells = document.querySelectorAll('#reviewTableBody tr[data-idx] td:nth-child(8)');
  statusCells.forEach(td => { td.innerHTML = '<span class="review-status pending">Pendiente</span>'; });
  document.querySelectorAll('#reviewTableBody .btn-anomaly').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('#reviewTableBody .btn-boxes').forEach(btn => btn.classList.remove('has-boxes'));
  document.querySelectorAll('#reviewTableBody .btn-boxes .box-badge').forEach(b => b.remove());

  for (let i = 0; i < 8; i++) {
    document.getElementById('anomalyRow' + i).style.display = 'none';
    document.getElementById('anomalyPanel' + i).innerHTML = '';
    document.getElementById('boxRow' + i).style.display = 'none';
    document.getElementById('boxPanel' + i).innerHTML = '';
  }

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  if (mode === 'edit') {
    loadExistingReview();
  } else if (reviewSimMode === 1) {
    inputs[2].value = 180;
    updateRowReview(2);
    reviewAnomalies[2] = { damaged: '20', desc: 'Se recibieron 180 unidades en lugar de 200. Faltan 20 unidades.', severity: 'moderada' };
    document.querySelectorAll('#reviewTableBody .btn-anomaly')[2].classList.add('active');

    inputs[5].value = 40;
    updateRowReview(5);
    reviewAnomalies[5] = { damaged: '8', desc: 'Rollos con daño visible en embalaje. 8 rollos presentan humedad.', severity: 'grave' };
    document.querySelectorAll('#reviewTableBody .btn-anomaly')[5].classList.add('active');
    const dmgInputs = document.querySelectorAll('#reviewTableBody .dmg-input');
    dmgInputs[5].value = 8;
    dmgInputs[5].classList.add('has-damaged');
    const statusTd5 = document.querySelectorAll('#reviewTableBody tr[data-idx="5"] td:nth-child(8)')[0];
    if (statusTd5) statusTd5.innerHTML = '<span class="review-status anomaly">⚠ Anomalía</span>';
  }

  updateReviewProgress();
}

/* === Cargar datos de revisión existente === */
function loadExistingReview() {
  const inputs = document.querySelectorAll('#reviewTableBody .qty-input');
  const dmgInputs = document.querySelectorAll('#reviewTableBody .dmg-input');
  const anomalyBtns = document.querySelectorAll('#reviewTableBody .btn-anomaly');

  /* Construir mapa de código producto → índice en la tabla */
  var codeToIdx = {};
  detailProducts.forEach(function(p, i) { codeToIdx[p.codigo] = i; });

  /* Cargar anomalías si existen */
  var anomalies = orderAnomalies[reviewOrderCode] || [];
  var anomalyIdxSet = {};
  anomalies.forEach(function(a) {
    var idx = a.item - 1;
    anomalyIdxSet[idx] = true;
    inputs[idx].value = a.recibido;
    if (a.danados > 0 && dmgInputs[idx]) {
      dmgInputs[idx].value = a.danados;
      dmgInputs[idx].classList.add('has-damaged');
    }
    reviewAnomalies[idx] = {
      damaged: String(a.danados || 0),
      desc: a.desc || '',
      severity: a.severity || '',
      photos: a.fotos || []
    };
    if (a.fotos && a.fotos.length > 0) {
      anomalyPhotos[idx] = a.fotos.slice();
    }
    anomalyBtns[idx].classList.add('active');
    updateRowReview(idx);
  });

  /* Cargar cantidades para ítems sin anomalía (se asume recibido = esperado) */
  inputs.forEach(function(inp, idx) {
    if (!anomalyIdxSet[idx]) {
      inp.value = inp.dataset.expected;
      updateRowReview(idx);
    }
  });

  /* Cargar cajas si existen */
  var boxes = orderBoxes[reviewOrderCode] || [];
  var maxBoxNum = 0;
  boxes.forEach(function(entry) {
    var idx = codeToIdx[entry.codigo];
    if (idx === undefined) return;
    reviewBoxes[idx] = entry.cajas.map(function(c) {
      var num = parseInt(c.code.replace('CAJA-', ''));
      if (num > maxBoxNum) maxBoxNum = num;
      return { code: c.code, qty: c.qty, size: c.size || 'mediano' };
    });
    updateBoxButton(idx);
  });
  boxCounter = maxBoxNum + 1;
}

function cancelReview() {
  var urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'edit') {
    window.location.href = 'detalle_orden.html?code=' + encodeURIComponent(reviewOrderCode)
      + '&proveedor=' + encodeURIComponent(reviewProveedor);
  } else {
    window.location.href = 'index.html';
  }
}

function updateRowReview(idx) {
  const row = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"]');
  const input = row.querySelector('.qty-input');
  const dmgInput = row.querySelector('.dmg-input');
  const statusTd = row.querySelector('td:nth-child(8)');
  const expected = parseInt(input.dataset.expected);
  const received = input.value === '' ? null : parseInt(input.value);
  const damaged = dmgInput ? parseInt(dmgInput.value) || 0 : 0;

  if (dmgInput) dmgInput.classList.toggle('has-damaged', damaged > 0);

  if (received === null || isNaN(received)) {
    statusTd.innerHTML = '<span class="review-status pending">Pendiente</span>';
    input.classList.remove('mismatch');
  } else if (damaged > 0 || reviewAnomalies[idx]) {
    statusTd.innerHTML = '<span class="review-status anomaly">⚠ Anomalía</span>';
    input.classList.toggle('mismatch', received !== expected);
  } else if (received === expected) {
    statusTd.innerHTML = '<span class="review-status ok">✓ OK</span>';
    input.classList.remove('mismatch');
  } else {
    statusTd.innerHTML = '<span class="review-status anomaly">⚠ Diferencia</span>';
    input.classList.add('mismatch');
  }

  updateAnomalySummary(idx);
  updateReviewProgress();
}

function updateReviewProgress() {
  const inputs = document.querySelectorAll('#reviewTableBody .qty-input');
  let ok = 0, anomalies = 0, pending = 0;

  inputs.forEach((inp, idx) => {
    const val = inp.value === '' ? null : parseInt(inp.value);
    const expected = parseInt(inp.dataset.expected);
    const dmgInput = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"] .dmg-input');
    const damaged = dmgInput ? parseInt(dmgInput.value) || 0 : 0;

    if (val === null || isNaN(val)) pending++;
    else if (reviewAnomalies[idx] || val !== expected || damaged > 0) anomalies++;
    else ok++;
  });

  document.getElementById('reviewOkCount').textContent = ok;
  document.getElementById('reviewAnomalyCount').textContent = anomalies;
  document.getElementById('reviewPendingCount').textContent = pending;

  const total = inputs.length;
  const verified = ok + anomalies;
  const pct = total > 0 ? Math.round((verified / total) * 100) : 0;
  document.getElementById('reviewProgressFill').style.width = pct + '%';
  document.getElementById('reviewItemsCount').textContent = verified + ' de ' + total + ' verificados';
  document.getElementById('btnFinishReview').disabled = (pending > 0);
}

function toggleAnomalyPanel(idx) {
  const panelRow = document.getElementById('anomalyRow' + idx);
  const panel = document.getElementById('anomalyPanel' + idx);

  if (panelRow.style.display !== 'none') {
    panelRow.style.display = 'none';
    panel.innerHTML = '';
    return;
  }

  const existing = reviewAnomalies[idx] || {};
  const isEditing = !!existing.severity;

  const qtyInput = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"] .qty-input');
  const dmgInput = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"] .dmg-input');
  const expected = parseInt(qtyInput.dataset.expected);
  const received = qtyInput.value ? parseInt(qtyInput.value) : 0;
  const damaged = dmgInput ? parseInt(dmgInput.value) || 0 : 0;
  const faltantes = Math.max(0, expected - received);

  panel.innerHTML = `
    <div class="anomaly-panel-header">
      <div class="anomaly-panel-title">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
        ${isEditing ? 'Editar' : 'Registrar'} anomalía — Ítem #${idx + 1}
      </div>
      <button class="anomaly-panel-close" onclick="toggleAnomalyPanel(${idx})">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="anomaly-summary" id="anomalySummary${idx}">
      <span class="summary-item">📦 Faltantes: <strong>${faltantes}</strong></span>
      <span class="summary-item">⚠️ Dañados: <strong>${damaged}</strong></span>
    </div>
    <div class="anomaly-form-row">
      <div class="anomaly-form-group">
        <label>Severidad</label>
        <div class="severity-chips" id="severityChips${idx}">
          <button class="severity-chip leve ${existing.severity === 'leve' ? 'selected' : ''}" onclick="selectSeverity(${idx},'leve')">Leve</button>
          <button class="severity-chip moderada ${existing.severity === 'moderada' ? 'selected' : ''}" onclick="selectSeverity(${idx},'moderada')">Moderada</button>
          <button class="severity-chip grave ${existing.severity === 'grave' ? 'selected' : ''}" onclick="selectSeverity(${idx},'grave')">Grave</button>
        </div>
      </div>
    </div>
    <div class="anomaly-form-group" style="margin-bottom:12px;">
      <label>Descripción</label>
      <textarea id="anomalyDesc${idx}" placeholder="Describir la anomalía encontrada...">${existing.desc || ''}</textarea>
    </div>
    <div class="anomaly-form-group" style="margin-bottom:14px;">
      <label>Evidencia fotográfica (opcional)</label>
      <div class="upload-zone-sm" onclick="document.getElementById('anomalyPhoto${idx}').click()">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="vertical-align:middle;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
        Agregar fotos
      </div>
      <input type="file" id="anomalyPhoto${idx}" accept="image/*" multiple style="display:none;" onchange="addPhotos(${idx})">
      <div class="photo-gallery" id="photoGallery${idx}"></div>
    </div>
    <div class="anomaly-actions">
      <button class="btn-register-anomaly" onclick="registerAnomaly(${idx})">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        ${isEditing ? 'Actualizar anomalía' : 'Registrar anomalía'}
      </button>
      ${isEditing ? `<button class="btn-delete-anomaly" onclick="deleteAnomaly(${idx})">
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        Eliminar anomalía
      </button>` : ''}
    </div>
  `;

  if (existing.photos && existing.photos.length > 0) {
    renderPhotoGallery(idx, existing.photos);
  }

  panelRow.style.display = '';
}

function updateAnomalySummary(idx) {
  const qtyInput = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"] .qty-input');
  const dmgInput = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"] .dmg-input');
  const expected = parseInt(qtyInput.dataset.expected);
  const received = qtyInput.value ? parseInt(qtyInput.value) : 0;
  const damaged = dmgInput ? parseInt(dmgInput.value) || 0 : 0;
  const faltantes = Math.max(0, expected - received);
  const summary = document.getElementById('anomalySummary' + idx);
  if (summary) {
    summary.innerHTML = '<span class="summary-item">📦 Faltantes: <strong>' + faltantes + '</strong></span>' +
      '<span class="summary-item">⚠️ Dañados: <strong>' + damaged + '</strong></span>';
  }
}

function selectSeverity(idx, level) {
  const chips = document.querySelectorAll('#severityChips' + idx + ' .severity-chip');
  chips.forEach(c => c.classList.remove('selected'));
  const chip = document.querySelector('#severityChips' + idx + ' .severity-chip.' + level);
  if (chip) chip.classList.add('selected');
}

function addPhotos(idx) {
  const input = document.getElementById('anomalyPhoto' + idx);
  if (!input.files || input.files.length === 0) return;
  if (!anomalyPhotos[idx]) anomalyPhotos[idx] = [];
  Array.from(input.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      anomalyPhotos[idx].push(e.target.result);
      renderPhotoGallery(idx, anomalyPhotos[idx]);
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function renderPhotoGallery(idx, photos) {
  const gallery = document.getElementById('photoGallery' + idx);
  if (!gallery) return;
  gallery.innerHTML = photos.map((src, i) =>
    '<div class="photo-thumb"><img src="' + src + '" alt="Foto ' + (i + 1) + '"><button class="photo-thumb-remove" onclick="event.stopPropagation(); removePhoto(' + idx + ', ' + i + ')" title="Quitar foto">✕</button></div>'
  ).join('');
}

function removePhoto(idx, photoIdx) {
  if (!anomalyPhotos[idx]) return;
  anomalyPhotos[idx].splice(photoIdx, 1);
  renderPhotoGallery(idx, anomalyPhotos[idx]);
}

function registerAnomaly(idx) {
  const dmgInput = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"] .dmg-input');
  const damaged = dmgInput ? dmgInput.value : '0';
  const desc = document.getElementById('anomalyDesc' + idx).value;
  const chips = document.querySelectorAll('#severityChips' + idx + ' .severity-chip.selected');
  const severity = chips.length > 0 ? chips[0].textContent.toLowerCase() : '';
  if (!severity) { alert('Seleccione la severidad'); return; }

  reviewAnomalies[idx] = { damaged: damaged, desc: desc, severity: severity, photos: anomalyPhotos[idx] || [] };
  document.querySelectorAll('#reviewTableBody .btn-anomaly')[idx].classList.add('active');
  const row = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"]');
  row.querySelector('td:nth-child(8)').innerHTML = '<span class="review-status anomaly">⚠ Anomalía</span>';
  document.getElementById('anomalyRow' + idx).style.display = 'none';
  updateReviewProgress();
}

function deleteAnomaly(idx) {
  delete reviewAnomalies[idx];
  delete anomalyPhotos[idx];
  document.querySelectorAll('#reviewTableBody .btn-anomaly')[idx].classList.remove('active');
  updateRowReview(idx);
  document.getElementById('anomalyRow' + idx).style.display = 'none';
  document.getElementById('anomalyPanel' + idx).innerHTML = '';
  updateReviewProgress();
}

/* === Recipients === */
function renderRecipients() {
  const container = document.getElementById('recipientsContainer');
  let html = '';
  defaultRecipients.forEach(r => {
    html += '<span class="recipient-chip default"><span class="chip-label">fijo</span>' + r.email + '</span>';
  });
  extraRecipients.forEach((email, i) => {
    html += '<span class="recipient-chip">' + email + '<button class="recipient-chip-remove" onclick="removeRecipient(' + i + ')" title="Quitar">✕</button></span>';
  });
  container.innerHTML = html;
}

function addRecipient() {
  const input = document.getElementById('recipientInput');
  const email = input.value.trim().toLowerCase();
  if (!email) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    input.style.borderColor = '#ef4444';
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
    return;
  }
  const allEmails = defaultRecipients.map(r => r.email).concat(extraRecipients);
  if (allEmails.includes(email)) {
    input.style.borderColor = '#f59e0b';
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
    input.value = '';
    return;
  }
  extraRecipients.push(email);
  input.value = '';
  renderRecipients();
}

function removeRecipient(index) {
  extraRecipients.splice(index, 1);
  renderRecipients();
}

/* === Box distribution === */
function toggleBoxPanel(idx) {
  const boxRow = document.getElementById('boxRow' + idx);
  if (boxRow.style.display !== 'none') { boxRow.style.display = 'none'; return; }
  if (!reviewBoxes[idx]) reviewBoxes[idx] = [];
  boxRow.style.display = 'table-row';
  renderBoxPanel(idx);
}

function renderBoxPanel(idx) {
  const panel = document.getElementById('boxPanel' + idx);
  const boxes = reviewBoxes[idx] || [];
  const row = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"]');
  const received = parseInt(row.querySelector('.qty-input').value) || 0;
  const distributed = boxes.reduce((sum, b) => sum + (b.qty || 0), 0);
  const isComplete = received > 0 && distributed === received;

  let html = '<div class="box-panel-header">';
  html += '<div class="box-panel-title"><svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> Distribución en cajas</div>';
  html += '<span class="box-panel-status ' + (isComplete ? 'complete' : 'pending') + '">' + distributed + ' / ' + received + ' unidades</span></div>';

  html += '<div class="box-list">';
  boxes.forEach((box, i) => {
    html += '<div class="box-item"><span class="box-item-code">' + box.code + '</span>';
    html += '<select class="box-size-select" onchange="updateBoxSize(' + idx + ', ' + i + ', this.value)">';
    html += '<option value="pequeño"' + (box.size === 'pequeño' ? ' selected' : '') + '>Pequeña</option>';
    html += '<option value="mediano"' + (box.size === 'mediano' ? ' selected' : '') + '>Mediana</option>';
    html += '<option value="grande"' + (box.size === 'grande' ? ' selected' : '') + '>Grande</option>';
    html += '</select>';
    html += '<input type="number" class="box-item-input" value="' + (box.qty || '') + '" min="0" oninput="updateBoxQty(' + idx + ', ' + i + ', this.value)" placeholder="0">';
    html += '<span class="box-item-label">unidades</span>';
    html += '<button class="box-item-remove" onclick="removeBox(' + idx + ', ' + i + ')" title="Eliminar caja">✕</button></div>';
  });
  html += '</div>';
  html += '<button class="box-add-btn" onclick="addBox(' + idx + ')">+ Agregar caja</button>';
  panel.innerHTML = html;
}

function addBox(idx) {
  if (!reviewBoxes[idx]) reviewBoxes[idx] = [];
  reviewBoxes[idx].push({ code: 'CAJA-' + String(boxCounter).padStart(3, '0'), qty: 0, size: 'mediano' });
  boxCounter++;
  renderBoxPanel(idx);
  updateBoxButton(idx);
}

function removeBox(idx, boxIndex) {
  reviewBoxes[idx].splice(boxIndex, 1);
  renderBoxPanel(idx);
  updateBoxButton(idx);
}

function updateBoxSize(idx, boxIndex, value) {
  reviewBoxes[idx][boxIndex].size = value;
}

function updateBoxQty(idx, boxIndex, value) {
  reviewBoxes[idx][boxIndex].qty = parseInt(value) || 0;
  const row = document.querySelector('#reviewTableBody tr[data-idx="' + idx + '"]');
  const received = parseInt(row.querySelector('.qty-input').value) || 0;
  const distributed = reviewBoxes[idx].reduce((sum, b) => sum + (b.qty || 0), 0);
  const isComplete = received > 0 && distributed === received;
  const statusEl = document.querySelector('#boxPanel' + idx + ' .box-panel-status');
  if (statusEl) {
    statusEl.className = 'box-panel-status ' + (isComplete ? 'complete' : 'pending');
    statusEl.textContent = distributed + ' / ' + received + ' unidades';
  }
  updateBoxButton(idx);
}

function updateBoxButton(idx) {
  const btn = document.getElementById('btnBoxes' + idx);
  const boxes = reviewBoxes[idx] || [];
  const existingBadge = btn.querySelector('.box-badge');
  if (existingBadge) existingBadge.remove();
  if (boxes.length > 0) {
    btn.classList.add('has-boxes');
    const badge = document.createElement('span');
    badge.className = 'box-badge';
    badge.textContent = boxes.length;
    btn.appendChild(badge);
  } else {
    btn.classList.remove('has-boxes');
  }
}

/* === Review modal === */
function openReviewModal() {
  const okCount = parseInt(document.getElementById('reviewOkCount').textContent);
  const anomalyCount = parseInt(document.getElementById('reviewAnomalyCount').textContent);

  document.getElementById('reviewModalCode').textContent = reviewOrderCode;
  document.getElementById('reviewModalOk').textContent = okCount;

  const inputs = document.querySelectorAll('#reviewTableBody .qty-input');
  const dmgInputs = document.querySelectorAll('#reviewTableBody .dmg-input');
  let linesSob = 0, linesFal = 0, linesDan = 0;
  let qtySob = 0, qtyFal = 0, qtyDan = 0;

  inputs.forEach((inp, idx) => {
    const expected = parseInt(inp.dataset.expected);
    const received = inp.value === '' ? null : parseInt(inp.value);
    const damaged = dmgInputs[idx] ? parseInt(dmgInputs[idx].value) || 0 : 0;
    if (received !== null && received > expected) { linesSob++; qtySob += (received - expected); }
    if (received !== null && received < expected) { linesFal++; qtyFal += (expected - received); }
    if (damaged > 0) { linesDan++; qtyDan += damaged; }
  });

  const hasAnyAnomaly = linesSob > 0 || linesFal > 0 || linesDan > 0;
  document.getElementById('reviewAnomalySection').style.display = hasAnyAnomaly ? '' : 'none';
  let anomalySeq = 34;
  document.getElementById('reviewModalSobrantesRow').style.display = linesSob > 0 ? 'table-row' : 'none';
  if (linesSob > 0) { document.getElementById('reviewModalSobrantesCode').innerHTML = '<code style="background:#dbeafe; color:#1d4ed8; padding:2px 8px; border-radius:4px; font-size:11px;">SOB-' + String(anomalySeq).padStart(4,'0') + '</code>'; anomalySeq++; }
  document.getElementById('reviewModalSobrantes').textContent = linesSob;
  document.getElementById('reviewModalSobrantesQty').textContent = qtySob;
  document.getElementById('reviewModalFaltantesRow').style.display = linesFal > 0 ? 'table-row' : 'none';
  if (linesFal > 0) { document.getElementById('reviewModalFaltantesCode').innerHTML = '<code style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:4px; font-size:11px;">FAL-' + String(anomalySeq).padStart(4,'0') + '</code>'; anomalySeq++; }
  document.getElementById('reviewModalFaltantes').textContent = linesFal;
  document.getElementById('reviewModalFaltantesQty').textContent = qtyFal;
  document.getElementById('reviewModalDanadosRow').style.display = linesDan > 0 ? 'table-row' : 'none';
  if (linesDan > 0) { document.getElementById('reviewModalDanadosCode').innerHTML = '<code style="background:#fee2e2; color:#991b1b; padding:2px 8px; border-radius:4px; font-size:11px;">DAÑ-' + String(anomalySeq).padStart(4,'0') + '</code>'; anomalySeq++; }
  document.getElementById('reviewModalDanados').textContent = linesDan;
  document.getElementById('reviewModalDanadosQty').textContent = qtyDan;

  const result = anomalyCount > 0 ? 'Revisada ⚠' : 'Revisada';
  document.getElementById('reviewModalResult').textContent = result;
  document.getElementById('reviewModalResult').style.color = anomalyCount > 0 ? '#f59e0b' : '#059669';

  const recipientsSection = document.getElementById('reviewRecipientsSection');
  if (anomalyCount > 0) {
    recipientsSection.style.display = '';
    extraRecipients = [];
    renderRecipients();
  } else {
    recipientsSection.style.display = 'none';
  }

  document.getElementById('reviewModal').classList.add('active');
}

function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('active');
}

function confirmReview() {
  const code = reviewOrderCode;
  const anomalyCount = parseInt(document.getElementById('reviewAnomalyCount').textContent);
  closeReviewModal();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'edit') {
    // Edit mode — go back to detail page
    window.location.href = 'detalle_orden.html?code=' + encodeURIComponent(code)
      + '&proveedor=' + encodeURIComponent(reviewProveedor)
      + '&reviewEdited=1';
  } else {
    // New review — redirect to index with toast
    window.location.href = 'index.html?toast=review&code=' + encodeURIComponent(code) + '&anomalies=' + anomalyCount;
  }
}

/* === Toggle de simulación de revisión === */
function toggleReviewSimMode() {
  reviewSimMode = (reviewSimMode + 1) % 2;
  const labels = ['Normal (limpia)', 'Con anomalías'];
  const btn = document.getElementById('btnToggleReviewMode');
  btn.querySelector('.mode-label').textContent = labels[reviewSimMode];
  btn.title = 'Revisión: ' + labels[reviewSimMode] + ' (clic para cambiar)';
  initReview();
}
