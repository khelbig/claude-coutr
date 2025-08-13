# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Repository Overview

This directory contains three separate Git repositories for the Coutr e-commerce platform:

1. **Admin Dashboard** (`/admin`) - Next.js 14 B2B vendor management platform (separate repo)
2. **Shopify Theme** (`/shopify`) - Customer-facing Shopify Prestige theme (separate repo)
3. **Operations** (`/operations`) - Node.js microservices backend (separate repo)

**IMPORTANT**: Each subdirectory is its own Git repository. Always `cd` into the specific project directory before running any git commands to ensure commits go to the correct repository.

## Overall Architecture Principles

### System Design Pattern
The Coutr platform follows a **microservices architecture** with clear separation of concerns:

1. **Frontend/Backend Separation**: 
   - Admin UI (Next.js) handles presentation and user interaction
   - Operations service handles all business logic and data operations
   - Shopify theme provides customer-facing storefront

2. **Event-Driven Architecture**:
   - Shopify webhooks trigger operations service
   - Queue-based processing (Bull/Redis) for async operations
   - Event emitters for internal communication

3. **Data Architecture**:
   - **Firestore**: Primary source of truth for vendor, product, and business data
   - **PostgreSQL**: Order sync data, audit logs, and relational data
   - **Algolia**: Search and listing functionality (auto-synced from Firestore)
   - **Shopify**: E-commerce platform data (orders, customers, products)

4. **Integration Pattern**:
   - RESTful APIs between services
   - Webhook-based integration with Shopify
   - Service-to-service authentication via API keys and JWT tokens

### Key Architectural Decisions

1. **Dependency Injection**: Operations service uses InversifyJS for IoC container
2. **Type Safety**: Strict TypeScript across admin and operations
3. **Multi-tenancy**: Built-in support for multiple vendors/suppliers
4. **Queue Processing**: Bull queues for reliable async processing
5. **Modular Design**: Feature-based module organization
6. **Microservices Pattern**: Admin app is presentation only, Operations service handles all business logic
7. **Vendor Data Management**: All vendor CRUD operations go through Operations service, no direct Firestore access from admin

## Project-Specific Guidelines

### Admin Dashboard (`/admin`)
- **Technology**: Next.js 14.1.0 with MUI components
- **Auth**: Firebase (current), supports Auth0, Cognito, Supabase, Custom
- **State**: React Context API
- **Testing**: Jest with Next.js preset
- **Styling**: MUI with custom theme, emotion for CSS-in-JS
- **CRITICAL ROUTING**:
  - `/admin/*` routes - Internal admin functionality (superadmin, admin roles)
  - `/dashboard/*` routes - Vendor/customer portal functionality
  - DO NOT CONFUSE: Admin features go under `/admin/*`, NOT `/dashboard/*`
- **Key Commands**:
  ```bash
  yarn dev              # Start development server (port 3000)
  yarn build            # Build for production
  yarn lint             # Run ESLint
  yarn typecheck        # TypeScript type checking
  yarn format:write     # Fix code formatting
  yarn test             # Run tests in watch mode
  ```

### Operations Service (`/operations`)
- **Technology**: Node.js with Express, TypeScript, InversifyJS
- **Database**: PostgreSQL (TypeORM) + Firestore
- **Queue**: Bull with Redis for async processing
- **Architecture**: Microservices with dependency injection
- **Key Commands**:
  ```bash
  yarn dev              # Start with nodemon
  yarn build            # Compile TypeScript
  yarn migration:run    # Run database migrations
  yarn lint:fix         # Fix linting issues
  yarn typecheck        # Type checking
  ```

### Shopify Theme (`/shopify`)
- **Technology**: Liquid templates, Web Components, utility CSS
- **Version**: Prestige Theme v10.7.0
- **JavaScript**: ES6 modules with custom elements
- **No Build Process**: Direct editing of theme files
- **Key Commands**:
  ```bash
  shopify theme dev     # Local development
  shopify theme push    # Deploy to Shopify
  shopify theme check   # Lint theme files
  ```

