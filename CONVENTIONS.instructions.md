---
applyTo: "**/*.java"
---

# Convenciones de código — Java + Spring Boot

## 1. Estructura del proyecto

Arquitectura **Hexagonal (Ports & Adapters)** con **DDD**, organizada en **módulos por paquete** dentro de un único artefacto Maven/Gradle. Cada módulo representa un Bounded Context y es autónomo. El dominio no tiene dependencias externas; la infraestructura depende del dominio, nunca al revés.

```
src/
├── main/
│   ├── java/com/empresa/proyecto/
│   │   │
│   │   ├── {modulo}/                        # Un paquete por Bounded Context (ej: orders, inventory, users)
│   │   │   ├── domain/                      # Núcleo — Java puro, sin dependencias externas
│   │   │   │   ├── model/                   # Entidades, Value Objects, Aggregates
│   │   │   │   ├── event/                   # Eventos de dominio publicados por este módulo
│   │   │   │   ├── port/
│   │   │   │   │   └── out/                 # Puertos de salida (repositorios, servicios externos — interfaces)
│   │   │   │   ├── service/                 # Domain Services (lógica que no pertenece a una entidad)
│   │   │   │   └── exception/               # Excepciones de dominio
│   │   │   │
│   │   │   ├── application/                 # Orquestación — define y cumple los puertos de entrada
│   │   │   │   ├── port/
│   │   │   │   │   └── in/                  # Puertos de entrada: interfaz + Command/Query + Result
│   │   │   │   ├── usecase/                 # Implementaciones de los puertos de entrada
│   │   │   │   └── handler/                 # Handlers de eventos publicados por otros módulos
│   │   │   │
│   │   │   └── infrastructure/              # Adaptadores — implementa los puertos de salida
│   │   │       ├── adapter/
│   │   │       │   ├── in/
│   │   │       │   │   └── web/             # Controladores REST
│   │   │       │   └── out/
│   │   │       │       ├── persistence/     # Repositorios JPA
│   │   │       │       └── messaging/       # Mensajería, eventos externos
│   │   │       └── config/                  # Configuraciones Spring del módulo
│   │   │
│   │   └── shared/                          # Código compartido entre módulos
│   │       ├── domain/                      # Value Objects reutilizables (Money, Pagination, AuditInfo)
│   │       ├── event/                       # Contrato base: DomainEvent, EventPublisher (interfaz)
│   │       └── infrastructure/              # Config. globales (Security, CORS, ExceptionHandler)
│   │                                        # + implementación en memoria de EventPublisher
│   │
│   └── resources/
│       ├── application.yml                  # Configuración principal (YAML, no .properties)
│       └── application-{env}.yml            # Perfiles por entorno (dev, staging, prod)
│
└── test/
    └── java/com/empresa/proyecto/           # Espejo de la estructura main
```

### Reglas de dependencia

| Capa | Puede depender de | No puede depender de |
|---|---|---|
| `{modulo}.domain` | `shared.domain` únicamente | Otros módulos, Spring, Jakarta, `application`, `infrastructure` |
| `{modulo}.application` | `{modulo}.domain`, `shared.domain`, Jakarta Validation | `infrastructure`, otros módulos directamente |
| `{modulo}.infrastructure` | `{modulo}.domain`, `{modulo}.application`, `shared` | Capas `domain`/`application` de **otros** módulos |
| `shared` | Java puro | Cualquier módulo de negocio |

> Un módulo se comunica con otro únicamente a través de sus **puertos de entrada** (`application/port/in`) o mediante **eventos de dominio**, nunca importando clases internas del otro módulo.

### Flujo de eventos entre módulos

- El evento se define en el módulo que lo **publica**: `orders/domain/event/OrderCreatedEvent.java`
- El handler se define en el módulo que lo **consume**: `inventory/application/handler/InventoryAllocationHandler.java`
- El módulo consumidor importa el evento del módulo publicador (única dependencia permitida entre módulos)
- `EventPublisher` es una interfaz en `shared/event/`; su implementación en memoria usa `ApplicationEventPublisher` de Spring

