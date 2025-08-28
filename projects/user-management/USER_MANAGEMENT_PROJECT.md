# User Management System Redesign Project

## Project Overview
Complete redesign and reimplementation of the user and role management system for COUTR platform, ensuring proper architecture with all operations going through the operations service.

## Current Status
- ✅ Firebase Auth integration moved to operations service
- ✅ User management endpoints created in operations service
- ✅ Admin app now proxies all user operations through operations service
- ✅ Team invitation creates Firebase Auth users properly
- ⏳ Need to redesign UI based on mockups
- ⏳ Need to implement role management system

## Mockups Location
- `/Users/kenthelbig/work/coutr/projects/user-management/users-page.html`
- `/Users/kenthelbig/work/coutr/projects/user-management/role-management-admin.html`
- `/Users/kenthelbig/work/coutr/projects/user-management/role-management-admin-create-role.html`

## Phase 1: Backend Architecture (Completed ✅)

### 1.1 Operations Service User Management
- [x] Create UserService with getAllUsers, getUsersByVendor methods
- [x] Create UserController with CRUD operations
- [x] Implement /api/users endpoints
- [x] Add Firebase Auth user creation endpoint
- [x] Handle user invitation with email sending

### 1.2 Admin App Proxy Layer
- [x] Update /api/users to proxy to operations service
- [x] Create /api/users/[userId] proxy routes
- [x] Update team invitation to use operations service
- [x] Remove direct Firestore access from admin app

## Phase 2: Role Management System (Completed ✅)

### Implementation Summary
**Completed on**: 2025-08-22

#### Database Schema Created
- ✅ Created 5 TypeORM entities in PostgreSQL:
  - `roles` table - Main role definitions with vendor scoping
  - `permissions` table - Granular permissions with risk levels
  - `role_permissions` table - Many-to-many role-permission mapping
  - `user_roles` table - User role assignments with validity periods
  - `user_permissions` table - Direct user permission overrides
- ✅ Migration file: `1755899999999-OnlyAddRoleManagementTables.ts`
- ✅ Successfully ran migration to create all tables

#### Backend Services Implemented
- ✅ **RoleService** (`/src/modules/roles/role.service.ts`)
  - Full CRUD operations for roles
  - Role inheritance support
  - Vendor-scoped roles
  - Max user limits per role
  - Assign/revoke roles to users
  - Dual storage (PostgreSQL + Firestore sync)
  
- ✅ **PermissionService** (`/src/modules/roles/permission.service.ts`)
  - Permission CRUD operations
  - User permission checking (direct + role-based)
  - Grant/revoke direct permissions
  - System permissions initialization
  - Permission categories and risk levels

- ✅ **RoleController** (`/src/modules/roles/role.controller.ts`)
  - Complete REST API endpoints
  - Role management endpoints
  - Permission management endpoints
  - User assignment endpoints

#### API Endpoints Created
- `POST /api/roles` - Create role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `GET /api/roles/:id` - Get role by ID
- `GET /api/roles` - List roles with filters
- `POST /api/roles/assign` - Assign role to user
- `DELETE /api/roles/assign` - Revoke role from user
- `GET /api/roles/user/:userId` - Get user's roles
- `POST /api/permissions` - Create permission
- `PUT /api/permissions/:id` - Update permission
- `DELETE /api/permissions/:id` - Delete permission
- `GET /api/permissions` - List permissions
- `GET /api/permissions/categories` - Get permission categories
- `POST /api/permissions/check` - Check user permission
- `GET /api/permissions/user/:userId` - Get user's effective permissions
- `POST /api/permissions/grant` - Grant direct permission to user
- `POST /api/permissions/revoke` - Revoke permission from user
- `POST /api/permissions/init-system` - Initialize system permissions

### 2.1 Database Design
- [x] Create Roles collection/table structure
- [x] Design permissions schema
- [x] Create role-permission mapping
- [x] Add audit logging for role changes

### 2.2 Operations Service Role Management
- [x] Create RoleService with CRUD operations
- [x] Create PermissionService for permission management
- [x] Create RoleController with endpoints
- [x] Implement /api/roles endpoints
- [x] Implement /api/permissions endpoints
- [x] Add role assignment to users
- [x] Add permission checking middleware

### 2.3 Admin App Role Management API
- [ ] Create /api/roles proxy routes
- [ ] Create /api/permissions proxy routes
- [ ] Update user endpoints to include role data
- [ ] Add role assignment endpoints

## Phase 3: UI Redesign - Users Page (TODO)

### 3.1 Users List Page (`/admin/users`)
Based on mockup: `users-page.html`

#### Components to Create:
- [ ] UserStats component (shows Total Users, Active Users, Inactive Users, Pending Invitations)
- [ ] UserFilters component (search, role filter, status filter, department filter)
- [ ] UserTable component (enhanced with new columns and actions)
- [ ] UserQuickActions component (bulk actions dropdown)
- [ ] UserActivityIndicator component (last login, activity status)

