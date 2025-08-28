# Vendor Balance Card Analysis & Debug Plan

## Problem
Vendor balance card shows all zeros across all locations:
- `/dashboard` (vendor view)  
- `/admin/vendor-payments` (admin view)
- Vendor detail pages

All values showing as 0: COGS, Shipping, Available Credit, Total Orders, Total Payments

## Architecture Overview

### Service Flow Pattern
```
VendorBalanceCard (Client) → Admin API Proxy → Operations Service → Database/Algolia
```

### Data Flow Architecture

#### Orders Data Flow
```
VendorBalanceCard.loadOrders()
  ↓ (Firebase token auth)
Admin: /api/vendor/orders
  ↓ (calls /api/users/${userId} for role/vendorId)
  ↓ (proxies to operations with x-vendor-id header)
Operations: /api/vendor/orders  
  ↓ (filters by vendor)
Algolia: shopify_orders index
  ↓ (returns order data with financials)
Result: Order COGS, shipping, handling amounts
```

#### AP Invoices Data Flow  
```
VendorBalanceCard.loadAPInvoices()
  ↓ (Firebase token auth)
Admin: /api/ap-invoices?vendorId=${vendorId}
  ↓ (proxies to operations)
Operations: /api/ap-invoices
  ↓ (filters by vendorId)
Firestore: APInvoices collection
  ↓ (returns paid/unpaid invoices)
Result: COGS payment status
```

#### Deposits Data Flow
```
VendorBalanceCard.loadDeposits()
  ↓ (direct Algolia client call)
Algolia: firebase_vendordeposits index
  ↓ (filters: vendorId:"${vendorId}")
Result: Paid deposit amounts
```

#### Vendor Invoices Data Flow
```
VendorBalanceCard.loadVendorInvoices()
  ↓ (direct Algolia client call)
Algolia: firebase_vendorinvoices index
  ↓ (filters: vendorId:"${vendorId}" OR lineItems.supplier:"${vendorKey}")
Result: Invoice payment status
```

#### Shipping Invoices Data Flow
```
VendorBalanceCard.loadShippingInvoices()
  ↓ (direct Algolia client call)  
Algolia: firebase_shippinginvoices index
  ↓ (filters: vendorId:"${vendorId}")
Result: Standalone shipping costs
```

### Critical Dependencies

#### User Data Dependency Chain
1. **VendorBalanceCard** gets `vendorId` prop from parent component
2. **Parent components** get vendor ID from:
   - User context (vendor users)
   - View-as-supplier cookie (admin users) 
   - Direct prop passing (admin viewing specific vendor)

#### API Dependency Chain  
1. **Admin /api/vendor/orders** calls **Admin /api/users/${userId}** 
2. **Admin /api/users/${userId}** proxies to **Operations /api/users/${userId}**
3. **Operations user controller** returns user data with `role` and `vendorId` fields
4. **Admin vendor API** uses these fields to determine access and filtering

### Authentication Flow
```
Client Component (Firebase Auth)
  ↓ (Firebase ID token)
Admin API Route (Token verification) 
  ↓ (Bearer token + headers)
Operations Service (Role-based filtering)
  ↓ (Database queries)
Data Sources (Filtered results)
```

## Architectural Violations & Required Fixes

### Current Violations

#### 1. Direct Algolia Access from Client
**VIOLATION**: VendorBalanceCard directly calls Algolia indices:
```javascript
// WRONG: Direct Algolia client calls from admin app
loadDeposits() → Algolia firebase_vendordeposits
loadVendorInvoices() → Algolia firebase_vendorinvoices  
loadShippingInvoices() → Algolia firebase_shippinginvoices
```

**PROPER ARCHITECTURE**: All data access should go through operations service:
```javascript
// CORRECT: Admin → Operations → Algolia
loadDeposits() → /api/vendor/deposits → Operations /api/vendor/deposits → Algolia
loadVendorInvoices() → /api/vendor/invoices → Operations /api/vendor/invoices → Algolia
loadShippingInvoices() → /api/vendor/shipping-invoices → Operations /api/vendor/shipping-invoices → Algolia
```

#### 2. Mixed Data Loading Pattern  
**PROBLEM**: Component uses inconsistent patterns:
- Orders & AP Invoices: Proper proxy to operations ✅
- Deposits, Vendor Invoices, Shipping: Direct Algolia access ❌

### Required Architecture Changes

