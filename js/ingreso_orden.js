/* === File upload handling === */
function handleFiles(event, listId) {
  const files = event.target.files;
  const list = document.getElementById(listId);

  for (const file of files) {
    const ext = file.name.split('.').pop().toLowerCase();
    let iconClass = 'default';
    let iconLabel = '📄';

    if (ext === 'pdf') { iconClass = 'pdf'; iconLabel = 'PDF'; }
    else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) { iconClass = 'img'; iconLabel = 'IMG'; }
    else if (['doc', 'docx', 'xls', 'xlsx'].includes(ext)) { iconClass = 'doc'; iconLabel = 'DOC'; }

    const size = file.size < 1024 * 1024
      ? (file.size / 1024).toFixed(1) + ' KB'
      : (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <div class="file-item-icon ${iconClass}">${iconLabel}</div>
      <div class="file-item-info">
        <div class="file-item-name" title="${file.name}">${file.name}</div>
        <div class="file-item-size">${size}</div>
      </div>
      <button type="button" class="file-item-remove" onclick="removeFile(this)" title="Eliminar">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    `;
    list.appendChild(item);
  }

  // Ocultar zona de subida (solo un archivo)
  list.closest('.card-body').querySelector('.upload-zone').style.display = 'none';

  // Mostrar tabla o alerta según el modo actual
  if (listId === 'fileListPO') {
    hideAllPoAlerts();
    if (simMode === 0) {
      document.getElementById('poInfoValid').style.display = '';
      document.getElementById('poTableSection').style.display = '';
    } else if (simMode === 1) {
      document.getElementById('poErrorSection').style.display = '';
    } else if (simMode === 2) {
      document.getElementById('poWarningSection').style.display = '';
      document.getElementById('poInfoIncomplete').style.display = '';
      document.getElementById('poTableIncomplete').style.display = '';
    } else if (simMode === 3) {
      document.getElementById('poExistsSection').style.display = '';
    } else if (simMode === 4) {
      document.getElementById('poInfoMulti').style.display = '';
      document.getElementById('poMultiInvoiceSection').style.display = '';
      currentInvoiceIdx = 0;
      renderCurrentInvoice();
    }
  }

  // Reset input so the same file can be selected again
  event.target.value = '';
  validateForm();
}

function removeFile(btn) {
  const item = btn.closest('.file-item');
  const list = item.closest('.file-list');
  item.style.opacity = '0';
  item.style.transform = 'translateY(-4px)';
  setTimeout(() => {
    item.remove();
    if (list.children.length === 0) {
      list.closest('.card-body').querySelector('.upload-zone').style.display = '';
      if (list.id === 'fileListPO') {
        hideAllPoAlerts();
      }
    }
    validateForm();
  }, 200);
}

/* === Form actions === */
function handleSubmit(event) {
  event.preventDefault();
  alert('Orden guardada exitosamente.');
}

function handleCancel() {
  if (confirm('¿Está seguro que desea cancelar? Los cambios no guardados se perderán.')) {
    document.getElementById('orderForm').reset();
    document.getElementById('fileListPO').innerHTML = '';
    document.getElementById('fileListEmail').innerHTML = '';
  }
}

/* === Modo simulación de flujos === */
let simMode = 0; // 0=válido, 1=archivo no válido, 2=datos incompletos, 3=orden existente, 4=multi-invoice
const modeLabels = ['Válido', 'Archivo no válido', 'Datos incompletos', 'Orden existente', 'Multi-invoice'];
const modeClasses = ['', 'mode-1', 'mode-2', 'mode-3', 'mode-4'];

function hideAllPoAlerts() {
  document.getElementById('poTableSection').style.display = 'none';
  document.getElementById('poTableIncomplete').style.display = 'none';
  document.getElementById('poInfoValid').style.display = 'none';
  document.getElementById('poInfoIncomplete').style.display = 'none';
  document.getElementById('poErrorSection').style.display = 'none';
  document.getElementById('poWarningSection').style.display = 'none';
  document.getElementById('poExistsSection').style.display = 'none';
  document.getElementById('poInfoMulti').style.display = 'none';
  document.getElementById('poMultiInvoiceSection').style.display = 'none';
  document.querySelectorAll('.ml-ac-input:not(.filled)').forEach(function(input) {
    input.value = '';
  });
}

function toggleSimMode() {
  simMode = (simMode + 1) % 5;
  const btn = document.getElementById('btnToggleMode');
  btn.className = 'toggle-error-mode ' + modeClasses[simMode];
  btn.querySelector('.mode-label').textContent = modeLabels[simMode];
  btn.title = 'Modo: ' + modeLabels[simMode] + ' (clic para cambiar)';
  hideAllPoAlerts();
  validateForm();
}

/* === Validación del formulario === */
function validateForm() {
  const hasFile = document.getElementById('fileListPO').children.length > 0;
  const isValidMode = simMode === 0 || simMode === 4;
  document.getElementById('btnProcesar').disabled = !(hasFile && isValidMode);
}

/* === Navegación entre pasos === */
function goToStep3() {
  document.getElementById('step1').style.display = 'none';
  document.getElementById('step3').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Selector tipo de orden ── */
let currentOrderType = 'local';

function selectOrderType(el, type) {
  document.querySelectorAll('.order-type-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  el.querySelector('input[type="radio"]').checked = true;
  currentOrderType = type;
  applyExternaMode();
}

function applyExternaMode() {
  const isExterna = currentOrderType === 'externa';
  const externaData = [
    { code: 'R150-AR0509', desc: 'Cable de velocímetro' },
    { code: 'R150-AR0507', desc: 'Cable de acelerador' },
    { code: 'R150-AR0508', desc: 'Cable de embrague' },
    { code: 'R180-XP1122', desc: 'Decorativo frontal superior' },
    { code: 'R150-100837', desc: 'Pastillas de freno' },
    { code: 'R180-XP0302', desc: 'Juego de retenedores' },
    { code: 'R180-XP0903', desc: 'Llave de paso de combustible' },
    { code: 'R180-XP0806', desc: 'Piñón de velocímetro' }
  ];

  // Collect unique td cells: inputs present (local mode) or tds already transformed (externa mode)
  const externaTds = [];
  document.querySelectorAll('.ml-externa-lock').forEach(function(input) {
    const td = input.closest('td');
    if (td && externaTds.indexOf(td) === -1) externaTds.push(td);
  });
  document.querySelectorAll('td[data-original-html]').forEach(function(td) {
    if (externaTds.indexOf(td) === -1) externaTds.push(td);
  });

  externaTds.forEach(function(td, idx) {
    const rowIdx = Math.floor(idx / 2);
    const isDesc = td.classList.contains('ml-desc-cell');
    const data = externaData[rowIdx] || { code: '—', desc: '—' };

    if (isExterna) {
      if (!td.dataset.originalHtml) td.dataset.originalHtml = td.innerHTML;
      const val = isDesc ? data.desc : data.code;
      const content = isDesc
        ? '<span class="ml-desc-readonly">' + val + '</span>'
        : '<code class="ml-code-badge">' + val + '</code>';
      td.innerHTML = content;
      td.classList.remove('ml-ac-cell');
      td.classList.add('ml-readonly-cell');
    } else {
      if (td.dataset.originalHtml) {
        td.innerHTML = td.dataset.originalHtml;
        delete td.dataset.originalHtml;
      }
      td.classList.remove('ml-readonly-cell');
      td.classList.add('ml-ac-cell');
    }
  });
}

function resetForm() {
  document.getElementById('step3').style.display = 'none';
  document.getElementById('step1').style.display = '';
  document.getElementById('fileListPO').innerHTML = '';
  document.getElementById('fileListEmail').innerHTML = '';
  document.querySelectorAll('#step1 .upload-zone').forEach(z => z.style.display = '');
  hideAllPoAlerts();
  // Reset order type to Local
  currentOrderType = 'local';
  const localOption = document.querySelector('.order-type-option');
  if (localOption) selectOrderType(localOption, 'local');
  validateForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* === Multi-invoice carousel === */
const invoicesData = [
  {
    invoiceNum: 'INV-2026-001',
    nirCode: 'NIR1-000063',
    date: '18/03/2026',
    items: [
      { desc: 'BASE DE FARO', mlCode: 'R150-FR0520', mlDesc: 'Base de faro', qty: 100 },
      { desc: 'MANUBRIO IZQ./DER.SET NEGRO', mlCode: 'R150-FR0256NEG', mlDesc: 'Manubrio izq./der. set negro', qty: 160 },
      { desc: 'PITO', mlCode: 'R150-FR0309', mlDesc: 'Pito', qty: 100 },
      { desc: 'KIT DE PISTAS DEL TREN DELANTERO', mlCode: 'R150-FR0238', mlDesc: 'Kit de pistas del tren delantero', qty: 300 }
    ]
  },
  {
    invoiceNum: 'INV-2026-002',
    nirCode: 'NIR1-000064',
    date: '25/03/2026',
    items: [
      { desc: 'MANIJA DE FRENO S/BASE', mlCode: 'R150-FR0222', mlDesc: 'Manija de freno s/base', qty: 50 },
      { desc: 'KIT DE TRANSMISION DELANTERA', mlCode: 'R150-FR0234', mlDesc: 'Kit de transmisión delantera', qty: 150 },
      { desc: 'BARRA TELESCOPICA IZQ/DER SET', mlCode: 'R150-AR0518', mlDesc: 'Barra telescópica izq./der. set', qty: 30 },
      { desc: 'AMORTIGUADOR', mlCode: 'R150-AR0605', mlDesc: 'Amortiguador', qty: 50 }
    ]
  },
  {
    invoiceNum: 'INV-2026-003',
    nirCode: 'NIR1-000065',
    date: '02/04/2026',
    items: [
      { desc: 'ARNES ELECTRICO', mlCode: 'R150-AR0308', mlDesc: 'Arnés eléctrico', qty: 50 },
      { desc: 'KIT SWITCH', mlCode: 'R150-AR0305', mlDesc: 'Kit switch', qty: 100 }
    ]
  }
];

let currentInvoiceIdx = 0;

function renderCurrentInvoice() {
  const inv = invoicesData[currentInvoiceIdx];
  const total = invoicesData.length;

  // Counter
  document.getElementById('invoiceCurrentNum').textContent = currentInvoiceIdx + 1;
  document.getElementById('invoiceTotalNum').textContent = total;

  // Dots
  var dotsEl = document.getElementById('invoiceDots');
  dotsEl.innerHTML = '';
  for (var i = 0; i < total; i++) {
    var dot = document.createElement('span');
    dot.className = 'invoice-dot' + (i === currentInvoiceIdx ? ' active' : '');
    (function(idx) {
      dot.onclick = function() { currentInvoiceIdx = idx; renderCurrentInvoice(); };
    })(i);
    dotsEl.appendChild(dot);
  }

  // NIR code in info bar
  var nirEl = document.getElementById('multiInvoiceNir');
  if (nirEl) nirEl.textContent = inv.nirCode;

  // Header bar
  document.getElementById('invoiceHeaderBar').innerHTML =
    '<span class="invoice-num-badge">' + inv.invoiceNum + '</span>' +
    '<span class="invoice-date-badge">' +
      '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink:0;">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>' +
      '</svg>' +
      inv.date +
    '</span>';

  // Table rows
  var html = '';
  inv.items.forEach(function(item, i) {
    html += '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td>' + item.desc + '</td>' +
      '<td class="ml-readonly-cell"><code class="ml-code-badge">' + item.mlCode + '</code></td>' +
      '<td class="ml-desc-cell ml-readonly-cell"><span class="ml-desc-readonly">' + item.mlDesc + '</span></td>' +
      '<td>' + item.qty + '</td>' +
    '</tr>';
  });
  document.getElementById('invoiceTbody').innerHTML = html;

  // Nav buttons
  document.getElementById('btnPrevInvoice').disabled = currentInvoiceIdx === 0;
  document.getElementById('btnNextInvoice').disabled = currentInvoiceIdx === total - 1;
}

function navigateInvoice(dir) {
  var newIdx = currentInvoiceIdx + dir;
  if (newIdx >= 0 && newIdx < invoicesData.length) {
    currentInvoiceIdx = newIdx;
    renderCurrentInvoice();
  }
}