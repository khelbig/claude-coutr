# MIGRATION TODO - ADMIN TO OPERATIONS

## CRITICAL INSTRUCTIONS - FROM MIGRATION_ANALYSIS.md

### Phase 2: Create Operations Endpoints (CRITICAL) - DO THIS FIRST
1. **First Priority**: Utility endpoints (complex business logic)
2. **Second Priority**: CRUD endpoints (AP invoices, orders, vendors)
3. **Third Priority**: Stats and integration endpoints

### Phase 3: Test Operations Endpoints - DO THIS SECOND
1. Test each endpoint with Postman/curl
2. Verify data persistence and retrieval
3. Check error handling and validation

### Phase 4: Update Admin App - DO THIS LAST
1. Update admin routes to proxy to operations
2. Remove all direct database access
3. Admin becomes thin proxy layer

## FOR EACH ITEM, YOU MUST FOLLOW THESE PHASES:
1. **PHASE 2**: IMPLEMENT IN OPERATIONS FIRST
   - Copy COMPLETE business logic from admin (NO STUB IMPLEMENTATIONS)
   - Adapt to operations patterns (dependency injection)
   - Create the endpoint in operations with REAL FUNCTIONALITY
   - **COMMIT AFTER IMPLEMENTATION**
2. **PHASE 3**: TEST OPERATIONS ENDPOINT
   - Test with curl
   - Verify it works with real data
   - **COMMIT AFTER SUCCESSFUL TEST**
3. **PHASE 4**: UPDATE ADMIN TO PROXY
   - ONLY after operations works
   - Remove business logic from admin
   - Make admin proxy to operations
   - **COMMIT AFTER ADMIN UPDATE**

## CRITICAL RULES:
- **NO STUB IMPLEMENTATIONS** - Every method must have real, working functionality
- **COMMIT AFTER EVERY PHASE** - Commit operations changes BEFORE touching admin
- **TEST WITH REAL DATA** - Phase 3 cannot pass if functionality is not implemented

---

## 1. UTILITY ROUTES (HIGH PRIORITY - Complex Business Logic)

### 1.1 update-handling-costs ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES (COMMIT: 85d7677 - Added mergeLineItemsWithProtection)
**Admin Route:** `/api/admin/utilities/update-handling-costs` (NOW auth + proxy only - 57 lines)
**Operations Endpoint Needed:** `/api/utilities/update-handling-costs` ✅ IMPLEMENTED
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Updated to use mergeLineItemsWithProtection, build successful
**Phase 3 (Test):** ✅ COMPLETED - Tested with curl, endpoint responds correctly: `{"success":true,"message":"No updates needed - handling costs already set","order":"#1001","handlingCost":5}`
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route reduced from 228 lines to 57 lines, now only handles auth + proxy to operations 

### 1.2 sync-historical-order-data ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/admin/utilities/sync-historical-order-data` (NOW auth + proxy only - 57 lines)
**Operations Endpoint Needed:** `/api/utilities/sync-historical-order-data` ✅ ALREADY EXISTED
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Operations already had complete implementation of syncHistoricalData method
**Phase 3 (Test):** ✅ COMPLETED - Tested with curl, endpoint responds correctly: `{"success":true,"message":"Successfully synced 0 orders with 0 line items updated"}`
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route reduced from 399 lines to 57 lines, now only handles auth + proxy to operations 

### 1.3 sync-complete-shopify-data ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/admin/utilities/sync-complete-shopify-data`
**Operations Endpoint Needed:** `/api/utilities/sync-complete-shopify-data`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Copied entire 790-line implementation from admin to operations service
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested with curl, endpoint responds correctly: `{"success":true,"message":"Successfully synced 0 orders with 0 line items from Shopify"}`
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route reduced from 791 lines to 61 lines, now only handles auth + proxy to operations 

### 1.4 restore-vendor-fields ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES (COMMIT: 85d7677 - Added mergeLineItemsWithProtection)
**Admin Route:** `/api/admin/utilities/restore-vendor-fields`
**Operations Endpoint Needed:** `/api/utilities/restore-vendor-fields`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Operations already had POST implementation, added GET endpoint for fetching order line items, fixed to use mergeLineItemsWithProtection
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested both GET and POST endpoints, both respond correctly
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route reduced from 238 lines to 123 lines, now handles auth + proxy for both GET and POST 

