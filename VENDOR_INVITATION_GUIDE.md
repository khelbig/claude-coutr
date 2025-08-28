# Vendor Invitation Guide

## Overview
There are multiple ways to invite vendors to their portal in the COUTR platform. This guide covers all available methods.

## Method 1: Vendor CRM - Introduction Email (Recommended)

### Location
`/admin/vendor-crm` → Click on a vendor → "Send Introduction Email" button

### Process
1. **Navigate to Vendor CRM**
   - Go to `/admin/vendor-crm`
   - Find or create the vendor record
   - Click on the vendor to open details

2. **Send Introduction Email**
   - Click the "Send Introduction Email" button (envelope icon)
   - Fill in:
     - Recipient Email (vendor's email)
     - Recipient Name (contact person)
     - Sender Name (defaults to "The COUTR Team")
     - Sender Title (defaults to "Vendor Relations")
   - Click "Send Email"

3. **What Happens**
   - Vendor receives a professional introduction email
   - Email includes partnership benefits and next steps
   - Vendor can click to schedule a call or express interest

### Email Template Used
The system uses the "Vendor Introduction - Invitation to Partner" template which includes:
- Partnership opportunity overview
- Benefits of joining COUTR
- Call-to-action buttons
- Professional branding

## Method 2: Team Management - Direct User Creation

### Location
`/dashboard/team` → "Invite Member" button

### Process
1. **Create Vendor Account First**
   - Ensure vendor exists in `/admin/vendors` or `/admin/vendor-crm`
   - Note the vendor ID

2. **Navigate to Team Management**
   - As an admin, go to `/dashboard/team`
   - Or use "view as" functionality to view as the vendor
   - Click "Invite Member"

3. **Create Vendor User**
   - Fill in vendor contact details:
     - Email
     - First Name
     - Last Name
     - Title (optional)
     - Role (select "Owner" for primary vendor contact)
   - If admin, select the vendor from dropdown
   - Click "Send Invite"

4. **Manual Firebase Setup Required**
   - Currently, Firebase user creation is commented out
   - You need to manually:
     ```javascript
     // In Firebase Console or via Admin SDK:
     1. Create user in Firebase Authentication
     2. Send password reset email
     3. Update SuppliersUsers collection with proper vendor_id
     ```

## Method 3: Email Workflows - Automated Invitations

### Location
`/admin/email` → Workflows tab

### Setup Process
1. **Create or Use Existing Workflow**
   - Go to `/admin/email`
   - Click on "Workflows" tab
   - Create new workflow or edit existing

2. **Configure Trigger**
   - Set trigger type: "Event Based"
   - Select event: `vendor.created` or `vendor.approved`
   - This automatically sends invitation when vendor is created/approved

3. **Configure Email Action**
   - Select template: "Vendor Introduction - Invitation to Partner"
   - Map variables from vendor data
   - Enable workflow

### Available Email Templates for Vendors
- **Vendor Introduction - Invitation to Partner**: Initial outreach
- **Onboarding Help - Complete Your Setup**: Follow-up for incomplete setups
- **Contract Renewal Reminder**: For existing vendors
- **Weekly Performance Summary**: Automated performance reports

## Method 4: Manual Process with Firebase Admin

### For Developers/Admins with Firebase Access

1. **Create Vendor in System**
   ```bash
   # Via admin UI or API
   POST /api/vendors
   {
     "companyName": "Vendor Name",
     "email": "vendor@example.com",
     "status": "INVITED"
   }
   ```

2. **Create Firebase User**
   ```javascript
   // Using Firebase Admin SDK
   const admin = require('firebase-admin');
   
   // Create user
   const userRecord = await admin.auth().createUser({
     email: 'vendor@example.com',
     password: 'temporary-password',
     displayName: 'Vendor Name'
   });
   
   // Send password reset email
   await admin.auth().generatePasswordResetLink('vendor@example.com');
   ```

3. **Create SuppliersUsers Record**
   ```javascript
   // Add to Firestore
   await admin.firestore().collection('SuppliersUsers').doc(userRecord.uid).set({
     email: 'vendor@example.com',
     vendor_id: 'vendor-uuid',
     role: 'owner',
     first_name: 'John',
     last_name: 'Doe',
     status: 'active',
     created_at: new Date()
   });
   ```

## Access Credentials for Vendors

### What Vendors Need
1. **Email Address**: Used as username
2. **Password**: Set via password reset email
3. **Portal URL**: `https://admin.coutr.com/dashboard` (production) or `http://localhost:3000/dashboard` (development)

### First-Time Login Process
1. Vendor receives invitation email
2. Clicks password reset link
3. Sets their password
4. Logs in at `/auth/firebase/sign-in`
5. Redirected to `/dashboard` (vendor portal)

### Portal Access
Once logged in, vendors have access to:
- **Dashboard**: Overview and stats
- **Orders**: View and manage orders
- **Products**: Browse products (if configured)
- **Team**: Manage team members
- **Invoices**: View invoices and payments
- **Settings**: Update company information

## Best Practices

### For Initial Vendor Onboarding
1. **Create vendor record** in Vendor CRM with all details
2. **Send introduction email** to gauge interest
3. **After positive response**, create user account
4. **Schedule onboarding call** to walk through portal
5. **Monitor onboarding progress** via CRM status

### For Bulk Invitations
1. Use **email workflows** for automation
2. Set up **event-based triggers** for new vendor creation
3. Use **batch operations** in operations service for multiple vendors
4. Track **invitation status** in vendor CRM

### Security Considerations
- Always verify vendor email before creating accounts
- Use strong temporary passwords
- Require password change on first login
- Monitor failed login attempts
- Set up 2FA for high-value vendors

## Troubleshooting

### Common Issues

1. **Vendor Can't Log In**
   - Check if user exists in Firebase Authentication
   - Verify SuppliersUsers document has correct vendor_id
   - Ensure role is set (not null)
   - Check if account is active (not suspended)

2. **No Access to Dashboard**
   - Verify vendor_id is set in SuppliersUsers
   - Check if vendor exists in Suppliers collection
   - Ensure cookies are set correctly (token and auth-token)

3. **Email Not Sending**
   - Check SendGrid API key configuration
   - Verify email template exists
   - Check operations service logs for errors
   - Ensure email address is valid

4. **Wrong Portal Access**
   - Vendors should use `/dashboard/*` routes
   - Admins use `/admin/*` routes
   - Check user role in SuppliersUsers collection

## API Endpoints

### Vendor Creation
```
POST /api/vendors
POST /api/admin/vendor-crm
```

### Send Introduction Email
```
POST /api/admin/vendor-crm/{vendorId}/send-introduction-email
```

### Team Member Invitation
```
POST /api/vendor/team
```

### Email Sending
```
POST /api/email/send
{
  "templateId": "template-uuid",
  "to": "vendor@example.com",
  "variables": {
    "vendorName": "Vendor Company",
    "contactName": "John Doe"
  }
}
```

## Future Improvements

### Planned Features
1. **One-Click Invitation**: Create vendor and user in single action
2. **Magic Link Login**: Passwordless authentication
3. **Invitation Tracking**: Track email opens and clicks
4. **Automated Follow-ups**: Send reminders if invitation not accepted
5. **Bulk Import**: CSV upload for multiple vendors
6. **Self-Service Registration**: Allow vendors to sign up directly

### In Development
- Improved Firebase user creation in team management
- Invitation status tracking in vendor CRM
- Automated onboarding workflows
- Portal customization per vendor

## Contact

For issues with vendor invitations, check:
- Operations service logs: `/admin/queues`
- Email service status: `/admin/email`
- Firebase Authentication console
- Firestore SuppliersUsers collection

Remember: The vendor invitation process involves multiple systems (Firebase Auth, Firestore, Email Service, Admin App) so check each component when troubleshooting.