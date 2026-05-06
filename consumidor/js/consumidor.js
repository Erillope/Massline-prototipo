// =============================================================
// consumidor.js — Portal de Repuestos (UC13 + UC14)
// =============================================================

// === Catálogo de productos ===
const productos = [
  { code: 'R150-AR0507', desc: 'Cable de acelerador',           cat: 'Cables',      disp: 32, unidad: 'und.' },
  { code: 'R150-AR0508', desc: 'Cable de embrague',             cat: 'Cables',      disp: 45, unidad: 'und.' },
  { code: 'R150-AR0509', desc: 'Cable de velocímetro',          cat: 'Cables',      disp: 28, unidad: 'und.' },
  { code: 'R150-100837', desc: 'Pastillas de freno',            cat: 'Frenos',      disp: 80, unidad: 'par'  },
  { code: 'R180-XP0903', desc: 'Llave de paso de combustible',  cat: 'Combustible', disp: 60, unidad: 'und.' },
  { code: 'R180-XP0302', desc: 'Juego de retenedores',          cat: 'Sellantes',   disp: 25, unidad: 'juego'},
  { code: 'R180-XP0806', desc: 'Piñón de velocímetro',          cat: 'Transmisión', disp: 40, unidad: 'und.' },
  { code: 'R180-XP1122', desc: 'Decorativo frontal superior',   cat: 'Carrocería',  disp: 15, unidad: 'und.' },
  { code: 'R150-GY0205', desc: 'Kit de balancines I/D',         cat: 'Motor',       disp: 18, unidad: 'kit'  },
  { code: 'R110-LX0923', desc: 'Empaques kit 110cc (23 piezas)',cat: 'Motor',       disp: 35, unidad: 'kit'  },
  { code: 'R150-XY0412', desc: 'Bendix de rodillo 41 dientes',  cat: 'Transmisión', disp: 22, unidad: 'und.' },
  { code: 'R250-XY0619', desc: 'Cilindro kit 250cc',            cat: 'Motor',       disp:  2, unidad: 'kit'  },
  { code: 'R200-GY0119', desc: 'Caja de transmisión LEP168.5',  cat: 'Transmisión', disp: 12, unidad: 'und.' },
];

// === Estado ===
var carrito = {};
var productosFiltrados = productos.slice();

// === Mapa de clases CSS por categoría ===
var catClass = {
  'Cables':      'cat-cables',
  'Frenos':      'cat-frenos',
  'Motor':       'cat-motor',
  'Transmisión': 'cat-transmision',
  'Sellantes':   'cat-sellantes',
  'Combustible': 'cat-combustible',
  'Carrocería':  'cat-carroceria',
};

// =============================================================
// Renderizar tabla de inventario
// =============================================================
function renderInventario() {
  var tbody        = document.getElementById('inventarioTbody');
  var countEl      = document.getElementById('inventarioCount');
  var noResults    = document.getElementById('noResultsCard');
  var invCard      = document.getElementById('inventarioCard');
  var total        = productosFiltrados.length;

  tbody.innerHTML  = '';
  countEl.textContent = total + ' producto' + (total !== 1 ? 's' : '');
  noResults.style.display = total === 0 ? '' : 'none';
  invCard.style.display   = total === 0 ? 'none' : '';

  productosFiltrados.forEach(function (p) {
    var enCarrito = !!carrito[p.code];
    var lowStock  = p.disp <= 5;

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><code>' + p.code + '</code></td>' +
      '<td>' + p.desc + '</td>' +

      '<td class="' + (lowStock ? 'qty-low' : '') + '">' +
        '<strong>' + p.disp + '</strong>' +
        ' <span class="qty-unit">' + p.unidad + '</span>' +
        (lowStock ? ' <span class="qty-low-badge">stock bajo</span>' : '') +
      '</td>' +
      '<td>' +
        '<div class="add-cell">' +
          '<input type="number" class="inv-qty-input" id="qty-' + p.code + '"' +
                 ' value="' + (carrito[p.code] || 1) + '" min="1" max="' + p.disp + '">' +
          '<button class="btn-add-cart' + (enCarrito ? ' added' : '') + '"' +
                  ' onclick="agregarAlCarrito(\'' + p.code + '\')">' +
            (enCarrito
              ? '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg> Agregado'
              : '<svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Agregar') +
          '</button>' +
        '</div>' +
      '</td>';
    tbody.appendChild(tr);
  });
}

