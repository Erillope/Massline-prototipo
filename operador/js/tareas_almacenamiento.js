var tasks = [
  {
    taskCode: 'TA-ALM-00041',
    nir: 'NIR1-000055',
    boxCode: 'CAJA-014',
    suggestedLocation: 'B-02-03'
  },
  {
    taskCode: 'TA-ALM-00042',
    nir: 'NIR1-000055',
    boxCode: 'CAJA-015',
    suggestedLocation: 'B-02-04'
  },
  {
    taskCode: 'TA-ALM-00043',
    nir: 'NIR1-000060',
    boxCode: 'CAJA-021',
    suggestedLocation: 'C-01-02'
  },
  {
    taskCode: 'TA-ALM-00044',
    nir: 'NIR1-000060',
    boxCode: 'CAJA-022',
    suggestedLocation: 'C-01-03'
  }
];

var simMode = 0;
var simLabels = ['Normal', 'Sin tareas'];

function renderTasks() {
  var taskList = document.getElementById('taskList');
  var emptyState = document.getElementById('emptyState');
  var pendingCount = document.getElementById('pendingCount');

  var viewTasks = simMode === 1 ? [] : tasks;

  pendingCount.textContent = viewTasks.length;

  if (!viewTasks.length) {
    taskList.innerHTML = '';
    taskList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  taskList.style.display = 'grid';
  emptyState.style.display = 'none';

  taskList.innerHTML = viewTasks.map(function (task) {
    return '\n      <article class="op-task-card">\n        <div class="op-task-card-head">\n          <div class="op-task-code">' + task.taskCode + '</div>\n        </div>\n        <div class="op-task-body">\n          <div class="op-task-row">\n            <span class="op-task-label">NIR</span>\n            <span class="op-task-value">' + task.nir + '</span>\n          </div>\n          <div class="op-task-row">\n            <span class="op-task-label">Caja</span>\n            <span class="op-task-value">' + task.boxCode + '</span>\n          </div>\n          <div class="op-task-row">\n            <span class="op-task-label">Ubicación</span>\n            <span class="op-task-value">' + task.suggestedLocation + '</span>\n          </div>\n        </div>\n      </article>\n    ';
  }).join('');
}

function toggleSimMode() {
  var btn = document.getElementById('btnToggleMode');
  simMode = (simMode + 1) % simLabels.length;
  document.getElementById('simLabel').textContent = simLabels[simMode];
  btn.title = 'Modo: ' + simLabels[simMode] + ' (clic para cambiar)';
  btn.classList.remove('mode-1');
  if (simMode === 1) btn.classList.add('mode-1');
  renderTasks();
}

renderTasks();
