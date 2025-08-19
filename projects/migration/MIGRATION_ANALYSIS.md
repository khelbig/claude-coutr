# Admin to Operations Migration Analysis

## Summary
- **93 admin API routes** need to be migrated to operations service
- Admin app should have ZERO direct database access
- All business logic must be moved to operations service

## Categories of Routes to Migrate

### 1. Utility Routes (HIGH PRIORITY - Already attempted)
These contain complex business logic that was removed earlier:

**Admin Routes → Operations Endpoints Needed:**
- `/api/admin/utilities/update-handling-costs` → `/api/utilities/update-handling-costs`
- `/api/admin/utilities/sync-historical-order-data` → `/api/utilities/sync-historical-order-data`
- `/api/admin/utilities/sync-complete-shopify-data` → `/api/utilities/sync-complete-shopify-data`
- `/api/admin/utilities/restore-vendor-fields` → `/api/utilities/restore-vendor-fields`
- `/api/admin/utilities/fetch-shopify-order-events` → `/api/utilities/fetch-shopify-order-events`
- `/api/admin/utilities/update-vendor-invoices-paid` → `/api/utilities/update-vendor-invoices-paid`
- `/api/admin/utilities/update-line-items-paid` → `/api/utilities/update-line-items-paid`
- `/api/admin/utilities/update-ap-invoice-vendor-numbers` → `/api/utilities/update-ap-invoice-vendor-numbers`
- `/api/admin/utilities/backfill-shipping-costs` → `/api/utilities/backfill-shipping-costs`
- `/api/admin/utilities/reassociate-ap-invoice` → `/api/utilities/reassociate-ap-invoice`
- `/api/admin/utilities/clean-status-history` → `/api/utilities/clean-status-history`
- `/api/admin/utilities/capitalize-ap-status` → `/api/utilities/capitalize-ap-status`
- `/api/admin/utilities/calculate-vendor-invoice-discrepancies` → `/api/utilities/calculate-vendor-invoice-discrepancies`
- `/api/admin/utilities/add-line-item-status-fields` → `/api/utilities/add-line-item-status-fields`

### 2. AP Invoice Routes
**Admin Routes → Operations Endpoints:**
- `/api/ap-invoices/list` → `/api/ap-invoices` (GET)
- `/api/ap-invoices/[invoiceId]` → `/api/ap-invoices/:invoiceId`
- `/api/ap-invoices/[invoiceId]/pay` → `/api/ap-invoices/:invoiceId/pay`
- `/api/ap-invoices/[invoiceId]/add-orders` → `/api/ap-invoices/:invoiceId/add-orders`
- `/api/admin/ap-invoices/backfill` → `/api/ap-invoices/backfill`

### 3. Order Management Routes
**Admin Routes → Operations Endpoints:**
- `/api/orders` → `/api/orders`
- `/api/orders/[orderId]` → `/api/orders/:orderId`
- `/api/orders/[orderId]/shipping-urls` → `/api/orders/:orderId/shipping-urls`
- `/api/admin/orders` → `/api/admin/orders`
- `/api/admin/orders/[orderId]` → `/api/admin/orders/:orderId`
- `/api/admin/orders/[orderId]/line-items` → `/api/admin/orders/:orderId/line-items`
- `/api/admin/orders/[orderId]/vendor-expected-date` → `/api/admin/orders/:orderId/vendor-expected-date`
- `/api/admin/orders/[orderId]/audit-logs` → `/api/admin/orders/:orderId/audit-logs`
- `/api/vendor/orders/[orderId]` → `/api/vendor/orders/:orderId`

### 4. Line Item Management Routes
**Admin Routes → Operations Endpoints:**
- `/api/line-items/update-status` → `/api/line-items/update-status`
- `/api/line-items/batch-update-status` → `/api/line-items/batch-update-status`
- `/api/line-items/[lineItemId]/status-timeline` → `/api/line-items/:lineItemId/status-timeline`
- `/api/line-items/[lineItemId]/details` → `/api/line-items/:lineItemId/details`

### 5. Vendor Management Routes
**Admin Routes → Operations Endpoints:**
- `/api/vendors` → `/api/vendors` (ALREADY EXISTS)
- `/api/vendors/draft` → `/api/vendors/draft`
- `/api/vendors/drafts` → `/api/vendors/drafts`
- `/api/vendors/drafts/cleanup` → `/api/vendors/drafts/cleanup`
- `/api/vendors/[vendorId]/status` → `/api/vendors/:vendorId/status`
- `/api/vendors/[vendorId]/payments` → `/api/vendors/:vendorId/payments`
- `/api/vendors/[vendorId]/balance` → `/api/vendors/:vendorId/balance`
- `/api/vendors/[vendorId]/users` → `/api/vendors/:vendorId/users`
- `/api/admin/vendors` → `/api/admin/vendors`
- `/api/admin/vendors/stats` → `/api/admin/vendors/stats`

### 6. User Management Routes
**Admin Routes → Operations Endpoints:**
- `/api/users` → `/api/users`
- `/api/users/[uid]` → `/api/users/:uid`
- `/api/admin/users` → `/api/admin/users`
- `/api/auth/track-login` → `/api/auth/track-login`

### 7. Product Management Routes
**Admin Routes → Operations Endpoints:**
- `/api/products` → `/api/products`
- `/api/products/[productId]` → `/api/products/:productId`

### 8. Stats & Analytics Routes
**Admin Routes → Operations Endpoints:**
- `/api/stats` → `/api/stats`
- `/api/stats/refresh` → `/api/stats/refresh`
- `/api/stats/refresh-all` → `/api/stats/refresh-all`
- `/api/supplier-stats` → `/api/supplier-stats`
- `/api/suppliers/[vendorKey]` → `/api/suppliers/:vendorKey`