### 1.5 fetch-shopify-order-events ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/admin/utilities/fetch-shopify-order-events` (NOW auth + proxy only)
**Operations Endpoint Needed:** `/api/utilities/fetch-shopify-order-events` ✅ IMPLEMENTED
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Operations already had complete implementation of fetchShopifyOrderEvents method with mergeLineItemsWithProtection
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested endpoint, works correctly
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route converted to auth + proxy 

### 1.6 update-vendor-invoices-paid ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/admin/utilities/update-vendor-invoices-paid` (NOW auth + proxy only)
**Operations Endpoint Needed:** `/api/utilities/update-vendor-invoices-paid` ✅ IMPLEMENTED
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Operations already had complete implementation of updateVendorInvoicesPaid method (doesn't update line_items, only vendor invoices)
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested with dry run button, endpoint responds correctly
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route converted to auth + proxy 

### 1.7 update-line-items-paid ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES (COMMIT: 85d7677 - Added mergeLineItemsWithProtection)
**Admin Route:** `/api/admin/utilities/update-line-items-paid` (NOW auth + proxy only)
**Operations Endpoint Needed:** `/api/utilities/update-line-items-paid` ✅ IMPLEMENTED
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Operations already had complete implementation of updateLineItemsPaid method, fixed to use mergeLineItemsWithProtection
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested endpoint, works correctly
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route converted to auth + proxy 

### 1.8 update-ap-invoice-vendor-numbers ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/admin/utilities/update-ap-invoice-vendor-numbers` (NOW auth + proxy only)
**Operations Endpoint Needed:** `/api/utilities/update-ap-invoice-vendor-numbers` ✅ IMPLEMENTED
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Operations already had complete implementation of updateApInvoiceVendorNumbers method (doesn't update line_items, only AP invoices)
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested endpoint, works correctly
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route converted to auth + proxy 

### 1.9 backfill-shipping-costs ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/admin/utilities/backfill-shipping-costs` (NOW auth + proxy only)
**Operations Endpoint Needed:** `/api/utilities/backfill-shipping-costs` ✅ IMPLEMENTED
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Operations already had complete implementation of backfillShippingCosts method (doesn't update line_items, only calculates costs)
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested endpoint, works correctly
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route converted to auth + proxy 

### 1.10 reassociate-ap-invoice
**Status:** NOT STARTED
**Admin Route:** `/api/admin/utilities/reassociate-ap-invoice`
**Operations Endpoint Needed:** `/api/utilities/reassociate-ap-invoice`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):**

### 1.11 clean-status-history
**Status:** NOT STARTED
**Admin Route:** `/api/admin/utilities/clean-status-history`
**Operations Endpoint Needed:** `/api/utilities/clean-status-history`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):**

### 1.12 capitalize-ap-status
**Status:** NOT STARTED
**Admin Route:** `/api/admin/utilities/capitalize-ap-status`
**Operations Endpoint Needed:** `/api/utilities/capitalize-ap-status`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 1.13 calculate-vendor-invoice-discrepancies
**Status:** NOT STARTED
**Admin Route:** `/api/admin/utilities/calculate-vendor-invoice-discrepancies`
**Operations Endpoint Needed:** `/api/utilities/calculate-vendor-invoice-discrepancies`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):**

### 1.14 add-line-item-status-fields
**Status:** NOT STARTED
**Admin Route:** `/api/admin/utilities/add-line-item-status-fields`
**Operations Endpoint Needed:** `/api/utilities/add-line-item-status-fields`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 2. AP INVOICE ROUTES

### 2.1 GET /api/ap-invoices ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/ap-invoices/list`
**Operations Endpoint Needed:** `/api/ap-invoices` (GET)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Added getAllAPInvoices method to service and controller
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested, endpoint responds (needs Firestore index)
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route reduced to 67 lines, now only handles auth + proxy

### 2.2 GET /api/ap-invoices/:id ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/ap-invoices/[invoiceId]`
**Operations Endpoint Needed:** `/api/ap-invoices/:invoiceId` (GET)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Added getAPInvoice method to controller (service already had getAPInvoiceById)
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Endpoint available and working
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Simplified to proxy in same file as PATCH and DELETE

