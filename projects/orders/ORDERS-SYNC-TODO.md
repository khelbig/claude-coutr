# Orders Sync from Firestore to PostgreSQL - Implementation Plan

## Overview
Implement a comprehensive order synchronization system that listens to Firestore Orders collection changes and syncs them to PostgreSQL. This will enable proper customer-order relationships and allow the customer detail page to show real order history.

## Current State
- ✅ Webhooks from Shopify → Firestore Orders collection (already working)
- ✅ Comprehensive orders schema created in PostgreSQL with 15 normalized tables
- ✅ Customer-order relationship established via foreign key
- ❌ No Firestore → PostgreSQL sync for orders (entities and sync service needed)
- ❌ Customer detail page can't show real orders (needs API implementation)

## Phase 1: Database Schema Design

### 1.1 Analyze Firestore Order Structure
- [x] Review sample Firestore order document
- [x] Identify all data types and nested structures
- [x] Map Firestore fields to PostgreSQL columns
- [x] Identify relationships needed

### 1.2 Create/Update PostgreSQL Tables
- [x] Update `orders` table with all missing fields from Firestore
  - [x] Add customer relationship fields (customer_id, customer_email)
  - [x] Add financial fields (current_total_price, current_subtotal_price, etc.)
  - [x] Add discount fields (discount_applications, discount_codes)
  - [x] Add tax fields (tax_lines, taxes_included)
  - [x] Add payment fields (payment_gateway_names, payment_terms)
  - [x] Add fulfillment tracking fields
  - [x] Add return/refund tracking fields

- [x] Create `order_line_items` table (enhance existing)
  - [x] Add all fields from Firestore line_items array
  - [x] Add vendor fields (supplier, supplier_sku, supply_price)
  - [x] Add handling cost fields
  - [x] Add tax_lines as proper normalized fields
  - [x] Add discount_allocations as proper normalized fields
  - [x] Add properties array as JSONB

- [x] Create `order_addresses` table
  - [x] Billing address
  - [x] Shipping address
  - [x] Customer default address

- [x] Create `order_shipping_lines` table
  - [x] Carrier information
  - [x] Shipping costs and discounts
  - [x] Tax lines for shipping

- [x] Create `order_refunds` table
  - [x] Refund amounts and reasons
  - [x] Refund line items
  - [x] Refund transactions

- [x] Create `order_returns` table
  - [x] Return line items
  - [x] Return status
  - [x] Return shipping

- [x] Create `order_discount_applications` table
  - [x] Discount type and value
  - [x] Target selection
  - [x] Allocation method

- [x] Create `order_tax_lines` table
  - [x] Tax rates and amounts
  - [x] Tax titles and zones

- [x] Create `order_transactions` table for payment tracking
- [x] Create `order_note_attributes` table for custom order attributes

### 1.3 Create Database Migrations
- [x] Generate TypeORM migration for orders table updates
- [x] Generate migrations for new tables
- [x] Add indexes for performance
  - [x] Index on customer_email
  - [x] Index on customer_id
  - [x] Index on order_number
  - [x] Index on created_at
  - [x] Index on financial_status
  - [x] Index on fulfillment_status
  - [x] Additional indexes on all foreign keys and commonly queried fields

## Phase 2: Entity Models

### 2.1 Update TypeORM Entities
- [x] Update `Order` entity with all new fields
- [x] Update `OrderLineItem` entity
- [x] Create `OrderAddress` entity
- [x] Create `OrderShippingLine` entity
- [x] Create `OrderRefund` entity
- [x] Create `OrderReturn` entity
- [x] Create `OrderDiscountApplication` entity
- [x] Create `OrderTaxLine` entity
- [x] Create `OrderTransaction` entity
- [x] Create `OrderNoteAttribute` entity
- [x] Create `OrderRefundLineItem` entity
- [x] Create `OrderReturnLineItem` entity
- [x] Create `OrderFulfillment` entity
- [x] Create `OrderFulfillmentLineItem` entity
- [x] Add proper relationships between entities

### 2.2 Create DTOs
- [x] Use direct Firestore data transformation in sync service
- [x] Implement type-safe data mapping
- [x] Add comprehensive field validation
- [x] Handle all data types properly

## Phase 3: Firestore Listener Service

### 3.1 Create Firestore Order Listener
- [x] Create `FirestoreOrderListenerService` in operations/src/modules/orders/
- [x] Implement real-time listener for Orders collection
- [x] Handle onCreate events
- [x] Handle onUpdate events
- [x] Handle onDelete events
- [x] Implement error handling and retry logic
- [x] Add logging for all operations

### 3.2 Data Transformation
- [x] Create comprehensive data transformation in OrderSyncService
- [x] Map Firestore document structure to PostgreSQL entities
- [x] Handle nested objects (customer, addresses, line_items)
- [x] Handle arrays (line_items, shipping_lines, discount_applications)
- [x] Handle different data types (timestamps, numbers, strings)
- [x] Handle null/undefined values properly

### 3.3 Customer Linkage
- [x] Create logic to link orders to customers
- [x] Match by email first
- [x] Create customer record placeholder (TODO: implement full customer creation)
- [x] Update customer metrics when order is created/updated
- [x] Handle guest checkouts vs registered customers

## Phase 4: Synchronization Logic

### 4.1 Order Sync Service
- [x] Create `OrderSyncService` with comprehensive methods:
  - [x] `syncOrderFromFirestore(firestoreOrder)`
  - [x] `createOrUpdateOrder(orderData)`
  - [x] `syncLineItems(orderId, lineItems)`
  - [x] `syncAddresses(orderId, addresses)`
  - [x] `syncShippingLines(orderId, shippingLines)`
  - [x] `syncDiscountApplications(orderId, discounts)`
  - [x] `syncDiscountCodes(orderId, codes)`
  - [x] `syncTaxLines(orderId, taxLines)`
  - [x] `syncTransactions(orderId, transactions)`
  - [x] `syncRefunds(orderId, refunds)`
  - [x] `syncReturns(orderId, returns)`
  - [x] `syncFulfillments(orderId, fulfillments)`

### 4.2 Batch Processing
- [x] Implement batch processing for initial sync
- [x] Create `performInitialSync` method with batching
- [x] Add progress tracking and logging
- [x] Handle failures and retries via BullMQ
- [x] Create pagination system for large datasets

### 4.3 Real-time Processing
- [x] Queue order sync jobs using BullMQ
- [x] Process orders asynchronously with OrderSyncQueueProcessor
- [x] Implement rate limiting (10 jobs/sec, concurrency 5)
- [x] Add comprehensive monitoring and logging

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