## Integration Points

### Shopify Webhooks → Operations Service
- Order creation/update webhooks
- Fulfillment webhooks
- Return webhooks
- Product updates

### Operations Service → Admin Dashboard
- RESTful APIs for all data operations
- Real-time order syncing
- Vendor management
- Financial calculations
- Email system APIs:
  - `/api/email/templates/*` - Template management
  - `/api/email/workflows/*` - Workflow operations  
  - `/api/email/send` - Send emails using templates
  - `/api/email/webhooks/sendgrid` - Process delivery events
  - `/api/email/analytics` - Fetch email statistics
  - `/api/email/history` - Email send history
- Vendor CRM APIs:
  - `/api/admin/vendor-crm/:id/send-introduction-email` - Send vendor introduction emails
  - `/api/admin/vendor-crm/:id/events` - Get vendor event history
  - `/api/admin/vendor-crm/:id/recent-activity` - Get recent vendor activities
- Shipping Invoice APIs:
  - `/api/admin/shipping-invoices/*` - CRUD operations for shipping invoices
  - `/api/admin/shipping-invoices/upload-csv` - Bulk upload via CSV

### Algolia Indices (DO NOT CHANGE NAMES)
- `shopify_orders` - Order data from Shopify
- `firebase_products` - Product catalog
- `firebase_vendorinvoices` - Vendor invoice documents
- `firebase_shippinginvoices` - Shipping invoices (CRITICAL: NOT firestore_shippinginvoices)
- `firebase_vendordocuments` - Vendor document metadata
- `firestore_suppliers` - Vendor/supplier data
- `firebase_returns` - Return documents from Shopify with vendor data in lineItems
**ARCHITECTURE RULE**: Always use Algolia for listing/searching, Firestore for individual CRUD operations

#### Returns Index Structure
The `firebase_returns` index stores return documents with vendor information nested in lineItems:
- Vendor field is at `lineItems.vendor` or `lineItems.supplier` (they are the same)
- When filtering by vendor in Algolia, use `lineItems.vendor:"vendorName"` NOT `vendor:"vendorName"`
- The vendor field is extracted from lineItems AFTER fetching, not stored at root level

## Environment Variables

### Admin Dashboard
- `NEXT_PUBLIC_AUTH_STRATEGY` - Authentication provider
- `NEXT_PUBLIC_ALGOLIA_*` - Algolia configuration
- `GOOGLE_PLACES_API_KEY` - Address autocomplete
- Firebase/Auth provider credentials

### Operations Service
- Database connection strings (Postgres)
- Firebase service account credentials
- Redis connection for Bull queues
- Shopify API credentials
- Webhook secrets
- SendGrid email service credentials:
  - `SENDGRID_API_KEY` - SendGrid API key for sending emails
  - `SENDGRID_WEBHOOK_KEY` - Webhook verification key for event tracking
  - `SENDGRID_FROM_EMAIL` - Default sender email address
  - `SENDGRID_FROM_NAME` - Default sender name
  - `SENDGRID_VERIFIED_SENDER_EMAIL` - Verified sender email in SendGrid

## Development Workflow

1. **Git Repositories**: Each subdirectory is a separate repo
   - Always `cd` into the project directory before git operations
   - Never mix commits across repositories

2. **Testing Changes**:
   - Admin: Use `yarn dev` and test at localhost:3000
   - Operations: Use `yarn dev` with proper .env setup
   - Shopify: Use `shopify theme dev` for local preview

3. **Code Quality**:
   - Run linting before commits: `yarn lint:fix`
   - Check types: `yarn typecheck`
   - Format code: `yarn format:write` (admin) or `yarn format` (operations)

