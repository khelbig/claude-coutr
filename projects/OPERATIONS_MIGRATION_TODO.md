# Operations Dashboard Migration TODO

## Overview
Migrate the operations dashboard from admin app (where it violates microservices architecture) to operations service, making admin a pure presentation layer.

## Phase 1: Create Operations Service Infrastructure

### 1.1 Create Operations Module Structure
- [ ] Create `/operations/src/modules/operations/` directory
- [ ] Create `/operations/src/modules/operations/interfaces/` directory
- [ ] Create `/operations/src/modules/operations/services/` directory
- [ ] Create `/operations/src/modules/operations/controllers/` directory
- [ ] Create `/operations/src/modules/operations/routes/` directory

### 1.2 Define TypeScript Interfaces
- [ ] Create `operations-dashboard.interface.ts` with:
  - [ ] `OperationsDashboardFilter` interface (page, limit, search, vendor, status, etc.)
  - [ ] `OperationsLineItem` interface (complete line item with all calculated fields)
  - [ ] `OperationsOrder` interface (transformed order data)
  - [ ] `SLAStatus` enum ('on-time' | 'at-risk' | 'delayed')
  - [ ] `VendorConfiguration` interface (processingTime, shipmentTime, cutoffTime)
  - [ ] `OperationsDashboardResponse` interface (orders, summary, vendors, pagination)

## Phase 2: Implement Business Logic Service

### 2.1 Create OperationsDashboardService
- [ ] Create `operations-dashboard.service.ts`
- [ ] Inject dependencies:
  - [ ] AlgoliaService for search
  - [ ] FirestoreService for vendor configs
  - [ ] Logger for debugging

### 2.2 Implement Core Business Logic
- [ ] Create `fetchVendorConfigurations()` method
  - [ ] Query Firestore for actual vendor configs
  - [ ] Return map of vendor ID to configuration
  - [ ] Include defaults for missing vendors

- [ ] Create `calculateSLAStatus()` method
  - [ ] Input: orderDate, expectedShipDate, actualShipDate
  - [ ] Calculate business days difference
  - [ ] Return SLA status and days outside SLA

- [ ] Create `calculateExpectedDates()` method
  - [ ] Input: orderDate, vendor config
  - [ ] Handle cutoff time logic
  - [ ] Calculate business days (skip weekends)
  - [ ] Return expectedShipDate and expectedDeliveryDate

- [ ] Create `transformLineItemToOperation()` method
  - [ ] Transform raw line item to operations row
  - [ ] Apply all calculations
  - [ ] Include vendor invoice data
  - [ ] Include AP invoice data
  - [ ] Calculate financial metrics

### 2.3 Implement Main Service Method
- [ ] Create `getOperationsDashboard()` method
  - [ ] Search Algolia shopify_orders index
  - [ ] Fetch vendor configurations from Firestore
  - [ ] Fetch shipping invoices from firebase_shippinginvoices
  - [ ] Transform each line item with business logic
  - [ ] Calculate summary statistics
  - [ ] Return fully transformed data

## Phase 3: Create Controller and Routes

### 3.1 Create OperationsDashboardController
- [ ] Create `operations-dashboard.controller.ts`
- [ ] Implement `getDashboard()` method
  - [ ] Parse request query parameters
  - [ ] Call service method
  - [ ] Return response

### 3.2 Create Routes
- [ ] Create `operations-dashboard.routes.ts`
- [ ] Define GET `/api/operations/dashboard` route
- [ ] Add authentication middleware
- [ ] Add role checking (admin/superadmin only)

### 3.3 Register Routes in App
- [ ] Import routes in `/operations/src/app.ts`
- [ ] Register routes with Express app
- [ ] Add to InversifyJS container

## Phase 4: Vendor Expected Ship Date Service

### 4.1 Create Update Service Method
- [ ] Add `updateVendorExpectedShipDate()` to service
  - [ ] Update Algolia index
  - [ ] Create audit trail in Firestore
  - [ ] Set manuallySet flag
  - [ ] Update all line items for the order

### 4.2 Create Controller Method
- [ ] Add `updateExpectedDate()` to controller
  - [ ] Validate date format
  - [ ] Check user permissions
  - [ ] Call service method
  - [ ] Return success response

### 4.3 Add Route
- [ ] Define PUT `/api/operations/orders/:orderId/vendor-expected-date`
- [ ] Add to operations dashboard routes

## Phase 5: Update Admin Frontend

### 5.1 Create New API Proxy Route
- [ ] Create `/admin/src/app/api/operations/dashboard/route.ts`
  - [ ] Verify authentication
  - [ ] Check admin/superadmin role
  - [ ] Proxy to operations service
  - [ ] Pass through all query parameters

### 5.2 Remove Business Logic from Frontend
- [ ] Update `/admin/src/app/admin/operations/page.tsx`
  - [ ] Remove SLA calculation logic
  - [ ] Remove expected date calculations
  - [ ] Remove date comparison logic
  - [ ] Remove hardcoded vendor configs
  - [ ] Remove financial calculations
  - [ ] Keep only UI state management

### 5.3 Update Data Fetching
- [ ] Change fetch URL to `/api/operations/dashboard`
- [ ] Remove data transformation code
- [ ] Use pre-calculated values from API
- [ ] Update TypeScript interfaces to match API response

### 5.4 Update Vendor Expected Date Update
- [ ] Create `/admin/src/app/api/operations/orders/[orderId]/vendor-expected-date/route.ts`
- [ ] Make it a pure proxy to operations service
- [ ] Remove all business logic
- [ ] Just pass through the request

## Phase 6: Testing and Validation

### 6.1 Test Operations Service
- [ ] Test with various filter combinations
- [ ] Verify SLA calculations are correct
- [ ] Confirm vendor configs are fetched properly
- [ ] Check financial calculations
- [ ] Validate date calculations

### 6.2 Test Admin Frontend
- [ ] Verify data displays correctly
- [ ] Test all filters work
- [ ] Confirm vendor expected date updates work
- [ ] Check loading states
- [ ] Verify error handling

### 6.3 Performance Testing
- [ ] Compare load times before/after migration
- [ ] Check if calculations are faster server-side
- [ ] Monitor memory usage
- [ ] Test with large datasets

## Phase 7: Cleanup and Documentation

### 7.1 Remove Old Code
- [ ] Delete `/admin/src/app/api/admin/orders/[orderId]/vendor-expected-date/route.ts`
- [ ] Remove unused imports from operations page
- [ ] Clean up any temporary code

### 7.2 Update Documentation
- [ ] Update CLAUDE.md in operations repo
- [ ] Update CLAUDE.md in admin repo
- [ ] Document new API endpoints
- [ ] Add JSDoc comments to new services

### 7.3 Update Error Handling
- [ ] Add proper error messages
- [ ] Implement retry logic where needed
- [ ] Add logging for debugging

## Success Criteria

✅ Migration is complete when:
1. Admin app has NO business logic for operations dashboard
2. All calculations happen in operations service
3. Vendor configs are fetched from Firestore (not hardcoded)
4. Admin app is a pure presentation layer
5. API responses include all pre-calculated data
6. Performance is same or better than before
7. All existing functionality still works

## Notes

- Each phase should be tested before moving to the next
- Commit after each major step for easy rollback
- Keep the old implementation until new one is fully tested
- Consider feature flag for gradual rollout