var OPERATOR_FIXED_EXEC_TASK_CODE = 'TA-ALM-00041';

var OPERATOR_DEFAULT_TASKS = [
  {
    taskCode: 'TA-ALM-00041',
    nir: 'NIR1-000055',
    boxCode: 'CAJA-014',
    suggestedLocation: 'B-02-03',
    completed: false
  },
  {
    taskCode: 'TA-ALM-00042',
    nir: 'NIR1-000055',
    boxCode: 'CAJA-015',
    suggestedLocation: 'B-02-04',
    completed: false
  },
  {
    taskCode: 'TA-ALM-00043',
    nir: 'NIR1-000060',
    boxCode: 'CAJA-021',
    suggestedLocation: 'C-01-02',
    completed: false
  },
  {
    taskCode: 'TA-ALM-00044',
    nir: 'NIR1-000060',
    boxCode: 'CAJA-022',
    suggestedLocation: 'C-01-03',
    completed: false
  },
  {
    taskCode: 'TA-ALM-00036',
    nir: 'NIR1-000049',
    boxCode: 'CAJA-003',
    suggestedLocation: 'A-01-02',
    completed: true
  },
  {
    taskCode: 'TA-ALM-00037',
    nir: 'NIR1-000049',
    boxCode: 'CAJA-004',
    suggestedLocation: 'A-01-03',
    completed: true
  }
];

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getOperatorTasks() {
  return deepClone(OPERATOR_DEFAULT_TASKS);
}

function getOperatorTaskByCode(taskCode) {
  var tasks = getOperatorTasks();
  return tasks.find(function (task) {
    return task.taskCode === taskCode;
  }) || null;
}

function getOperatorFixedExecutionTask() {
  return getOperatorTaskByCode(OPERATOR_FIXED_EXEC_TASK_CODE);
}

function markOperatorTaskCompleted() {
  // Prototipo sin persistencia de estado.
  return true;
}

window.operatorData = {
  fixedExecutionTaskCode: OPERATOR_FIXED_EXEC_TASK_CODE,
  getTasks: getOperatorTasks,
  getTaskByCode: getOperatorTaskByCode,
  getExecutionTask: getOperatorFixedExecutionTask,
  markTaskCompleted: markOperatorTaskCompleted
};
