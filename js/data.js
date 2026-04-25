/* ===== MassLine — Datos compartidos ===== */

/* === Anomalías predefinidas por orden (datos de demostración) === */
const orderAnomalies = {
  'NIR1-000055': [
    {
      item: 3,
      producto: 'CABLE DE EMBRAGUE',
      codigo: 'WUX-003',
      esperado: 60,
      recibido: 52,
      danados: 0,
      severity: 'moderada',
      desc: 'Se recibieron 52 unidades en lugar de las 60 solicitadas. Faltan 8 unidades según guía de despacho.'
    },
    {
      item: 5,
      producto: 'PASTILLAS DE FRENO',
      codigo: 'WUX-005',
      esperado: 100,
      recibido: 100,
      danados: 14,
      severity: 'grave',
      desc: '14 juegos presentan deformación visible en las pastillas. Producto no utilizable. Se registró evidencia fotográfica.',
      fotos: [
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fde68a" width="200" height="200"/><rect fill="%23f59e0b" x="30" y="60" width="140" height="80" rx="8"/><text x="100" y="108" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="14" font-weight="600">Foto 1 — Daño</text></svg>'),
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fee2e2" width="200" height="200"/><rect fill="%23ef4444" x="30" y="60" width="140" height="80" rx="8"/><text x="100" y="108" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="14" font-weight="600">Foto 2 — Daño</text></svg>'),
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fef3c7" width="200" height="200"/><rect fill="%23d97706" x="30" y="60" width="140" height="80" rx="8"/><text x="100" y="108" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="14" font-weight="600">Foto 3 — Daño</text></svg>')
      ]
    }
  ],
  'NIR1-000049': [
    {
      item: 2,
      producto: 'CABLE DE ACELERADOR',
      codigo: 'WUX-002',
      esperado: 70,
      recibido: 63,
      danados: 3,
      severity: 'grave',
      desc: '7 unidades faltantes y 3 cables con funda rota. Embalaje exterior dañado durante el transporte.',
      fotos: [
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fee2e2" width="200" height="200"/><rect fill="%23991b1b" x="20" y="55" width="160" height="90" rx="8"/><text x="100" y="105" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="13" font-weight="600">Funda rota</text></svg>'),
        'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="%23fef3c7" width="200" height="200"/><rect fill="%23b45309" x="20" y="55" width="160" height="90" rx="8"/><text x="100" y="105" text-anchor="middle" fill="%23fff" font-family="sans-serif" font-size="13" font-weight="600">Embalaje dañado</text></svg>')
      ]
    },
    {
      item: 7,
      producto: 'LLAVE DE PASO DE COMBUSTIBLE',
      codigo: 'WUX-007',
      esperado: 100,
      recibido: 100,
      danados: 0,
      severity: 'leve',
      desc: 'Llaves con leve oxidación en la rosca. Producto utilizable pero no cumple estándar de calidad óptimo.'
    },
    {
      item: 8,
      producto: 'PIÑON DE VELOCIMETRO',
      codigo: 'WUX-008',
      esperado: 110,
      recibido: 98,
      danados: 0,
      severity: 'moderada',
      desc: 'Se recibieron 98 unidades en lugar de 110. Proveedor indica que las 12 restantes serán enviadas en despacho complementario.'
    }
  ]
};

