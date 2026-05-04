---
applyTo: "**/*.{ts,tsx}"
---

# Convenciones de código — TypeScript + React

## 1. Estructura del proyecto

Arquitectura **modular por feature**, organizada dentro de un proyecto Vite + React. La lógica de negocio vive en el backend; el frontend es responsable de presentación, comunicación HTTP y validación de formularios.

```
src/
├── modules/
│   └── {modulo}/                         # Un paquete por módulo (ej: orders, auth, inventory)
│       ├── api/                          # Llamadas HTTP con Axios — una función por endpoint
│       ├── components/                   # Componentes React del módulo
│       ├── hooks/                        # Custom hooks — conectan componentes con api/
│       ├── pages/                        # Páginas enrutables del módulo
│       ├── routes/                       # Definición de rutas del módulo (React Router)
│       ├── styles/                       # Archivos SCSS del módulo (.module.scss)
│       └── validators/                   # Esquemas de validación de formularios (Zod)
│
├── shared/                               # Código reutilizable entre módulos
│   ├── api/                              # Cliente Axios base + interceptores
│   ├── components/                       # Componentes genéricos (Button, Input, Modal, etc.)
│   ├── hooks/                            # Hooks genéricos (useDisclosure, useDebounce, etc.)
│   ├── styles/                           # Variables y mixins SCSS globales
│   └── types/                            # Tipos base compartidos (Pagination, AppError, etc.)
│
├── app/
│   ├── router/                           # Ensamblado de todas las rutas de módulos
│   └── App.tsx                           # Componente raíz
│
├── assets/                               # Imágenes, fuentes, íconos estáticos
└── main.tsx                              # Punto de entrada
```

### Regla principal de dependencia

> Los componentes **nunca** llaman a `api/` directamente — siempre a través de un `hook`.

```
components / pages
    └── llaman a → hooks/
                      └── llaman a → api/
                                        └── usa → shared/api/ (httpClient)
```

| Carpeta | Puede usar | No puede usar |
|---|---|---|
| `components/`, `pages/` | `hooks/`, `shared/components` | `api/` directamente |
| `hooks/` | `api/`, `validators/`, `shared/types` | Otros módulos directamente |
| `api/` | `shared/api/` (httpClient) | React, hooks |
| `validators/` | Zod, `shared/types` | React, Axios |

## 2. Nomenclatura

### Archivos y carpetas
- **kebab-case** para archivos y carpetas: `order-card.tsx`, `use-get-order.ts`, `order-api.ts`
- Excepción: componentes React en **PascalCase**: `OrderCard.tsx`, `OrdersPage.tsx`

### Tipos e interfaces
- **PascalCase**: `Order`, `CreateOrderForm`, `OrderFilters`
- Preferir `interface` para objetos extensibles; `type` para uniones y aliases
- No usar prefijo `I` (no `IOrder`)
- Sufijos por rol:
  - `Order`, `Product` → tipos que representan entidades del servidor
  - `CreateOrderForm`, `FilterOrdersForm` → datos de formularios (input del usuario)
  - `OrderCardProps`, `OrdersPageProps` → props de componentes

### Enums y union types
- **PascalCase** para el tipo; **UPPER_SNAKE_CASE** para valores de enum:
  ```ts
  enum OrderStatus { PENDING = 'PENDING', DELIVERED = 'DELIVERED' }
  // o bien:
  type OrderStatus = 'PENDING' | 'DELIVERED';
  ```

### Funciones y variables
- **camelCase**: `getOrder`, `createOrder`, `isLoading`, `hasError`
- Booleanos con prefijo `is`, `has`, `can`: `isLoading`, `hasAnomalies`, `canSubmit`
- Evitar abreviaciones: `orderCode` no `oc`, `response` no `res` salvo convención de Axios

### Constantes
- **UPPER_SNAKE_CASE** para constantes de módulo: `API_BASE_URL`, `DEFAULT_PAGE_SIZE`

### Componentes React
- **PascalCase**: `OrderCard`, `OrdersPage`, `ConfirmDialog`
- Props con sufijo explícito: `OrderCardProps`, `ConfirmDialogProps`

### Hooks
- Prefijo `use`: `useGetOrder`, `useCreateOrder`, `useDisclosure`

## 3. TypeScript

- Activar `strict: true` en `tsconfig.json`
- **Nunca usar `any`** — usar `unknown` cuando el tipo es indeterminado y luego hacer narrowing
- Preferir tipos explícitos en firmas de funciones públicas; inferencia en variables locales
- Evitar `as` (type assertion) salvo en adaptadores de infraestructura donde la forma del dato externo se conoce

## 4. Componentes React

- **Siempre componentes funcionales** — nunca clases
- Definir props con `interface` y tipar explícitamente:
  ```tsx
  interface OrderCardProps {
    order: Order;
    onSelect: (code: string) => void;
  }

  export function OrderCard({ order, onSelect }: OrderCardProps) { ... }
  ```
- Exportaciones nombradas (no `export default`) para componentes internos de módulo
- Exportación default solo en páginas (para lazy loading con React Router)
- Extraer lógica a custom hooks — un componente no debe tener más de ~50 líneas de lógica interna
- No hacer llamadas HTTP directamente desde un componente

### Patrón Container / Presentational

Cuando una página agrupa varios componentes que comparten datos, usar un **componente orquestador (container)**:

- El container tiene el hook, concentra todas las llamadas a `api/` y coordina el estado
- Los componentes hijos son **presentacionales**: reciben props y callbacks, no conocen la API
- La página simplemente renderiza el container

```
pages/OrdersPage.tsx          → renderiza <OrdersContainer />
components/OrdersContainer.tsx → usa useOrders(), coordina hijos
    ├── components/OrderFilters.tsx      → solo UI, recibe onFilter callback
    ├── components/OrderList.tsx         → solo renderiza la lista
    └── components/OrderPagination.tsx   → solo renderiza paginación
```