```java
// shared/event/DomainEvent.java
public abstract class DomainEvent {
    private final Instant occurredOn = Instant.now();
}

// shared/event/EventPublisher.java
public interface EventPublisher {
    void publish(DomainEvent event);
}

// orders/domain/event/OrderCreatedEvent.java
public class OrderCreatedEvent extends DomainEvent {
    private final String orderCode;
    public OrderCreatedEvent(String orderCode) { this.orderCode = orderCode; }
    public String getOrderCode() { return orderCode; }
}

// inventory/application/handler/InventoryAllocationHandler.java
@Component
public class InventoryAllocationHandler {

    @EventListener
    public void handle(OrderCreatedEvent event) {
        // reaccionar al evento del módulo orders
    }
}
```

## 2. Nomenclatura

### Clases
- **PascalCase** para todas las clases.
- Sufijos obligatorios según rol:
  - `Order`, `Product`, `OrderItem` → entidades de dominio (sin sufijo)
  - `OrderId`, `Money`, `Quantity` → Value Objects (sin sufijo)
  - `CreateOrderUseCase`, `FindOrderUseCase` → puertos de entrada (interfaces en `application/port/in`)
  - `OrderRepositoryPort`, `NotificationPort` → puertos de salida (interfaces en `domain/port/out`)
  - `CreateOrderCommand`, `UpdateOrderCommand` → input de comandos (en `application/port/in`, record con validaciones)
  - `FindOrderQuery`, `ListOrdersQuery` → input de consultas (en `application/port/in`, record)
  - `OrderResult`, `OrderSummaryResult` → output de casos de uso (en `application/port/in`, record Java puro, retornado directo al cliente)
  - `CreateOrderUseCaseImpl`, `FindOrderUseCaseImpl` → casos de uso (en `application/usecase`)
  - `OrderController` → adaptador REST de entrada (en `infrastructure/adapter/in/web`)
  - `OrderJpaRepository`, `OrderPersistenceAdapter` → adaptadores de persistencia (en `infrastructure/adapter/out/persistence`)
  - `OrderJpaEntity` → entidad JPA (distinta de la entidad de dominio)
  - `OrderNotFoundException`, `DuplicateOrderException` → excepciones de dominio (en `domain/exception`)
  - `OrderCreatedEvent`, `OrderStatusChangedEvent` → eventos de dominio (en `{modulo}/domain/event`)
  - `InventoryAllocationHandler`, `NotificationHandler` → handlers de eventos (en `{modulo}/application/handler`)
  - `EventPublisher` → interfaz del publicador de eventos (en `shared/event`)
  - `OrderMapper` → mappers entre capas (MapStruct)

### Métodos
- **camelCase**: `createOrder()`, `findOrderByCode()`, `updateOrderStatus()`
- Verbos para acciones: `create`, `update`, `delete`, `find`, `get`, `validate`, `send`
- Nombres descriptivos; evitar abreviaciones como `proc()`, `calc()`

### Variables y parámetros
- **camelCase**: `orderCode`, `totalAmount`, `isActive`
- Evitar nombres de una sola letra (salvo índices `i`, `j` en bucles simples)
- Booleanos con prefijo `is`, `has`, `can`: `isValid`, `hasAnomalies`

### Constantes
- **UPPER_SNAKE_CASE**: `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE`
- Declarar en la clase que las usa o en una clase `Constants` centralizada

### Paquetes
- **lowercase** sin guiones: `com.empresa.proyecto.service`, `com.empresa.proyecto.dto`

## 3. Estilo de código

- **Indentación**: 4 espacios (no tabulaciones)
- **Longitud máxima de línea**: 120 caracteres
- **Llaves**: estilo K&R (llave de apertura en la misma línea)
- Una clase por archivo
- Ordenar miembros: constantes → campos → constructores → métodos públicos → métodos privados

```java
// ✅ Correcto
public class OrderService {

    private static final int MAX_ITEMS = 100;

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public OrderResponseDto findByCode(String code) {
        return orderRepository.findByCode(code)
                .map(OrderMapper::toDto)
                .orElseThrow(() -> new OrderNotFoundException(code));
    }
}
```

## 4. Anotaciones Spring Boot