#### Phase 1: Create Missing Operations Endpoints
Create these operations service endpoints:
- `GET /api/vendor/deposits?vendorId=${id}` 
- `GET /api/vendor/invoices?vendorId=${id}`
- `GET /api/vendor/shipping-invoices?vendorId=${id}`

#### Phase 2: Create Admin Proxy Endpoints  
Create these admin API routes:
- `/api/vendor/deposits/route.ts` → proxy to operations
- `/api/vendor/invoices/route.ts` → proxy to operations  
- `/api/vendor/shipping-invoices/route.ts` → proxy to operations

#### Phase 3: Update VendorBalanceCard
Replace direct Algolia calls with API calls:
```javascript
// Replace this:
const searchClient = getAlgoliaClient();
const depositsIndex = searchClient.initIndex('firebase_vendordeposits');

// With this:
const token = await user.getIdToken();
const response = await fetch('/api/vendor/deposits', {
  headers: { Authorization: token }
});
```

#### Phase 4: Remove Direct Database Access
Remove all Algolia client imports and dependencies from admin app components.

### Proper Data Flow (After Fix)

```
VendorBalanceCard (Client Component)
  ↓ (5 API calls with Firebase auth)
Admin API Proxy Layer  
  ↓ (Bearer token + vendor context headers)
Operations Service Controllers
  ↓ (Role-based filtering & access control)
Data Sources (Algolia indices, Firestore collections)
```

### Benefits of Proper Architecture

1. **Security**: All vendor filtering happens in operations service
2. **Consistency**: Single authentication/authorization pattern  
3. **Maintainability**: Business logic centralized in operations
4. **Scalability**: Caching, rate limiting, monitoring in one place
5. **View-As Functionality**: Proper header propagation through proxy layer

## Implementation Steps (Proper Architecture)

### Step 1: Create Operations Service Endpoints

#### 1.1 Create VendorDepositsController
- **File**: `operations/src/modules/vendors/controllers/vendor-deposits.controller.ts`
- **Purpose**: Handle vendor deposit data from Algolia
- **Method**: `GET /api/vendor/deposits`
- **Logic**:
  - Get vendorId from x-vendor-id header
  - Query Algolia firebase_vendordeposits index
  - Filter by vendorId
  - Return only paid deposits
- **Security**: Ensure vendor isolation (vendor can only see their deposits)

#### 1.2 Create VendorInvoicesController  
- **File**: `operations/src/modules/vendors/controllers/vendor-invoices.controller.ts`
- **Purpose**: Handle vendor invoice data from Algolia
- **Method**: `GET /api/vendor/invoices`
- **Logic**:
  - Get vendorId from x-vendor-id header
  - Get vendor data for vendorKey lookup
  - Query Algolia firebase_vendorinvoices index
  - Filter by vendorId OR lineItems.supplier (fallback)
  - Return invoice data with status
- **Security**: Ensure vendor isolation

#### 1.3 Create VendorShippingController
- **File**: `operations/src/modules/vendors/controllers/vendor-shipping.controller.ts` 
- **Purpose**: Handle shipping invoice data from Algolia
- **Method**: `GET /api/vendor/shipping-invoices`
- **Logic**:
  - Get vendorId from x-vendor-id header
  - Query Algolia firebase_shippinginvoices index
  - Filter by vendorId
  - Return shipping invoices
- **Security**: Ensure vendor isolation

#### 1.4 Register Routes in Operations
- **File**: `operations/src/modules/vendors/routes/vendor.routes.ts`
- **Add routes**:
  ```typescript
  router.get('/deposits', vendorDepositsController.getDeposits);
  router.get('/invoices', vendorInvoicesController.getInvoices);  
  router.get('/shipping-invoices', vendorShippingController.getShippingInvoices);
  ```

#### 1.5 Register Controllers in DI Container
- **File**: `operations/src/core/container/inversify.config.ts`
- **Add bindings** for new controllers

### Step 2: Create Admin Proxy Endpoints

#### 2.1 Create Admin Vendor Deposits Route
- **File**: `admin/src/app/api/vendor/deposits/route.ts`
- **Purpose**: Proxy vendor deposits to operations
- **Logic**:
  - Verify Firebase token
  - Get user data for role/vendorId
  - Determine effective vendor ID (view-as support)
  - Proxy to operations `/api/vendor/deposits`
  - Pass x-vendor-id, x-user-role, x-view-as-supplier headers

