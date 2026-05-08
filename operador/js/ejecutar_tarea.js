var task = null;
var phase = 'box'; // box | location
var activeStream = null;
var scanMode = 'ideal'; // ideal | error

function getExecutionTask() {
  if (!window.operatorData) return null;
  if (typeof window.operatorData.getExecutionTask === 'function') {
    return window.operatorData.getExecutionTask();
  }
  var fixedCode = window.operatorData.fixedExecutionTaskCode || 'TA-ALM-00041';
  return window.operatorData.getTaskByCode(fixedCode);
}

function goBackToList() {
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

function setFlowPhase(nextPhase) {
  phase = nextPhase;

  var instruction = document.getElementById('execInstruction');
  var target = document.getElementById('execTargetValue');
  var cameraTitle = document.getElementById('cameraTitle');

  if (!instruction || !target || !cameraTitle) return;

  hideScanError();

  if (phase === 'box') {
    instruction.textContent = 'Escanea el código QR de la caja';
    target.textContent = task.boxCode;
    cameraTitle.textContent = 'Escaneando caja…';
  } else {
    instruction.textContent = 'Diríjase a Bodega y escanee el QR de la ubicación';
    target.textContent = task.suggestedLocation;
    cameraTitle.textContent = 'Escaneando ubicación…';
  }
}

function getScanModeFromQuery() {
  var params = new URLSearchParams(window.location.search);
  return params.get('scanMode') === 'error' ? 'error' : 'ideal';
}

function persistScanModeInQuery() {
  var url = new URL(window.location.href);
  if (scanMode === 'error') {
    url.searchParams.set('scanMode', 'error');
  } else {
    url.searchParams.delete('scanMode');
  }

  var query = url.searchParams.toString();
  var nextUrl = url.pathname + (query ? '?' + query : '') + url.hash;
  window.history.replaceState({}, '', nextUrl);
}

function renderScanModeButton() {
  var btn = document.getElementById('scanModeBtn');
  if (!btn) return;

  var isError = scanMode === 'error';
  btn.textContent = isError ? 'Error' : 'Ideal';
  btn.classList.toggle('error', isError);
  btn.classList.toggle('ideal', !isError);
}

function toggleScanMode() {
  scanMode = scanMode === 'error' ? 'ideal' : 'error';
  renderScanModeButton();
  persistScanModeInQuery();
  hideScanError();
}

function showScanError() {
  var errorBox = document.getElementById('execScanError');
  var shell = document.getElementById('cameraTapTarget');
  var cameraTitle = document.getElementById('cameraTitle');
  if (!errorBox) return;

  if (phase === 'box') {
    errorBox.textContent = 'Caja incorrecta. Verifica el código y vuelve a escanear.';
  } else {
    errorBox.textContent = 'Ubicación incorrecta. Escanea la ubicación indicada.';
  }

  if (cameraTitle) cameraTitle.textContent = 'Error de escaneo';
  errorBox.style.display = 'block';

  if (shell) {
    shell.classList.remove('scan-error');
    void shell.offsetWidth;
    shell.classList.add('scan-error');
  }
}

function hideScanError() {
  var errorBox = document.getElementById('execScanError');
  var shell = document.getElementById('cameraTapTarget');
  if (errorBox) errorBox.style.display = 'none';
  if (shell) shell.classList.remove('scan-error');
}

async function startCameraFeed() {
  var video = document.getElementById('cameraVideo');
  var fallback = document.getElementById('cameraFallback');

  video.srcObject = null;
  fallback.style.display = 'none';

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    fallback.textContent = 'Este navegador no soporta cámara.';
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
    fallback.textContent = 'No se pudo acceder a la cámara. Verifica permisos.';
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

function completeTask() {
  var instruction = document.getElementById('execInstruction');
  var cameraTitle = document.getElementById('cameraTitle');

  if (instruction) instruction.textContent = 'Tarea completada correctamente';
  if (cameraTitle) cameraTitle.textContent = 'Escaneo completado';

  if (window.operatorData && task) {
    window.operatorData.markTaskCompleted(task.taskCode);
  }

  setTimeout(function () {
    stopCameraFeed();
    window.location.href = 'index.html?toast=tarea-completada&taskCode=' + encodeURIComponent(task.taskCode);
  }, 280);
}

function handleCameraTap() {
  if (scanMode === 'error') {
    showScanError();
    return;
  }

  if (phase === 'box') {
    setFlowPhase('location');
    return;
  }
  completeTask();
}

function initExecution() {
  task = getExecutionTask();
  if (!task) {
    showTaskNotFound();
    return;
  }

  renderTaskHeader();
  document.getElementById('execTaskInfo').style.display = 'block';
  document.getElementById('execFlow').style.display = 'grid';
  document.getElementById('execNotFound').style.display = 'none';

  scanMode = getScanModeFromQuery();
  renderScanModeButton();
  setFlowPhase('box');
  startCameraFeed();
}

window.goBackToList = goBackToList;
window.handleCameraTap = handleCameraTap;
window.toggleScanMode = toggleScanMode;
window.addEventListener('beforeunload', stopCameraFeed);

initExecution();
