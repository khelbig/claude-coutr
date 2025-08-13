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

## Repository Architecture Overview

**IMPORTANT**: This is NOT a monorepo. Each subdirectory is its own separate Git repository with independent version control.

```
/coutr/                      # Root directory (has its own git repo for documentation)
├── admin/                   # Next.js 14 admin dashboard (separate git repo)
├── operations/              # Node.js microservices backend (separate git repo)
├── shopify/                 # Liquid theme for storefront (separate git repo)
├── firebase-catalog/        # Legacy data sync service (separate git repo)
└── aws-orders/              # AWS Lambda functions for order processing (separate git repo)
```

### Architectural Design Patterns

The Coutr platform implements sophisticated **microservices architecture** with these key patterns:

#### 1. **Microservices Architecture**
- **Admin Dashboard**: Pure presentation layer (Next.js 14.1.0)
- **Operations Service**: Business logic and data orchestration (Express + TypeScript)
- **Shopify Theme**: Customer-facing e-commerce frontend (Liquid templates)
- **Firebase Catalog**: Legacy data synchronization and import service
- **AWS Orders**: Serverless Lambda functions for webhook processing

#### 2. **Domain-Driven Design (DDD)**
Each repository follows domain separation:
- **Admin Domain**: User management, vendor CRM, financial reports, email campaigns
- **Operations Domain**: Order processing, webhook handling, data synchronization, business rules
- **Storefront Domain**: Product display, cart, checkout, customer experience
- **Data Sync Domain**: External integrations, product imports, API connectors

#### 3. **Event-Driven Architecture**
- Shopify webhooks → Operations service (order events, fulfillment events)
- Bull queues (Redis) for async processing
- EventEmitter pattern for internal communication
- Email workflow automation triggered by business events
- Audit logging for all critical operations

#### 4. **Clean Architecture Principles**
**Operations Service** demonstrates clean architecture:
- **Core**: Database abstractions, event system, logging, queue management
- **Entities**: TypeORM models for PostgreSQL data
- **Use Cases**: Business services with dependency injection (InversifyJS)
- **Interface Adapters**: Controllers, middleware, external API clients
- **External Interfaces**: REST APIs, database connections, third-party integrations

#### 5. **Dependency Injection Pattern**
Operations service uses InversifyJS container:
```typescript
@injectable()
export class VendorService {
  constructor(
    @inject(TYPES.FirestoreService) private firestore: FirestoreService,
    @inject(TYPES.Logger) private logger: Logger
  ) {}
}
```

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

### Service Architecture
```
src/
├── services/               # Integration services
│   ├── shopify/           # Shopify product sync
│   ├── algolia/           # Search index management
│   ├── link2lux/          # Vendor integration
│   ├── medusa/            # Medusa platform sync
│   └── ai/                # OpenAI integrations
└── utils/                 # Shared utilities
```

### Key Integrations
- Multiple vendor APIs (Atelier, Channel Advisor, Link2Lux)
- Shopify GraphQL and REST APIs
- Google Sheets for data management
- FTP/CSV imports from various sources

## AWS Orders Service (`/aws-orders`)

### Technology Stack
- **Runtime**: AWS Lambda with Node.js (ES modules)
- **Infrastructure**: AWS SAM (Serverless Application Model)
- **API Gateway**: REST API endpoints for webhooks
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
└── shared/                          # Shared utilities
    ├── apiClients.mjs              # External API clients
    ├── database.mjs                # Database operations
    └── shopifyOperations.mjs      # Shopify-specific logic
```

### API Endpoints
- `/link2lux` - Link2Lux webhook receiver
- `/coutr` - General webhook endpoint
- Additional endpoints for products and orders (configurable)

### Deployment
```bash
# Deploy using SAM CLI
sam deploy --guided

# Local testing
sam local start-api
```

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

### Shopify Webhooks → Operations Service
- Order creation/update webhooks
- Fulfillment webhooks
- Return webhooks
- Product updates

### Operations Service → Admin Dashboard
All data operations go through Operations service APIs:
- `/api/vendors/*` - Vendor management
- `/api/email/*` - Email system operations
- `/api/admin/vendor-crm/*` - CRM operations
- `/api/admin/shipping-invoices/*` - Shipping invoice CRUD
- `/api/ap-invoices/*` - AP invoice processing

### External Integrations
- **SendGrid**: Email delivery with webhook tracking
- **Google Cloud Vision**: OCR for invoice processing
- **AWS S3**: Document storage with pre-signed URLs
- **Shopify APIs**: GraphQL and REST for e-commerce
- **Google Sheets**: Data synchronization

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

### Error Handling Patterns
- Service-level: Try-catch with contextual logging
- Middleware-level: Global error handler
- Queue-level: Retry strategies with dead letter queues

### Performance Optimizations
- Connection pooling for databases
- Eager loading for TypeORM relations
- Queue concurrency limits
- Redis caching through Bull
- Lazy loading in frontend components

This documentation represents the complete architectural knowledge of the Coutr e-commerce platform, ensuring consistent development practices across all repositories and services.