4. **Database Changes** (Operations):
   - Generate migration: `npm run typeorm -- migration:generate ./src/migrations/MigrationName -d ./dist/core/database/typeorm.config.js`
   - Run migrations: `yarn migration:run`
   - **Note**: Must build TypeScript first (`yarn build`) before generating migrations

## Common Pitfalls

1. **Algolia Index Names**: Never change the hardcoded index names
2. **Authentication**: Ensure users exist in Firestore `SuppliersUsers` collection
3. **Git Operations**: Always check which repo you're in before committing
4. **Environment Variables**: Each project has different requirements
5. **Build Process**: Only admin and operations need building; Shopify doesn't
6. **Email System Architecture**: 
   - **NEVER** implement email business logic in admin app
   - All email services (SendGrid, templates, workflows) belong in operations service
   - Admin components should only call operations API via `/lib/email.ts` client
   - Email data is stored in PostgreSQL via TypeORM entities in operations
7. **Build Verification**: 
   - **ALWAYS** run `yarn build` after major changes to verify TypeScript compilation
   - Fix TypeScript errors immediately - they can block deployments
   - Check both admin (`yarn build`) and operations (`yarn build`) services
   - Missing service methods are common after refactoring - implement them properly
8. **Financial Calculations**:
   - **Shipping Invoice Double-Counting**: Always filter out shipping invoices with `vendorOrderNumber` when calculating standalone shipping costs
   - **Date Filter Initialization**: Initialize date filters as `null` to show all data, not with a date range that might exclude records
   - **Balance Consistency**: Ensure vendor-balance-card and financial-reports use identical calculation logic

## Vendor System Architecture

### Vendor Data Flow (CRITICAL)
- **Admin UI**: Presentation layer only - `/admin/vendors/[vendorId]` page displays vendor data
- **Admin API**: Proxy endpoints at `/api/vendors/[vendorId]` that forward requests to Operations service
- **Operations Service**: Contains actual business logic with vendor CRUD operations at `/api/vendors/[vendorId]`
- **Data Storage**: Firestore as primary storage, Algolia for search indexing
- **Environment**: Admin connects to Operations via `OPERATIONS_API_URL=http://localhost:8000`

### Vendor Service Implementation
- **Location**: `/operations/src/modules/vendors/services/vendor.service.ts`
- **Controller**: `/operations/src/modules/vendors/controllers/vendor.controller.ts`
- **Routes**: Registered in `/operations/src/app.ts` with full CRUD support
- **Container**: Registered in InversifyJS container with proper dependency injection
- **Nested Objects**: Properly handles `costShipping` and `shippingZones` configuration objects

### Vendor Data Structure
Vendors have nested configuration objects:
- `costShipping`: Handling fees, shipping method selection, tax settings
- `shippingZones`: Zone-based rates, coverage, restrictions, express shipping
- `bankingInfo`: Banking and payment information
- Processing times, calendars, and fulfillment settings

## Vendor Modal System and Data Structure

### Vendor Configuration Modals
The vendor details page (`/admin/vendors/[id]`) has several configuration modals that save data in specific nested objects:

1. **Cost & Shipping Configuration Modal** (`cost-shipping-modal-exact.tsx`)
   - Saves data under `vendor.costShipping` object
   - Fields: `handlingEnabled`, `handlingFee`, `handlingFeeType`, `includeShippingInPayables`, `shippingCostMethod`, `taxOnShipping`, `taxRate`
   - Controls handling fees, shipping method selection, and tax settings

2. **Processing & Fulfillment Times Modal** (`processing-times-modal-fixed.tsx`)
   - Saves data directly on vendor root object
   - Fields: `processingTime`, `shipmentTime`, `cutoffTime`, `processWeekends`, `selectedCalendars`, `offerExpress`, `processHolidays`, `customDates`
   - Uses custom toggle components with proper separation of label and switch

