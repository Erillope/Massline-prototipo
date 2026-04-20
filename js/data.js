/* ===== MassLine — Datos compartidos ===== */

/* === Anomalías predefinidas por orden (datos de demostración) === */
const orderAnomalies = {
  'PO-2026-0455': [
    {
      item: 3,
      producto: 'Hilo industrial blanco 5000m',
      codigo: 'ART-3012',
      esperado: 200,
      recibido: 180,
      danados: 0,
      severity: 'moderada',
      desc: 'Se recibieron 180 unidades en lugar de las 200 solicitadas. Faltan 20 unidades según guía de despacho.'
    },
    {
      item: 5,
      producto: 'Elástico plano 3cm (rollo 50m)',
      codigo: 'ART-3014',
      esperado: 80,
      recibido: 80,
      danados: 5,
      severity: 'grave',
      desc: '5 bolsas presentan humedad y moho visible. Producto no utilizable. Se registró evidencia fotográfica.',
      fotos: [
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fde68a" width="200" height="200"/><rect fill="%23f59e0b" x="30" y="60" width="140" height="80" rx="8"/><text x="100" y="108" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="14" font-weight="600">Foto 1 — Daño</text></svg>'),
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fee2e2" width="200" height="200"/><rect fill="%23ef4444" x="30" y="60" width="140" height="80" rx="8"/><text x="100" y="108" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="14" font-weight="600">Foto 2 — Daño</text></svg>'),
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fef3c7" width="200" height="200"/><rect fill="%23d97706" x="30" y="60" width="140" height="80" rx="8"/><text x="100" y="108" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="14" font-weight="600">Foto 3 — Daño</text></svg>')
      ]
    }
  ],
  'PO-2026-0449': [
    {
      item: 2,
      producto: 'Tela poliéster reciclado (rollo)',
      codigo: 'ART-3011',
      esperado: 30,
      recibido: 27,
      danados: 2,
      severity: 'grave',
      desc: '3 rollos faltantes y 2 rollos con manchas de aceite. Embalaje exterior dañado durante el transporte.',
      fotos: [
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fee2e2" width="200" height="200"/><rect fill="%23991b1b" x="20" y="55" width="160" height="90" rx="8"/><text x="100" y="105" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="13" font-weight="600">Manchas aceite</text></svg>'),
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fef3c7" width="200" height="200"/><rect fill="%23b45309" x="20" y="55" width="160" height="90" rx="8"/><text x="100" y="105" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="13" font-weight="600">Embalaje dañado</text></svg>')
      ]
    },
    {
      item: 7,
      producto: 'Etiqueta tejida marca personalizada',
      codigo: 'ART-3016',
      esperado: 10,
      recibido: 10,
      danados: 0,
      severity: 'leve',
      desc: 'Etiquetas con leve decoloración en los bordes. Producto utilizable pero no cumple estándar de calidad óptimo.'
    },
    {
      item: 8,
      producto: 'Papel tissue embalaje 50x70cm',
      codigo: 'ART-3017',
      esperado: 25,
      recibido: 20,
      danados: 0,
      severity: 'moderada',
      desc: 'Se recibieron 20 resmas en lugar de 25. Proveedor indica que las 5 restantes serán enviadas en despacho complementario.'
    }
  ]
};

/* Productos base para la tabla de detalle */
const detailProducts = [
  { num: 1, codigo: 'ART-3010', desc: 'Tela algodón 100% orgánico (rollo)', unidad: 'Rollo', cantidad: 50 },
  { num: 2, codigo: 'ART-3011', desc: 'Tela poliéster reciclado (rollo)', unidad: 'Rollo', cantidad: 30 },
  { num: 3, codigo: 'ART-3012', desc: 'Hilo industrial blanco 5000m', unidad: 'Unidad', cantidad: 200 },
  { num: 4, codigo: 'ART-3013', desc: 'Cierre metálico 20cm surtido', unidad: 'Paquete', cantidad: 500 },
  { num: 5, codigo: 'ART-3014', desc: 'Botones madera natural 15mm', unidad: 'Bolsa (100u)', cantidad: 80 },
  { num: 6, codigo: 'ART-3015', desc: 'Elástico plano 3cm (rollo 50m)', unidad: 'Rollo', cantidad: 40 },
  { num: 7, codigo: 'ART-3016', desc: 'Etiqueta tejida marca personalizada', unidad: 'Millar', cantidad: 10 },
  { num: 8, codigo: 'ART-3017', desc: 'Papel tissue embalaje 50x70cm', unidad: 'Resma', cantidad: 25 }
];

