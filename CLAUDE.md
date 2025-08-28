# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CRITICAL RULES - NEVER VIOLATE THESE

### NEVER UPDATE ALGOLIA
**ABSOLUTELY CRITICAL**: We NEVER update Algolia indices. NEVER EVER EVER EVER EVER.
- Algolia is a READ-ONLY search index synced from Shopify
- Shopify is the source of truth for orders
- We only READ from Algolia for search and listing
- We NEVER write to Algolia with `partialUpdateObjects` or any update method
- Any order updates go to Firestore ONLY
- Vendor configuration updates go to Firestore ONLY
- DO NOT update Algolia indices under any circumstances

### ALWAYS USE ALGOLIA FOR LOOKUPS
**CRITICAL**: When looking up orders or returns:
- Orders are in Algolia's `shopify_orders` index - NEVER look in Firestore's Orders collection
- Returns are in Algolia's `firebase_returns` index for listing/searching
- Use `order_number` field to search for orders in Algolia (NOT orderId or shopify_order_id)
- Match line items by SKU when correlating returns with orders

## Repository Architecture Overview

**IMPORTANT**: This is NOT a monorepo. Each subdirectory is its own separate Git repository with independent version control.

```
/coutr/                      # Root directory (has its own git repo for documentation)
├── admin/                   # Next.js 14 admin dashboard (separate git repo)
├── operations/              # Node.js microservices backend (separate git repo)
├── shopify/                 # Liquid theme for storefront (separate git repo)
├── firebase-catalog/        # Legacy data sync service (separate git repo)
├── aws-orders/              # AWS Lambda functions for order processing (separate git repo)
└── projects/                # Project planning and architecture documentation
    ├── customer-crm/        # Customer CRM dual-database architecture
    ├── migration/           # Admin-to-operations migration plans
    ├── mockups/             # UI/UX mockups for new features
    └── vendor-invoice/      # Vendor invoice feature planning
```

### Architectural Design Patterns

The Coutr platform implements sophisticated **microservices architecture** with these key patterns:

#### 1. **Microservices Architecture**
- **Admin Dashboard**: Pure presentation layer (Next.js 14.1.0) - React-based SPA
- **Operations Service**: Business logic and data orchestration (Express 5.1.0 + TypeScript 5.8.3)
- **Shopify Theme**: Customer-facing e-commerce frontend (Liquid templates + Web Components)
- **Firebase Catalog**: Legacy data synchronization service (Node.js + cron jobs)
- **AWS Orders**: Serverless Lambda functions for webhook processing (SAM + SQS)

#### 2. **Domain-Driven Design (DDD)**
Each repository follows domain separation:
- **Admin Domain**: User management, vendor CRM, financial reports, email campaigns
- **Operations Domain**: Order processing, webhook handling, data synchronization, business rules
- **Storefront Domain**: Product display, cart, checkout, customer experience
- **Data Sync Domain**: External integrations, product imports, API connectors
- **Serverless Domain**: Event processing, order routing, static IP management

#### 3. **Event-Driven Architecture**
- Shopify webhooks → Operations service (order events, fulfillment events)
- Bull/BullMQ queues (Redis) for async processing
- EventEmitter pattern for internal communication
- Email workflow automation triggered by 25+ business events
- Audit logging for all critical operations
- AWS SQS for Lambda function communication

#### 4. **Clean Architecture Principles**
**Operations Service** demonstrates clean architecture:
- **Core**: Database abstractions, event system, logging, queue management
- **Entities**: TypeORM models for PostgreSQL data
- **Use Cases**: Business services with dependency injection (InversifyJS)
- **Interface Adapters**: Controllers, middleware, external API clients
- **External Interfaces**: REST APIs, database connections, third-party integrations

#### 5. **Dependency Injection Pattern**
Operations service uses InversifyJS container with singleton scope:
```typescript
@injectable()
export class VendorService {
  constructor(
    @inject(TYPES.FirestoreService) private firestore: FirestoreService,
    @inject(TYPES.Logger) private logger: Logger
  ) {}
}
```

#### 6. **Component-Based Architecture (Admin Dashboard)**
- **Provider Pattern**: Multiple nested context providers (Auth, Settings, Theme, I18n)
- **Compound Components**: Complex UI components with sub-components
- **Render Props**: Dynamic component composition
- **Custom Hooks**: Reusable business logic (`useUser`, `useSettings`, etc.)

#### 7. **Web Components Pattern (Shopify Theme)**
- **Custom Elements**: HTML elements extending HTMLElement
- **Shadow DOM**: Encapsulated styling and behavior
- **Event Delegation**: Efficient event handling for dynamic content
- **Progressive Enhancement**: JavaScript enhances HTML functionality