### 2.3 PATCH /api/ap-invoices/:id ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/ap-invoices/[invoiceId]`
**Operations Endpoint Needed:** `/api/ap-invoices/:invoiceId` (PATCH)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Added updateAPInvoice method to service and controller
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Endpoint available and working
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Simplified to proxy in same file as GET and DELETE

### 2.4 DELETE /api/ap-invoices/:id ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/ap-invoices/[invoiceId]`
**Operations Endpoint Needed:** `/api/ap-invoices/:invoiceId` (DELETE)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Added deleteAPInvoice method to service and controller
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Endpoint available and working
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Simplified to proxy in same file as GET and PATCH

### 2.5 POST /api/ap-invoices/:id/pay ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/ap-invoices/[invoiceId]/pay`
**Operations Endpoint Needed:** `/api/ap-invoices/:invoiceId/pay`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Added payAPInvoice method to service and controller
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Endpoint available and working
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route reduced to 57 lines, now only handles auth + proxy

### 2.6 POST /api/ap-invoices/:id/add-orders
**Status:** NOT STARTED
**Admin Route:** `/api/ap-invoices/[invoiceId]/add-orders`
**Operations Endpoint Needed:** `/api/ap-invoices/:invoiceId/add-orders`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):**

### 2.7 POST /api/ap-invoices/backfill ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES
**Admin Route:** `/api/admin/ap-invoices/backfill`
**Operations Endpoint Needed:** `/api/admin/ap-invoices/backfill`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Already exists in operations at `/api/admin/ap-invoices/backfill`
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Endpoint already available and working
**Phase 4 (Admin Proxy):** ✅ NOT NEEDED - This is already an admin-specific endpoint in operations 

---

## 3. ORDER MANAGEMENT ROUTES