3. **Shipping Zones & Rates Modal** (`shipping-zones-modal-exact.tsx`)
   - Saves data under `vendor.shippingZones` object
   - Fields: `shippingCoverage`, `customRegions`, `shippingCostMethod`, `zones`, `freeShippingThreshold`, `freeShippingEnabled`, `expressEnabled`, `expressFee`, `ddpEnabled`, `useCustomRestrictions`, `restrictedCountries`
   - Zones array contains objects with: `id`, `name`, `enabled`, `standardRate`, `weightRate`, `deliveryTime`
   - Shipping methods: 'zones' (zone-based rates), 'vendor' (vendor invoiced), 'company' (company provider)
   - Zones section is hidden when not using zone-based shipping

4. **Enhanced Banking Modal** (`enhanced-banking-modal.tsx`)
   - Saves data under `vendor.bankingInfo` object
   - Contains three tabs: Bank Account, Payment Methods, Tax & Compliance
   - Includes early payment discount settings, payment terms, and business registration info

### Important UI Implementation Notes

#### Styled Components with MUI
- When creating styled MUI components with custom props, use the `$` prefix to avoid prop forwarding issues:
  ```typescript
  const StyledButton = styled(Button)<{ $variant: 'primary' | 'secondary' }>(({ $variant }) => ({
    // styles based on $variant
  }));
  // Usage: <StyledButton $variant="primary">
  ```
- Use `shouldForwardProp` when needed to prevent custom props from being passed to DOM

#### Modal Data Display Pattern
- Each modal saves data to a specific nested object on the vendor
- The vendor details page must read from these nested objects, not from vendor root
- Always provide sensible defaults when data hasn't been configured yet
- Example: `vendor?.shippingZones?.zones || defaultZones`

#### Toggle Component Pattern
- Custom toggle switches should have proper layout separation between label and switch
- Use flexbox with `justifyContent: 'space-between'` to prevent overlap
- Toggle switches should be implemented as separate components, not using MUI's FormControlLabel

## Recent Updates

- **Vendor CRM System**: Full vendor management with document handling
- **Order Protection**: Insurance and handling cost calculations
- **AP Invoice Processing**: OCR and automated invoice matching
- **Returns Management**: Shopify return sync and processing
- **Queue Management**: Bull board UI for monitoring async jobs
- **Document Management System**: 
  - Complete document lifecycle (upload, view, share, permissions)
  - Groups management for team-based sharing
  - Activity tracking and audit trails
  - Document status workflow (pending → signed/verified/rejected/expired)
  - Real-time updates and version control
  - Algolia-powered search with faceted filtering
- **Email System Architecture**:
  - Complete email platform with SendGrid integration
  - Templates, workflows, analytics, and history tracking
  - CRITICAL: All business logic in operations service
  - Admin app provides UI only at `/admin/email`
  - Microservices pattern strictly enforced
- **Vendor Expected Ship Date System**:
  - Editable UI with inline date picker on operations page
  - Manual override protection from Google Sheets sync
  - Enhanced date parsing for both American and international formats
  - Proper red/green date highlighting for all date columns
  - Visual indicators showing date source (manual vs imported)
  - Full audit trail for date changes
- **Email Notification System**: 
  - **CRITICAL**: Email system moved from admin to operations service following microservices architecture
  - Complete email management with SendGrid integration in operations service
  - Admin UI only handles presentation via operations API calls
  - Email templates, workflows, history, and analytics all processed by operations
  - TypeORM entities and PostgreSQL storage in operations
  - Webhook processing and event tracking handled by operations
- **Vendor Event Tracking System**:
  - Complete event history tracking for all vendor activities
  - PostgreSQL storage via TypeORM `VendorEvent` entity
  - Comprehensive event types: status changes, emails sent, documents, notes, etc.
  - Integration with email system for tracking introduction emails
  - Timeline UI component in vendor detail page History tab
  - Event emitter integration for real-time updates