#### Features to Implement:
- [ ] Advanced search with filters
- [ ] Bulk user actions (activate, deactivate, delete, export)
- [ ] User status management (active, inactive, pending, suspended)
- [ ] Department assignment
- [ ] Last login tracking
- [ ] Activity indicators
- [ ] Export to CSV/Excel
- [ ] Pagination with customizable page size
- [ ] Sort by any column

### 3.2 User Details Modal/Page
- [ ] User profile view with all details
- [ ] Activity timeline
- [ ] Permission overview
- [ ] Role assignment UI
- [ ] Audit log for user actions
- [ ] Password reset functionality
- [ ] 2FA management
- [ ] Session management

## Phase 4: UI Redesign - Role Management (TODO)

### 4.1 Roles List Page (`/admin/roles`)
Based on mockup: `role-management-admin.html`

#### Components to Create:
- [ ] RoleCard component (displays role with user count and permissions summary)
- [ ] RoleGrid component (responsive grid layout for role cards)
- [ ] PermissionMatrix component (visual permission grid)
- [ ] RoleStats component (Total Roles, Custom Roles, System Roles)
- [ ] RoleActions component (edit, duplicate, delete actions)

#### Features to Implement:
- [ ] Visual role hierarchy display
- [ ] Drag-and-drop permission assignment
- [ ] Role templates (predefined role configurations)
- [ ] Role duplication
- [ ] Permission categories (grouped permissions)
- [ ] Role comparison view
- [ ] Bulk permission updates

### 4.2 Create/Edit Role Modal
Based on mockup: `role-management-admin-create-role.html`

#### Components to Create:
- [ ] RoleForm component (name, description, type)
- [ ] PermissionSelector component (checkbox tree for permissions)
- [ ] PermissionSearch component (search permissions)
- [ ] PermissionPreview component (shows selected permissions)
- [ ] RoleInheritance component (inherit from existing role)

#### Features to Implement:
- [ ] Step-by-step role creation wizard
- [ ] Permission inheritance from parent roles
- [ ] Permission conflict detection
- [ ] Role validation
- [ ] Preview before save
- [ ] Permission templates

## Phase 5: Advanced Features (TODO)

### 5.1 Dynamic Permissions
- [ ] Resource-based permissions (e.g., specific vendor access)
- [ ] Time-based permissions (temporary access)
- [ ] Conditional permissions (based on user attributes)
- [ ] Permission delegation (users can grant subset of their permissions)

### 5.2 Audit & Compliance
- [ ] Complete audit trail for all user/role changes
- [ ] Compliance reports (who has access to what)
- [ ] Access reviews (periodic permission reviews)
- [ ] Suspicious activity detection
- [ ] Login anomaly detection

### 5.3 Integration Features
- [ ] SSO integration (if needed)
- [ ] LDAP/Active Directory sync
- [ ] API key management for service accounts
- [ ] OAuth2 client management

## Phase 6: Security Enhancements (TODO)

### 6.1 Authentication Security
- [ ] Multi-factor authentication (MFA/2FA)
- [ ] Session management (concurrent session limits)
- [ ] Password policies (complexity, expiration)
- [ ] Account lockout policies
- [ ] IP whitelisting for admin users

### 6.2 Authorization Security
- [ ] Fine-grained permissions (field-level access control)
- [ ] Data masking for sensitive fields
- [ ] Row-level security (vendor-specific data isolation)
- [ ] API rate limiting per role

## Phase 7: Testing & Documentation (TODO)

### 7.1 Testing
- [ ] Unit tests for all services
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Permission testing matrix
- [ ] Security penetration testing

### 7.2 Documentation
- [ ] API documentation for all endpoints
- [ ] User management guide for admins
- [ ] Role configuration best practices
- [ ] Security guidelines
- [ ] Migration guide from old system

## Technical Specifications

### Data Models

#### User Model (Enhanced)
```typescript
interface User {
  id: string;
  uid: string; // Firebase UID
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber?: string;
  avatar?: string;
  
  // Role & Permissions
  roles: string[]; // Multiple roles support
  permissions: string[]; // Direct permissions
  effectivePermissions?: string[]; // Computed from roles + direct
  
  // Organization
  vendorId?: string;
  department?: string;
  title?: string;
  reportsTo?: string; // Manager's user ID
  
  // Status
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Security
  mfaEnabled: boolean;
  mfaMethods: ('sms' | 'totp' | 'email')[];
  lastPasswordChange: Date;
  passwordExpiresAt?: Date;
  
  // Activity
  lastLoginAt?: Date;
  lastActivityAt?: Date;
  loginCount: number;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  deletedAt?: Date; // Soft delete
  
  // Preferences
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}
```