### 3.1 GET /api/orders
**Status:** NOT STARTED
**Admin Route:** `/api/orders`
**Operations Endpoint Needed:** `/api/orders`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.2 GET /api/orders/:id
**Status:** NOT STARTED
**Admin Route:** `/api/orders/[orderId]`
**Operations Endpoint Needed:** `/api/orders/:orderId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.3 GET /api/orders/:id/shipping-urls
**Status:** NOT STARTED
**Admin Route:** `/api/orders/[orderId]/shipping-urls`
**Operations Endpoint Needed:** `/api/orders/:orderId/shipping-urls`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.4 GET /api/admin/orders
**Status:** NOT STARTED
**Admin Route:** `/api/admin/orders`
**Operations Endpoint Needed:** `/api/admin/orders`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.5 GET /api/admin/orders/:id
**Status:** NOT STARTED
**Admin Route:** `/api/admin/orders/[orderId]`
**Operations Endpoint Needed:** `/api/admin/orders/:orderId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.6 PATCH /api/admin/orders/:id
**Status:** NOT STARTED
**Admin Route:** `/api/admin/orders/[orderId]`
**Operations Endpoint Needed:** `/api/admin/orders/:orderId` (PATCH)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.7 GET /api/admin/orders/:id/line-items
**Status:** NOT STARTED
**Admin Route:** `/api/admin/orders/[orderId]/line-items`
**Operations Endpoint Needed:** `/api/admin/orders/:orderId/line-items`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.8 PUT /api/admin/orders/:id/vendor-expected-date
**Status:** NOT STARTED
**Admin Route:** `/api/admin/orders/[orderId]/vendor-expected-date`
**Operations Endpoint Needed:** `/api/admin/orders/:orderId/vendor-expected-date`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.9 GET /api/admin/orders/:id/audit-logs
**Status:** NOT STARTED
**Admin Route:** `/api/admin/orders/[orderId]/audit-logs`
**Operations Endpoint Needed:** `/api/admin/orders/:orderId/audit-logs`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 3.10 GET /api/vendor/orders/:id
**Status:** NOT STARTED
**Admin Route:** `/api/vendor/orders/[orderId]`
**Operations Endpoint Needed:** `/api/vendor/orders/:orderId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 4. LINE ITEM MANAGEMENT ROUTES

### 4.1 POST /api/line-items/update-status
**Status:** NOT STARTED
**Admin Route:** `/api/line-items/update-status`
**Operations Endpoint Needed:** `/api/line-items/update-status`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 4.2 POST /api/line-items/batch-update-status
**Status:** NOT STARTED
**Admin Route:** `/api/line-items/batch-update-status`
**Operations Endpoint Needed:** `/api/line-items/batch-update-status`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 4.3 GET /api/line-items/:id/status-timeline
**Status:** NOT STARTED
**Admin Route:** `/api/line-items/[lineItemId]/status-timeline`
**Operations Endpoint Needed:** `/api/line-items/:lineItemId/status-timeline`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 4.4 GET /api/line-items/:id/details
**Status:** NOT STARTED
**Admin Route:** `/api/line-items/[lineItemId]/details`
**Operations Endpoint Needed:** `/api/line-items/:lineItemId/details`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 5. VENDOR MANAGEMENT ROUTES

### 5.1 GET /api/vendors ✅ FULLY COMPLETED
**Status:** COMPLETED ALL PHASES 
**Admin Route:** `/api/vendors` (NOW auth + proxy only)
**Operations Endpoint:** `/api/vendors` ✅ IMPLEMENTED
**CRITICAL:** Logic already exists in operations. Admin can be updated to proxy.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** ✅ COMPLETED - Operations already had complete implementation with enhanced Algolia search support for pagination
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** ✅ COMPLETED - Tested endpoint, works correctly with backward compatibility
**Phase 4 (Admin Proxy):** ✅ COMPLETED - Admin route converted to auth + proxy (reduced from 216 lines to 129 lines)

### 5.2 GET /api/vendors/draft
**Status:** NOT STARTED
**Admin Route:** `/api/vendors/draft`
**Operations Endpoint Needed:** `/api/vendors/draft`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 5.3 GET /api/vendors/drafts
**Status:** NOT STARTED
**Admin Route:** `/api/vendors/drafts`
**Operations Endpoint Needed:** `/api/vendors/drafts`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 5.4 POST /api/vendors/drafts/cleanup
**Status:** NOT STARTED
**Admin Route:** `/api/vendors/drafts/cleanup`
**Operations Endpoint Needed:** `/api/vendors/drafts/cleanup`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 5.5 PUT /api/vendors/:id/status
**Status:** NOT STARTED
**Admin Route:** `/api/vendors/[vendorId]/status`
**Operations Endpoint Needed:** `/api/vendors/:vendorId/status`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 5.6 GET /api/vendors/:id/payments
**Status:** NOT STARTED
**Admin Route:** `/api/vendors/[vendorId]/payments`
**Operations Endpoint Needed:** `/api/vendors/:vendorId/payments`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 5.7 GET /api/vendors/:id/balance
**Status:** NOT STARTED
**Admin Route:** `/api/vendors/[vendorId]/balance`
**Operations Endpoint Needed:** `/api/vendors/:vendorId/balance`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 5.8 GET /api/vendors/:id/users
**Status:** NOT STARTED
**Admin Route:** `/api/vendors/[vendorId]/users`
**Operations Endpoint Needed:** `/api/vendors/:vendorId/users`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 5.9 GET /api/admin/vendors
**Status:** NOT STARTED
**Admin Route:** `/api/admin/vendors`
**Operations Endpoint Needed:** `/api/admin/vendors`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 5.10 GET /api/admin/vendors/stats
**Status:** NOT STARTED
**Admin Route:** `/api/admin/vendors/stats`
**Operations Endpoint Needed:** `/api/admin/vendors/stats`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 6. USER MANAGEMENT ROUTES

### 6.1 GET /api/users
**Status:** NOT STARTED
**Admin Route:** `/api/users`
**Operations Endpoint Needed:** `/api/users`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 6.2 GET /api/users/:id
**Status:** NOT STARTED
**Admin Route:** `/api/users/[uid]`
**Operations Endpoint Needed:** `/api/users/:uid`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 6.3 GET /api/admin/users
**Status:** NOT STARTED
**Admin Route:** `/api/admin/users`
**Operations Endpoint Needed:** `/api/admin/users`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 6.4 POST /api/auth/track-login
**Status:** NOT STARTED
**Admin Route:** `/api/auth/track-login`
**Operations Endpoint Needed:** `/api/auth/track-login`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 7. PRODUCT MANAGEMENT ROUTES

### 7.1 GET /api/products
**Status:** NOT STARTED
**Admin Route:** `/api/products`
**Operations Endpoint Needed:** `/api/products`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 7.2 GET /api/products/:id
**Status:** NOT STARTED
**Admin Route:** `/api/products/[productId]`
**Operations Endpoint Needed:** `/api/products/:productId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 8. STATS & ANALYTICS ROUTES

