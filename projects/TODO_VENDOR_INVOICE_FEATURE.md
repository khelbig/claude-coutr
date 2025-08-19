# Vendor Invoice Upload Feature - Implementation TODO

## Overview
Implementing a vendor invoice upload system that allows admins to upload vendor invoices to AP Invoices, with automatic Google Drive storage, COGS calculation, and discrepancy detection.

## IMPORTANT UPDATE
After reviewing the codebase, vendor invoice uploads should be integrated into the existing AP Invoices system (not individual orders):
- AP Invoices already aggregate multiple orders by vendor
- Vendors typically send one invoice covering multiple orders
- Payment tracking already happens at the AP Invoice level
- COGS comparison makes more sense at the aggregated invoice level

## Frontend Tasks (Admin App)

### 1. Research existing order details implementation in Admin app
**Status:** COMPLETED
**Priority:** HIGH
**Details:** 
- Examine the current order details page structure
- Understand the modal system being used
- Check existing file upload implementations
- Review the order data model
**Completion Notes:** 
- Main order details component: `/admin/src/components/dashboard/order/OrderDetailsContent.tsx`
- Uses Material-UI Dialog components for modals (standard pattern)
- File upload handled by FileDropzone component with react-dropzone
- S3 integration exists for file storage (shipping labels)
- Order has shipping_label property for document URLs
- Authentication uses Firebase tokens
- Existing pattern for document viewing/downloading established 

### 2. Add Upload Vendor Invoice button to AP Invoice details page
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Add button to AP Invoice details header
- Style consistently with existing buttons (Mark as Paid, etc.)
- Position with other action buttons
- Show upload status if vendor invoice already uploaded
**Completion Notes:**
- Added "Upload Vendor Invoice" button with Receipt icon in AP Invoice details header
- Positioned with other action buttons (Add Orders, Print, Download)
- Only shows when invoice is not paid (same logic as Add Orders)
- Connected to vendorInvoiceDialog state
- Uses outlined variant with primary color

### 3. Create vendor invoice upload modal component for AP Invoices
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Create new modal component following existing patterns
- Include proper state management
- Handle open/close actions
- Pass order data to modal
**Completion Notes:**
- Created VendorInvoiceUploadModal component following MUI Dialog pattern
- Integrated with AP Invoice details page
- Includes form reset on close
- Passes AP Invoice data for comparison
- Calls loadInvoice on successful upload

### 4. Implement file dropzone with PDF/image support
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Use existing FileDropzone component or enhance it
- Support PDF, JPG, PNG, JPEG formats
- Show file preview
- Validate file size and type
- Handle multiple file selection
**Completion Notes:**
- Used existing FileDropzone component
- Configured for PDF and image files (PNG, JPG, JPEG)
- Set max file size to 10MB
- Limited to single file upload
- Shows file preview automatically

### 5. Create invoice matching form in modal
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Vendor invoice number field (required)
- Vendor invoice date picker (required)
- Total amount field (required, currency formatted)
- Vendor auto-populated from AP Invoice
- Option to confirm/adjust line items if needed
- Notes field (optional)
**Completion Notes:**
- Added vendor invoice number field (required)
- Added date picker with MUI X Date Pickers
- Added amount breakdown fields (COGS, shipping, handling, total)
- Vendor info shown in dialog header
- Auto-calculate total button for convenience
- Optional notes field with multiline support

### 6. Implement COGS comparison at AP Invoice level
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Compare AP Invoice calculated totals vs vendor invoice totals
- Show COGS discrepancy
- Show shipping cost discrepancy
- Show handling cost discrepancy
- Calculate total variance amount and percentage
- Highlight significant discrepancies
**Completion Notes:**
- Added "Show Comparison" toggle button
- Displays side-by-side comparison table
- Shows AP Invoice vs Vendor Invoice amounts
- Calculates and displays differences for each component
- Color coding: red for overages, green for savings
- Alert shown for significant discrepancies

### 7. Create uploaded vendor invoices section in AP Invoice details
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Add section to AP Invoice details page
- List all uploaded vendor invoices
- Show vendor invoice number, date, amount
- Include view/download actions
- Display upload timestamp and user
- Show COGS comparison summary
**Completion Notes:**
- Created VendorInvoicesSection component
- Displays vendor invoice number, date, file type, amount, and discrepancy
- Shows upload info (user email and timestamp)
- Actions menu with View, Download, and Delete options
- View opens Google Drive URL in new tab
- Delete requires confirmation and removes from system
- Shows total discrepancy summary at bottom
- Integrated into AP Invoice details page

### 8. Integrate invoice viewer for uploaded files
**Status:** PENDING
**Priority:** MEDIUM
**Details:**
- Use PDF viewer for PDF files
- Display images directly
- Open in modal or new tab
- Include download option
**Completion Notes:**

## Backend Tasks (Operations App)

### 9. Create vendor invoice upload endpoint in Operations app
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- POST /webhooks/vendor-invoice/upload
- Accept multipart form data with AP Invoice ID
- Validate authentication
- Process file and metadata
- Return upload status and processed data
**Completion Notes:**
- Created POST /api/vendors/:vendorId/invoices endpoint
- Uses multer for file upload (10MB limit, PDF/images only)
- Accepts form data with invoice details and order associations
- Returns created vendor invoice with Google Drive URL