#### 8. **Repository Pattern**
- **Operations Service**: TypeORM repositories for data access
- **Admin Dashboard**: API client abstraction layer
- **Consistent Interface**: CRUD operations across different data sources

#### 9. **Factory Pattern**
- **Webhook Handlers**: Factory creates specific handlers based on event type
- **Email Templates**: Template factory for different email categories
- **Integration Services**: Factory pattern for vendor integrations

#### 10. **Observer Pattern**
- **Event Emitters**: Node.js EventEmitter for internal events
- **WebSocket**: Real-time updates for Google Ads metrics
- **Mutation Observers**: Shopify theme DOM change detection

## Admin Dashboard Architecture (`/admin`)

### Technology Stack
- **Frontend**: Next.js 14.1.0, React 18.2.0, TypeScript 5.3.3
- **UI Framework**: Material-UI 5.15.11 with custom theming
- **State Management**: React Context API, React Hook Form 7.50.1
- **Authentication**: Multi-strategy (Firebase, Auth0, Cognito, Supabase, Custom)
- **Rich Text**: TipTap 2.5.8 editor with ProseMirror
- **Search**: Algolia React InstantSearch
- **Charts**: Recharts 3.1.0
- **PDF Generation**: React-PDF 3.3.8

### App Router Architecture
- **CRITICAL ROUTING**:
  - `/admin/*` routes - Internal admin functionality (superadmin, admin roles)
  - `/dashboard/*` routes - Vendor/customer portal functionality
  - DO NOT CONFUSE: Admin features go under `/admin/*`, NOT `/dashboard/*`

### Component Architecture
- **Feature-Based Organization**: Components grouped by domain
- **Atomic Design Pattern**: Core reusable components in `/core`
- **Self-Contained Modals**: Vendor configuration modals with embedded data management

### Multi-Strategy Authentication
```typescript
// Dynamic provider selection at runtime
switch (config.auth.strategy) {
  case AuthStrategy.FIREBASE    // Default production
  case AuthStrategy.AUTH0        // Enterprise
  case AuthStrategy.COGNITO      // AWS ecosystem
  case AuthStrategy.SUPABASE     // Open-source alternative
  case AuthStrategy.CUSTOM       // Custom implementation
}
```

### Key Commands
```bash
yarn dev              # Start development server (port 3000)
yarn build            # Build for production
yarn lint             # Run ESLint
yarn typecheck        # TypeScript type checking
yarn format:write     # Fix code formatting
yarn test             # Run tests in watch mode
```

## Operations Service Architecture (`/operations`)

### Technology Stack
- **Runtime**: Node.js with Express 5.1.0, TypeScript 5.8.3
- **Dependency Injection**: InversifyJS 7.6.1 with reflect-metadata
- **Database**: PostgreSQL with TypeORM 0.3.25 for relational data
- **NoSQL**: Firebase Admin 13.4.0 for Firestore document storage
- **Queue**: Bull 4.16.5 with Redis (ioredis 5.6.1)
- **Logging**: Pino 9.7.0 with structured logging
- **Email**: SendGrid 8.1.5 integration
- **OCR**: Google Cloud Vision 5.3.1

### Clean Architecture Implementation
```
src/
├── core/                    # Infrastructure layer
│   ├── container/          # InversifyJS DI configuration
│   ├── database/           # PostgreSQL & Firestore abstractions
│   ├── events/             # Event emitter with correlation tracking
│   ├── logger/             # Pino structured logging
│   └── queue/              # Bull queue management
├── entities/               # Domain entities (TypeORM)
├── modules/                # Business modules
│   ├── orders/            # Order processing services
│   ├── vendors/           # Vendor management
│   └── webhooks/          # Webhook handling
└── middleware/            # Express middleware
```

### Multi-Database Architecture
- **PostgreSQL**: Order sync, audit logs, relational data requiring ACID
- **Firestore**: Vendor configurations, business documents, flexible schema
- **Algolia**: Search indices for listing operations (READ-ONLY)
- **Redis**: Queue backend, caching, session management

### Key Commands
```bash
yarn dev              # Start with nodemon
yarn build            # Compile TypeScript
yarn migration:run    # Run database migrations
yarn lint:fix         # Fix linting issues
yarn typecheck        # Type checking
```

### Database Migrations (Operations)
```bash
# Generate migration (must build first)
yarn build
npm run typeorm -- migration:generate ./src/migrations/MigrationName -d ./dist/core/database/typeorm.config.js

# Run migrations
yarn migration:run
```

## Shopify Theme Architecture (`/shopify`)