/* Productos base para la tabla de detalle */
const detailProducts = [
  { num: 1, codigo: 'WUX-001', desc: 'CABLE DE VELOCIMETRO - WUXI HUAHENG - CHINA', unidad: 'Unidad', cantidad: 150, precioUnitario: 8500 },
  { num: 2, codigo: 'WUX-002', desc: 'CABLE DE ACELERADOR - WUXI HUAHENG - CHINA', unidad: 'Unidad', cantidad: 70, precioUnitario: 8500 },
  { num: 3, codigo: 'WUX-003', desc: 'CABLE DE EMBRAGUE - WUXI HUAHENG - CHINA', unidad: 'Unidad', cantidad: 60, precioUnitario: 8500 },
  { num: 4, codigo: 'WUX-004', desc: 'DECORATIVO FRONTAL SUPERIOR - WUXI HUAHENG - CHINA', unidad: 'Unidad', cantidad: 30, precioUnitario: 15000 },
  { num: 5, codigo: 'WUX-005', desc: 'PASTILLAS DE FRENO - WUXI HUAHENG - CHINA', unidad: 'Unidad', cantidad: 100, precioUnitario: 12000 },
  { num: 6, codigo: 'WUX-006', desc: 'JUEGO DE RETENEDORES - WUXI HUAHENG - CHINA', unidad: 'Unidad', cantidad: 200, precioUnitario: 5500 },
  { num: 7, codigo: 'WUX-007', desc: 'LLAVE DE PASO DE COMBUSTIBLE - WUXI HUAHENG - CHINA', unidad: 'Unidad', cantidad: 100, precioUnitario: 7500 },
  { num: 8, codigo: 'WUX-008', desc: 'PIÑON DE VELOCIMETRO - WUXI HUAHENG - CHINA', unidad: 'Unidad', cantidad: 110, precioUnitario: 9500 }
];

