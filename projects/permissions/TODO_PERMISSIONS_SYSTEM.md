# Permissions System Implementation TODO

## Overview
Implement a comprehensive role-based access control system with separate management for Admin and Vendor users, automatic page discovery, and dynamic permission assignment.

## Phase 1: Foundation (Backend)

### 1.1 Create Route Discovery System
- [ ] Create `/api/pages/discover` endpoint that scans file system
  - Scan `/app/admin/*` directories for admin pages
  - Scan `/app/dashboard/*` directories for vendor pages
  - Extract page metadata from exports if available
  - Auto-categorize based on path structure
  - Return JSON with all discovered routes

### 1.2 Create PageMetadata Firestore Collection
- [ ] Define schema:
  ```typescript
  interface PageMetadata {
    path: string;               // e.g., '/admin/orders'
    title: string;              // e.g., 'Orders Dashboard'
    description: string;        // e.g., 'View and manage customer orders'
    category: string;           // e.g., 'Operations'
    type: 'admin' | 'vendor';   // Based on path prefix
    autoDetected: boolean;      // true if auto-discovered
    isVisible: boolean;         // Can be hidden by superadmin
    lastModified?: Timestamp;
    modifiedBy?: string;        // User ID who modified
    allowedRoles?: string[];    // Assigned roles
    allowedGroups?: string[];   // Assigned groups
  }
  ```

### 1.3 Build Page Registry API
- [ ] Create `/api/pages/registry` endpoint that:
  - Calls discovery system
  - Fetches overrides from Firestore
  - Merges data with priority: DB > Page Export > Auto-detected
  - Returns complete page registry
- [ ] Add caching with 5-minute TTL

### 1.4 Update Operations API
- [ ] Add role CRUD endpoints:
  - `POST /api/roles` - Create new role
  - `GET /api/roles` - List all roles
  - `PUT /api/roles/:id` - Update role
  - `DELETE /api/roles/:id` - Delete role
- [ ] Add role-permission assignment:
  - `PUT /api/roles/:id/permissions` - Update role permissions
- [ ] Update group endpoints to include permissions:
  - `PUT /api/groups/:id/permissions` - Update group permissions

## Phase 2: Role Updates

### 2.1 Update Existing Role Names
- [ ] Migration script to update all users in Firestore:
  - `owner` → `vendor_owner`
  - `user` → `vendor_user`
- [ ] Update role checks in codebase
- [ ] Update UI labels and displays

### 2.2 Define Role Hierarchy
```typescript
const ADMIN_ROLES = ['superadmin', 'admin'];
const VENDOR_ROLES = ['vendor_owner', 'vendor_user'];
const CUSTOM_ADMIN_ROLES = []; // Created by superadmin
const CUSTOM_VENDOR_ROLES = []; // Created by superadmin
```

## Phase 3: Admin User Management UI

### 3.1 Update Admin User Management (`/admin/users`)
- [ ] Restructure tabs:
  1. **Users Tab** - Existing user list
  2. **Roles Tab** - NEW: Role management
  3. **Groups Tab** - Update to include permissions
  4. **Page Permissions Tab** - NEW: Page-level permissions

### 3.2 Create Roles Tab Component
- [ ] List all admin roles (cannot edit superadmin)
- [ ] Create new role button (superadmin only)
- [ ] Edit role modal:
  - Role name
  - Role description
  - Base permissions
  - Assigned pages (multi-select)
- [ ] Delete role (if no users assigned)

### 3.3 Update Groups Tab
- [ ] Add permissions section to group edit modal
- [ ] Multi-select for pages group can access
- [ ] Show number of users in each group

### 3.4 Create Page Permissions Tab
- [ ] Table with columns:
  - Page Name
  - Path
  - Category
  - Description
  - Allowed Roles (chips)
  - Allowed Groups (chips)
  - Actions (Edit)
- [ ] Filter by category
- [ ] Search by name/path
- [ ] Edit modal:
  - View page details
  - Multi-select roles
  - Multi-select groups
  - Save to operations API
- [ ] Superadmin extra features:
  - Edit page title
  - Edit description
  - Change category
  - Hide/show page

## Phase 4: Vendor User Management UI

### 4.1 Create Vendor User Management Page (`/admin/vendor-users`)
- [ ] Copy `/admin/users` structure
- [ ] Create `VendorUserManagement` component
- [ ] Filter to only show vendor users
- [ ] Same 4-tab structure as admin

### 4.2 Vendor-Specific Tabs
- [ ] **Users Tab**: Show vendor_owner and vendor_user roles only
- [ ] **Roles Tab**: Manage vendor roles only
- [ ] **Groups Tab**: Vendor groups only
- [ ] **Page Permissions Tab**: 
  - Only show `/dashboard/*` pages
  - Cannot assign admin roles
  - Cannot see admin pages

## Phase 5: Navigation Updates

### 5.1 Update Navigation Structure
- [ ] Add "User Management" section to admin nav
- [ ] Add two items under it:
  - "Admin Users" → `/admin/users`
  - "Vendor Users" → `/admin/vendor-users`
- [ ] Update icons and labels

### 5.2 Update Paths Configuration
- [ ] Add new paths to `paths.ts`:
  ```typescript
  admin: {
    users: {
      admin: '/admin/users',
      vendor: '/admin/vendor-users',
    }
  }
  ```

## Phase 6: Permission Enforcement

### 6.1 Update AdminRouteGuard
- [ ] Check page permissions from registry
- [ ] Check user's roles and groups
- [ ] Allow if user has required role OR is in allowed group
- [ ] Superadmin bypass (always allow)

### 6.2 Dynamic Navigation Filtering
- [ ] Filter nav items based on page permissions
- [ ] Hide items user cannot access
- [ ] Cache permissions in session storage

## Phase 7: Testing

### 7.1 Test Scenarios
- [ ] Create new admin role and assign pages
- [ ] Create new vendor role and verify can't access admin pages
- [ ] Create group with mixed users and verify permissions
- [ ] Add new page to codebase and verify auto-discovery
- [ ] Superadmin edits page metadata
- [ ] Role deletion with users assigned (should fail)
- [ ] Navigation filtering for different roles

### 7.2 Edge Cases
- [ ] User with multiple roles
- [ ] User in multiple groups
- [ ] Conflicting permissions (role allows, group denies)
- [ ] New page without metadata
- [ ] Invalid category assignment

## Implementation Order

1. **Week 1**: Backend foundation (Phase 1)
2. **Week 2**: Role updates and Admin UI (Phase 2-3)
3. **Week 3**: Vendor UI and Navigation (Phase 4-5)
4. **Week 4**: Testing and refinement (Phase 6-7)

## Technical Notes

### Categories
Default categories based on path:
- **Admin**: Operations, Finance, Marketing, Vendors, Settings, Utilities
- **Vendor**: Dashboard, Products, Orders, Invoices, Payments, Profile

### Security Rules
- Vendor roles can NEVER access `/admin/*` pages
- Admin roles can NEVER be assigned to `/dashboard/*` pages
- Superadmin always has full access (implicit)
- New pages default to superadmin-only until configured

### Performance Considerations
- Cache page registry for 5 minutes
- Use React Query for permission checks
- Batch permission updates in Firestore
- Lazy load permission UI components

## Success Criteria
- [ ] All existing pages appear in permissions UI
- [ ] New pages automatically appear after deployment
- [ ] Superadmin can manage all aspects
- [ ] Clear separation between admin and vendor permissions
- [ ] No hardcoded permissions in code
- [ ] Fast page load times with permission checks
- [ ] Audit trail for permission changes