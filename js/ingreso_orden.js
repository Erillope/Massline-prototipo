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
let simMode = 0; // 0=válido, 1=archivo no válido, 2=datos incompletos, 3=orden existente
const modeLabels = ['Válido', 'Archivo no válido', 'Datos incompletos', 'Orden existente'];
const modeClasses = ['', 'mode-1', 'mode-2', 'mode-3'];

function hideAllPoAlerts() {
  document.getElementById('poTableSection').style.display = 'none';
  document.getElementById('poTableIncomplete').style.display = 'none';
  document.getElementById('poInfoValid').style.display = 'none';
  document.getElementById('poInfoIncomplete').style.display = 'none';
  document.getElementById('poErrorSection').style.display = 'none';
  document.getElementById('poWarningSection').style.display = 'none';
  document.getElementById('poExistsSection').style.display = 'none';
  document.querySelectorAll('.ml-ac-input').forEach(function(input) {
    input.value = '';
    input.classList.remove('filled');
  });
}

function toggleSimMode() {
  simMode = (simMode + 1) % 4;
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
  const isValidMode = simMode === 0;
  document.getElementById('btnProcesar').disabled = !(hasFile && isValidMode);
}

/* === Navegación entre pasos === */
function goToStep3() {
  document.getElementById('step1').style.display = 'none';
  document.getElementById('step3').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  document.getElementById('step3').style.display = 'none';
  document.getElementById('step1').style.display = '';
  document.getElementById('fileListPO').innerHTML = '';
  document.getElementById('fileListEmail').innerHTML = '';
  document.querySelectorAll('#step1 .upload-zone').forEach(z => z.style.display = '');
  hideAllPoAlerts();
  validateForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* === Autocomplete Massline === */

function getRowFiltered(row) {
  var codeInput = row.querySelector('[data-field="code"]');
  var descInput = row.querySelector('[data-field="desc"]');
  var qCode = (codeInput ? codeInput.value : '').toLowerCase().trim();
  var qDesc = (descInput ? descInput.value : '').toLowerCase().trim();
  if (!qCode && !qDesc) return masslineCatalog;
  return masslineCatalog.filter(function(item) {
    var matchCode = !qCode || item.code.toLowerCase().includes(qCode) || item.desc.toLowerCase().includes(qCode);
    var matchDesc = !qDesc || item.desc.toLowerCase().includes(qDesc) || item.code.toLowerCase().includes(qDesc);
    return matchCode && matchDesc;
  });
}

function showMlDropdown(input) {
  document.querySelectorAll('.ml-ac-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
  var row = input.closest('tr');
  var filtered = getRowFiltered(row);
  var dropdown = input.nextElementSibling;
  renderMlOptions(dropdown, filtered);
  dropdown.classList.add('open');
}

function renderMlOptions(dropdown, filtered) {
  dropdown.innerHTML = filtered.map(function(item) {
    return '<div class="ml-ac-option" onmousedown="selectMassline(this, \'' + item.code + '\', \'' + item.desc + '\')">' +
      '<span class="ml-ac-option-code">' + item.code + '</span>' +
      '<span class="ml-ac-option-desc">' + item.desc + '</span>' +
      '</div>';
  }).join('');
  if (filtered.length === 0) {
    dropdown.innerHTML = '<div style="padding:8px 10px;color:#8b8fa3;font-size:12px;">Sin resultados</div>';
  }
}

function filterMassline(input) {
  var row = input.closest('tr');
  var filtered = getRowFiltered(row);
  // Update dropdown of the input being typed
  var dropdown = input.nextElementSibling;
  renderMlOptions(dropdown, filtered);
  dropdown.classList.add('open');
  // Also update the sibling's dropdown if it's open
  var sibling = input.dataset.field === 'code'
    ? row.querySelector('[data-field="desc"]')
    : row.querySelector('[data-field="code"]');
  if (sibling) {
    var sibDropdown = sibling.nextElementSibling;
    if (sibDropdown.classList.contains('open')) {
      renderMlOptions(sibDropdown, filtered);
    }
  }
  if (!input.value.trim()) {
    input.classList.remove('filled');
    if (sibling) {
      sibling.value = '';
      sibling.classList.remove('filled');
    }
  }
}

function selectMassline(option, code, desc) {
  var dropdown = option.closest('.ml-ac-dropdown');
  var input = dropdown.previousElementSibling;
  dropdown.classList.remove('open');
  var row = input.closest('tr');
  var codeInput = row.querySelector('[data-field="code"]');
  var descInput = row.querySelector('[data-field="desc"]');
  codeInput.value = code;
  codeInput.classList.add('filled');
  descInput.value = desc;
  descInput.classList.add('filled');
}

document.addEventListener('click', function(e) {
  if (!e.target.closest('.ml-autocomplete')) {
    document.querySelectorAll('.ml-ac-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
  }
});