#### 2.2 Create Admin Vendor Invoices Route
- **File**: `admin/src/app/api/vendor/invoices/route.ts`
- **Purpose**: Proxy vendor invoices to operations
- **Same pattern as deposits**

#### 2.3 Create Admin Vendor Shipping Route  
- **File**: `admin/src/app/api/vendor/shipping-invoices/route.ts`
- **Purpose**: Proxy shipping invoices to operations
- **Same pattern as deposits**

### Step 3: Update VendorBalanceCard Component

#### 3.1 Remove Direct Algolia Dependencies
- **File**: `admin/src/components/dashboard/vendor/vendor-balance-card.tsx`
- **Remove imports**:
  ```typescript
  // Remove these
  import { getAlgoliaClient } from '@/lib/algolia/client';
  ```

#### 3.2 Replace loadDeposits() Method
```typescript
// Replace direct Algolia call with API call
const loadDeposits = async () => {
  if (!vendorId) return;
  
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch('/api/vendor/deposits', {
      headers: { Authorization: token }
    });
    
    if (response.ok) {
      const data = await response.json();
      setDeposits(data.deposits || []);
    }
  } catch (error) {
    console.error('Error loading deposits:', error);
  }
};
```

#### 3.3 Replace loadVendorInvoices() Method
```typescript
// Replace direct Algolia call with API call  
const loadVendorInvoices = async () => {
  if (!vendorId) return;
  
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch('/api/vendor/invoices', {
      headers: { Authorization: token }
    });
    
    if (response.ok) {
      const data = await response.json();
      setVendorInvoices(data.invoices || []);
    }
  } catch (error) {
    console.error('Error loading vendor invoices:', error);
  }
};
```

#### 3.4 Replace loadShippingInvoices() Method
```typescript
// Replace direct Algolia call with API call
const loadShippingInvoices = async () => {
  if (!vendorId) return;
  
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const response = await fetch('/api/vendor/shipping-invoices', {
      headers: { Authorization: token }
    });
    
    if (response.ok) {
      const data = await response.json();
      setShippingInvoices(data.invoices || []);
    }
  } catch (error) {
    console.error('Error loading shipping invoices:', error);
  }
};
```

### Step 4: Fix User Data Dependency (Immediate Issue)

#### 4.1 Ensure Backward Compatibility in UserController
- **File**: `operations/src/modules/auth/controllers/user.controller.ts`
- **Ensure response includes both field formats**:
  ```typescript
  vendorId: user.vendorId,     // camelCase for new APIs
  vendor_id: user.vendorId,    // snake_case for legacy
  ```

### Step 5: Testing & Validation

#### 5.1 Test Each Endpoint Individually
- Test operations endpoints: `GET /api/vendor/deposits`, `/invoices`, `/shipping-invoices`
- Test admin proxy endpoints
- Verify proper vendor filtering
- Test view-as functionality

#### 5.2 Test VendorBalanceCard Integration
- Test on `/dashboard` (vendor view)
- Test on `/admin/vendor-payments` (admin view)  
- Test view-as functionality
- Verify all calculations work correctly

#### 5.3 Remove Legacy Code
- Remove unused Algolia client code from VendorBalanceCard
- Clean up imports
- Update any other components using direct Algolia access

### Step 6: Documentation Update
- Update CLAUDE.md with proper vendor balance architecture
- Document new API endpoints
- Update component documentation

## Current (Broken) Implementation Analysis

### Component Location
`/src/components/dashboard/vendor/vendor-balance-card.tsx`

### Usage Locations
1. **Vendor Dashboard** (`/dashboard`) - vendors viewing own balance
2. **Admin Vendor Payments** (`/admin/vendor-payments`) - admins viewing vendor balances  
3. **Vendor Details pages** - embedded in vendor management

### Data Sources (5 Separate API Calls)

#### 1. Orders Data
- **Function**: `loadOrders()`
- **Endpoint**: `/api/vendor/orders` with Firebase token auth
- **Purpose**: Gets order financials data
- **Fields Used**: 
  - `financials.totalCOGS` or `totalCOGS`
  - `financials.totalShipping` or `totalShipping` 
  - `financials.handlingCost` or `handlingCost`
- **Calculations**: 
  - `totalCOGSToDate` = sum of COGS + handling fees (excludes cancelled/test)
  - `orderShippingTotal` = sum of shipping costs