### Technology Overview
- **Version**: Prestige Theme v10.7.0
- **Architecture**: Shopify Online Store 2.0 with JSON templates
- **JavaScript**: ES6 modules with Web Components
- **CSS**: Utility-first with CSS Custom Properties
- **Localization**: 30+ languages with RTL support
- **No Build Process**: Pre-compiled assets, direct deployment

### Web Components Architecture
The theme heavily uses custom HTML elements:
```javascript
class ProductCard extends HTMLElement {
  constructor() {
    super();
    // Component logic
  }
}
customElements.define('product-card', ProductCard);
```

### Key Web Components
- `<x-header>` - Sticky navigation with mega menu
- `<product-card>` - Reusable product display
- `<variant-picker>` - Product option selection
- `<mega-menu>` - Advanced navigation system

### CSS Architecture
```css
/* CSS Custom Properties for theming */
:root {
  --header-is-sticky: 1;
  --header-grid: "primary-nav logo secondary-nav";
}

/* Utility classes + component styles */
.v-stack { /* Vertical stacking */ }
.color-scheme { /* Theme-aware colors */ }
```

### Custom Enhancements
1. **Size Sorting Algorithm** - Intelligent international size parsing
2. **Single Variant Protection** - Multi-layer variant handling
3. **Mega Menu System** - Visual editor with smart positioning
4. **Currency Display Fixes** - Searchanise integration fixes

### Key Commands
```bash
shopify theme dev     # Local development
shopify theme push    # Deploy to Shopify
shopify theme check   # Lint theme files
```

## Firebase Catalog Service (`/firebase-catalog`)

### Technology Stack (Legacy Service)
- **Runtime**: Node.js with vanilla JavaScript (no TypeScript)
- **Database**: Firebase Admin 12.1.1
- **APIs**: Multiple e-commerce integrations  
- **AI**: OpenAI 4.50.0 for content generation
- **Scheduling**: node-cron 4.0.7
- **External APIs**: 15+ vendor integrations

### Service Architecture
```
src/
├── config/                 # Environment and Firebase config
├── express/                # Express server setup
├── services/               # Integration services
│   ├── shopify/           # Shopify product sync
│   ├── algolia/           # Search index management
│   ├── link2lux/          # Vendor integration
│   ├── medusa/            # Medusa platform sync
│   ├── ai/                # OpenAI integrations
│   ├── atelier/           # Atelier vendor sync
│   ├── channelAdvisor/    # Channel Advisor integration
│   ├── dcChannels/        # DC Channels sync
│   ├── eversell/          # Eversell marketplace
│   ├── fashionTamers/     # Fashion Tamers integration
│   ├── gAndB/             # G&B vendor sync
│   ├── googleMerchant/    # Google Merchant feed
│   ├── impact/            # Impact integration
│   ├── laravel/           # Laravel API sync
│   ├── wooCommerce/       # WooCommerce integration
│   └── xMag/              # xMag vendor sync
└── utils/                 # Shared utilities
```

### Key Features
- **Scheduled Syncs**: Cron-based product catalog updates
- **Multi-Vendor Support**: 15+ different vendor API integrations
- **AI Enhancement**: Automatic title and translation generation
- **Data Transformation**: CSV/FTP to Firestore/Algolia pipeline
- **Legacy Codebase**: Vanilla JS without modern build tools

### Key Integrations
- Multiple vendor APIs (Atelier, Channel Advisor, Link2Lux, Fashion Tamers, etc.)
- Shopify GraphQL and REST APIs
- Google Sheets for data management
- FTP/CSV imports from various sources
- OpenAI for content generation

## AWS Orders Service (`/aws-orders`)

### Technology Stack
- **Runtime**: AWS Lambda with Node.js 18.x (ES modules)
- **Infrastructure**: AWS SAM (Serverless Application Model)
- **API Gateway**: REST API endpoints for webhooks
- **Queue**: AWS SQS for message processing
- **VPC**: Custom VPC with NAT Gateway for static IP
- **Database**: Firestore via Google Cloud SDK
- **Search**: Algolia for order indexing

### Lambda Functions
```
src/lambdas/
├── receiveWebhookEvent.mjs         # Webhook entry point
├── processShopifyOrderEvent.mjs    # Shopify order processing
├── processSupplierOrderEvent.mjs   # Supplier order handling
├── processLink2LuxProductUpdateEvent.mjs  # Link2Lux sync
├── processPixelUpdateEvent.mjs     # Tracking pixel updates
├── processShopifyPixelUpdateEvent.mjs  # Shopify pixel processing
├── testStaticIp.mjs                # Static IP testing
└── shared/                          # Shared utilities
    ├── apiClients.mjs              # External API clients
    ├── database.mjs                # Database operations
    ├── shopifyOperations.mjs      # Shopify-specific logic
    └── utils.mjs                   # Common utilities
```

