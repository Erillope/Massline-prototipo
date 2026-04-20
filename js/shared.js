/* ===== MassLine — Funciones compartidas ===== */

/* === Sidebar toggle === */
function toggleSection(header) {
  const section = header.closest('.nav-section');
  section.classList.toggle('open');
}

/* === Toast === */
function showToast() {
  const toast = document.getElementById('arrivalToast');
  toast.classList.add('show');
  setTimeout(() => { hideToast(); }, 4000);
}

function hideToast() {
  document.getElementById('arrivalToast').classList.remove('show');
}

/* === Photo lightbox === */
function openPhotoLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('photoLightbox').classList.add('active');
}

function closePhotoLightbox() {
  document.getElementById('photoLightbox').classList.remove('active');
  document.getElementById('lightboxImg').src = '';
}

/* === Autocomplete Massline (shared) === */

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
  var dropdown = input.nextElementSibling;
  renderMlOptions(dropdown, filtered);
  dropdown.classList.add('open');
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