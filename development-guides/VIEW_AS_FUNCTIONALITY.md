# View As Functionality Documentation

## Overview

The "View As" functionality allows admin users to impersonate vendors/suppliers to see the system from their perspective. This is essential for debugging vendor-specific issues, testing vendor workflows, and providing customer support.

## Architecture

### Cookie-Based Implementation
- **Cookie Name**: `viewAsSupplier`
- **Storage**: HTTP cookie with path `/`, sameSite `lax`
- **Scope**: Available across the entire admin application
- **Security**: Only works for users with `admin` or `superadmin` roles

### Request Flow
```
Admin User → Sets viewAsSupplier cookie → Admin App → Operations API
                                            ↓
                                    Adds x-view-as-supplier header
                                            ↓
                                    Operations filters by vendor ID
```

## Admin App Implementation

### Setting View As Mode

#### Method 1: Manual Cookie Setting (Browser DevTools)
```javascript
// Set the cookie to view as a specific vendor
document.cookie = "viewAsSupplier=vendor-uuid-here; path=/; sameSite=lax";

// Clear view as mode
document.cookie = "viewAsSupplier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=lax";
```

#### Method 2: UI Implementation (Recommended)
```typescript
// Example: Vendor selection dropdown in admin header
const handleViewAsVendor = (vendorId: string | null) => {
  if (vendorId) {
    // Set view as mode
    document.cookie = `viewAsSupplier=${vendorId}; path=/; sameSite=lax; max-age=3600`;
  } else {
    // Clear view as mode
    document.cookie = "viewAsSupplier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=lax";
  }
  
  // Refresh page to apply changes
  window.location.reload();
};
```

### Server-Side Pages (Next.js App Router)

All server-side pages should follow this pattern:

```typescript
// pages/dashboard/example/page.tsx
import { cookies } from 'next/headers';

export default async function ExamplePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const viewAsSupplier = cookieStore.get('viewAsSupplier')?.value;

  // Get user data
  const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/${userId}`);
  const userData = await userResponse.json();
  const isAdmin = userData?.role === 'admin' || userData?.role === 'superadmin';

  // Determine effective vendor ID
  let currentVendorId = userData?.vendorId;
  if (viewAsSupplier && isAdmin) {
    currentVendorId = viewAsSupplier;
    console.log('[Page] Admin viewing as supplier:', viewAsSupplier);
  }

  // Use currentVendorId for vendor-specific operations
  const data = await fetchVendorData(token, currentVendorId);
  
  return <Component data={data} currentVendorId={currentVendorId} />;
}
```

### Client-Side Components

Client components should pass the view-as-supplier header when making API calls:

```typescript
// components/vendor-specific-component.tsx
'use client';

const fetchVendorData = async () => {
  const viewAsSupplier = document.cookie
    .split('; ')
    .find(row => row.startsWith('viewAsSupplier='))
    ?.split('=')[1];

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: token,
  };

  if (viewAsSupplier) {
    headers['x-view-as-supplier'] = viewAsSupplier;
  }

  const response = await fetch('/api/vendor/data', {
    method: 'GET',
    headers,
  });

  return response.json();
};
```

### API Routes (Admin App)

Admin API routes should proxy the view-as-supplier header to operations:

```typescript
// app/api/vendor/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase/firestore-admin';