### 10. Create vendor invoice GET endpoint in Operations app
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- GET /webhooks/vendor-invoice/:apInvoiceId
- Return all vendor invoices for an AP Invoice
- Include Google Drive URLs
- Return COGS calculations and comparisons
**Completion Notes:**
- Created GET /api/vendors/:vendorId/invoices for vendor-specific invoices
- Created GET /api/ap-invoices/:apInvoiceId/vendor-invoices for AP Invoice
- Created GET /api/vendors/:vendorId/invoices/:invoiceId for single invoice
- Created DELETE /api/vendors/:vendorId/invoices/:invoiceId
- All endpoints return full invoice data with comparison calculations

### 11. Implement Google Drive service in Operations app
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Set up Google Drive API credentials
- Create service for folder management
- Implement file upload to Drive
- Generate shareable links
- Handle folder structure (Vendor/Year/Month)
**Completion Notes:**
- Created GoogleDriveService with folder hierarchy support
- Uses service account credentials (falls back to Firebase service account)
- Auto-creates folder structure: Vendor Invoices/[Vendor]/[Year]/[Month]
- Generates shareable links with public read access
- Handles file deletion when invoice is removed

### 12. Implement COGS calculation and comparison logic
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Calculate expected COGS from AP Invoice data
- Extract actual COGS from vendor invoice (if possible)
- Compare AP Invoice totals vs vendor invoice totals
- Calculate discrepancies for COGS, shipping, handling
- Store calculations in database
**Completion Notes:**
- Implemented comparison calculation in VendorInvoiceService
- Calculates discrepancies for COGS, shipping, handling, and total
- Stores both absolute values and percentages
- Comparison data stored with each vendor invoice
- Only compares selected orders, not entire AP Invoice

### 13. Connect Admin AP Invoice upload to Operations API
**Status:** COMPLETED
**Priority:** HIGH
**Details:**
- Configure API endpoints in Admin app
- Handle S3 temporary upload
- Call Operations API with file URL and AP Invoice data
- Process response and update UI
- Handle errors gracefully
**Completion Notes:**
- Created API proxy endpoint at /api/vendor-invoices
- Added OPERATIONS_API_URL environment variable (default: http://localhost:8000)
- Updated vendor invoice upload modal to send multipart form data
- Proxy endpoint validates user permissions before forwarding
- Handles file upload directly without S3 intermediate storage
- Proper error handling and user feedback via toast messages

### 14. Update AP Invoice API to include vendor invoice data
**Status:** PENDING
**Priority:** HIGH
**Details:**
- Modify AP Invoice data model to include vendor invoice references
- Update GET endpoints to return vendor invoice data
- Include COGS comparison data in responses
- Update Algolia index with vendor invoice info
**Completion Notes:**

### 15. Test complete flow and fix any issues
**Status:** PENDING
**Priority:** HIGH
**Details:**
- Test file upload process
- Verify Google Drive integration
- Check COGS calculations
- Test error scenarios
- Verify permissions and security
- Test with various file types
**Completion Notes:**

## Technical Implementation Details

### Data Models

#### VendorInvoice (Firestore/PostgreSQL)
```typescript
{
  id: string;
  apInvoiceId: string;  // Reference to our AP Invoice
  vendorId: string;
  vendorName: string;
  vendorInvoiceNumber: string;  // Vendor's invoice number
  vendorInvoiceDate: Date;
  totalAmount: number;
  cogsAmount: number;
  shippingAmount: number;
  handlingAmount: number;
  currency: string;
  googleDriveFileId: string;
  googleDriveUrl: string;
  s3Key: string;
  comparisonData: {
    apInvoiceTotals: {
      cogs: number;
      shipping: number;
      handling: number;
      total: number;
    };
    vendorInvoiceTotals: {
      cogs: number;
      shipping: number;
      handling: number;
      total: number;
    };
    discrepancies: {
      cogs: number;
      cogsPercentage: number;
      shipping: number;
      shippingPercentage: number;
      handling: number;
      handlingPercentage: number;
      total: number;
      totalPercentage: number;
    };
  };
  uploadedBy: string;
  uploadedAt: Date;
  status: 'pending' | 'processed' | 'error';
  notes: string;
}

// Update APInvoice model to include vendor invoice references
interface APInvoice {
  // ... existing fields ...
  vendorInvoices?: VendorInvoiceReference[];
  hasVendorInvoice: boolean;
  vendorInvoiceDiscrepancy?: number;
}

interface VendorInvoiceReference {
  vendorInvoiceId: string;
  vendorInvoiceNumber: string;
  uploadedAt: Date;
}
```

### API Flow
1. User selects specific order line items from AP Invoice to associate with vendor invoice
2. User uploads file directly to Operations API via multipart form data
3. Operations app:
   - Receives file and order line item IDs
   - Creates Google Drive folder structure if needed (Vendor/Year/Month)
   - Uploads to Google Drive
   - Processes invoice data
   - Associates vendor invoice with specific order line items
   - Calculates discrepancies at line item level
   - Stores in Firestore and PostgreSQL
   - Returns processed data
4. Admin UI updates to show which line items have vendor invoices attached

### Security Considerations
- Validate file types and sizes
- Scan for malware
- Ensure proper authentication
- Restrict access based on roles
- Audit trail for all uploads
- Secure Google Drive permissions

### Error Handling
- Network failures
- Invalid file formats
- Google Drive API errors
- Database errors
- COGS calculation errors
- Missing order data

## Notes
- Keep UI consistent with existing admin design
- Follow existing code patterns
- Ensure mobile responsiveness
- Add proper loading states
- Include success/error notifications
- Document all new endpoints