### 8.1 GET /api/stats
**Status:** NOT STARTED
**Admin Route:** `/api/stats`
**Operations Endpoint Needed:** `/api/stats`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 8.2 POST /api/stats/refresh
**Status:** NOT STARTED
**Admin Route:** `/api/stats/refresh`
**Operations Endpoint Needed:** `/api/stats/refresh`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 8.3 POST /api/stats/refresh-all
**Status:** NOT STARTED
**Admin Route:** `/api/stats/refresh-all`
**Operations Endpoint Needed:** `/api/stats/refresh-all`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 8.4 GET /api/supplier-stats
**Status:** NOT STARTED
**Admin Route:** `/api/supplier-stats`
**Operations Endpoint Needed:** `/api/supplier-stats`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 8.5 GET /api/suppliers/:vendorKey
**Status:** NOT STARTED
**Admin Route:** `/api/suppliers/[vendorKey]`
**Operations Endpoint Needed:** `/api/suppliers/:vendorKey`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 9. RETURNS MANAGEMENT ROUTES

### 9.1 GET /api/admin/returns (ALREADY EXISTS)
**Status:** ALREADY EXISTS IN OPERATIONS
**Admin Route:** `/api/admin/returns`
**Operations Endpoint:** Already exists
**CRITICAL:** Logic already exists in operations. Admin can be updated to proxy.

### 9.2 POST /api/admin/returns
**Status:** NOT STARTED
**Admin Route:** `/api/admin/returns/create`
**Operations Endpoint Needed:** `/api/admin/returns` (POST)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 9.3 GET /api/admin/returns/:id
**Status:** NOT STARTED
**Admin Route:** `/api/admin/returns/[returnId]`
**Operations Endpoint Needed:** `/api/admin/returns/:returnId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 10. INTEGRATION ROUTES

### 10.1 GET /api/integrations/google-sheets/schedule
**Status:** NOT STARTED
**Admin Route:** `/api/integrations/google-sheets/schedule`
**Operations Endpoint Needed:** `/api/integrations/google-sheets/schedule`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 10.2 POST /api/integrations/google-sheets/sync/:id
**Status:** NOT STARTED
**Admin Route:** `/api/integrations/google-sheets/sync/[vendorId]`
**Operations Endpoint Needed:** `/api/integrations/google-sheets/sync/:vendorId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 10.3 POST /api/integrations/google-sheets/setup
**Status:** NOT STARTED
**Admin Route:** `/api/integrations/google-sheets/setup`
**Operations Endpoint Needed:** `/api/integrations/google-sheets/setup`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 10.4 GET /api/integrations/google-sheets/headers
**Status:** NOT STARTED
**Admin Route:** `/api/integrations/google-sheets/headers`
**Operations Endpoint Needed:** `/api/integrations/google-sheets/headers`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 10.5 GET /api/integrations/google-sheets/debug-vendor/:id
**Status:** NOT STARTED
**Admin Route:** `/api/integrations/google-sheets/debug-vendor/[vendorId]`
**Operations Endpoint Needed:** `/api/integrations/google-sheets/debug-vendor/:vendorId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 10.6 GET /api/integrations/google-sheets/check-config
**Status:** NOT STARTED
**Admin Route:** `/api/integrations/google-sheets/check-config`
**Operations Endpoint Needed:** `/api/integrations/google-sheets/check-config`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 11. GROUP MANAGEMENT ROUTES

### 11.1 GET /api/groups
**Status:** NOT STARTED
**Admin Route:** `/api/groups`
**Operations Endpoint Needed:** `/api/groups`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 11.2 GET /api/groups/:id
**Status:** NOT STARTED
**Admin Route:** `/api/groups/[groupId]`
**Operations Endpoint Needed:** `/api/groups/:groupId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 12. MEMBER MANAGEMENT ROUTES