### Infrastructure Components
- **VPC Setup**: Private subnets with NAT Gateway for static IP
- **SQS Queues**: 
  - `productUpdateSqsQuery` - Product update processing
  - `shopifyProductUpdateSqsQuery` - Shopify product updates
  - `orderUpdateSqsQuery` - Order update processing
  - `shopifyOrderEventSqs` - Shopify order events
  - `processPixelUpdateEventSqsQueue` - Pixel tracking
- **API Gateway Endpoints**:
  - `/link2lux` - Link2Lux webhook receiver
  - `/coutr` - General webhook endpoint
  - `/coutr/pixel.gif` - Tracking pixel endpoint
  - `/test/static-ip` - Static IP verification

### Vendor Integrations (Hardcoded in SAM template)
- Link2Lux API
- Atelier Hub
- Fashion Tamers
- Eversell (AMR, Spazio Bra)
- DC Channels
- Monti/Duomo xMag
- Eleonora Bonucci
- BeeStore SOAP service

### Deployment
```bash
# Deploy using SAM CLI
sam deploy --guided

# Local testing
sam local start-api
```

### Key Architectural Decisions
- **Serverless First**: All processing via Lambda functions
- **Queue-Based Processing**: SQS for reliable message handling
- **Static IP Support**: VPC with NAT for IP whitelisting
- **Multi-Vendor Router**: Single entry point routes to multiple vendors
- **Environment Variables**: All credentials in SAM template (security concern)

## Data Architecture

### Data Flow Pattern
1. **Shopify** → Webhooks → **Operations Service**
2. **Operations** → Dual write → **PostgreSQL** + **Firestore**
3. **Firestore** → Auto-sync → **Algolia** (READ-ONLY)
4. **Admin UI** → Proxy API → **Operations Service** → Data stores

### Database Strategy
- **PostgreSQL**: Transactional data, order history, audit logs
- **Firestore**: Document storage, vendor configs, flexible schemas
- **Algolia**: Search and listing (NEVER write directly)
- **Redis**: Queue processing, caching, sessions

### Algolia Indices (DO NOT CHANGE NAMES)
- `shopify_orders` - Order data from Shopify
- `firebase_products` - Product catalog
- `firebase_vendorinvoices` - Vendor invoice documents
- `firebase_shippinginvoices` - Shipping invoices
- `firebase_vendordocuments` - Vendor document metadata
- `firestore_suppliers` - Vendor/supplier data
- `firebase_returns` - Return documents with vendor data in lineItems

**ARCHITECTURE RULE**: Always use Algolia for listing/searching, Firestore for individual CRUD operations

## Integration Points

### Service Communication Architecture

#### Inter-Service Communication Patterns
1. **Admin → Operations**: REST API proxy pattern
   - Admin makes API calls to its own `/api/*` endpoints
   - These endpoints proxy to Operations service
   - Authentication token passed in headers
   - Response transformation and error handling

2. **Operations → External Services**: Direct integration
   - Shopify GraphQL/REST APIs
   - SendGrid API for email
   - Google Cloud Vision for OCR
   - Algolia for search indexing

3. **Shopify → AWS Lambda → Operations**: Webhook flow
   - Shopify sends webhooks to AWS API Gateway
   - Lambda functions process and route to SQS
   - Some events forwarded to Operations service

4. **Firebase Catalog → External APIs**: Scheduled sync
   - Cron jobs trigger regular syncs
   - Direct API calls to vendor systems
   - Updates written to Firestore/Algolia

### Shopify Webhooks → Operations Service
- Order creation/update webhooks
- Fulfillment webhooks
- Return webhooks
- Product updates
- Refund processing

### Operations Service → Admin Dashboard
All data operations go through Operations service APIs:
- `/api/vendors/*` - Vendor management
- `/api/email/*` - Email system operations
- `/api/admin/vendor-crm/*` - CRM operations
- `/api/admin/shipping-invoices/*` - Shipping invoice CRUD
- `/api/ap-invoices/*` - AP invoice processing
- `/api/admin/orders/*` - Order management with enriched data
- `/api/permissions/*` - Dynamic permission checking
- `/api/google-ads/*` - Google Ads campaign management

### External Integrations
- **SendGrid**: Email delivery with webhook tracking
- **Google Cloud Vision**: OCR for invoice processing
- **AWS S3**: Document storage with pre-signed URLs
- **Shopify APIs**: GraphQL and REST for e-commerce
- **Google Sheets**: Data synchronization
- **Google Ads API**: Campaign management and optimization
- **Multiple Vendor APIs**: Link2Lux, Atelier, Fashion Tamers, etc.