#### 2. Deposits Data  
- **Function**: `loadDeposits()`
- **Source**: Algolia index `firebase_vendordeposits`
- **Filter**: `vendorId:"${vendorId}"`
- **Purpose**: Calculate paid deposits
- **Calculation**: `totalDeposits` = sum where `status === 'paid'`

#### 3. AP Invoices Data
- **Function**: `loadAPInvoices()` 
- **Endpoint**: `/api/ap-invoices?vendorId=${vendorId}`
- **Purpose**: COGS payment tracking
- **Calculations**:
  - `cogsInvoicesPaid` = sum of paid AP invoices
  - `cogsToBePaid` = sum of unpaid AP invoices

#### 4. Vendor Invoices Data
- **Function**: `loadVendorInvoices()`
- **Source**: Algolia index `firebase_vendorinvoices` 
- **Filter**: `vendorId:"${vendorId}"` or fallback `lineItems.supplier:"${vendorData.vendorKey}"`
- **Purpose**: Invoice payment tracking
- **Calculations**:
  - `totalInvoicesPaid` = sum of paid vendor invoices
  - `totalInvoicesToPay` = sum of unpaid vendor invoices
  - `totalInvoicedToDate` = sum of all vendor invoices

#### 5. Shipping Invoices Data
- **Function**: `loadShippingInvoices()`
- **Source**: Algolia index `firebase_shippinginvoices`
- **Filter**: `vendorId:"${vendorId}"`
- **Purpose**: Shipping cost tracking (standalone invoices only)
- **Calculation**: `shippingInvoiceTotal` = sum where `!vendorOrderNumber` (avoids double-counting)

### Final Balance Calculations

```javascript
// Total shipping = order shipping + standalone shipping invoices
totalShippingBilled = orderShippingTotal + shippingInvoiceTotal

// Net balance calculation  
netBalance = totalDeposits + totalPayments - totalCOGSToDate - totalShippingBilled

// Available credit (positive balance only)
availableCredit = netBalance > 0 ? netBalance : 0
```

## What I Changed (Recent Commits)

### Operations Service Changes
1. **user.controller.ts**: Changed user data field names (added backward compatibility)
2. **admin-orders.service.ts**: Minor string conversion (`String(orderData.name)`)
3. **event-stream.service.ts**: Added SSE connection limits  
4. **user.service.ts**: User data field mapping updates
5. **customer.service.ts**: Removed LEFT JOINs (but reverted this)

## Most Likely Root Causes

### 1. `/api/vendor/orders` Broken
- **Impact**: `totalCOGSToDate = 0`, `orderShippingTotal = 0`
- **Cause**: User data field name changes affecting vendor ID lookup
- **Evidence**: This endpoint calls `/api/users/${userId}` which I modified

### 2. `/api/ap-invoices` Broken  
- **Impact**: `cogsInvoicesPaid = 0`, `cogsToBePaid = 0`
- **Cause**: Similar vendor ID lookup issues

### 3. Algolia Index Access Issues
- **Impact**: All deposit/invoice data = 0
- **Indices**: `firebase_vendordeposits`, `firebase_vendorinvoices`, `firebase_shippinginvoices`
- **Cause**: Vendor ID filtering not working

## Debug Plan

### Phase 1: API Endpoint Testing
- [ ] Test `/api/vendor/orders?vendorId=XXX` directly in browser
- [ ] Test `/api/ap-invoices?vendorId=XXX` directly  
- [ ] Check network tab for failed requests or empty responses
- [ ] Verify vendor ID is being passed correctly

### Phase 2: Data Source Verification
- [ ] Test Algolia indices directly with vendor ID filters
- [ ] Verify vendor data structure (`vendorData.vendorKey` etc.)
- [ ] Check if vendor ID format changed

### Phase 3: Systematic Revert
- [ ] Revert user.controller.ts changes
- [ ] Test if balance card works
- [ ] Revert other changes one by one
- [ ] Identify which specific change broke it

### Phase 4: Fix Implementation  
- [ ] Fix the root cause while preserving other functionality
- [ ] Test across all usage locations
- [ ] Verify calculations are correct

## Expected Behavior
- Orders data populates COGS and shipping totals
- Deposits show available credit  
- AP invoices show payment status
- Net balance calculates correctly
- All values > 0 for active vendors

## Testing Locations
1. `/dashboard` with vendor user
2. `/admin/vendor-payments` with admin user  
3. `/admin/vendors/[id]` vendor detail pages
4. View-as functionality with admin viewing vendor data