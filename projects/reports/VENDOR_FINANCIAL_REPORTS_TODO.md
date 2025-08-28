# Vendor Financial Reports Implementation TODO

## Main Objective
Create an EXACT copy of `/admin/financial-reports` for vendors at `/dashboard/financial-reports`

## Key Differences from Admin Version
1. NO vendor dropdown - vendor determined by logged-in user
2. Only show PAID AP invoices
3. Remove "Import Duties Owed" tab
4. Remove "Orders with Invoices" tab  
5. Support View As feature for admins

## Files to Copy EXACTLY

### 1. Frontend Component
- [ ] Copy `/src/components/dashboard/financial-reports/financial-reports-dashboard.tsx`
- [ ] Save as `/src/components/dashboard/vendor/financial-reports/vendor-financial-reports-dashboard.tsx`
- [ ] Remove vendor selector dropdown
- [ ] Remove Import Duties tab
- [ ] Remove Orders with Invoices tab
- [ ] Change API calls from `financialReportsApi` to `vendorFinancialReportsApi`

### 2. Loading Skeleton
- [ ] Copy `/src/components/dashboard/financial-reports/loading-skeleton.tsx`
- [ ] Save as `/src/components/dashboard/vendor/financial-reports/loading-skeleton.tsx`
- [ ] No changes needed

### 3. API Client
- [ ] Copy `/src/lib/financial-reports.ts`
- [ ] Save as `/src/lib/vendor-financial-reports.ts`
- [ ] Change all URLs to use `/api/vendor/financial-reports/*` instead of `/api/admin/financial-reports/*`
- [ ] Remove vendorId parameters (handled by backend)

### 4. API Proxy Routes (Admin)
- [ ] Create `/src/app/api/vendor/financial-reports/report/route.ts`
- [ ] Create `/src/app/api/vendor/financial-reports/summary/route.ts`
- [ ] Create `/src/app/api/vendor/financial-reports/transactions/route.ts`
- [ ] Create `/src/app/api/vendor/financial-reports/payments/route.ts`
- [ ] Create `/src/app/api/vendor/financial-reports/export/route.ts`
- [ ] All routes proxy to operations service `/api/vendor/financial-reports/*`
- [ ] Forward `x-view-as-supplier` header

### 5. Page Component
- [ ] Create `/src/app/dashboard/financial-reports/page.tsx`
- [ ] Import and render VendorFinancialReportsDashboard

### 6. Operations Service Controller
- [ ] Copy `/operations/src/modules/financial-reports/financial-reports.controller.ts`
- [ ] Save as `/operations/src/modules/financial-reports/vendor-financial-reports.controller.ts`
- [ ] Add vendor isolation via Firebase auth
- [ ] Support x-view-as-supplier header
- [ ] Filter AP invoices to only show paid
- [ ] Register in operations module

## Current Status
- [x] Created initial attempt (FAILED - too different from admin)
- [x] DELETED current implementation
- [x] COPIED admin financial-reports-dashboard.tsx to vendor location
- [x] COPIED loading-skeleton.tsx to vendor location
- [x] Applied minimal changes with sed script
- [ ] Need to remove vendor selector UI completely
- [ ] Need to fix loadVendorData to not use selectedVendor
- [ ] Need to remove Import Duties tab
- [ ] Need to filter AP invoices to only show paid ones

## Next Steps
1. Delete all vendor financial reports files I created
2. Copy the admin files EXACTLY
3. Make only the required minimal changes
4. Test that it works