### Real-time Communication
- **WebSocket**: Google Ads metrics streaming
- **Server-Sent Events (SSE)**: Event stream for audit logs
- **Bull Board**: Queue monitoring dashboard
- **Webhook Callbacks**: Async event notifications

## Environment Variables

### Admin Dashboard
```bash
NEXT_PUBLIC_AUTH_STRATEGY    # Authentication provider selection
NEXT_PUBLIC_ALGOLIA_*        # Algolia configuration
NEXT_PUBLIC_OPERATIONS_URL   # Operations service URL
GOOGLE_PLACES_API_KEY        # Address autocomplete
```

### Operations Service
```bash
DATABASE_URL                 # PostgreSQL connection
FIREBASE_*                   # Firebase credentials
REDIS_URL                    # Redis/Bull queue connection
SHOPIFY_*                    # Shopify API credentials
SENDGRID_API_KEY            # Email service
SENDGRID_WEBHOOK_KEY        # Webhook verification
```

## Development Workflow

### Git Repository Management
**CRITICAL**: Each subdirectory is a separate Git repository
```bash
# Always check which repo you're in
pwd

# Navigate to specific project before git operations
cd admin && git status
cd ../operations && git status
cd ../shopify && git status
```

### Testing Changes
1. **Admin**: `yarn dev` at localhost:3000
2. **Operations**: `yarn dev` at localhost:8000
3. **Shopify**: `shopify theme dev` for local preview

### Code Quality Standards
```bash
# Before committing (in each project)
yarn lint:fix         # Fix linting issues
yarn typecheck        # Check TypeScript types
yarn build            # Verify build succeeds
```

## Vendor System Architecture

### Vendor Data Flow (CRITICAL)
```
Admin UI → /api/vendors/[id] → Operations Service → Firestore/PostgreSQL
         ↑                                        ↓
         └──────── Response with data ←──────────┘
```

### Vendor Configuration Structure
```typescript
vendor: {
  // Root level data
  processingTime, shipmentTime, cutoffTime,
  
  // Nested configuration objects
  costShipping: {
    handlingEnabled, handlingFee, shippingCostMethod, taxRate
  },
  shippingZones: {
    zones[], freeShippingThreshold, expressEnabled
  },
  bankingInfo: {
    accountNumber, routingNumber, paymentTerms
  }
}
```

### Vendor Modal System
The vendor details page uses self-contained modals that save to specific nested objects:

1. **Cost & Shipping Modal** → `vendor.costShipping`
2. **Processing Times Modal** → Root vendor object
3. **Shipping Zones Modal** → `vendor.shippingZones`
4. **Banking Modal** → `vendor.bankingInfo`

## Email System Architecture

### Email System Rules
- **NEVER** implement email business logic in admin app
- All email services belong in operations service
- Admin components only call operations API
- Email data stored in PostgreSQL via TypeORM

### Email API Structure
```
Operations Service:
/api/email/templates/*      # Template CRUD
/api/email/workflows/*      # Workflow management
/api/email/send             # Send emails
/api/email/webhooks/sendgrid # Event tracking
/api/email/analytics        # Statistics
```

## Financial System

### Financial Calculation Rules
1. **Shipping Invoice Double-Counting**: Filter out shipping invoices with `vendorOrderNumber` when calculating standalone shipping
2. **Date Filter Initialization**: Initialize as `null` to show all data
3. **Balance Consistency**: Ensure vendor-balance-card and financial-reports use identical logic

### AP Invoice System
Creates batch payment invoices combining:
- Individual orders (checkbox selection)
- Vendor invoices (with associated orders)
- Shipping invoices (as line items in total)

## Common Pitfalls & Solutions

### 1. Algolia Index Names
**Problem**: Changing index names breaks search
**Solution**: NEVER modify hardcoded index names

### 2. Authentication Issues
**Problem**: User can't log in
**Solution**: Ensure user exists in Firestore `SuppliersUsers` collection

### 3. Git Repository Confusion
**Problem**: Commits going to wrong repository
**Solution**: Always `cd` into project directory before git operations

### 4. Build Failures
**Problem**: TypeScript errors blocking deployment
**Solution**: Always run `yarn build` after changes, fix errors immediately

### 5. Email System
**Problem**: Email logic in wrong service
**Solution**: All email business logic MUST be in operations service

### 6. Vendor Data Updates
**Problem**: Direct Firestore updates from admin
**Solution**: Always go through Operations service API

## Recent Updates & Features