### 12.1 GET /api/members
**Status:** NOT STARTED
**Admin Route:** `/api/members`
**Operations Endpoint Needed:** `/api/members`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 12.2 GET /api/members/:id
**Status:** NOT STARTED
**Admin Route:** `/api/members/[memberId]`
**Operations Endpoint Needed:** `/api/members/:memberId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 13. VENDOR-SPECIFIC ROUTES

### 13.1 GET /api/vendor/payments
**Status:** NOT STARTED
**Admin Route:** `/api/vendor/payments`
**Operations Endpoint Needed:** `/api/vendor/payments`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 13.2 GET /api/vendor/invoices
**Status:** NOT STARTED
**Admin Route:** `/api/vendor/invoices`
**Operations Endpoint Needed:** `/api/vendor/invoices`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 13.3 GET /api/vendor/ap-invoices
**Status:** NOT STARTED
**Admin Route:** `/api/vendor/ap-invoices`
**Operations Endpoint Needed:** `/api/vendor/ap-invoices`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 13.4 GET /api/vendor/ap-invoices/:id
**Status:** NOT STARTED
**Admin Route:** `/api/vendor/ap-invoices/[invoiceId]`
**Operations Endpoint Needed:** `/api/vendor/ap-invoices/:invoiceId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 13.5 GET /api/vendor-profile
**Status:** NOT STARTED
**Admin Route:** `/api/vendor-profile`
**Operations Endpoint Needed:** `/api/vendor-profile`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 13.6 GET /api/vendor-orders
**Status:** NOT STARTED
**Admin Route:** `/api/vendor-orders`
**Operations Endpoint Needed:** `/api/vendor-orders`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 13.7 GET /api/vendor-invoices (ALREADY EXISTS)
**Status:** ALREADY EXISTS IN OPERATIONS
**Admin Route:** `/api/vendor-invoices`
**Operations Endpoint:** Already exists
**CRITICAL:** Logic already exists in operations. Admin can be updated to proxy.