/* Datos simulados de cajas por orden */
const orderBoxes = {
  'NIR1-000055': [
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-001',qty:75,size:'mediano'},{code:'CAJA-002',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-003',qty:35,size:'pequeño'},{code:'CAJA-004',qty:35,size:'pequeño'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-005',qty:30,size:'pequeño'},{code:'CAJA-006',qty:30,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-007',qty:15,size:'mediano'},{code:'CAJA-008',qty:15,size:'mediano'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-009',qty:50,size:'mediano'},{code:'CAJA-047',qty:50,size:'mediano'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-048',qty:100,size:'grande'},{code:'CAJA-049',qty:100,size:'grande'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-050',qty:50,size:'pequeño'},{code:'CAJA-051',qty:50,size:'pequeño'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-052',qty:55,size:'pequeño'},{code:'CAJA-053',qty:55,size:'pequeño'}] },
  ],
  'NIR1-000057': [
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-010',qty:75,size:'mediano'},{code:'CAJA-011',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-012',qty:35,size:'pequeño'},{code:'CAJA-054',qty:35,size:'pequeño'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-013',qty:50,size:'mediano'},{code:'CAJA-055',qty:50,size:'mediano'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-014',qty:100,size:'grande'},{code:'CAJA-056',qty:100,size:'grande'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-015',qty:50,size:'pequeño'},{code:'CAJA-057',qty:50,size:'pequeño'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-058',qty:30,size:'pequeño'},{code:'CAJA-059',qty:30,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-060',qty:15,size:'mediano'},{code:'CAJA-061',qty:15,size:'mediano'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-062',qty:55,size:'pequeño'},{code:'CAJA-063',qty:55,size:'pequeño'}] },
  ],
  'NIR1-000053': [
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-016',qty:35,size:'pequeño'},{code:'CAJA-017',qty:35,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-018',qty:15,size:'mediano'},{code:'CAJA-019',qty:15,size:'mediano'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-020',qty:50,size:'mediano'},{code:'CAJA-064',qty:50,size:'mediano'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-021',qty:55,size:'pequeño'},{code:'CAJA-022',qty:55,size:'pequeño'}] },
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-023',qty:75,size:'mediano'},{code:'CAJA-065',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-066',qty:30,size:'pequeño'},{code:'CAJA-067',qty:30,size:'pequeño'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-068',qty:100,size:'grande'},{code:'CAJA-069',qty:100,size:'grande'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-070',qty:50,size:'pequeño'},{code:'CAJA-071',qty:50,size:'pequeño'}] },
  ],
  'NIR1-000052': [
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-024',qty:75,size:'mediano'},{code:'CAJA-025',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-026',qty:30,size:'pequeño'},{code:'CAJA-027',qty:30,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-028',qty:30,size:'mediano'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-029',qty:50,size:'mediano'},{code:'CAJA-030',qty:50,size:'mediano'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-031',qty:100,size:'grande'},{code:'CAJA-072',qty:100,size:'grande'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-032',qty:55,size:'pequeño'},{code:'CAJA-033',qty:55,size:'pequeño'}] },
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-073',qty:35,size:'pequeño'},{code:'CAJA-074',qty:35,size:'pequeño'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-075',qty:50,size:'pequeño'},{code:'CAJA-076',qty:50,size:'pequeño'}] },
  ],
  'NIR1-000049': [
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-034',qty:75,size:'mediano'},{code:'CAJA-035',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-036',qty:33,size:'pequeño'},{code:'CAJA-037',qty:30,size:'pequeño'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-038',qty:30,size:'pequeño'},{code:'CAJA-039',qty:30,size:'pequeño'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-040',qty:50,size:'pequeño'},{code:'CAJA-077',qty:50,size:'pequeño'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-041',qty:49,size:'pequeño'},{code:'CAJA-042',qty:49,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-078',qty:15,size:'mediano'},{code:'CAJA-079',qty:15,size:'mediano'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-080',qty:50,size:'mediano'},{code:'CAJA-081',qty:50,size:'mediano'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-082',qty:100,size:'grande'},{code:'CAJA-083',qty:100,size:'grande'}] },
  ],
  'NIR1-000056': [
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-043',qty:75,size:'mediano'},{code:'CAJA-044',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-045',qty:35,size:'pequeño'},{code:'CAJA-046',qty:35,size:'pequeño'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-084',qty:30,size:'pequeño'},{code:'CAJA-085',qty:30,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-086',qty:15,size:'mediano'},{code:'CAJA-087',qty:15,size:'mediano'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-088',qty:50,size:'mediano'},{code:'CAJA-089',qty:50,size:'mediano'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-090',qty:100,size:'grande'},{code:'CAJA-091',qty:100,size:'grande'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-092',qty:50,size:'pequeño'},{code:'CAJA-093',qty:50,size:'pequeño'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-094',qty:55,size:'pequeño'},{code:'CAJA-095',qty:55,size:'pequeño'}] },
  ],
  'NIR1-000048': [
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-096',qty:75,size:'mediano'},{code:'CAJA-097',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-098',qty:70,size:'pequeño'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-099',qty:30,size:'pequeño'},{code:'CAJA-100',qty:30,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-101',qty:30,size:'mediano'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-102',qty:50,size:'mediano'},{code:'CAJA-103',qty:50,size:'mediano'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-104',qty:100,size:'grande'},{code:'CAJA-105',qty:100,size:'grande'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-106',qty:50,size:'pequeño'},{code:'CAJA-107',qty:50,size:'pequeño'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-108',qty:55,size:'pequeño'},{code:'CAJA-109',qty:55,size:'pequeño'}] },
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
  'NIR1-000060': { proveedor: 'WUXI HUAHENG INTERNATIONAL TRADE CORP.', fecha: '16/04/2026 08:45', status: 'en-bodega', label: 'En bodega', reviewer: '', reviewDate: '', confirmer: '', confirmDate: '', tipo: 'Externa' },
  'NIR1-000058': { proveedor: 'MOTORALMOR CIA. LTDA.', fecha: '14/04/2026 10:20', status: 'en-bodega', label: 'En bodega', reviewer: '', reviewDate: '', confirmer: '', confirmDate: '', tipo: 'Local' },
  'NIR1-000055': { proveedor: 'MOTORALMOR CIA. LTDA.', fecha: '11/04/2026 15:10', status: 'revisada-anomalia', label: 'Revisada', reviewer: 'Ana López', reviewDate: '12/04/2026 10:40', confirmer: '', confirmDate: '', tipo: 'Local' },
  'NIR1-000057': { proveedor: 'ECOLOGIA Y ENERGIA ECOENERGY CIA. LTDA', fecha: '13/04/2026 11:05', status: 'revisada', label: 'Revisada', reviewer: 'Carlos Méndez', reviewDate: '14/04/2026 09:30', confirmer: '', confirmDate: '', tipo: 'Local' },
  'NIR1-000053': { proveedor: 'WUXI HUAHENG INTERNATIONAL TRADE CORP.', fecha: '09/04/2026 09:50', status: 'revisada', label: 'Revisada', reviewer: 'Ana López', reviewDate: '10/04/2026 14:15', confirmer: '', confirmDate: '', tipo: 'Externa' },
  'NIR1-000056': { proveedor: 'WUXI HUAHENG INTERNATIONAL TRADE CORP.', fecha: '10/04/2026 16:20', status: 'por-almacenar', label: 'Por almacenar', reviewer: 'Carlos Méndez', reviewDate: '11/04/2026 09:00', confirmer: 'Carlos Méndez', confirmDate: '12/04/2026 10:30', tipo: 'Externa' },
  'NIR1-000052': { proveedor: 'WUXI HUAHENG INTERNATIONAL TRADE CORP.', fecha: '08/04/2026 14:30', status: 'almacenada', label: 'Almacenada', reviewer: 'Carlos Méndez', reviewDate: '09/04/2026 11:00', confirmer: 'Carlos Méndez', confirmDate: '10/04/2026 15:00', tipo: 'Externa' },
  'NIR1-000049': { proveedor: 'WUXI HUAHENG INTERNATIONAL TRADE CORP.', fecha: '05/04/2026 16:00', status: 'almacenada-anomalia', label: 'Almacenada', reviewer: 'Ana López', reviewDate: '06/04/2026 16:45', confirmer: 'Ana López', confirmDate: '07/04/2026 11:20', tipo: 'Externa' },
  'NIR1-000048': { proveedor: 'WUXI HUAHENG INTERNATIONAL TRADE CORP.', fecha: '03/04/2026 10:15', status: 'valorada', label: 'Valorada', reviewer: 'Carlos Méndez', reviewDate: '04/04/2026 09:30', confirmer: 'Carlos Méndez', confirmDate: '05/04/2026 14:00', tipo: 'Externa', valoracionCode: 'VAL-2026-0112' },
  'NIR1-000061': { proveedor: 'MOTORALMOR CIA. LTDA.', fecha: '16/04/2026 07:30', status: 'ingresada', label: 'Por llegar', reviewer: '', reviewDate: '', confirmer: '', confirmDate: '', tipo: 'Local' }
};