- **Shipping Invoice Management**:
  - Firestore-based storage following vendor invoice pattern
  - CSV bulk upload with auto-linking to vendor orders/invoices
  - Currency detection for €, $, £ in CSV parsing
  - Located at `/admin/shipping-invoices` with full CRUD operations
  - **IMPORTANT**: vendorId and vendorName are REQUIRED fields, never null
  - Auto-generates invoice numbers in format: VendorName-Ship-YYYY-MM-DD-#
  - Enhanced auto-linking searches by both invoice number AND vendor order number
- **Vendor Invoices Page** (`/admin/vendor-invoices`):
  - **CRITICAL**: Uses `/api/vendor-invoices` endpoint (NOT `/api/admin/vendor-invoices`)
  - Must wait for user authentication before fetching data (uses `useUser` hook)
  - Response handling: Supports both `result.data` and direct `result` formats
  - Table structure (10 columns, no File column):
    - Invoice Number (clickable, opens details modal)
    - Vendor
    - Date (formatted as MMM DD, YYYY)
    - Order Numbers (shows both Vendor and Master orders)
    - AP Invoice (clickable chip, navigates to AP invoice)
    - Amount (right aligned)
    - Discrepancy (right aligned with color coding)
    - Status (chip with color based on status)
    - Uploaded (email and date formatted as MMM DD, h:mm A)
    - Actions (centered, eye icon for details)
  - **UI Implementation Notes**:
    - NEVER use `tableLayout: 'fixed'` with column widths - causes misalignment
    - Use natural table layout (`<Table>` without layout props)
    - Import and use `dayjs` for date formatting in Uploaded column
    - Requires helper functions: `getDiscrepancyColor`, `getStatusColor`
- **AP Invoice System** (`/admin/vendor-payments` and `/api/ap-invoices`):
  - **Purpose**: Creates batch payment invoices for vendors combining multiple sources
  - **Can include line items from**:
    - Orders (selected individually with checkboxes)
    - Vendor Invoices (with their associated orders)
    - Shipping Invoices (individual shipping costs as line items)
  - **Backend Processing** (`/api/ap-invoices/route.ts`):
    - Accepts `orderIds`, `vendorInvoiceIds`, and `shippingInvoiceIds` arrays
    - Fetches shipping invoices from Algolia index `firebase_shippinginvoices`
    - Adds shipping invoice amounts to total shipping costs
    - Marks linked shipping invoices with `apInvoiceId` and `paymentStatus: 'processing'`
  - **Frontend Implementation** (`vendor-payment-dashboard-v2.tsx`):
    - Shipping invoices tab shows checkboxes for selection (disabled if already in AP invoice)
    - "Generate AP Invoice" button shows count of selected items
    - AP Invoice dialog calculates totals from all sources
    - Clears selections and reloads data after successful creation
  - **Important**: When user says "add shipping invoice line items to AP invoice" they mean including individual shipping costs as part of the AP invoice total, NOT linking entire shipping invoices to AP invoices

## Git Commit Guidelines