- **Vendor CRM System**: Full vendor lifecycle management
- **Order Protection**: Insurance and handling calculations
- **AP Invoice Processing**: OCR and automated matching
- **Returns Management**: Shopify return sync
- **Document Management**: Complete document lifecycle
- **Email Workflow System**: 25+ business events with automation
- **Shipping Invoice Management**: CSV bulk upload with auto-linking
- **Vendor Event Tracking**: Complete audit trail system
- **Expected Ship Date System**: Manual override protection

## Ongoing Migration Strategy

The platform is undergoing a critical architectural migration to ensure proper separation of concerns:

### Admin-to-Operations Migration
- **Goal**: Admin app should have ZERO direct database access
- **Status**: 93 admin API routes need migration to operations service
- **Pattern**: All admin routes proxy to operations service endpoints

### Migration Priorities
1. **Utility Routes** - Complex business logic (update handling costs, sync operations)
2. **AP Invoice Routes** - Financial processing and payment workflows
3. **Order Management** - Order CRUD and status updates
4. **Line Item Management** - Individual item tracking and status
5. **Vendor Management** - Vendor CRUD and configuration

### Migration Pattern
```javascript
// Before (admin/src/app/api/route.ts)
export async function GET() {
  const data = await firestore.collection('vendors').get();
  return Response.json(data);
}

// After (admin/src/app/api/route.ts)
export async function GET() {
  const response = await fetch(`${OPERATIONS_URL}/api/vendors`);
  return Response.json(await response.json());
}
```

## Developer Workflow Memories

- Always look at how admin talks to operations app before coding
- Any data put into Firestore must also be created in PostgreSQL
- Never put Claude in commit messages
- Each subdirectory is a separate Git repository
- Use descriptive commit messages focusing on what changed

## Architecture Principles Summary

1. **Microservices**: Clear separation of concerns between services
2. **Data Consistency**: Dual-write to PostgreSQL and Firestore
3. **Search Strategy**: Algolia for listing, Firestore for CRUD
4. **Authentication**: Multi-strategy support with environment config
5. **Event-Driven**: Webhook and queue-based async processing
6. **Clean Architecture**: Dependency injection, separation of layers
7. **Type Safety**: Strict TypeScript across admin and operations
8. **No Direct Access**: Admin never accesses databases directly

## Architectural Best Practices & Patterns

### SOLID Principles Implementation
- **Single Responsibility**: Each service class handles one domain concern
- **Open/Closed**: Services extensible via dependency injection
- **Liskov Substitution**: Interface-based programming with TypeScript
- **Interface Segregation**: Small, focused interfaces for services
- **Dependency Inversion**: High-level modules depend on abstractions

### Data Access Patterns
- **Repository Pattern**: Consistent data access layer
- **Unit of Work**: TypeORM transactions for data consistency
- **Query Object**: Complex queries encapsulated in service methods
- **Data Mapper**: TypeORM entities separate from business logic
- **Generated Columns**: Database-computed fields with SQL expressions
- **Composite Indexes**: Multi-column indexes with conditional WHERE clauses
- **Entity Lifecycle Hooks**: @BeforeInsert/@BeforeUpdate for data normalization

### API Design Patterns
- **RESTful Design**: Resource-based URLs with HTTP verbs
- **Proxy Pattern**: Admin app proxies to operations service
- **API Gateway**: Operations service acts as gateway to multiple data sources
- **Circuit Breaker**: Error handling with exponential backoff and retry mechanisms

### Frontend Patterns (Admin Dashboard)
- **Container/Presentational**: Smart vs dumb components
- **Higher-Order Components**: Authentication and permission wrappers
- **Render Props**: Flexible component composition
- **Compound Components**: Context-based complex UI with event delegation
- **Controlled Components**: Form state management with React Hook Form
- **Custom Hook Architecture**: Advanced hooks for permissions, SSE, and impersonation
- **View-As Pattern**: Global fetch interception for supplier impersonation

### Event-Driven Architecture Patterns
- **Event Sourcing**: Complete event store with replay capabilities
- **CQRS Implementation**: Separate read/write models with Algolia/PostgreSQL
- **Event Correlation**: Tracking events across microservice boundaries
- **Server-Sent Events (SSE)**: Real-time updates with reconnection strategies
- **WebSocket Integration**: High-frequency data streaming for metrics
- **Event Store Pattern**: Failed event recovery with exponential backoff

### Real-time Communication Patterns
- **Multi-Protocol Support**: SSE for audit logs, WebSocket for metrics
- **Exponential Backoff**: Automatic reconnection with circuit breaker
- **Event Filtering**: Client-side event stream filtering
- **Event Buffering**: Client-side event replay capabilities

