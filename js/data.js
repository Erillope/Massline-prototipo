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
  { num: 1, codigo: 'ART-3010', desc: 'Tela algodón 100% orgánico (rollo)', unidad: 'Rollo', cantidad: 50, precio: '$18.500', subtotal: '$925.000' },
  { num: 2, codigo: 'ART-3011', desc: 'Tela poliéster reciclado (rollo)', unidad: 'Rollo', cantidad: 30, precio: '$14.200', subtotal: '$426.000' },
  { num: 3, codigo: 'ART-3012', desc: 'Hilo industrial blanco 5000m', unidad: 'Unidad', cantidad: 200, precio: '$3.400', subtotal: '$680.000' },
  { num: 4, codigo: 'ART-3013', desc: 'Cierre metálico 20cm surtido', unidad: 'Paquete', cantidad: 500, precio: '$850', subtotal: '$425.000' },
  { num: 5, codigo: 'ART-3014', desc: 'Botones madera natural 15mm', unidad: 'Bolsa (100u)', cantidad: 80, precio: '$2.100', subtotal: '$168.000' },
  { num: 6, codigo: 'ART-3015', desc: 'Elástico plano 3cm (rollo 50m)', unidad: 'Rollo', cantidad: 40, precio: '$5.600', subtotal: '$224.000' },
  { num: 7, codigo: 'ART-3016', desc: 'Etiqueta tejida marca personalizada', unidad: 'Millar', cantidad: 10, precio: '$12.000', subtotal: '$120.000' },
  { num: 8, codigo: 'ART-3017', desc: 'Papel tissue embalaje 50x70cm', unidad: 'Resma', cantidad: 25, precio: '$6.800', subtotal: '$170.000' }
];

/* Datos simulados de cajas por orden */
const orderBoxes = {
  'PO-2026-0455': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-001',qty:25},{code:'CAJA-002',qty:25}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-003',qty:15},{code:'CAJA-004',qty:15}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-005',qty:100},{code:'CAJA-006',qty:100}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-007',qty:250},{code:'CAJA-008',qty:250}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-009',qty:40}] },
  ],
  'PO-2026-0457': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-010',qty:30},{code:'CAJA-011',qty:20}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-012',qty:200}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-013',qty:80}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-014',qty:10}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-015',qty:25}] },
  ],
  'PO-2026-0453': [
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-016',qty:30}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-017',qty:300},{code:'CAJA-018',qty:200}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-019',qty:80}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-020',qty:25}] },
  ],
  'PO-2026-0452': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-021',qty:30},{code:'CAJA-022',qty:20}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-023',qty:120},{code:'CAJA-024',qty:80}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-025',qty:500}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-026',qty:80}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-027',qty:40}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-028',qty:25}] },
  ],
  'PO-2026-0449': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-029',qty:25},{code:'CAJA-030',qty:25}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-031',qty:15},{code:'CAJA-032',qty:15}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-033',qty:100},{code:'CAJA-034',qty:100}] },
    { producto: 'Etiqueta tejida marca personalizada', codigo: 'ART-3016', cajas: [{code:'CAJA-035',qty:10}] },
    { producto: 'Papel tissue embalaje 50x70cm', codigo: 'ART-3017', cajas: [{code:'CAJA-036',qty:25}] },
  ],
  'PO-2026-0456': [
    { producto: 'Tela algodón 100% orgánico (rollo)', codigo: 'ART-3010', cajas: [{code:'CAJA-037',qty:20},{code:'CAJA-038',qty:30}] },
    { producto: 'Tela poliéster reciclado (rollo)', codigo: 'ART-3011', cajas: [{code:'CAJA-039',qty:15},{code:'CAJA-040',qty:15}] },
    { producto: 'Hilo industrial blanco 5000m', codigo: 'ART-3012', cajas: [{code:'CAJA-041',qty:100},{code:'CAJA-042',qty:100}] },
    { producto: 'Cierre metálico 20cm surtido', codigo: 'ART-3013', cajas: [{code:'CAJA-043',qty:250},{code:'CAJA-044',qty:250}] },
    { producto: 'Botones madera natural 15mm', codigo: 'ART-3014', cajas: [{code:'CAJA-045',qty:80}] },
    { producto: 'Elástico plano 3cm (rollo 50m)', codigo: 'ART-3015', cajas: [{code:'CAJA-046',qty:40}] },
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