- **Never put Claude in commit messages**
- **Each subdirectory is a separate Git repository**
- **Always `cd` into the project directory before git operations**
- **Check your current directory with `pwd` before committing**
- **Use descriptive commit messages focusing on what changed**
```

## Multi-Repository Architecture Analysis

### Repository Structure Pattern
This Coutr project root contains **three distinct Git repositories** that work together as a cohesive e-commerce platform:

```
/coutr/
├── admin/           # Next.js 14 admin dashboard (separate git repo)
├── operations/      # Node.js microservices backend (separate git repo) 
├── shopify/         # Liquid theme for storefront (separate git repo)
└── firebase-catalog/ # Legacy data sync service (JavaScript/Node.js)
```

### Architectural Design Patterns

#### 1. **Microservices Architecture**
- **Admin Dashboard**: Pure presentation layer (Next.js 14.1.0)
- **Operations Service**: Business logic and data orchestration (Express + TypeScript)
- **Shopify Theme**: Customer-facing e-commerce frontend (Liquid templates)
- **Firebase Catalog**: Legacy data synchronization and import service

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
Operations service uses InversifyJS container with decorators:
```typescript
@injectable()
export class VendorService {
  constructor(
    @inject(TYPES.FirestoreService) private firestore: FirestoreService,
    @inject(TYPES.Logger) private logger: Logger
  ) {}
}
```
All services registered as singletons in centralized container configuration.

#### 6. **Repository/Service Pattern**
- Services encapsulate business logic
- Database operations abstracted through repository pattern
- Multiple data sources (PostgreSQL, Firestore, Algolia) with consistent interfaces
- Service-to-service communication through well-defined APIs

### Technology Stack Analysis

#### **Admin Dashboard Stack**
- **Frontend**: Next.js 14.1.0, React 18.2.0, TypeScript 5.3.3
- **UI Framework**: Material-UI 5.15.11 with custom theming
- **State Management**: React Context API, React Hook Form 7.50.1
- **Authentication**: Multi-strategy (Firebase, Auth0, Cognito, Supabase, Custom)
- **Rich Text**: TipTap 2.5.8 editor with ProseMirror
- **File Handling**: React Dropzone, AWS S3 integration
- **Search**: Algolia React InstantSearch
- **Charts**: Recharts 3.1.0
- **PDF Generation**: React-PDF 3.3.8
- **Maps**: React Map GL (Mapbox)
- **Development**: ESLint 9.16.0, Prettier, Jest, TypeScript

#### **Operations Service Stack**
- **Runtime**: Node.js with Express 5.1.0, TypeScript 5.8.3
- **Dependency Injection**: InversifyJS 7.6.1 with reflect-metadata
- **Database**: PostgreSQL with TypeORM 0.3.25 for relational data
- **NoSQL**: Firebase Admin 13.4.0 for Firestore document storage
- **Search**: Algolia 4.24.0 for indexing and search
- **Queue**: Bull 4.16.5 with Redis (ioredis 5.6.1)
- **Logging**: Pino 9.7.0 with structured logging and Syslog support
- **Validation**: class-validator 0.14.2, class-transformer 0.5.1
- **HTTP Client**: Native fetch, Axios for external APIs
- **File Processing**: Multer 2.0.2, Google Cloud Vision 5.3.1 for OCR
- **Email**: SendGrid 8.1.5 integration
- **Scheduling**: node-cron 4.2.1 for background tasks
- **Monitoring**: Bull Board 6.11.1 for queue dashboard

#### **Shopify Theme Stack**
- **Templating**: Liquid templates (Shopify Prestige v10.7.0)
- **JavaScript**: ES6 modules, Custom Elements (Web Components)
- **Styling**: Utility CSS, no build process
- **Localization**: 20+ language files (JSON)
- **Features**: Mega menu system, product variants, size sorting
- **Tools**: Shopify CLI for development and deployment

#### **Firebase Catalog Stack** (Legacy Service)
- **Runtime**: Node.js with vanilla JavaScript
- **Database**: Firebase Admin 12.1.1
- **APIs**: Multiple e-commerce integrations (Shopify, Medusa, etc.)
- **AI**: OpenAI 4.50.0 for content generation
- **Scheduling**: node-cron 4.0.7
- **Data Processing**: CSV parsing, Google Sheets API

### Key Architectural Decisions

#### 1. **Data Architecture Strategy**
- **PostgreSQL**: Order sync, audit logs, relational data requiring ACID transactions
- **Firestore**: Vendor configurations, business documents, flexible schema needs  
- **Algolia**: Search indices for listing operations (DO NOT modify index names)
- **Separation Pattern**: Use Algolia for listing/searching, Firestore for CRUD operations

#### 2. **Authentication Architecture**
Multi-strategy authentication supporting:
- Firebase (current production)
- Auth0 (enterprise)
- AWS Cognito (scalable)
- Supabase (open-source alternative)
- Custom implementation
Strategy selected via `NEXT_PUBLIC_AUTH_STRATEGY` environment variable.

#### 3. **Route Architecture**
Clear separation between admin and customer routes:
- `/admin/*` - Internal administrative functions (superadmin, admin roles)
- `/dashboard/*` - Vendor portal and customer dashboard
- API routes follow RESTful conventions with proper HTTP verbs

#### 4. **Microservices Communication**
- Admin app → Operations service via proxy API routes
- Environment-driven configuration (`OPERATIONS_API_URL`)
- JWT token-based authentication between services
- Operations service as single source of truth for business logic

#### 5. **Queue Architecture**
Bull queues with Redis for:
- Webhook processing (non-blocking)
- Email workflow execution
- Long-running operations (OCR, sync jobs)
- Retry policies and dead letter queues
- Visual monitoring through Bull Board

#### 6. **Error Handling Strategy**
- Structured logging with Pino
- Error boundaries in React components
- Global error handlers in Express middleware
- Syslog integration for production monitoring (Papertrail)
- Comprehensive error tracking with context

### Integration Patterns

#### **External System Integrations**
1. **Shopify Integration**: GraphQL/REST APIs, webhook handling, real-time sync
2. **Email System**: SendGrid with webhook processing, template management
3. **Search**: Algolia indices with automatic synchronization
4. **File Storage**: AWS S3 with pre-signed URLs
5. **AI Services**: Google Cloud Vision (OCR), OpenAI (content generation)
6. **Maps**: Mapbox for geographical features
7. **Payment Processing**: Integrated through Shopify
8. **Analytics**: Custom implementation with Recharts visualization

#### **Data Synchronization Patterns**
- **Real-time**: Shopify webhooks → Operations service → Database updates
- **Scheduled**: Google Sheets sync, vendor data imports, cleanup jobs
- **On-demand**: Manual sync triggers, OCR processing, report generation
- **Event-driven**: Email workflows, audit logging, notification systems

### Testing and Development Patterns

#### **Development Workflow**
1. Each repository has independent development commands
2. Docker/container support for consistent environments
3. Environment-specific configurations (.env files)
4. Database migrations with rollback support (TypeORM)
5. Hot reloading for development efficiency

#### **Code Quality Patterns**
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with consistent configuration
- **Type Safety**: Strict TypeScript across projects
- **Testing**: Jest with React Testing Library for frontend
- **Git Hooks**: Pre-commit linting and formatting

#### **Deployment Patterns**
- Independent deployment per repository
- Environment variable configuration
- Database migration automation
- Queue job monitoring in production
- Structured logging for debugging

### Notable Implementation Details

#### **Email Workflow Architecture**
- Complete event-driven email system with 25+ business events
- EventEmitter pattern with automatic workflow registration
- Event persistence for audit trails and replay capability
- Webhook delivery system for external integrations
- Production-ready with retry policies and error handling

#### **Vendor Management System**
- Complex nested data structures (costShipping, shippingZones, bankingInfo)
- Self-contained modal components with embedded data management
- Real-time synchronization between admin UI and operations service
- Deep merge operations for preserving nested configurations

#### **Financial Calculations Engine**
- Sophisticated business logic for COGS, margins, shipping costs
- Double-counting prevention for shipping invoices
- Multi-currency support with proper formatting
- Audit trails for all financial operations

#### **Document Management System**
- Complete lifecycle: upload, OCR, approval, sharing, expiration
- Permission-based sharing with granular access control
- Activity tracking and audit trails
- Integration with Google Cloud Vision for intelligent processing

#### **Integration System**
- Google Sheets bidirectional synchronization
- Date format handling (DD/MM/YYYY priority)
- Manual override protection for user changes
- Flexible data parsing with multiple format support

## Developer Workflow Memories

- Always look at how admin talks to operations app before coding anything.
- add a rule that from now on, any data put into firestore must also have it created in postgres