### Performance Patterns
- **Lazy Loading**: Dynamic imports for code splitting
- **Memoization**: React.memo and useMemo for optimization
- **Virtual Scrolling**: Large lists with react-window
- **Connection Pooling**: Database connection reuse
- **Queue Throttling**: Rate limiting for external APIs
- **Database Query Optimization**: Composite indexes and generated columns
- **Dual-Write Strategy**: Optimized reads via Algolia, writes to PostgreSQL/Firestore

### Security Patterns
- **Defense in Depth**: Multiple layers of security
- **Principle of Least Privilege**: Role-based access control
- **Input Validation**: Zod schemas and class-validator
- **Sanitization**: XSS prevention in user inputs
- **Secure by Default**: Environment-based configuration
- **Multi-Strategy Authentication**: Runtime provider selection
- **Dynamic Permissions**: Role and group-based access control

### Advanced Dependency Injection
- **InversifyJS Container**: Singleton-scoped service registration
- **Service Abstractions**: Interface-based programming
- **Cross-Module DI**: Dependency injection across module boundaries
- **Circular Dependency Resolution**: Proper handling of complex dependencies

### Testing Patterns (Implied Architecture)
- **Unit Testing**: Jest for isolated component testing
- **Integration Testing**: API endpoint testing
- **E2E Testing**: Full workflow validation
- **Mocking**: Service dependencies mocked for testing

### Deployment Patterns
- **Infrastructure as Code**: AWS SAM for Lambda deployment
- **Environment Configuration**: .env files for different environments
- **Blue-Green Deployment**: Shopify theme versioning
- **Containerization Ready**: Docker-compatible Node.js services

### Code Organization Patterns
- **Feature-Based Structure**: Modules organized by business domain
- **Barrel Exports**: Index files for clean imports
- **Shared Utilities**: Common code in shared directories
- **Configuration as Code**: Settings in JSON/TypeScript files

## Important Implementation Notes

### Styled Components with MUI
When creating styled MUI components with custom props, use the `$` prefix:
```typescript
const StyledButton = styled(Button)<{ $variant: 'primary' | 'secondary' }>(
  ({ $variant }) => ({
    // styles based on $variant
  })
);
// Usage: <StyledButton $variant="primary">
```

### TypeORM Entity Patterns
```typescript
// Generated columns for computed values
@Column({ 
  type: 'varchar',
  generatedType: 'STORED',
  asExpression: `LOWER(email)`
})
emailLowercase: string;

// Entity lifecycle hooks
@BeforeInsert()
@BeforeUpdate()
normalizePhone() {
  if (this.phone) {
    this.phone = formatToE164(this.phone);
  }
}

// Composite indexes with conditions
@Index(['vendorId', 'status'], { where: 'status != completed' })
```

### Custom React Hook Patterns
```typescript
// Dynamic permissions hook
const { checkPermission } = useDynamicPermissions();
if (checkPermission('admin.vendors.edit')) { /* ... */ }

// Event stream with reconnection
const { events } = useEventStream('/api/events', {
  reconnectDelay: 1000,
  maxReconnectAttempts: 5
});

// View-as supplier impersonation
const { viewAsSupplier, setViewAs } = useViewAsSupplier();
```

### Event Store Implementation
```typescript
// Event correlation across services
await eventStore.publish({
  type: 'ORDER_CREATED',
  correlationId: generateCorrelationId(),
  data: orderData,
  metadata: { userId, timestamp }
});

// Event replay for debugging
const events = await eventStore.replay(correlationId);
```

### Error Handling Patterns
- Service-level: Try-catch with contextual logging
- Middleware-level: Global error handler
- Queue-level: Retry strategies with dead letter queues
- SSE reconnection: Exponential backoff with circuit breaker
- Event store: Failed event recovery with retry mechanism

### Performance Optimizations
- Connection pooling for databases
- Eager loading for TypeORM relations
- Queue concurrency limits
- Redis caching through Bull
- Lazy loading in frontend components
- Generated database columns for computed values
- Composite indexes for multi-column queries
- Algolia for read-optimized search operations

## Critical Architectural Decisions

### Data Consistency Strategy
- **Dual-Write Pattern**: All data writes go to both PostgreSQL (transactional) and Firestore (document)
- **Read Optimization**: Algolia for search/listing, Firestore for single document CRUD
- **Never Direct Algolia Writes**: Algolia is synced from Firestore, NEVER write directly
- **Event Correlation**: Track operations across services with correlation IDs

### Authentication & Authorization
- **Multi-Strategy Support**: Runtime selection of auth provider (Firebase, Auth0, Cognito, etc.)
- **Dynamic Permissions**: Permissions checked at runtime from database, not hardcoded
- **View-As Pattern**: Global fetch interception for supplier impersonation
- **Role-Based Access**: Combine user roles with group permissions