- Usar **inyección por constructor** (nunca `@Autowired` en campo)
- Anotar servicios con `@Service`, repositorios con `@Repository`, controladores con `@RestController`
- Usar `@RequiredArgsConstructor` de Lombok para simplificar constructores cuando aplique
- Configuraciones de beans en clases anotadas con `@Configuration`
- Preferir `@Value("${property}")` sobre hardcodear valores de configuración

```java
// ✅ Inyección por constructor
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
}

// ❌ Evitar
@Service
public class OrderServiceImpl {
    @Autowired
    private OrderRepository orderRepository;
}
```

## 5. Controladores REST

- Un controlador por entidad/recurso principal
- Anotar con `@RequestMapping("/api/v1/recurso")` a nivel de clase
- Usar los verbos HTTP correctamente:
  - `GET` → consultar (sin efectos secundarios)
  - `POST` → crear
  - `PUT` → reemplazar completo
  - `PATCH` → actualización parcial
  - `DELETE` → eliminar
- Retornar siempre `ResponseEntity<T>` con el código HTTP apropiado
- Usar `Command`/`Query` directamente como `@RequestBody` o parámetros (son clases de dominio, accesibles desde infraestructura)
- Validar entradas con `@Valid` sobre el `Command` o `Query`
- Retornar el `Result` de dominio directamente como cuerpo de la respuesta (sin capa extra de DTO)

```java
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final CreateOrderUseCase createOrderUseCase;
    private final FindOrderUseCase findOrderUseCase;

    // Comando: retorna solo el ID creado
    @PostMapping
    public ResponseEntity<String> createOrder(@Valid @RequestBody CreateOrderCommand command) {
        OrderId orderId = createOrderUseCase.execute(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderId.value());
    }

    // Query: retorna el Result de dominio directamente
    @GetMapping("/{code}")
    public ResponseEntity<OrderResult> getOrder(@PathVariable String code) {
        return ResponseEntity.ok(findOrderUseCase.execute(new FindOrderQuery(code)));
    }
}
```

## 6. Commands, Queries y Results

### Commands y Queries — definidos en `application/port/in/`

- Son `record` Java puro con anotaciones `jakarta.validation`
- Vivir en `application` permite usar Jakarta Validation sin contaminar el dominio
- No contienen lógica, solo datos de entrada

```java
// application/port/in/CreateOrderCommand.java
public record CreateOrderCommand(
    @NotBlank(message = "El código de proveedor es obligatorio")
    String supplierCode,

    @NotNull(message = "La fecha de entrega es obligatoria")
    LocalDate deliveryDate,

    @NotEmpty(message = "La orden debe tener al menos un ítem")
    List<OrderItemCommand> items
) {}

// application/port/in/FindOrderQuery.java
public record FindOrderQuery(String code) {}
```

### Results — definidos en `application/port/in/`

- Son `record` Java puro, sin anotaciones de frameworks
- Contienen solo los datos que el caso de uso decide exponer
- Se retornan directamente desde el controlador como cuerpo de la respuesta HTTP

```java
// application/port/in/OrderResult.java
public record OrderResult(
    String code,
    String supplierCode,
    LocalDate deliveryDate,
    String status,
    List<OrderItemResult> items
) {}
```

## 7. Manejo de excepciones

- Todas las excepciones de dominio extienden `ApplicationException` (en `shared/domain/exception/`)
- `ApplicationException` lleva un `ErrorCode` propio — **sin ninguna dependencia de Spring**
- `ErrorCode` es un enum puro en `shared/domain/` que clasifica el tipo de error semánticamente
- El handler (infraestructura) traduce `ErrorCode → HttpStatus` — el dominio nunca conoce `HttpStatus`
- Las excepciones exponen **factory methods estáticos** en vez de constructor público para mayor legibilidad: `throw OrderNotFoundException.forCode(code)`
- Retornar un DTO de error estándar (`ErrorResponseDto`) con: `timestamp`, `status`, `error`, `message`, `path`

