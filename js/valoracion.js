// Leer parámetros de la URL
const params = new URLSearchParams(window.location.search);
const orderCode = params.get('code') || 'NIR1-000048';
const proveedor = params.get('proveedor') || 'WUXI HUAHENG INTERNATIONAL TRADE CORP.';

document.getElementById('infoCode').textContent = orderCode;
document.getElementById('infoProveedor').textContent = proveedor;

function checkForm() {
  const codigo = document.getElementById('inputCodigo').value.trim();
  document.getElementById('btnConfirm').disabled = !codigo;
}

function confirmValoracion() {
  const codigo = document.getElementById('inputCodigo').value.trim();
  document.getElementById('formSection').classList.add('hidden');
  document.getElementById('successCode').textContent = orderCode;
  document.getElementById('successValCode').textContent = codigo;
  document.getElementById('successSection').classList.add('active');
}