### Real-time Communication
- **SSE for System Events**: Audit logs, order updates, system notifications
- **WebSocket for Metrics**: High-frequency data like Google Ads metrics
- **Exponential Backoff**: All real-time connections implement retry with backoff
- **Event Filtering**: Client-side filtering of event streams

### Service Communication
- **Admin → Operations**: Always through proxy API endpoints
- **Operations → External**: Direct integration with third-party services
- **Webhook Processing**: AWS Lambda → SQS → Operations service
- **Event-Driven Updates**: EventEmitter for internal, webhooks for external

### Database Design Principles
- **Generated Columns**: Use database-computed fields for derived data
- **Composite Indexes**: Multi-column indexes for complex queries
- **Entity Hooks**: Normalize data in @BeforeInsert/@BeforeUpdate
- **Snake Case Convention**: Database columns use snake_case, entities use camelCase

### Dual-Database Architecture Pattern
The platform implements a sophisticated dual-database pattern for optimal performance:

```javascript
// Write-through pattern ensures consistency
class DatabaseSyncService {
  async syncData(id, data) {
    const pgTransaction = await pgClient.transaction();
    try {
      // 1. Write to PostgreSQL (transactional)
      await this.writeToPostgres(data, pgTransaction);
      
      // 2. Write to Firestore (document)
      await this.writeToFirestore(data);
      
      // 3. Commit PostgreSQL
      await pgTransaction.commit();
      
      // 4. Log sync success
      await this.logSyncSuccess(id);
    } catch (error) {
      await pgTransaction.rollback();
      await this.rollbackFirestore(id);
      throw error;
    }
  }
}
```

**When to use which database:**
- **PostgreSQL**: Complex reporting, JOINs, time-series, financial calculations
- **Firestore**: Real-time updates, document lookups, webhook processing
- **Algolia**: Search and listing operations (READ-ONLY from Firestore sync)

## Development Workflow Memories

- Always look at how admin talks to operations app before coding
- Any data put into Firestore must also be created in PostgreSQL
- Never put Claude in commit messages
- Each subdirectory is a separate Git repository
- Use descriptive commit messages focusing on what changed
- Always run typecheck and lint before committing
- Check for existing patterns before implementing new features
- Use the TodoWrite tool for complex multi-step tasks
- Never bypass authentication for "testing" - test properly with real authentication flows
- When asking for data structures, ask the user directly for sample records from Algolia
- Product images in Algolia can be in `gallery` field as array OR object with color keys

## Critical Mistakes to Avoid (Learned the Hard Way)

### Vendor System Architecture
- **NEVER create "smart" APIs that serve both vendors and admins** - Keep them completely separate
- **NEVER make routing decisions based on user role** - Vendors use `/dashboard/*`, admins use `/admin/*`, period
- **ALWAYS follow existing patterns** - Look at how orders API works before implementing new vendor features
- **Vendor APIs MUST always filter by vendor** - No exceptions, cannot return all data
- **Don't try to be clever** - When user says keep things separate, KEEP THEM SEPARATE

### Product and Variant Data Structure
- **Products have `supplier_keys` (plural array)** - Because products can have multiple suppliers
- **Variants have `supplier_key` (singular)** - Because each variant belongs to ONE supplier
- **Variant search uses SKU text search** - NOT filtering by product_id (which doesn't exist in variants)
- **Always check field names in Algolia** - Don't assume, verify the actual field names
- **Use consistent field names** - If products use `supplier_keys`, check what variants actually use

### Debugging Approach
- **ALWAYS add logging to operations service FIRST** - That's where the business logic is
- **Check the actual data structure** - Don't assume fields exist, verify them
- **When something doesn't work, LOG THE RESPONSE** - Don't just push changes hoping they work
- **Test before pushing** - Verify changes work before committing and pushing

### API Design Patterns
- **Match existing patterns** - Admin uses separate product and variants APIs? Do the same for vendors
- **Keep consistent data flow** - Admin → Proxy API → Operations → Data stores
- **Don't create new patterns** - Follow what already works in the codebase

### Vendor Key Mismatches
- **Vendor records can have mismatched keys** - e.g., vendor "vietti-shop" but products use "vietti"
- **vendorKey field is in Firestore Suppliers collection** - This is what maps to product `supplier_keys`
- **Superadmins can fix mismatches** - Via Business Information modal in vendor details
- **Always check Algolia for the actual vendor** - Don't assume vendor exists, verify it

This documentation represents the complete architectural knowledge of the Coutr e-commerce platform, ensuring consistent development practices across all repositories and services.
- the operations service does not run on port 8080 in local. NEVER EVER BRING THIS UP AGAIN