### 9. Returns Management Routes
**Admin Routes → Operations Endpoints:**
- `/api/admin/returns` → `/api/admin/returns` (ALREADY EXISTS)
- `/api/admin/returns/create` → `/api/admin/returns`
- `/api/admin/returns/[returnId]` → `/api/admin/returns/:returnId`

### 10. Integration Routes
**Admin Routes → Operations Endpoints:**
- `/api/integrations/google-sheets/schedule` → `/api/integrations/google-sheets/schedule`
- `/api/integrations/google-sheets/sync/[vendorId]` → `/api/integrations/google-sheets/sync/:vendorId`
- `/api/integrations/google-sheets/setup` → `/api/integrations/google-sheets/setup`
- `/api/integrations/google-sheets/headers` → `/api/integrations/google-sheets/headers`
- `/api/integrations/google-sheets/debug-vendor/[vendorId]` → `/api/integrations/google-sheets/debug-vendor/:vendorId`
- `/api/integrations/google-sheets/check-config` → `/api/integrations/google-sheets/check-config`

### 11. Group Management Routes
**Admin Routes → Operations Endpoints:**
- `/api/groups` → `/api/groups`
- `/api/groups/[groupId]` → `/api/groups/:groupId`

### 12. Member Management Routes
**Admin Routes → Operations Endpoints:**
- `/api/members` → `/api/members`
- `/api/members/[memberId]` → `/api/members/:memberId`

### 13. Vendor-Specific Routes
**Admin Routes → Operations Endpoints:**
- `/api/vendor/payments` → `/api/vendor/payments`
- `/api/vendor/invoices` → `/api/vendor/invoices`
- `/api/vendor/ap-invoices` → `/api/vendor/ap-invoices`
- `/api/vendor/ap-invoices/[invoiceId]` → `/api/vendor/ap-invoices/:invoiceId`
- `/api/vendor-profile` → `/api/vendor-profile`
- `/api/vendor-orders` → `/api/vendor-orders`
- `/api/vendor-invoices` → `/api/vendor-invoices` (ALREADY EXISTS)
- `/api/vendor-invoices/manual` → `/api/vendor-invoices/manual`
- `/api/vendor-invoices/[vendorId]/[invoiceId]` → `/api/vendor-invoices/:vendorId/:invoiceId`

### 14. Vendor Deposits Routes
**Admin Routes → Operations Endpoints:**
- `/api/vendor-deposits` → `/api/vendor-deposits`
- `/api/vendor-deposits/[id]` → `/api/vendor-deposits/:id`
- `/api/vendor-deposits/[id]/mark-paid` → `/api/vendor-deposits/:id/mark-paid`

### 15. Miscellaneous Routes
**Admin Routes → Operations Endpoints:**
- `/api/invite` → `/api/invite`
- `/api/invoices/[invoiceId]` → `/api/invoices/:invoiceId`
- `/api/shipping-labels/[orderId]` → `/api/shipping-labels/:orderId`
- `/api/admin/settings/webhook-sync` → `/api/admin/settings/webhook-sync`
- `/api/admin/queues` → `/api/admin/queues` (ALREADY EXISTS)
- `/api/admin/queues/jobs` → `/api/admin/queues/jobs`
- `/api/admin/pricing/rules` → `/api/admin/pricing/rules`
- `/api/admin/pricing/rules/[ruleId]` → `/api/admin/pricing/rules/:ruleId`
- `/api/admin/pricing/rules/[ruleId]/run` → `/api/admin/pricing/rules/:ruleId/run`
- `/api/admin/pricing/fx-rates` → `/api/admin/pricing/fx-rates`
- `/api/admin/pricing/config` → `/api/admin/pricing/config`

### 16. Webhook Routes
**Admin Routes → Operations Endpoints:**
- `/api/webhooks/orders` → `/api/webhooks/orders`

## Implementation Strategy

### Phase 1: Analyze & Document ✅
1. ✅ Identify all 93 files with direct database access
2. ✅ Categorize routes by functionality
3. ✅ Map admin routes to required operations endpoints

### Phase 2: Create Operations Endpoints (CRITICAL)
1. **First Priority**: Utility endpoints (complex business logic)
2. **Second Priority**: CRUD endpoints (AP invoices, orders, vendors)
3. **Third Priority**: Stats and integration endpoints

### Phase 3: Test Operations Endpoints
1. Test each endpoint with Postman/curl
2. Verify data persistence and retrieval
3. Check error handling and validation

### Phase 4: Update Admin App
1. Update operations-api.ts client with all new endpoints
2. Refactor admin routes to use operations API
3. Remove all direct database access

### Phase 5: Verification
1. Test all admin UI functionality
2. Verify no direct database access remains
3. Run builds and typechecks

## Critical Notes

1. **Utility Routes Were Already Broken**: These contained 1000+ lines of complex business logic that was removed earlier
2. **Operations Service Structure**: Well-organized with InversifyJS, TypeORM, proper DI
3. **Existing Endpoints**: Some endpoints already exist (vendors, returns, email, queues)
4. **No Algolia Writes**: Admin must NEVER write to Algolia (operations service handles sync)
5. **Authentication**: All routes need proper authentication and authorization

## Success Criteria

✅ **When Complete**:
- Admin app has ZERO `getFirestoreInstance` imports
- Admin app has ZERO direct Algolia writes  
- All business logic is in operations service
- All admin routes are thin proxy layers calling operations API
- Both services build successfully with no TypeScript errors