/* Datos simulados de cajas por orden */
const orderBoxes = {
  'PO-2026-0455': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-001',qty:25,size:'grande'},{code:'CAJA-002',qty:25,size:'grande'}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-003',qty:15,size:'mediano'},{code:'CAJA-004',qty:15,size:'mediano'}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-005',qty:100,size:'grande'},{code:'CAJA-006',qty:100,size:'grande'}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-007',qty:250,size:'grande'},{code:'CAJA-008',qty:250,size:'grande'}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-009',qty:40,size:'mediano'}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-047',qty:80,size:'mediano'}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-048',qty:10,size:'pequeño'}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-049',qty:25,size:'pequeño'}] },
  ],
  'PO-2026-0457': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-010',qty:30,size:'grande'},{code:'CAJA-011',qty:20,size:'mediano'}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-012',qty:200,size:'grande'}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-013',qty:80,size:'mediano'}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-014',qty:10,size:'pequeño'}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-015',qty:25,size:'pequeño'}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-050',qty:15,size:'mediano'},{code:'CAJA-051',qty:15,size:'mediano'}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-052',qty:250,size:'grande'},{code:'CAJA-053',qty:250,size:'grande'}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-054',qty:40,size:'mediano'}] },
  ],
  'PO-2026-0453': [
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-016',qty:30,size:'grande'}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-017',qty:300,size:'grande'},{code:'CAJA-018',qty:200,size:'grande'}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-019',qty:80,size:'mediano'}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-020',qty:25,size:'pequeño'}] },
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-055',qty:25,size:'grande'},{code:'CAJA-056',qty:25,size:'mediano'}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-057',qty:100,size:'grande'},{code:'CAJA-058',qty:100,size:'grande'}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-059',qty:40,size:'mediano'}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-060',qty:10,size:'pequeño'}] },
  ],
  'PO-2026-0452': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-021',qty:30,size:'grande'},{code:'CAJA-022',qty:20,size:'mediano'}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-023',qty:120,size:'grande'},{code:'CAJA-024',qty:80,size:'grande'}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-025',qty:500,size:'grande'}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-026',qty:80,size:'mediano'}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-027',qty:40,size:'mediano'}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-028',qty:25,size:'pequeño'}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-061',qty:15,size:'mediano'},{code:'CAJA-062',qty:15,size:'mediano'}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-063',qty:10,size:'pequeño'}] },
  ],
  'PO-2026-0449': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-029',qty:25,size:'grande'},{code:'CAJA-030',qty:25,size:'grande'}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-031',qty:15,size:'mediano'},{code:'CAJA-032',qty:15,size:'mediano'}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-033',qty:100,size:'grande'},{code:'CAJA-034',qty:100,size:'grande'}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-035',qty:10,size:'pequeño'}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-036',qty:25,size:'pequeño'}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-064',qty:250,size:'grande'},{code:'CAJA-065',qty:250,size:'grande'}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-066',qty:80,size:'mediano'}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-067',qty:40,size:'mediano'}] },
  ],
  'PO-2026-0456': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-037',qty:20,size:'mediano'},{code:'CAJA-038',qty:30,size:'grande'}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-039',qty:15,size:'mediano'},{code:'CAJA-040',qty:15,size:'mediano'}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-041',qty:100,size:'grande'},{code:'CAJA-042',qty:100,size:'grande'}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-043',qty:250,size:'grande'},{code:'CAJA-044',qty:250,size:'grande'}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-045',qty:80,size:'mediano'}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-046',qty:40,size:'mediano'}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-068',qty:10,size:'pequeño'}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-069',qty:25,size:'pequeño'}] },
  ]
};

