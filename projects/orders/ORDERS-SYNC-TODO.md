# Orders Sync from Firestore to PostgreSQL - Implementation Plan

## Overview
Implement a comprehensive order synchronization system that listens to Firestore Orders collection changes and syncs them to PostgreSQL. This will enable proper customer-order relationships and allow the customer detail page to show real order history.

## Current State
- ✅ Webhooks from Shopify → Firestore Orders collection (already working)
- ✅ Basic Order entity exists in PostgreSQL but incomplete
- ❌ No Firestore → PostgreSQL sync for orders
- ❌ No customer-order relationship in PostgreSQL
- ❌ Customer detail page can't show real orders

## Phase 1: Database Schema Design

### 1.1 Analyze Firestore Order Structure
- [x] Review sample Firestore order document
- [ ] Identify all data types and nested structures
- [ ] Map Firestore fields to PostgreSQL columns
- [ ] Identify relationships needed

### 1.2 Create/Update PostgreSQL Tables
- [ ] Update `orders` table with all missing fields from Firestore
  - [ ] Add customer relationship fields (customer_id, customer_email)
  - [ ] Add financial fields (current_total_price, current_subtotal_price, etc.)
  - [ ] Add discount fields (discount_applications, discount_codes)
  - [ ] Add tax fields (tax_lines, taxes_included)
  - [ ] Add payment fields (payment_gateway_names, payment_terms)
  - [ ] Add fulfillment tracking fields
  - [ ] Add return/refund tracking fields

- [ ] Create `order_line_items` table (enhance existing)
  - [ ] Add all fields from Firestore line_items array
  - [ ] Add vendor fields (supplier, supplier_sku, supply_price)
  - [ ] Add handling cost fields
  - [ ] Add tax_lines as JSONB
  - [ ] Add discount_allocations as JSONB
  - [ ] Add properties array as JSONB

- [ ] Create `order_addresses` table
  - [ ] Billing address
  - [ ] Shipping address
  - [ ] Customer default address

- [ ] Create `order_shipping_lines` table
  - [ ] Carrier information
  - [ ] Shipping costs and discounts
  - [ ] Tax lines for shipping

- [ ] Create `order_refunds` table
  - [ ] Refund amounts and reasons
  - [ ] Refund line items
  - [ ] Refund transactions

- [ ] Create `order_returns` table
  - [ ] Return line items
  - [ ] Return status
  - [ ] Return shipping

- [ ] Create `order_discount_applications` table
  - [ ] Discount type and value
  - [ ] Target selection
  - [ ] Allocation method

- [ ] Create `order_tax_lines` table
  - [ ] Tax rates and amounts
  - [ ] Tax titles and zones

### 1.3 Create Database Migrations
- [ ] Generate TypeORM migration for orders table updates
- [ ] Generate migrations for new tables
- [ ] Add indexes for performance
  - [ ] Index on customer_email
  - [ ] Index on customer_id
  - [ ] Index on order_number
  - [ ] Index on created_at
  - [ ] Index on financial_status
  - [ ] Index on fulfillment_status

## Phase 2: Entity Models

### 2.1 Update TypeORM Entities
- [ ] Update `Order` entity with all new fields
- [ ] Update `OrderLineItem` entity
- [ ] Create `OrderAddress` entity
- [ ] Create `OrderShippingLine` entity
- [ ] Create `OrderRefund` entity
- [ ] Create `OrderReturn` entity
- [ ] Create `OrderDiscountApplication` entity
- [ ] Create `OrderTaxLine` entity
- [ ] Add proper relationships between entities

### 2.2 Create DTOs
- [ ] Create FirestoreOrderDTO for incoming data
- [ ] Create OrderCreateDTO for database inserts
- [ ] Create OrderUpdateDTO for updates
- [ ] Add validation decorators

## Phase 3: Firestore Listener Service

### 3.1 Create Firestore Order Listener
- [ ] Create `FirestoreOrderListenerService` in operations/src/modules/orders/
- [ ] Implement real-time listener for Orders collection
- [ ] Handle onCreate events
- [ ] Handle onUpdate events
- [ ] Handle onDelete events
- [ ] Implement error handling and retry logic
- [ ] Add logging for all operations

### 3.2 Data Transformation
- [ ] Create `FirestoreOrderTransformer` service
- [ ] Map Firestore document structure to PostgreSQL entities
- [ ] Handle nested objects (customer, addresses, line_items)
- [ ] Handle arrays (line_items, shipping_lines, discount_applications)
- [ ] Handle different data types (timestamps, numbers, strings)
- [ ] Handle null/undefined values properly

### 3.3 Customer Linkage
- [ ] Create logic to link orders to customers
- [ ] Match by email first
- [ ] Create customer record if doesn't exist
- [ ] Update customer metrics when order is created/updated
- [ ] Handle guest checkouts vs registered customers

## Phase 4: Synchronization Logic

### 4.1 Order Sync Service
- [ ] Create `OrderSyncService` with methods:
  - [ ] `syncOrderFromFirestore(firestoreOrder)`
  - [ ] `createOrUpdateOrder(orderData)`
  - [ ] `syncLineItems(orderId, lineItems)`
  - [ ] `syncAddresses(orderId, addresses)`
  - [ ] `syncShippingLines(orderId, shippingLines)`
  - [ ] `syncDiscounts(orderId, discounts)`
  - [ ] `syncTaxLines(orderId, taxLines)`