```java
// shared/domain/exception/ErrorCode.java  (Java puro — sin dependencias)
public enum ErrorCode {
    NOT_FOUND,
    CONFLICT,
    FORBIDDEN,
    VALIDATION_ERROR,
    INTERNAL_ERROR
}

// shared/domain/exception/ApplicationException.java  (Java puro — sin dependencias)
public abstract class ApplicationException extends RuntimeException {

    private final ErrorCode errorCode;

    protected ApplicationException(String message, ErrorCode errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() { return errorCode; }
}

// orders/domain/exception/OrderNotFoundException.java
public class OrderNotFoundException extends ApplicationException {

    private OrderNotFoundException(String message) {
        super(message, ErrorCode.NOT_FOUND);
    }

    public static OrderNotFoundException forCode(String code) {
        return new OrderNotFoundException("Orden no encontrada: " + code);
    }
}

// orders/domain/exception/DuplicateOrderException.java
public class DuplicateOrderException extends ApplicationException {

    private DuplicateOrderException(String message) {
        super(message, ErrorCode.CONFLICT);
    }

    public static DuplicateOrderException forCode(String code) {
        return new DuplicateOrderException("La orden ya existe: " + code);
    }
}

// shared/infrastructure/GlobalExceptionHandler.java  (aquí sí puede conocer HttpStatus)
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Map<ErrorCode, HttpStatus> STATUS_MAP = Map.of(
        ErrorCode.NOT_FOUND,       HttpStatus.NOT_FOUND,
        ErrorCode.CONFLICT,        HttpStatus.CONFLICT,
        ErrorCode.FORBIDDEN,       HttpStatus.FORBIDDEN,
        ErrorCode.VALIDATION_ERROR, HttpStatus.UNPROCESSABLE_ENTITY,
        ErrorCode.INTERNAL_ERROR,  HttpStatus.INTERNAL_SERVER_ERROR
    );

    @ExceptionHandler(ApplicationException.class)
    public ResponseEntity<ErrorResponseDto> handleApplicationException(ApplicationException ex,
                                                                        HttpServletRequest request) {
        HttpStatus status = STATUS_MAP.getOrDefault(ex.getErrorCode(), HttpStatus.INTERNAL_SERVER_ERROR);
        ErrorResponseDto error = new ErrorResponseDto(
            LocalDateTime.now(),
            status.value(),
            status.getReasonPhrase(),
            ex.getMessage(),
            request.getRequestURI()
        );
        return ResponseEntity.status(status).body(error);
    }
}
```

## 8. Persistencia (JPA / Hibernate)

- Anotar entidades con `@Entity` y `@Table(name = "nombre_tabla")`
- Nombres de tablas y columnas en **snake_case**: `orden_compra`, `fecha_ingreso`
- Siempre definir `@Column` con nombre explícito
- Usar `@CreationTimestamp` y `@UpdateTimestamp` de Hibernate para auditoría
- Preferir `Optional<T>` en métodos de repositorio que pueden no encontrar resultado
- No usar `FetchType.EAGER` en relaciones `@OneToMany` / `@ManyToMany`

```java
@Entity
@Table(name = "orden_compra")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "fecha_ingreso", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private OrderStatus status;
}
```

## 9. Pruebas

Patrón de nomenclatura de métodos: `metodoProbado_escenario_resultadoEsperado()`

### Estrategia diferenciada por capa

| Qué se prueba | Herramienta | Cuándo |
|---|---|---|
| Entidades de dominio | JUnit 5 puro (sin mocks) | Siempre que la entidad tenga lógica |
| Casos de uso simples | — | No se testean por separado; el test de controlador los cubre |
| Casos de uso complejos | JUnit 5 + Mockito | Cuando hay más de una decisión de negocio o se llama a más de un puerto de salida |
| Controladores REST | `@SpringBootTest` + `@AutoConfigureMockMvc` | Siempre, un test por endpoint mínimo |

> Un caso de uso es **complejo** si tiene más de un `if`/decisión de negocio o coordina más de un puerto de salida. En ese caso merece su propio test con mocks de los puertos para verificar la orquestación de forma aislada.

---

### Entidades de dominio — JUnit 5 puro

```java
class OrderTest {

    @Test
    void confirmarLlegada_ordenPorLlegar_cambiaEstadoAEnBodega() {
        Order order = Order.create("NIR1-000058", "PROV-001", LocalDate.now().plusDays(7));

        order.confirmarLlegada();

        assertThat(order.getStatus()).isEqualTo(OrderStatus.EN_BODEGA);
    }

    @Test
    void confirmarLlegada_ordenYaEnBodega_lanzaExcepcion() {
        Order order = Order.create("NIR1-000058", "PROV-001", LocalDate.now().plusDays(7));
        order.confirmarLlegada();

        assertThatThrownBy(order::confirmarLlegada)
            .isInstanceOf(InvalidOrderStateException.class);
    }
}
```