const orderHistory = {
  'NIR1-000061': [
    { type: 'ingreso', date: '16/04/2026 07:30', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' }
  ],
  'NIR1-000060': [
    { type: 'ingreso', date: '16/04/2026 08:45', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '17/04/2026 09:15', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' }
  ],
  'NIR1-000058': [
    { type: 'ingreso', date: '14/04/2026 10:20', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '15/04/2026 08:30', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' }
  ],
  'NIR1-000055': [
    { type: 'ingreso', date: '11/04/2026 15:10', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '12/04/2026 08:20', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '12/04/2026 10:40', user: 'Ana López', desc: 'Revisión completada. Se registraron 2 anomalías.' },
    { type: 'edicion-revision', date: '12/04/2026 11:00', user: 'Ana López', desc: 'Revisión editada por el usuario.' },
    { type: 'edicion-codigos', date: '12/04/2026 11:15', user: 'Ana López', desc: 'Códigos Massline actualizados en 5 productos.' }
  ],
  'NIR1-000057': [
    { type: 'ingreso', date: '13/04/2026 11:05', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '14/04/2026 08:00', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '14/04/2026 09:30', user: 'Carlos Méndez', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'edicion-revision', date: '14/04/2026 10:00', user: 'Carlos Méndez', desc: 'Revisión editada por el usuario.' },
    { type: 'edicion-codigos', date: '14/04/2026 10:30', user: 'Carlos Méndez', desc: 'Códigos Massline actualizados en 6 productos.' }
  ],
  'NIR1-000056': [
    { type: 'ingreso', date: '10/04/2026 16:20', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '11/04/2026 07:45', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '11/04/2026 09:00', user: 'Carlos Méndez', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'confirmacion', date: '12/04/2026 10:30', user: 'Carlos Méndez', desc: 'Confirmación de almacenamiento. Productos asignados a posiciones de bodega.' },
    { type: 'almacenada', date: '12/04/2026 14:00', user: 'Carlos Méndez', desc: 'Orden almacenada en bodega.' }
  ],
  'NIR1-000053': [
    { type: 'ingreso', date: '09/04/2026 09:50', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '10/04/2026 08:10', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '10/04/2026 14:15', user: 'Ana López', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'edicion-revision', date: '10/04/2026 16:00', user: 'Ana López', desc: 'Revisión editada por el usuario.' }
  ],
  'NIR1-000052': [
    { type: 'ingreso', date: '08/04/2026 14:30', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '09/04/2026 08:45', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '09/04/2026 11:00', user: 'Carlos Méndez', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'edicion-revision', date: '09/04/2026 11:30', user: 'Carlos Méndez', desc: 'Revisión editada por el usuario.' },
    { type: 'edicion-codigos', date: '09/04/2026 11:45', user: 'Carlos Méndez', desc: 'Códigos Massline actualizados en 3 productos.' },
    { type: 'confirmacion', date: '10/04/2026 14:30', user: 'Carlos Méndez', desc: 'Confirmación de almacenamiento. Productos asignados a posiciones de bodega.' },
    { type: 'almacenada', date: '10/04/2026 15:00', user: 'Carlos Méndez', desc: 'Orden almacenada en bodega.' }
  ],
  'NIR1-000049': [
    { type: 'ingreso', date: '05/04/2026 16:00', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '06/04/2026 08:30', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '06/04/2026 16:45', user: 'Ana López', desc: 'Revisión completada. Se registraron 3 anomalías.' },
    { type: 'edicion-revision', date: '06/04/2026 17:30', user: 'Ana López', desc: 'Revisión editada por el usuario.' },
    { type: 'edicion-codigos', date: '06/04/2026 18:00', user: 'Ana López', desc: 'Códigos Massline actualizados en 4 productos.' },
    { type: 'confirmacion', date: '07/04/2026 10:50', user: 'Ana López', desc: 'Confirmación de almacenamiento. Productos asignados a posiciones de bodega.' },
    { type: 'almacenada', date: '07/04/2026 11:20', user: 'Ana López', desc: 'Orden almacenada en bodega.' }
  ],
  'NIR1-000048': [
    { type: 'ingreso', date: '03/04/2026 10:15', user: 'Usuario Sistema', desc: 'Orden de compra ingresada al sistema.' },
    { type: 'llegada', date: '04/04/2026 08:00', user: 'Usuario Sistema', desc: 'Orden recibida en bodega.' },
    { type: 'revision', date: '04/04/2026 09:30', user: 'Carlos Méndez', desc: 'Revisión completada. Sin anomalías detectadas.' },
    { type: 'edicion-codigos', date: '04/04/2026 10:00', user: 'Carlos Méndez', desc: 'Códigos Massline actualizados en 4 productos.' },
    { type: 'confirmacion', date: '05/04/2026 13:30', user: 'Carlos Méndez', desc: 'Confirmación de almacenamiento. Productos asignados a posiciones de bodega.' },
    { type: 'almacenada', date: '05/04/2026 14:00', user: 'Carlos Méndez', desc: 'Orden almacenada en bodega.' },
    { type: 'valoracion', date: '06/04/2026 10:45', user: 'Carlos Méndez', desc: 'Orden valorada con código VAL-2026-0112.' }
  ]
};

/* Mapeo código artículo → código Massline (basado en ejemplos.json) */
const artToMassline = {
  'WUX-001': { code: 'R150-AR0509', desc: 'Cable de velocímetro' },
  'WUX-002': { code: 'R150-AR0507', desc: 'Cable de acelerador' },
  'WUX-003': { code: 'R150-AR0508', desc: 'Cable de embrague' },
  'WUX-004': { code: 'R180-XP1122', desc: 'Decorativo frontal superior' },
  'WUX-005': { code: 'R150-100837', desc: 'Pastillas de freno' },
  'WUX-006': { code: 'R180-XP0302', desc: 'Juego de retenedores' },
  'WUX-007': { code: 'R180-XP0903', desc: 'Llave de paso de combustible' },
  'WUX-008': { code: 'R180-XP0806', desc: 'Piñón de velocímetro' }
};

/* Autocomplete Massline catalog — todos los códigos de ejemplos.json */
const masslineCatalog = [
  { code: 'R150-AR0509', desc: 'Cable de velocímetro' },
  { code: 'R150-AR0507', desc: 'Cable de acelerador' },
  { code: 'R150-AR0508', desc: 'Cable de embrague' },
  { code: 'R180-XP1122', desc: 'Decorativo frontal superior' },
  { code: 'R150-100837', desc: 'Pastillas de freno' },
  { code: 'R180-XP0302', desc: 'Juego de retenedores' },
  { code: 'R180-XP0903', desc: 'Llave de paso de combustible' },
  { code: 'R180-XP0806', desc: 'Piñón de velocímetro' },
  { code: 'R180-XP1403', desc: 'Sensor de velocímetro' },
  { code: 'R180-XP1408', desc: 'Bobina de bujía' },
  { code: 'R180-XP1407', desc: 'CDI' },
  { code: 'R150-FR0520', desc: 'Base de faro' },
  { code: 'R150-FR0256NEG', desc: 'Manubrio izq./der. set negro' },
  { code: 'R150-FR0309', desc: 'Pito' },
  { code: 'R150-FR0238', desc: 'Kit de pistas del tren delantero' },
  { code: 'R150-FR0222', desc: 'Manija de freno s/base' },
  { code: 'R150-FR0234', desc: 'Kit de transmisión delantera' },
  { code: 'R150-AR0518', desc: 'Barra telescópica izq./der. set' },
  { code: 'R150-AR0605', desc: 'Amortiguador' },
  { code: 'R150-AR0308', desc: 'Arnés eléctrico' },
  { code: 'R150-AR0305', desc: 'Kit switch' },
  { code: 'R300-XT1703', desc: 'Kit de switch' },
];

// Versión anterior de anomalías (antes de edición de revisión)
const orderAnomaliesPrev = {
  'NIR1-000055': [
    {
      item: 3,
      producto: 'CABLE DE EMBRAGUE',
      codigo: 'WUX-003',
      esperado: 60,
      recibido: 52,
      danados: 0,
      severity: 'moderada',
      desc: 'Se recibieron 52 unidades en lugar de las 60 solicitadas. Faltan 8 unidades según guía de despacho.'
    }
  ],
  'NIR1-000049': [
    {
      item: 2,
      producto: 'CABLE DE ACELERADOR',
      codigo: 'WUX-002',
      esperado: 70,
      recibido: 63,
      danados: 0,
      severity: 'moderada',
      desc: 'Se recibieron 63 unidades en lugar de 70. Faltan 7 unidades según guía de despacho.'
    },
    {
      item: 5,
      producto: 'PASTILLAS DE FRENO',
      codigo: 'WUX-005',
      esperado: 100,
      recibido: 96,
      danados: 0,
      severity: 'leve',
      desc: 'Se recibieron 96 juegos en lugar de 100. Faltan 4 unidades según guía de despacho.'
    }
  ]
};

// Versión anterior de cajas (antes de edición de revisión)
const orderBoxesPrev = {
  'NIR1-000055': [
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-001',qty:75,size:'mediano'},{code:'CAJA-002',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-003',qty:35,size:'pequeño'},{code:'CAJA-004',qty:35,size:'pequeño'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-005',qty:35,size:'pequeño'},{code:'CAJA-006',qty:30,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-007',qty:15,size:'mediano'},{code:'CAJA-008',qty:15,size:'mediano'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-009',qty:55,size:'mediano'},{code:'CAJA-047',qty:55,size:'mediano'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-048',qty:100,size:'grande'},{code:'CAJA-049',qty:100,size:'grande'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-050',qty:50,size:'pequeño'},{code:'CAJA-051',qty:50,size:'pequeño'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-052',qty:55,size:'pequeño'},{code:'CAJA-053',qty:55,size:'pequeño'}] },
  ],
  'NIR1-000049': [
    { producto: 'CABLE DE VELOCIMETRO', codigo: 'WUX-001', cajas: [{code:'CAJA-034',qty:75,size:'mediano'},{code:'CAJA-035',qty:75,size:'mediano'}] },
    { producto: 'CABLE DE ACELERADOR', codigo: 'WUX-002', cajas: [{code:'CAJA-036',qty:38,size:'pequeño'},{code:'CAJA-037',qty:32,size:'pequeño'},{code:'CAJA-110',qty:5,size:'pequeño'}] },
    { producto: 'CABLE DE EMBRAGUE', codigo: 'WUX-003', cajas: [{code:'CAJA-038',qty:30,size:'pequeño'},{code:'CAJA-039',qty:30,size:'pequeño'}] },
    { producto: 'LLAVE DE PASO DE COMBUSTIBLE', codigo: 'WUX-007', cajas: [{code:'CAJA-040',qty:50,size:'pequeño'},{code:'CAJA-077',qty:50,size:'pequeño'}] },
    { producto: 'PIÑON DE VELOCIMETRO', codigo: 'WUX-008', cajas: [{code:'CAJA-041',qty:55,size:'pequeño'},{code:'CAJA-042',qty:55,size:'pequeño'}] },
    { producto: 'DECORATIVO FRONTAL SUPERIOR', codigo: 'WUX-004', cajas: [{code:'CAJA-078',qty:15,size:'mediano'},{code:'CAJA-079',qty:15,size:'mediano'}] },
    { producto: 'PASTILLAS DE FRENO', codigo: 'WUX-005', cajas: [{code:'CAJA-080',qty:55,size:'mediano'},{code:'CAJA-081',qty:55,size:'mediano'}] },
    { producto: 'JUEGO DE RETENEDORES', codigo: 'WUX-006', cajas: [{code:'CAJA-082',qty:100,size:'grande'},{code:'CAJA-083',qty:100,size:'grande'}] },
  ]
};

