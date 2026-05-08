var activeTab = 'pending'; // pending | completed

var simMode = 0;
var simLabels = ['Normal', 'Sin tareas'];

function getTasks() {
  if (!window.operatorData) return [];
  return window.operatorData.getTasks();
}

function applyFilter(list) {
  return list.filter(function (task) {
    return activeTab === 'completed' ? !!task.completed : !task.completed;
  });
}

function updateTabs(tasks) {
  var pendingTotal = tasks.filter(function (t) { return !t.completed; }).length;
  var completedTotal = tasks.filter(function (t) { return t.completed; }).length;

  var pendingBtn = document.getElementById('filterPending');
  var completedBtn = document.getElementById('filterCompleted');

  if (!pendingBtn || !completedBtn) return;

  pendingBtn.textContent = 'Pendientes (' + pendingTotal + ')';
  completedBtn.textContent = 'Completadas (' + completedTotal + ')';

  pendingBtn.classList.toggle('active', activeTab === 'pending');
  completedBtn.classList.toggle('active', activeTab === 'completed');
  pendingBtn.setAttribute('aria-selected', activeTab === 'pending' ? 'true' : 'false');
  completedBtn.setAttribute('aria-selected', activeTab === 'completed' ? 'true' : 'false');
}

function openTask() {
  var fixedCode = (window.operatorData && window.operatorData.fixedExecutionTaskCode)
    ? window.operatorData.fixedExecutionTaskCode
    : 'TA-ALM-00041';
  window.location.href = 'ejecutar_tarea.html?taskCode=' + encodeURIComponent(fixedCode);
}

function renderTasks() {
  var taskList = document.getElementById('taskList');
  var emptyState = document.getElementById('emptyState');
  var emptyTitle = emptyState ? emptyState.querySelector('h3') : null;
  var emptyMsg = emptyState ? emptyState.querySelector('p') : null;
  if (!taskList || !emptyState) return;

  var tasks = getTasks();
  var filteredTasks = applyFilter(tasks);
  var viewTasks = simMode === 1 ? [] : filteredTasks;

  updateTabs(tasks);

  if (!viewTasks.length) {
    if (emptyTitle && emptyMsg) {
      if (activeTab === 'completed') {
        emptyTitle.textContent = 'Sin tareas completadas';
        emptyMsg.textContent = 'Aún no hay tareas completadas para mostrar.';
      } else {
        emptyTitle.textContent = 'Sin tareas pendientes';
        emptyMsg.textContent = 'No hay tareas de almacenamiento por atender en este momento.';
      }
    }

    taskList.innerHTML = '';
    taskList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  taskList.style.display = 'grid';
  emptyState.style.display = 'none';

  taskList.innerHTML = viewTasks.map(function (task) {
    var completedMeta = '';
    var cardClass = 'op-task-card op-task-clickable';

    if (task.completed) {
      cardClass += ' is-completed';
      completedMeta = '<div class="op-task-meta">Completada ' + (task.completedAt || '--:--') + ' · ' + String(task.durationMin || 0).padStart(2, '0') + 'm</div>';
    }

    return '\n      <article class="' + cardClass + '" role="button" tabindex="0" onclick="openTask()" onkeydown="openTaskFromKey(event)">\n        <div class="op-task-card-head">\n          <div class="op-task-code">' + task.taskCode + '</div>\n          ' + completedMeta + '\n        </div>\n        <div class="op-task-body">\n          <div class="op-task-row">\n            <span class="op-task-label">NIR</span>\n            <span class="op-task-value">' + task.nir + '</span>\n          </div>\n          <div class="op-task-row">\n            <span class="op-task-label">Caja</span>\n            <span class="op-task-value">' + task.boxCode + '</span>\n          </div>\n          <div class="op-task-row">\n            <span class="op-task-label">Ubicación</span>\n            <span class="op-task-value">' + task.suggestedLocation + '</span>\n          </div>\n        </div>\n      </article>\n    ';
  }).join('');
}

function openTaskFromKey(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    openTask();
  }
}

function setTab(type) {
  if (type !== 'pending' && type !== 'completed') return;
  activeTab = type;
  renderTasks();
}

function toggleSimMode() {
  var btn = document.getElementById('btnToggleMode');
  if (!btn) return;
  simMode = (simMode + 1) % simLabels.length;
  var simLabel = document.getElementById('simLabel');
  if (simLabel) simLabel.textContent = simLabels[simMode];
  btn.title = 'Modo: ' + simLabels[simMode] + ' (clic para cambiar)';
  btn.classList.remove('mode-1');
  if (simMode === 1) btn.classList.add('mode-1');
  renderTasks();
}

function showListToastFromQuery() {
  var params = new URLSearchParams(window.location.search);
  var toast = params.get('toast');
  if (toast !== 'tarea-completada') return;

  var code = params.get('taskCode') || '';
  var toastEl = document.getElementById('opToast');
  var msgEl = document.getElementById('opToastMsg');
  if (!toastEl || !msgEl) return;

  msgEl.textContent = code
    ? 'Tarea ' + code + ' completada correctamente.'
    : 'Tarea completada correctamente.';

  toastEl.classList.add('show');
  setTimeout(function () {
    toastEl.classList.remove('show');
  }, 3200);

  var cleanUrl = window.location.pathname;
  window.history.replaceState({}, document.title, cleanUrl);
}

window.setTab = setTab;
window.toggleSimMode = toggleSimMode;
window.openTask = openTask;
window.openTaskFromKey = openTaskFromKey;

showListToastFromQuery();
renderTasks();