---

### Casos de uso complejos — JUnit 5 + Mockito

```java
@ExtendWith(MockitoExtension.class)
class CreateOrderUseCaseImplTest {

    @Mock
    private OrderRepositoryPort orderRepository;

    @Mock
    private SupplierRepositoryPort supplierRepository;

    @Mock
    private EventPublisher eventPublisher;

    @InjectMocks
    private CreateOrderUseCaseImpl useCase;

    @Test
    void execute_proveedorActivoOrdenNueva_creaYPublicaEvento() {
        // Arrange
        var command = new CreateOrderCommand("PROV-001", LocalDate.now().plusDays(7), List.of(...));
        when(supplierRepository.findByCode("PROV-001"))
            .thenReturn(Optional.of(Supplier.active("PROV-001")));
        when(orderRepository.existsByCode(any())).thenReturn(false);

        // Act
        useCase.execute(command);

        // Assert
        verify(orderRepository).save(any(Order.class));
        verify(eventPublisher).publish(any(OrderCreatedEvent.class));
    }

    @Test
    void execute_proveedorInactivo_lanzaExcepcion() {
        var command = new CreateOrderCommand("PROV-999", LocalDate.now().plusDays(7), List.of(...));
        when(supplierRepository.findByCode("PROV-999"))
            .thenReturn(Optional.of(Supplier.inactive("PROV-999")));

        assertThatThrownBy(() -> useCase.execute(command))
            .isInstanceOf(InactiveSupplierException.class);

        verifyNoInteractions(orderRepository);
        verifyNoInteractions(eventPublisher);
    }
}
```

---

### Controladores REST — `@SpringBootTest`

```java
@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getOrder_codigoExistente_retorna200ConResult() throws Exception {
        mockMvc.perform(get("/api/v1/orders/NIR1-000058"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("NIR1-000058"));
    }

    @Test
    void getOrder_codigoInexistente_retorna404() throws Exception {
        mockMvc.perform(get("/api/v1/orders/INVALIDO"))
            .andExpect(status().isNotFound());
    }

    @Test
    void createOrder_commandValido_retorna201() throws Exception {
        String body = """
            {
              "supplierCode": "PROV-001",
              "deliveryDate": "2026-06-01",
              "items": [{ "productCode": "MOT-001", "quantity": 10 }]
            }
            """;

        mockMvc.perform(post("/api/v1/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated());
    }
}
```

## 10. Seguridad

- Nunca loggear contraseñas, tokens ni datos sensibles
- Usar `@PreAuthorize` para control de acceso a nivel de método
- Almacenar secretos en variables de entorno o en Spring Cloud Config (nunca en el código fuente)
- Validar y sanear toda entrada del usuario antes de procesarla
- Usar HTTPS en todos los entornos (producción obligatorio)

## 11. Logging

- Usar **SLF4J** con Logback (ya incluido en Spring Boot)
- Declarar el logger como campo estático final:
  ```java
  private static final Logger log = LoggerFactory.getLogger(OrderService.class);
  ```
  O usar `@Slf4j` de Lombok
- Niveles:
  - `DEBUG` → flujo interno, valores de variables durante desarrollo
  - `INFO` → eventos de negocio relevantes (orden creada, estado cambiado)
  - `WARN` → situaciones recuperables o inesperadas
  - `ERROR` → errores que requieren atención, siempre con el stack trace

```java
log.info("Orden creada exitosamente: {}", order.getCode());
log.error("Error al procesar orden {}: {}", code, ex.getMessage(), ex);
```

## 12. Configuración (`application.yml`)

- Usar YAML en lugar de `.properties`
- Separar configuración por perfiles: `dev`, `staging`, `prod`
- Agrupar propiedades bajo namespaces lógicos:

```yaml
spring:
  application:
    name: nombre-del-proyecto
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

app:
  orders:
    max-items-per-order: 100
    default-page-size: 20
```