### 4.2 Batch Processing
- [ ] Implement batch processing for initial sync
- [ ] Create script to sync all existing Firestore orders
- [ ] Add progress tracking and logging
- [ ] Handle failures and retries
- [ ] Create checkpoint system for resuming

### 4.3 Real-time Processing
- [ ] Queue order sync jobs using Bull/BullMQ
- [ ] Process orders asynchronously
- [ ] Implement rate limiting
- [ ] Add monitoring and alerting

## Phase 5: Data Integrity

### 5.1 Validation
- [ ] Validate all required fields
- [ ] Validate data types and formats
- [ ] Validate relationships
- [ ] Handle missing or malformed data

### 5.2 Error Handling
- [ ] Log all errors with context
- [ ] Create error recovery mechanisms
- [ ] Implement dead letter queue for failed syncs
- [ ] Create admin interface to review failed syncs

### 5.3 Data Consistency
- [ ] Implement transaction support
- [ ] Ensure atomic updates
- [ ] Handle concurrent updates
- [ ] Implement optimistic locking

## Phase 6: Customer Integration

### 6.1 Customer-Order Relationship
- [ ] Add foreign key from orders to customers
- [ ] Update customer metrics on order changes
- [ ] Calculate customer lifetime value
- [ ] Track order frequency and recency

### 6.2 Customer Activity Tracking
- [ ] Create activity records for order events
- [ ] Track order placed, fulfilled, delivered
- [ ] Track refunds and returns
- [ ] Update last_active_at timestamp

### 6.3 Customer Service Methods
- [ ] Update `getCustomerOrders` to query PostgreSQL
- [ ] Add order statistics to customer data
- [ ] Add order timeline to activities
- [ ] Calculate customer segments based on orders

## Phase 7: API Updates

### 7.1 Orders API
- [ ] Create comprehensive orders API in operations
- [ ] Add endpoints for:
  - [ ] GET /api/orders - List orders with filters
  - [ ] GET /api/orders/:id - Get single order
  - [ ] GET /api/customers/:id/orders - Get customer orders
  - [ ] GET /api/orders/:id/line-items - Get order line items
  - [ ] PUT /api/orders/:id - Update order (limited fields)

### 7.2 Customer API Updates
- [ ] Update customer endpoints to include order data
- [ ] Add order count to customer list
- [ ] Add recent orders to customer detail
- [ ] Add order-based filtering

## Phase 8: Testing

### 8.1 Unit Tests
- [ ] Test Firestore listener
- [ ] Test data transformation
- [ ] Test sync service methods
- [ ] Test error handling

### 8.2 Integration Tests
- [ ] Test full sync flow
- [ ] Test customer linkage
- [ ] Test concurrent updates
- [ ] Test error recovery

### 8.3 Performance Tests
- [ ] Test with large order volumes
- [ ] Test query performance
- [ ] Optimize slow queries
- [ ] Add missing indexes

## Phase 9: Monitoring

### 9.1 Logging
- [ ] Add structured logging for all operations
- [ ] Log sync statistics
- [ ] Log performance metrics
- [ ] Log errors with full context

### 9.2 Metrics
- [ ] Track sync lag time
- [ ] Track success/failure rates
- [ ] Track processing time
- [ ] Track queue depth

### 9.3 Alerting
- [ ] Alert on sync failures
- [ ] Alert on high lag time
- [ ] Alert on queue buildup
- [ ] Alert on data inconsistencies

## Phase 10: Documentation

### 10.1 Technical Documentation
- [ ] Document database schema
- [ ] Document sync architecture
- [ ] Document API endpoints
- [ ] Document error codes

### 10.2 Operational Documentation
- [ ] Create runbooks for common issues
- [ ] Document monitoring procedures
- [ ] Document recovery procedures
- [ ] Create troubleshooting guide

## Implementation Order

1. **Week 1**: Database Schema & Entities (Phase 1-2)
2. **Week 2**: Firestore Listener & Transformation (Phase 3)
3. **Week 3**: Sync Logic & Batch Processing (Phase 4)
4. **Week 4**: Customer Integration & API (Phase 6-7)
5. **Week 5**: Testing & Monitoring (Phase 8-9)
6. **Week 6**: Documentation & Deployment (Phase 10)

## Success Criteria

- [ ] All Firestore orders are synced to PostgreSQL
- [ ] Real-time sync lag < 5 seconds
- [ ] Customer detail page shows real orders
- [ ] No data loss during sync
- [ ] System handles 1000+ orders/hour
- [ ] Error rate < 0.1%
- [ ] Full audit trail of all changes

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during sync | High | Implement idempotent operations, use transactions |
| Performance degradation | Medium | Add indexes, use batch processing, implement caching |
| Schema changes in Firestore | Medium | Version schema, add validation, monitor for changes |
| Customer matching failures | Medium | Multiple matching strategies, manual review queue |
| Sync lag during high volume | Low | Scale workers, implement priority queues |

## Dependencies

- Firestore Admin SDK
- TypeORM for PostgreSQL
- Bull/BullMQ for queue processing
- Customer entity must be properly implemented
- Proper error tracking system (Sentry/Papertrail)

## Notes

- This is a critical system that affects financial reporting
- Must maintain 100% data parity with Firestore
- Consider GDPR compliance for customer data
- Plan for future Shopify API v2024-01 migration
- Consider implementing event sourcing for audit trail