// Solicitudes de edición de emergencia pendientes de aprobación
const emergencyRequests = [
  {
    id: 'EE-001',
    code: 'NIR1-000060',
    proveedor: 'WUXI HUAHENG INTERNATIONAL TRADE CORP.',
    requestedBy: 'Carlos Méndez',
    requestedAt: '23/04/2026 10:32',
    motivo: 'El proveedor informó por correo que la guía de despacho refleja 140 unidades de Cable de velocímetro, no 150. Se adjunta corrección del documento de embarque. Además se agrega un ítem de arnés eléctrico que venía incluido en el mismo contenedor.',
    changes: [
      { campo: 'Cantidad — CABLE DE VELOCIMETRO (WUX-001)', antes: '150', despues: '140' },
      { campo: 'Nuevo ítem', antes: '—', despues: 'ARNES ELECTRICO (R150-AR0308) × 50', type: 'added' },
    ],
    status: 'pendiente'
  },
  {
    id: 'EE-002',
    code: 'NIR1-000058',
    proveedor: 'MOTORALMOR CIA. LTDA.',
    requestedBy: 'Ana López',
    requestedAt: '22/04/2026 16:15',
    motivo: 'Error de digitación al registrar la orden. La cantidad del ítem CILINDRO KIT CG D:69 250CC fue ingresada incorrectamente; la factura del proveedor indica 120 unidades.',
    changes: [
      { campo: 'Cantidad — CILINDRO KIT CG D:69 250CC H:113.30MM', antes: '145', despues: '120' },
    ],
    status: 'pendiente'
  }
];
const masslineCatalogPrev = [
  { code: 'R150-AR0509', desc: 'Cable de velocímetro' },
  { code: 'R150-AR0507', desc: 'Cable de acelerador' },
  { code: 'R150-AR9010', desc: 'Cable flexible tipo B' },
  { code: 'R180-XP1122', desc: 'Decorativo frontal superior' },
  { code: 'R180-XP9011', desc: 'Panel decorativo lateral' },
  { code: 'R180-XP0302', desc: 'Juego de retenedores' },
  { code: 'R180-XP9009', desc: 'Kit freno parcial' },
  { code: 'R180-XP0806', desc: 'Piñón de velocímetro' },
];
