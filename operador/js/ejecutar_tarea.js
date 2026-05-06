var task = null;
var stepDone = {
  box: false,
  location: false
};

var forceErrorNextScan = {
  box: false,
  location: false
};

var scanInProgress = false;
var scanTimer = null;
var activeStream = null;

function getTaskFromQuery() {
  if (!window.operatorData) return null;
  if (typeof window.operatorData.getExecutionTask === 'function') {
    return window.operatorData.getExecutionTask();
  }
  var fixedCode = window.operatorData.fixedExecutionTaskCode || 'TA-ALM-00041';
  return window.operatorData.getTaskByCode(fixedCode);
}

function goBackToList() {
  if (scanTimer) {
    clearInterval(scanTimer);
    scanTimer = null;
  }
  stopCameraFeed();
  window.location.href = 'index.html';
}

function showTaskNotFound() {
  document.getElementById('execTaskInfo').style.display = 'none';
  document.getElementById('execFlow').style.display = 'none';
  document.getElementById('execNotFound').style.display = 'block';
}

function renderTaskHeader() {
  document.getElementById('execTaskCode').textContent = task.taskCode;
  document.getElementById('execNir').textContent = task.nir;
  document.getElementById('execBox').textContent = task.boxCode;
  document.getElementById('execLocation').textContent = task.suggestedLocation;
}

function updateStepPill(step, label, cls) {
  var pill = document.getElementById(step === 'box' ? 'stepBoxPill' : 'stepLocationPill');
  pill.textContent = label;
  pill.className = 'op-step-pill ' + cls;
}

function renderFlowState() {
  var scanBoxBtn = document.getElementById('scanBoxBtn');
  var scanLocationBtn = document.getElementById('scanLocationBtn');
  var finishBtn = document.getElementById('finishTaskBtn');
  var boxModeBtn = document.getElementById('boxModeBtn');
  var locationModeBtn = document.getElementById('locationModeBtn');

  if (scanBoxBtn) {
    scanBoxBtn.disabled = scanInProgress || stepDone.box;
  }
  if (scanLocationBtn) {
    scanLocationBtn.disabled = !stepDone.box || scanInProgress || stepDone.location;
  }
  if (finishBtn) {
    finishBtn.disabled = !(stepDone.box && stepDone.location) || scanInProgress;
  }
  if (boxModeBtn) {
    boxModeBtn.disabled = scanInProgress || stepDone.box;
  }
  if (locationModeBtn) {
    locationModeBtn.disabled = scanInProgress || !stepDone.box || stepDone.location;
  }

  if (stepDone.box) {
    updateStepPill('box', 'OK', 'ok');
  } else {
    updateStepPill('box', 'Pendiente', 'pending');
  }

  if (stepDone.location) {
    updateStepPill('location', 'OK', 'ok');
  } else {
    updateStepPill('location', 'Pendiente', 'pending');
  }
}

function toggleStepMode(step) {
  if (!forceErrorNextScan.hasOwnProperty(step)) return;

  var btn = document.getElementById(step + 'ModeBtn');
  if (!btn || btn.disabled) return;
  forceErrorNextScan[step] = !forceErrorNextScan[step];

  if (forceErrorNextScan[step]) {
    btn.textContent = 'Error próximo';
    btn.classList.add('mode-1');
  } else {
    btn.textContent = 'Éxito';
    btn.classList.remove('mode-1');
  }
}

function resetStepMode(step) {
  var btn = document.getElementById(step + 'ModeBtn');
  forceErrorNextScan[step] = false;
  if (!btn) return;
  btn.textContent = 'Éxito';
  btn.classList.remove('mode-1');
}

function hideStepErrors() {
  document.getElementById('boxErrorMsg').style.display = 'none';
  document.getElementById('locationErrorMsg').style.display = 'none';
}

function showError(step) {
  var errId = step === 'box' ? 'boxErrorMsg' : 'locationErrorMsg';
  document.getElementById(errId).style.display = 'block';
}

async function startCameraFeed() {
  var video = document.getElementById('cameraVideo');
  var fallback = document.getElementById('cameraFallback');

  video.srcObject = null;
  fallback.style.display = 'none';

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    fallback.style.display = 'flex';
    return;
  }

  try {
    activeStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false
    });
    video.srcObject = activeStream;
    await video.play();
  } catch (e) {
    fallback.style.display = 'flex';
  }
}

function stopCameraFeed() {
  if (activeStream) {
    activeStream.getTracks().forEach(function (track) {
      track.stop();
    });
    activeStream = null;
  }

  var video = document.getElementById('cameraVideo');
  if (video) video.srcObject = null;
}

function hideCameraOverlay() {
  document.getElementById('cameraOverlay').classList.remove('active');
  stopCameraFeed();
}

function applyScanResult(step) {
  hideStepErrors();

  if (forceErrorNextScan[step]) {
    resetStepMode(step);
    showError(step);
    renderFlowState();
    return;
  }

  if (step === 'box') {
    stepDone.box = true;
  } else if (step === 'location') {
    stepDone.location = true;
  }

  renderFlowState();
}

function startScan(step) {
  if (scanInProgress) return;

  if (step === 'location' && !stepDone.box) return;

  scanInProgress = true;
  renderFlowState();

  var overlay = document.getElementById('cameraOverlay');
  var title = document.getElementById('cameraTitle');
  var count = document.getElementById('cameraCount');

  title.textContent = step === 'box' ? 'Escaneando caja…' : 'Escaneando ubicación…';
  count.textContent = '3';
  overlay.classList.add('active');

  startCameraFeed();

  var remaining = 3;
  scanTimer = setInterval(function () {
    remaining -= 1;
    count.textContent = String(Math.max(remaining, 0));
    if (remaining <= 0) {
      clearInterval(scanTimer);
      scanTimer = null;
      hideCameraOverlay();
      scanInProgress = false;
      applyScanResult(step);
    }
  }, 1000);
}

function finishTask() {
  if (!(stepDone.box && stepDone.location)) return;
  if (!window.operatorData || !task) return;

  window.operatorData.markTaskCompleted(task.taskCode);
  window.location.href = 'index.html?toast=tarea-completada&taskCode=' + encodeURIComponent(task.taskCode);
}

function initExecution() {
  task = getTaskFromQuery();
  if (!task) {
    showTaskNotFound();
    return;
  }

  renderTaskHeader();

  document.getElementById('execTaskInfo').style.display = 'block';
  document.getElementById('execFlow').style.display = 'grid';
  document.getElementById('execNotFound').style.display = 'none';

  renderFlowState();
  setTimeout(function () {
    startScan('box');
  }, 120);
}

window.goBackToList = goBackToList;
window.toggleStepMode = toggleStepMode;
window.startScan = startScan;
window.finishTask = finishTask;

window.addEventListener('beforeunload', function () {
  if (scanTimer) clearInterval(scanTimer);
  stopCameraFeed();
});

initExecution();