/* Posiciones de bodega simuladas */
const warehousePositions = [
  'A-01-01','A-01-02','A-01-03','A-02-01','A-02-02','A-03-01',
  'B-01-01','B-01-02','B-02-01','B-02-02','B-03-01','B-03-02',
  'C-01-01','C-01-02','C-02-01','C-02-02','C-03-01','C-03-02',
  'D-01-01','D-01-02','D-02-01','D-02-02','D-03-01','D-03-02'
];

function getRecommendedPosition(boxCode) {
  const num = parseInt(boxCode.replace('CAJA-',''));
  return warehousePositions[(num - 1) % warehousePositions.length];
}

/* Default recipients for anomaly report */
const defaultRecipients = [
  { email: 'jefe.bodega@massline.cl', removable: false },
  { email: 'compras@massline.cl', removable: false },
  { email: 'calidad@massline.cl', removable: false }
];

/* Catálogo de órdenes (fallback cuando URL params están incompletos) */
const orderCatalog = {
  'PO-2026-0460': { proveedor: 'Textiles Oriente SpA', fecha: '16/04/2026 08:45', status: 'en-bodega', label: 'En bodega', reviewer: '', reviewDate: '', confirmer: '', confirmDate: '', tipo: 'Externa' },
  'PO-2026-0458': { proveedor: 'Logística Global Ltda.', fecha: '14/04/2026 10:20', status: 'en-bodega', label: 'En bodega', reviewer: '', reviewDate: '', confirmer: '', confirmDate: '', tipo: 'Local' },
  'PO-2026-0455': { proveedor: 'Importadora Andina S.A.', fecha: '11/04/2026 15:10', status: 'revisada-anomalia', label: 'Revisada', reviewer: 'Ana López', reviewDate: '12/04/2026 10:40', confirmer: '', confirmDate: '', tipo: 'Local' },
  'PO-2026-0457': { proveedor: 'Distribuidora ABC Ltda.', fecha: '13/04/2026 11:05', status: 'revisada', label: 'Revisada', reviewer: 'Carlos Méndez', reviewDate: '14/04/2026 09:30', confirmer: '', confirmDate: '', tipo: 'Local' },
  'PO-2026-0453': { proveedor: 'Textiles Oriente SpA', fecha: '09/04/2026 09:50', status: 'revisada', label: 'Revisada', reviewer: 'Ana López', reviewDate: '10/04/2026 14:15', confirmer: '', confirmDate: '', tipo: 'Externa' },
  'PO-2026-0456': { proveedor: 'Textiles Oriente SpA', fecha: '10/04/2026 16:20', status: 'por-almacenar', label: 'Por almacenar', reviewer: 'Carlos Méndez', reviewDate: '11/04/2026 09:00', confirmer: 'Carlos Méndez', confirmDate: '12/04/2026 10:30', tipo: 'Externa' },
  'PO-2026-0452': { proveedor: 'Importadora Andina S.A.', fecha: '08/04/2026 14:30', status: 'almacenada', label: 'Almacenada', reviewer: 'Carlos Méndez', reviewDate: '09/04/2026 11:00', confirmer: 'Carlos Méndez', confirmDate: '10/04/2026 15:00', tipo: 'Externa' },
  'PO-2026-0449': { proveedor: 'Logística Global Ltda.', fecha: '05/04/2026 16:00', status: 'almacenada-anomalia', label: 'Almacenada', reviewer: 'Ana López', reviewDate: '06/04/2026 16:45', confirmer: 'Ana López', confirmDate: '07/04/2026 11:20', tipo: 'Local' },
  'PO-2026-0461': { proveedor: 'Distribuidora ABC Ltda.', fecha: '16/04/2026 07:30', status: 'ingresada', label: 'Por llegar', reviewer: '', reviewDate: '', confirmer: '', confirmDate: '', tipo: 'Local' }
};