export async function GET(request: NextRequest) {
  // Get auth token
  const token = request.headers.get('Authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify token and get user
  const decodedToken = await verifyToken(token);
  const userData = await getUserData(decodedToken.uid);
  const { role, vendorId } = userData;

  // Handle view-as-supplier
  const viewAsSupplier = request.headers.get('x-view-as-supplier');
  let effectiveVendorId = vendorId;
  
  if (viewAsSupplier && (role === 'admin' || role === 'superadmin')) {
    effectiveVendorId = viewAsSupplier;
  }

  // Proxy to operations service
  const operationsUrl = process.env.OPERATIONS_API_URL;
  const response = await fetch(`${operationsUrl}/api/vendor/example`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-vendor-id': effectiveVendorId,
      'x-user-role': role,
      'x-user-id': decodedToken.uid,
      ...(viewAsSupplier && { 'x-view-as-supplier': viewAsSupplier }),
    },
  });

  return NextResponse.json(await response.json());
}
```

## Operations Service Implementation

### Middleware Pattern

Operations service uses dependency injection with headers:

```typescript
// controllers/vendor-example.controller.ts
@injectable()
export class VendorExampleController {
  async getData(req: Request, res: Response): Promise<void> {
    try {
      const vendorId = req.headers['x-vendor-id'] as string;
      const userRole = req.headers['x-user-role'] as string;
      const viewAsSupplier = req.headers['x-view-as-supplier'] as string;

      this.logger.info('[VendorExampleController] Request details', {
        vendorId,
        userRole,
        viewAsSupplier: !!viewAsSupplier,
        userId: req.user?.uid
      });

      if (!vendorId) {
        res.status(400).json({ error: 'Vendor ID is required' });
        return;
      }

      // Always filter data by vendorId - this ensures vendor isolation
      const data = await this.dataService.getByVendor(vendorId);
      
      res.json({ data });
    } catch (error) {
      this.logger.error('[VendorExampleController] Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

### Security Rules

**CRITICAL**: Operations service controllers must ALWAYS filter by vendor:

```typescript
// ✅ CORRECT - Always filtered by vendor
const data = await this.firestoreService.getDb()
  .collection('SomeCollection')
  .where('vendorId', '==', vendorId)  // Always filter by vendor
  .get();

// ❌ WRONG - Returns all data
const data = await this.firestoreService.getDb()
  .collection('SomeCollection')
  .get();
```

### Database Queries

All database operations in vendor controllers must include vendor filtering:

```typescript
// Firestore queries
const vendorOrders = await this.firestoreService.getDb()
  .collection('Orders')
  .where('vendorId', '==', vendorId)
  .get();

// PostgreSQL queries  
const vendorData = await this.postgresService
  .getDataSource()
  .getRepository(VendorEntity)
  .find({ where: { vendorId } });

// Algolia queries with facet filters
const searchResults = await this.algolia.search('index_name', {
  filters: `vendorId:${vendorId}`,
  facetFilters: [`supplier_key:${vendorKey}`]
});
```

## Security Considerations

### Access Control
- Only `admin` and `superadmin` roles can use view-as functionality
- Non-admin users are ignored if they somehow set the cookie
- All vendor controllers verify vendor ID exists and user has access

### Audit Logging
```typescript
this.logger.info('[Controller] Admin viewing as supplier', {
  adminUserId: req.headers['x-user-id'],
  adminRole: req.headers['x-user-role'],
  viewingAsVendor: vendorId,
  action: 'getData',
  timestamp: new Date().toISOString()
});
```

### Data Isolation
- View-as mode NEVER bypasses vendor data isolation
- Admin sees exactly what the vendor would see - no additional data
- All queries must include vendor filtering

## Common Implementation Patterns

### 1. Team Management Example
```typescript
// ✅ Proper implementation from team management
let currentVendorId = userData?.vendorId;
if (viewAsSupplier && isAdmin) {
  currentVendorId = viewAsSupplier;
  console.log('[Team Page] Admin viewing as supplier:', viewAsSupplier);
} else if (!isAdmin && !userData?.vendorId) {
  redirect(paths.auth.firebase.signIn);
}

const members = await fetchTeamMembers(token, viewAsSupplier);
```

### 2. API Client Pattern
```typescript
// Reusable function for adding view-as header
const getVendorHeaders = (token: string): HeadersInit => {
  const headers: HeadersInit = {
    'Authorization': token,
    'Content-Type': 'application/json',
  };

  const viewAsSupplier = document.cookie
    .split('; ')
    .find(row => row.startsWith('viewAsSupplier='))
    ?.split('=')[1];

  if (viewAsSupplier) {
    headers['x-view-as-supplier'] = viewAsSupplier;
  }

  return headers;
};
```

### 3. Operations Service Route Registration
```typescript
// routes/vendor.routes.ts
const router = express.Router();

router.get('/team', container.get<VendorTeamController>(TYPES.VendorTeamController).getTeamMembers.bind(container.get(TYPES.VendorTeamController)));
router.post('/team', container.get<VendorTeamController>(TYPES.VendorTeamController).inviteTeamMember.bind(container.get(TYPES.VendorTeamController)));
router.patch('/team/:memberId', container.get<VendorTeamController>(TYPES.VendorTeamController).updateTeamMember.bind(container.get(TYPES.VendorTeamController)));
router.delete('/team/:memberId', container.get<VendorTeamController>(TYPES.VendorTeamController).deleteTeamMember.bind(container.get(TYPES.VendorTeamController)));

export default router;
```

## Testing View As Functionality

### Manual Testing Steps

1. **Setup**: Log in as admin/superadmin user
2. **Enable View As**: Set `viewAsSupplier` cookie with target vendor ID
3. **Navigate**: Go to vendor-specific pages (e.g., `/dashboard/team`)
4. **Verify**: Check that data shown belongs to target vendor only
5. **Clear**: Remove cookie and verify return to normal admin view

### Browser DevTools Testing
```javascript
// Enable view as
document.cookie = "viewAsSupplier=your-vendor-id-here; path=/; sameSite=lax";
location.reload();

// Check current view as status
console.log('View As:', document.cookie.split('; ').find(row => row.startsWith('viewAsSupplier=')));

// Disable view as
document.cookie = "viewAsSupplier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=lax";
location.reload();
```

### Debugging View As Issues

1. **Check Console Logs**: Look for `[Component] Admin viewing as supplier:` messages
2. **Verify Headers**: Ensure `x-view-as-supplier` header is being sent to operations
3. **Check Vendor ID**: Confirm the vendor ID in cookie matches expected vendor
4. **Operations Logs**: Check operations service logs for vendor filtering

## UI Implementation Recommendations

### Admin Header Dropdown
```typescript
const ViewAsSelector = ({ currentUser, vendors }: Props) => {
  const [viewAsVendor, setViewAsVendor] = useState<string | null>(null);

  useEffect(() => {
    // Get current view-as value from cookie
    const current = document.cookie
      .split('; ')
      .find(row => row.startsWith('viewAsSupplier='))
      ?.split('=')[1];
    setViewAsVendor(current || null);
  }, []);

  const handleViewAsChange = (vendorId: string | null) => {
    if (vendorId) {
      document.cookie = `viewAsSupplier=${vendorId}; path=/; sameSite=lax; max-age=3600`;
    } else {
      document.cookie = "viewAsSupplier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=lax";
    }
    window.location.reload();
  };

  if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
    return null;
  }

  return (
    <Select
      value={viewAsVendor || ''}
      onChange={(e) => handleViewAsChange(e.target.value || null)}
      displayEmpty
    >
      <MenuItem value="">
        <em>View as Admin</em>
      </MenuItem>
      {vendors.map(vendor => (
        <MenuItem key={vendor.id} value={vendor.id}>
          View as: {vendor.name}
        </MenuItem>
      ))}
    </Select>
  );
};
```

### Visual Indicator
```typescript
const ViewAsIndicator = () => {
  const [viewAsVendor, setViewAsVendor] = useState<string | null>(null);

  useEffect(() => {
    const current = document.cookie
      .split('; ')
      .find(row => row.startsWith('viewAsSupplier='))
      ?.split('=')[1];
    setViewAsVendor(current || null);
  }, []);

  if (!viewAsVendor) return null;

  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <strong>Admin View:</strong> You are viewing as vendor {viewAsVendor}
      <Button size="small" onClick={() => {
        document.cookie = "viewAsSupplier=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; sameSite=lax";
        window.location.reload();
      }}>
        Exit View As
      </Button>
    </Alert>
  );
};
```

## Troubleshooting

### Common Issues

1. **Page Redirects**: Ensure both `auth-token` and `token` cookies are set
2. **No Data Showing**: Check vendor ID mapping in operations service
3. **Wrong Data**: Verify vendor filtering in database queries
4. **Access Denied**: Confirm user has admin/superadmin role

### Debug Checklist

- [ ] User has `admin` or `superadmin` role
- [ ] `viewAsSupplier` cookie is set with valid vendor ID
- [ ] `x-view-as-supplier` header is sent to operations service
- [ ] Operations service receives and uses vendor ID for filtering
- [ ] Database queries include vendor filtering
- [ ] Vendor ID exists in the system

This documentation should be updated as the view-as functionality evolves and new patterns emerge.