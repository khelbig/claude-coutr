# Vendor Balance API Authentication Architecture

Based on `/projects/auth-investigation/SUPPLIER_AUTH_INVESTIGATION.md`

## Authentication Pattern (Secure)

### Current Working Pattern
1. **Firebase ID token** verified to get user ID
2. **User data** looked up from database using verified user ID
3. **Database-verified vendor ID and role** used for authorization
4. **No client-provided parameters** (headers/params) used for security decisions

### Implementation for Vendor Balance APIs

#### Admin Vendor Balance APIs
```
/api/admin/vendors/deposits
/api/admin/vendors/invoices  
/api/admin/vendors/shipping-invoices
```

**Flow:**
1. Verify Firebase token → extract `userId`
2. Look up user data: `await getUserFromDatabase(userId)`
3. Check `userData.role` is 'admin' or 'superadmin'
4. Get `targetVendorId` from request body (admin specifies which vendor)
5. Query data for `targetVendorId`

#### Vendor Self-Service APIs
```
/api/vendor/deposits
/api/vendor/invoices
/api/vendor/shipping-invoices  
```

**Flow:**
1. Verify Firebase token → extract `userId`
2. Look up user data: `await getUserFromDatabase(userId)`
3. Get `vendorId` from `userData.vendorId` (their own vendor)
4. Query data for their own `vendorId` only

## Secure Controller Pattern

### Admin Controller Example
```typescript
async getVendorDeposits(req: Request, res: Response): Promise<void> {
  // 1. Get user ID from verified token (not from headers/params!)
  const userId = req.user?.uid; // Set by auth middleware
  
  // 2. Look up user from database
  const userData = await this.userService.getUser(userId);
  
  // 3. Check admin authorization
  if (userData.role !== 'admin' && userData.role !== 'superadmin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // 4. Get target vendor ID from request body (secure)
  const { vendorId } = req.body;
  
  // 5. Query deposits for specified vendor
  const deposits = await this.algoliaClient
    .initIndex('firebase_vendordeposits')
    .search('', { filters: `vendorId:"${vendorId}"` });
}
```

### Vendor Controller Example
```typescript
async getMyDeposits(req: Request, res: Response): Promise<void> {
  // 1. Get user ID from verified token
  const userId = req.user?.uid;
  
  // 2. Look up user from database  
  const userData = await this.userService.getUser(userId);
  
  // 3. Get their vendor ID (can only access their own data)
  const vendorId = userData.vendorId;
  
  if (!vendorId) {
    return res.status(400).json({ error: 'No vendor associated with user' });
  }
  
  // 4. Query deposits for their vendor only
  const deposits = await this.algoliaClient
    .initIndex('firebase_vendordeposits')
    .search('', { filters: `vendorId:"${vendorId}"` });
}
```

## Key Security Principles

1. **Never trust client data** for security decisions
2. **Always get vendor ID from authenticated user's database record**
3. **Admin APIs**: Admin specifies target vendor in request body  
4. **Vendor APIs**: Vendor can only access their own data
5. **No URL parameters or headers** for vendor identification
6. **Database lookup required** for every request to get current user data

## VendorBalanceCard Integration

The card will make different API calls based on context:

### Admin Context (e.g., /admin/vendor-payments)
```typescript
// Admin viewing specific vendor's balance
const response = await fetch('/api/admin/vendors/deposits', {
  method: 'POST',
  headers: { Authorization: token },
  body: JSON.stringify({ vendorId: targetVendorId })
});
```

### Vendor Context (e.g., /dashboard)
```typescript  
// Vendor viewing their own balance
const response = await fetch('/api/vendor/deposits', {
  headers: { Authorization: token }
  // No body needed - gets their own vendor ID from auth
});
```

## Authentication Middleware

Both API groups will use auth middleware to:
1. Verify Firebase token
2. Extract user ID
3. Attach user ID to `req.user.uid`
4. Controller handles database lookup and authorization

This follows the existing pattern documented in the auth investigation.