#### Role Model
```typescript
interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'system' | 'custom';
  
  // Permissions
  permissions: string[];
  inheritFrom?: string[]; // Parent role IDs
  
  // Constraints
  maxUsers?: number;
  validFrom?: Date;
  validUntil?: Date;
  
  // Organization
  vendorId?: string; // Vendor-specific role
  departmentId?: string; // Department-specific role
  
  // UI Configuration
  color?: string;
  icon?: string;
  order?: number; // Display order
  
  // Metadata
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  isActive: boolean;
  isDefault: boolean; // Default role for new users
}
```

#### Permission Model
```typescript
interface Permission {
  id: string;
  name: string; // e.g., 'orders.view'
  displayName: string;
  description: string;
  category: string; // e.g., 'Orders', 'Users', 'Reports'
  
  // Resource-based
  resource?: string; // e.g., 'order', 'user', 'vendor'
  action: string; // e.g., 'view', 'create', 'update', 'delete'
  
  // Constraints
  conditions?: {
    field: string;
    operator: string;
    value: any;
  }[];
  
  // Dependencies
  requires?: string[]; // Required permissions
  conflicts?: string[]; // Conflicting permissions
  
  // Risk Level
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

## API Endpoints Design

### User Management
- `GET /api/users` - List all users (with filters)
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)
- `POST /api/users/:id/activate` - Activate user
- `POST /api/users/:id/deactivate` - Deactivate user
- `POST /api/users/:id/reset-password` - Reset password
- `POST /api/users/:id/roles` - Assign roles
- `DELETE /api/users/:id/roles/:roleId` - Remove role
- `GET /api/users/:id/permissions` - Get effective permissions
- `GET /api/users/:id/activity` - Get activity log

### Role Management
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get role details
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `POST /api/roles/:id/duplicate` - Duplicate role
- `GET /api/roles/:id/users` - Get users with role
- `POST /api/roles/:id/permissions` - Add permissions
- `DELETE /api/roles/:id/permissions/:permissionId` - Remove permission

### Permission Management
- `GET /api/permissions` - List all permissions
- `GET /api/permissions/categories` - Get permission categories
- `GET /api/permissions/check` - Check user permissions
- `POST /api/permissions/validate` - Validate permission set

## Migration Plan

### Phase 1: Data Migration
1. Export existing user data from Firestore
2. Map existing roles to new role system
3. Create permission mappings
4. Migrate user-role associations
5. Validate data integrity

### Phase 2: Feature Rollout
1. Deploy new backend services
2. Enable read-only UI for testing
3. Gradual feature enablement
4. Monitor for issues
5. Full cutover

### Phase 3: Cleanup
1. Remove old user management code
2. Archive old data
3. Update documentation
4. Train administrators

## Success Metrics

### Technical Metrics
- API response time < 200ms for user queries
- 99.9% uptime for authentication services
- Zero data loss during migration
- 100% test coverage for critical paths

### Business Metrics
- Reduce time to provision new users by 50%
- Decrease permission-related support tickets by 60%
- Improve audit compliance score to 100%
- Increase admin efficiency by 40%

### User Experience Metrics
- User satisfaction score > 4.5/5
- Task completion rate > 95%
- Error rate < 1%
- Time to complete common tasks reduced by 30%

## Timeline Estimate

- **Phase 1**: ✅ Completed
- **Phase 2**: 1 week (Role Management Backend)
- **Phase 3**: 1 week (Users Page UI)
- **Phase 4**: 1 week (Role Management UI)
- **Phase 5**: 2 weeks (Advanced Features)
- **Phase 6**: 1 week (Security Enhancements)
- **Phase 7**: 1 week (Testing & Documentation)

**Total Estimated Time**: 7 weeks

## Next Steps

1. Review and approve the project plan
2. Prioritize phases based on business needs
3. Begin Phase 2: Role Management System backend
4. Set up development environment for UI work
5. Schedule design review sessions for mockups

## Notes

- All database operations must go through operations service
- Admin app is presentation layer only
- Firebase Auth remains the primary authentication provider
- Maintain backward compatibility during migration
- Consider vendor-specific permissions and data isolation
- Ensure audit trail for all sensitive operations

## Dependencies

- Firebase Admin SDK (operations service)
- TypeORM for PostgreSQL operations
- Material-UI for admin interface
- React Hook Form for form management
- Algolia for user search functionality
- SendGrid for email notifications

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | High | Comprehensive backups, staged rollout |
| Performance degradation | Medium | Load testing, caching strategy |
| Security vulnerabilities | High | Security audit, penetration testing |
| User adoption issues | Medium | Training, documentation, gradual rollout |
| Integration conflicts | Low | API versioning, backward compatibility |

## Open Questions

1. Should we support multiple roles per user or single role?
2. Do we need field-level permissions or resource-level is sufficient?
3. Should permissions be cached or always fetched real-time?
4. Do we need approval workflows for role changes?
5. Should we implement session recording for audit purposes?
6. What's the retention policy for audit logs?
7. Do we need to support custom attributes for users?
8. Should we implement password-less authentication options?

---

**Document Version**: 1.0
**Created**: 2024-08-22
**Last Updated**: 2024-08-22
**Author**: Claude Assistant
**Status**: In Planning