// =============================================================
// Filtrar inventario
// =============================================================
function filtrarInventario() {
  var cod  = document.getElementById('filterCodigo').value.toLowerCase().trim();
  var desc = document.getElementById('filterDesc').value.toLowerCase().trim();

  productosFiltrados = productos.filter(function (p) {
    return (!cod  || p.code.toLowerCase().indexOf(cod)  !== -1) &&
           (!desc || p.desc.toLowerCase().indexOf(desc) !== -1);
  });

  renderInventario();
}

// =============================================================
// Carrito: agregar ítem
// =============================================================
function agregarAlCarrito(code) {
  var input = document.getElementById('qty-' + code);
  var qty   = Math.max(1, parseInt(input ? input.value : 1) || 1);
  var prod  = productos.find(function (p) { return p.code === code; });
  if (!prod) return;

  carrito[code] = Math.min(qty, prod.disp);
  actualizarCarritoBadge();
  renderInventario();
}

// =============================================================
// Carrito: quitar ítem
// =============================================================
function quitarDelCarrito(code) {
  delete carrito[code];
  actualizarCarritoBadge();
  renderInventario();
}

// =============================================================
// Actualizar barra flotante
// =============================================================
function actualizarCarritoBadge() {
  var total   = Object.keys(carrito).length;
  var bar     = document.getElementById('cartFloatBar');
  var countEl = document.getElementById('cartFloatCount');

  countEl.textContent = total + ' ítem' + (total !== 1 ? 's' : '') + ' seleccionado' + (total !== 1 ? 's' : '');

  if (total > 0) {
    bar.classList.add('visible');
  } else {
    bar.classList.remove('visible');
  }
}

// =============================================================
// Modal: abrir y renderizar
// =============================================================
function abrirConfirmModal() {
  var tbody = document.getElementById('modalCartTbody');
  tbody.innerHTML = '';

  Object.keys(carrito).forEach(function (code) {
    var prod = productos.find(function (p) { return p.code === code; });
    if (!prod) return;

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><code>' + code + '</code></td>' +
      '<td style="min-width: 160px;">' + prod.desc + '</td>' +
      '<td>' +
        '<span class="modal-qty-plain">' + carrito[code] + ' und</span>' +
      '</td>' +
      '<td>' +
        '<button class="file-item-remove" title="Quitar" onclick="quitarDelModalYCarrito(\'' + code + '\')">' +
          '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>' +
          '</svg>' +
        '</button>' +
      '</td>';
    tbody.appendChild(tr);
  });

  document.getElementById('confirmModal').classList.add('active');
}

// =============================================================
// Modal: cerrar
// =============================================================
function cerrarConfirmModal() {
  document.getElementById('confirmModal').classList.remove('active');
}

// =============================================================
// Modal: actualizar cantidad de un ítem
// =============================================================
function actualizarQtyModal(code, val) {
  var qty  = parseInt(val) || 1;
  var prod = productos.find(function (p) { return p.code === code; });
  if (!prod) return;
  carrito[code] = Math.max(1, Math.min(qty, prod.disp));
  actualizarCarritoBadge();
}

// =============================================================
// Modal: quitar ítem desde la tabla del modal
// =============================================================
function quitarDelModalYCarrito(code) {
  delete carrito[code];
  actualizarCarritoBadge();
  renderInventario();

  if (Object.keys(carrito).length === 0) {
    cerrarConfirmModal();
  } else {
    abrirConfirmModal();
  }
}

// =============================================================
// Confirmar pedido → vista éxito
// =============================================================
function confirmarPedido() {
  var codigos     = Object.keys(carrito);
  var totalItems  = codigos.length;
  var totalUnids  = codigos.reduce(function (sum, c) { return sum + (carrito[c] || 0); }, 0);

  // Generar código PED (simulado)
  var seq     = 127 + Math.floor(Math.random() * 5) + 1;
  var pedCode = 'PED-' + String(seq).padStart(6, '0');

  document.getElementById('exitoPedCode').textContent = pedCode;
  document.getElementById('exitoItems').textContent   =
    totalItems + ' producto' + (totalItems !== 1 ? 's' : '') + ' · ' + totalUnids + ' unidades';

  cerrarConfirmModal();
  document.getElementById('viewInventario').style.display = 'none';
  document.getElementById('viewExito').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Limpiar carrito
  carrito = {};
  actualizarCarritoBadge();
}

// =============================================================
// Nuevo pedido — regresar a inventario
// =============================================================
function nuevoPedido() {
  document.getElementById('viewExito').style.display = 'none';
  document.getElementById('viewInventario').style.display = '';
  document.getElementById('areaInput').value = '';
  // Limpiar filtros
  document.getElementById('filterCodigo').value = '';
  document.getElementById('filterDesc').value = '';
  filtrarInventario();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================
// Init
// =============================================================
renderInventario();