```tsx
// components/OrdersContainer.tsx  — orquestador
export function OrdersContainer() {
  const { orders, isLoading, error, filters, setFilters, page, setPage } = useOrders();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <>
      <OrderFilters filters={filters} onChange={setFilters} />
      <OrderList orders={orders} />
      <OrderPagination page={page} onPageChange={setPage} />
    </>
  );
}

// components/OrderList.tsx  — presentacional
interface OrderListProps {
  orders: Order[];
}

export function OrderList({ orders }: OrderListProps) {
  return (
    <ul>
      {orders.map((order) => <OrderCard key={order.code} order={order} />)}
    </ul>
  );
}
```

- Sufijo `Container` para los orquestadores: `OrdersContainer`, `OrderDetailContainer`
- Los componentes presentacionales **no tienen hooks de API** — solo `useState` local si es necesario para UI pura (ej: toggle de un acordeón)

## 5. Custom Hooks

- Un hook por responsabilidad
- Retornar un objeto con nombres explícitos (no una tupla salvo `[value, setter]` estándar):
  ```ts
  // ✅
  return { order, isLoading, error, refetch };

  // ❌ difícil de consumir
  return [order, isLoading, error, refetch];
  ```
- Manejar los tres estados siempre: carga, error y datos:
  ```ts
  export function useGetOrder(code: string) {
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AppError | null>(null);

    useEffect(() => {
      setIsLoading(true);
      orderApi.findByCode(code)
        .then(setOrder)
        .catch((err) => setError(err as AppError))
        .finally(() => setIsLoading(false));
    }, [code]);

    return { order, isLoading, error };
  }
  ```

## 6. Validadores (`validators/`)

- Usar **Zod** para definir esquemas de validación de formularios
- Un archivo por formulario: `createOrderValidator.ts`, `filterOrdersValidator.ts`
- Exportar el schema y el tipo inferido juntos:

```ts
// modules/orders/validators/createOrderValidator.ts
import { z } from 'zod';

export const createOrderSchema = z.object({
  supplierCode: z.string().min(1, 'El proveedor es obligatorio'),
  deliveryDate: z.string().min(1, 'La fecha de entrega es obligatoria'),
  items: z.array(
    z.object({
      productCode: z.string().min(1),
      quantity: z.number().int().positive('La cantidad debe ser mayor a 0'),
    })
  ).min(1, 'La orden debe tener al menos un ítem'),
});

export type CreateOrderForm = z.infer<typeof createOrderSchema>;
```

- Los validadores solo conocen Zod y `shared/types` — no importan hooks ni Axios

## 7. Capa HTTP (`api/`)

- Usa el cliente Axios configurado en `shared/api/`
- Cada función tipea la respuesta con los tipos del módulo
- Lanza `AppError` en lugar de dejar escapar errores de Axios (el interceptor global lo hace automáticamente)

```ts
// shared/api/httpClient.ts
import axios from 'axios';
import { toAppError } from '../types/AppError';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toAppError(error))
);

// modules/orders/api/orderApi.ts
import { httpClient } from '../../../shared/api/httpClient';
import type { Order } from '../types/Order';
import type { CreateOrderForm } from '../validators/createOrderValidator';

export const orderApi = {
  findByCode: async (code: string): Promise<Order> => {
    const { data } = await httpClient.get<Order>(`/orders/${code}`);
    return data;
  },

  create: async (form: CreateOrderForm): Promise<string> => {
    const { data } = await httpClient.post<string>('/orders', form);
    return data;
  },
};
```

## 8. Manejo de errores

- Clase base `AppError` en `shared/domain/`:
  ```ts
  // shared/domain/AppError.ts
  export class AppError extends Error {
    constructor(
      message: string,
      public readonly code: ErrorCode,
    ) {
      super(message);
      this.name = 'AppError';
    }
  }

  export type ErrorCode =
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'FORBIDDEN'
    | 'VALIDATION_ERROR'
    | 'NETWORK_ERROR'
    | 'UNKNOWN';
  ```
- Función `toAppError` en el interceptor de Axios para normalizar errores HTTP a `AppError`
- Los hooks exponen `error: AppError | null` — los componentes deciden cómo mostrarlo
- Nunca hacer `catch` y silenciar el error sin loggearlo o mostrarlo al usuario

## 9. Estilos (SCSS)

- Archivos SCSS por componente dentro de `{modulo}/styles/`: `OrderCard.module.scss`
- Usar **CSS Modules** (`.module.scss`) para estilos con scope local
- Variables y mixins globales en `shared/styles/`: `_variables.scss`, `_mixins.scss`, importados vía `@use`
- Nombres de clases en **kebab-case**: `.order-card`, `.status-badge`
- Evitar estilos inline en JSX salvo valores dinámicos imposibles de resolver en CSS

## 10. Estilo de código

- **Indentación**: 2 espacios
- **Longitud máxima de línea**: 100 caracteres
- **Comillas**: simples para strings en TS/TSX; dobles solo en JSX atributos
- Punto y coma al final de cada sentencia
- Ordenar imports: librerías externas → `shared` → feature local → estilos
- Usar `const` por defecto; `let` solo cuando la variable muta; nunca `var`

## 11. Configuración y variables de entorno

- Variables de entorno con prefijo `VITE_`: `VITE_API_BASE_URL`
- Acceder solo a través de `import.meta.env` — nunca `process.env`
- Tipar las variables en `src/vite-env.d.ts`:
  ```ts
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
  }
  ```
- Archivos `.env.development`, `.env.staging`, `.env.production` — nunca commitear `.env` con secretos