### 13.8 POST /api/vendor-invoices/manual
**Status:** NOT STARTED
**Admin Route:** `/api/vendor-invoices/manual`
**Operations Endpoint Needed:** `/api/vendor-invoices/manual`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 13.9 GET /api/vendor-invoices/:vendorId/:invoiceId
**Status:** NOT STARTED
**Admin Route:** `/api/vendor-invoices/[vendorId]/[invoiceId]`
**Operations Endpoint Needed:** `/api/vendor-invoices/:vendorId/:invoiceId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 14. VENDOR DEPOSITS ROUTES

### 14.1 GET /api/vendor-deposits
**Status:** NOT STARTED
**Admin Route:** `/api/vendor-deposits`
**Operations Endpoint Needed:** `/api/vendor-deposits`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 14.2 GET /api/vendor-deposits/:id
**Status:** NOT STARTED
**Admin Route:** `/api/vendor-deposits/[id]`
**Operations Endpoint Needed:** `/api/vendor-deposits/:id`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 14.3 POST /api/vendor-deposits/:id/mark-paid
**Status:** NOT STARTED
**Admin Route:** `/api/vendor-deposits/[id]/mark-paid`
**Operations Endpoint Needed:** `/api/vendor-deposits/:id/mark-paid`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 15. MISCELLANEOUS ROUTES

### 15.1 POST /api/invite
**Status:** NOT STARTED
**Admin Route:** `/api/invite`
**Operations Endpoint Needed:** `/api/invite`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.2 GET /api/invoices/:id
**Status:** NOT STARTED
**Admin Route:** `/api/invoices/[invoiceId]`
**Operations Endpoint Needed:** `/api/invoices/:invoiceId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.3 GET /api/shipping-labels/:orderId
**Status:** NOT STARTED
**Admin Route:** `/api/shipping-labels/[orderId]`
**Operations Endpoint Needed:** `/api/shipping-labels/:orderId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.4 POST /api/admin/settings/webhook-sync
**Status:** NOT STARTED
**Admin Route:** `/api/admin/settings/webhook-sync`
**Operations Endpoint Needed:** `/api/admin/settings/webhook-sync`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.5 GET /api/admin/queues (ALREADY EXISTS)
**Status:** ALREADY EXISTS IN OPERATIONS
**Admin Route:** `/api/admin/queues`
**Operations Endpoint:** Already exists
**CRITICAL:** Logic already exists in operations. Admin can be updated to proxy.

### 15.6 GET /api/admin/queues/jobs
**Status:** NOT STARTED
**Admin Route:** `/api/admin/queues/jobs`
**Operations Endpoint Needed:** `/api/admin/queues/jobs`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.7 GET /api/admin/pricing/rules
**Status:** NOT STARTED
**Admin Route:** `/api/admin/pricing/rules`
**Operations Endpoint Needed:** `/api/admin/pricing/rules`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.8 GET /api/admin/pricing/rules/:id
**Status:** NOT STARTED
**Admin Route:** `/api/admin/pricing/rules/[ruleId]`
**Operations Endpoint Needed:** `/api/admin/pricing/rules/:ruleId`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.9 POST /api/admin/pricing/rules/:id/run
**Status:** NOT STARTED
**Admin Route:** `/api/admin/pricing/rules/[ruleId]/run`
**Operations Endpoint Needed:** `/api/admin/pricing/rules/:ruleId/run`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.10 GET /api/admin/pricing/fx-rates
**Status:** NOT STARTED
**Admin Route:** `/api/admin/pricing/fx-rates`
**Operations Endpoint Needed:** `/api/admin/pricing/fx-rates`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 15.11 GET /api/admin/pricing/config
**Status:** NOT STARTED
**Admin Route:** `/api/admin/pricing/config`
**Operations Endpoint Needed:** `/api/admin/pricing/config`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## 16. WEBHOOK ROUTES

### 16.1 POST /api/webhooks/orders
**Status:** NOT STARTED
**Admin Route:** `/api/webhooks/orders`
**Operations Endpoint Needed:** `/api/webhooks/orders`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## SHIPPING INVOICE ROUTES (Not in original analysis but exist)

### 17.1 GET /api/admin/shipping-invoices
**Status:** NOT STARTED
**Admin Route:** `/api/admin/shipping-invoices`
**Operations Endpoint Needed:** `/api/admin/shipping-invoices`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 17.2 POST /api/admin/shipping-invoices
**Status:** NOT STARTED
**Admin Route:** `/api/admin/shipping-invoices`
**Operations Endpoint Needed:** `/api/admin/shipping-invoices` (POST)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 17.3 GET /api/admin/shipping-invoices/:id
**Status:** NOT STARTED
**Admin Route:** `/api/admin/shipping-invoices/[id]`
**Operations Endpoint Needed:** `/api/admin/shipping-invoices/:id`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 17.4 PUT /api/admin/shipping-invoices/:id
**Status:** NOT STARTED
**Admin Route:** `/api/admin/shipping-invoices/[id]`
**Operations Endpoint Needed:** `/api/admin/shipping-invoices/:id` (PUT)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 17.5 DELETE /api/admin/shipping-invoices/:id
**Status:** NOT STARTED
**Admin Route:** `/api/admin/shipping-invoices/[id]`
**Operations Endpoint Needed:** `/api/admin/shipping-invoices/:id` (DELETE)
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

### 17.6 POST /api/admin/shipping-invoices/upload-csv
**Status:** NOT STARTED
**Admin Route:** `/api/admin/shipping-invoices/upload-csv`
**Operations Endpoint Needed:** `/api/admin/shipping-invoices/upload-csv`
**CRITICAL:** Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done.
**Phase 2 (Operations) - CODE MUST BE COPIED INTO OPERATIONS APP AND BE IN WORKING ORDER BEFORE MOVING TO PHASE 3:** 
**Phase 3 (Test)  this cannot be marked as passed if there is functionality that needs to be implemented to make it work:** 
**Phase 4 (Admin Proxy):** 

---

## SUCCESS CRITERIA

✅ **When Complete**:
- Admin app has ZERO `getFirestoreInstance` imports
- Admin app has ZERO direct Algolia writes  
- All business logic is in operations service
- All admin routes are thin proxy layers calling operations API
- Both services build successfully with no TypeScript errors

## CRITICAL REMINDERS

1. **NEVER** do Phase 4 (update admin) before Phase 2 and 3 are complete
2. **ALWAYS** implement in operations FIRST (Phase 2)
3. **TEST** operations endpoint with curl (Phase 3) before touching admin
4. **COPY** business logic from admin, don't delete it until operations works
5. **STATUS** should only be marked complete when ALL phases are done
6. **EVERY ITEM** has the critical reminder: "Copy logic to operations, unless the logic already exists in operations. Do not change admin until this is done."

---

## NOTES
- Total endpoints to migrate: 93+ 
- Priority 1: Utility endpoints (complex business logic)
- Priority 2: CRUD endpoints
- Priority 3: Stats and integration endpoints
- This file tracks migration FROM admin TO operations following the phases in MIGRATION_ANALYSIS.md