const orderHistory = {
  'PO-2026-0461': [
    { type: 'ingreso', date: '16/04/2026 07:30', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' }
  ],
  'PO-2026-0460': [
    { type: 'ingreso', date: '16/04/2026 08:45', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '17/04/2026 09:15', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' }
  ],
  'PO-2026-0458': [
    { type: 'ingreso', date: '14/04/2026 10:20', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '15/04/2026 08:30', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' }
  ],
  'PO-2026-0455': [
    { type: 'ingreso', date: '11/04/2026 15:10', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '12/04/2026 08:20', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '12/04/2026 10:40', user: 'Ana López', desc: 'Revisión completada. Se registraron 2 anomalías.' },
    { type: 'edicion-revision', date: '12/04/2026 11:00', user: 'Ana López', desc: 'Revisión editada por el usuario.' },
    { type: 'edicion-codigos', date: '12/04/2026 11:15', user: 'Ana López', desc: 'Códigos Massline actualizados en 5 productos.' }
  ],
  'PO-2026-0457': [
    { type: 'ingreso', date: '13/04/2026 11:05', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '14/04/2026 08:00', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '14/04/2026 09:30', user: 'Carlos Méndez', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'edicion-revision', date: '14/04/2026 10:00', user: 'Carlos Méndez', desc: 'Revisión editada por el usuario.' },
    { type: 'edicion-codigos', date: '14/04/2026 10:30', user: 'Carlos Méndez', desc: 'Códigos Massline actualizados en 6 productos.' }
  ],
  'PO-2026-0456': [
    { type: 'ingreso', date: '10/04/2026 16:20', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '11/04/2026 07:45', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '11/04/2026 09:00', user: 'Carlos Méndez', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'confirmacion', date: '12/04/2026 10:30', user: 'Carlos Méndez', desc: 'Confirmación de almacenamiento. Productos asignados a posiciones de bodega.' },
    { type: 'almacenada', date: '12/04/2026 14:00', user: 'Carlos Méndez', desc: 'Orden almacenada en bodega.' }
  ],
  'PO-2026-0453': [
    { type: 'ingreso', date: '09/04/2026 09:50', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '10/04/2026 08:10', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '10/04/2026 14:15', user: 'Ana López', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'edicion-revision', date: '10/04/2026 16:00', user: 'Ana López', desc: 'Revisión editada por el usuario.' }
  ],
  'PO-2026-0452': [
    { type: 'ingreso', date: '08/04/2026 14:30', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '09/04/2026 08:45', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '09/04/2026 11:00', user: 'Carlos Méndez', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'edicion-revision', date: '09/04/2026 11:30', user: 'Carlos Méndez', desc: 'Revisión editada por el usuario.' },
    { type: 'edicion-codigos', date: '09/04/2026 11:45', user: 'Carlos Méndez', desc: 'Códigos Massline actualizados en 3 productos.' },
    { type: 'confirmacion', date: '10/04/2026 14:30', user: 'Carlos Méndez', desc: 'Confirmación de almacenamiento. Productos asignados a posiciones de bodega.' },
    { type: 'almacenada', date: '10/04/2026 15:00', user: 'Carlos Méndez', desc: 'Orden almacenada en bodega.' }
  ],
  'PO-2026-0449': [
    { type: 'ingreso', date: '05/04/2026 16:00', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '06/04/2026 08:30', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '06/04/2026 16:45', user: 'Ana López', desc: 'Revisión completada. Se registraron 3 anomalías.' },
    { type: 'edicion-revision', date: '06/04/2026 17:30', user: 'Ana López', desc: 'Revisión editada por el usuario.' },
    { type: 'edicion-codigos', date: '06/04/2026 18:00', user: 'Ana López', desc: 'Códigos Massline actualizados en 4 productos.' },
    { type: 'confirmacion', date: '07/04/2026 10:50', user: 'Ana López', desc: 'Confirmación de almacenamiento. Productos asignados a posiciones de bodega.' },
    { type: 'almacenada', date: '07/04/2026 11:20', user: 'Ana López', desc: 'Orden almacenada en bodega.' }
  ]
};

/* Mapeo código artículo → código Massline */
const artToMassline = {
  'ART-3010': { code: 'ML-3010', desc: 'Tela algodón orgánico' },
  'ART-3011': { code: 'ML-3011', desc: 'Tela poliéster reciclado' },
  'ART-3012': { code: 'ML-3012', desc: 'Hilo industrial blanco' },
  'ART-3013': { code: 'ML-3013', desc: 'Cierre metálico surtido' },
  'ART-3014': { code: 'ML-3014', desc: 'Botones madera natural' },
  'ART-3015': { code: 'ML-3015', desc: 'Elástico plano 3cm' },
  'ART-3016': { code: 'ML-3016', desc: 'Etiqueta tejida marca' },
  'ART-3017': { code: 'ML-3017', desc: 'Papel tissue embalaje' }
};

/* Autocomplete Massline catalog */
const masslineCatalog = [
  { code: 'ML-5001', desc: 'Camiseta orgánica básica' },
  { code: 'ML-5002', desc: 'Pantalón denim slim' },
  { code: 'ML-5003', desc: 'Chaqueta cortaviento' },
  { code: 'ML-5004', desc: 'Zapatillas running' },
  { code: 'ML-5005', desc: 'Bufanda lana merino' },
  { code: 'ML-5006', desc: 'Polo manga corta' },
  { code: 'ML-5007', desc: 'Bermuda cargo' },
  { code: 'ML-5008', desc: 'Gorro lana tejido' },
];

// Versión anterior de anomalías (antes de edición de revisión)
const orderAnomaliesPrev = {
  'PO-2026-0455': [
    {
      item: 3,
      producto: 'Hilo industrial blanco 5000m',
      codigo: 'ART-3012',
      esperado: 200,
      recibido: 180,
      danados: 0,
      severity: 'moderada',
      desc: 'Se recibieron 180 unidades en lugar de las 200 solicitadas. Faltan 20 unidades según guía de despacho.'
    }
  ],
  'PO-2026-0449': [
    {
      item: 2,
      producto: 'Tela poliéster reciclado (rollo)',
      codigo: 'ART-3011',
      esperado: 30,
      recibido: 28,
      danados: 0,
      severity: 'moderada',
      desc: 'Se recibieron 28 rollos en lugar de 30. Faltan 2 unidades según guía de despacho.'
    },
    {
      item: 4,
      producto: 'Cierre metálico 20cm surtido',
      codigo: 'ART-3013',
      esperado: 500,
      recibido: 490,
      danados: 0,
      severity: 'leve',
      desc: 'Se recibieron 490 paquetes en lugar de 500. Faltan 10 paquetes según guía de despacho.'
    }
  ]
};

// Versión anterior de cajas (antes de edición de revisión)
const orderBoxesPrev = {
  'PO-2026-0455': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-001',qty:25,size:'grande'},{code:'CAJA-002',qty:25,size:'grande'}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-003',qty:15,size:'mediano'},{code:'CAJA-004',qty:15,size:'mediano'}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-005',qty:120,size:'grande'},{code:'CAJA-006',qty:100,size:'grande'}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-007',qty:250,size:'grande'},{code:'CAJA-008',qty:250,size:'grande'}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-009',qty:45,size:'mediano'}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-047',qty:100,size:'mediano'}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-048',qty:10,size:'pequeño'}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-049',qty:25,size:'pequeño'}] },
  ],
  'PO-2026-0449': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-029',qty:25,size:'grande'},{code:'CAJA-030',qty:25,size:'grande'}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-031',qty:18,size:'mediano'},{code:'CAJA-032',qty:12,size:'pequeño'},{code:'CAJA-070',qty:5,size:'pequeño'}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-033',qty:100,size:'grande'},{code:'CAJA-034',qty:100,size:'grande'}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-035',qty:10,size:'pequeño'}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-036',qty:20,size:'pequeño'}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-064',qty:250,size:'grande'},{code:'CAJA-065',qty:250,size:'grande'}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-066',qty:75,size:'mediano'}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-067',qty:35,size:'mediano'}] },
  ]
};

// Version anterior de códigos ML (antes de edición)
const masslineCatalogPrev = [
  { code: 'ML-5001', desc: 'Camiseta orgánica básica' },
  { code: 'ML-5002', desc: 'Pantalón denim slim' },
  { code: 'ML-5010', desc: 'Chaleco acolchado' },
  { code: 'ML-5004', desc: 'Zapatillas running' },
  { code: 'ML-5011', desc: 'Pañuelo seda estampado' },
  { code: 'ML-5006', desc: 'Polo manga corta' },
  { code: 'ML-5009', desc: 'Short deportivo' },
  { code: 'ML-5008', desc: 'Gorro lana tejido' },
];