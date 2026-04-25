/* ===== MassLine — Solicitudes de edición de emergencia ===== */

var seDiffExpanded = {};
var seRejecting = {};

function renderRequestsList() {
  var container = document.getElementById('erList');
  if (!container) return;

  var pending = emergencyRequests.filter(function(r) { return r.status === 'pendiente'; });

  if (pending.length === 0) {
    container.innerHTML =
      '<div class="se-empty">' +
        '<svg width="40" height="40" fill="none" stroke="#d1d5db" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' +
        '<p class="se-empty-title">Sin solicitudes pendientes</p>' +
        '<p class="se-empty-msg">No hay solicitudes de edición que requieran aprobación en este momento.</p>' +
      '</div>';
    return;
  }

  var html = '';

  pending.forEach(function(req) {
    var url = 'detalle_orden.html?code=' + encodeURIComponent(req.code) + '&reviewMode=' + req.id;

    html += '<div class="er-card se-card er-card-clickable" id="se-card-' + req.id + '" onclick="window.location.href=\'' + url + '\'">';

    html += '<div class="er-card-top">';
    html += '<div class="er-card-info">';
    html += '<code class="er-code">' + req.code + '</code>';
    html += '<span class="er-proveedor">' + req.proveedor + '</span>';
    html += '<span class="er-meta">Solicitado por <strong>' + req.requestedBy + '</strong> · ' + req.requestedAt + '</span>';
    html += '</div>';
    html += '<div class="er-card-nav-hint">';
    html += '<span>' + req.changes.length + ' cambio' + (req.changes.length !== 1 ? 's' : '') + '</span>';
    html += '<svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>';
    html += '</div>';
    html += '</div>'; // er-card-top

    html += '<div class="er-motivo"><span class="er-motivo-label">Motivo:</span> ' + req.motivo + '</div>';

    html += '</div>'; // se-card
  });

  container.innerHTML = html;
}

function toggleSeDiff(id) {
  seDiffExpanded[id] = !seDiffExpanded[id];
  renderRequestsList();
}

function seApprove(id) {
  var req = emergencyRequests.find(function(r) { return r.id === id; });
  if (!req) return;
  req.status = 'aprobada';
  delete seDiffExpanded[id];
  delete seRejecting[id];
  renderRequestsList();
  document.querySelector('#seToast .toast-title').textContent = 'Solicitud aprobada';
  document.getElementById('seToastMessage').textContent = 'Los cambios en la orden ' + req.code + ' han sido aprobados.';
  seShowToast();
}

function seOpenReject(id) {
  seRejecting[id] = true;
  seDiffExpanded[id] = false;
  renderRequestsList();
}

function seCancelReject(id) {
  delete seRejecting[id];
  renderRequestsList();
}

function seConfirmReject(id) {
  var req = emergencyRequests.find(function(r) { return r.id === id; });
  if (!req) return;
  req.status = 'rechazada';
  delete seDiffExpanded[id];
  delete seRejecting[id];
  renderRequestsList();
  document.querySelector('#seToast .toast-title').textContent = 'Solicitud rechazada';
  document.getElementById('seToastMessage').textContent = 'La solicitud de edición de ' + req.code + ' fue rechazada.';
  seShowToast();
}

function seShowToast() {
  var toast = document.getElementById('seToast');
  toast.classList.add('show');
  setTimeout(function() { seHideToast(); }, 4000);
}

function seHideToast() {
  document.getElementById('seToast').classList.remove('show');
}

document.addEventListener('DOMContentLoaded', function() {
  renderRequestsList();
});
