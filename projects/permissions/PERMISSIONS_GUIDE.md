# Document Permissions Management Guide

## Overview
The document permissions management system has been fully implemented with the following features:

## How to Access Document Permissions

### 1. From Vendor Documents Page
1. Navigate to a vendor: http://localhost:3000/admin/vendor-crm/[vendorId]/documents
2. Click on any document to open the document viewer
3. Look for the **"Share Document"** button in the right sidebar (it has a gold/yellow color)
4. Click the button to open the Permissions Management dialog

### 2. From User Management Page
1. Go to http://localhost:3000/admin/users
2. Click on the **"Document Permissions"** tab (third tab with files icon)
3. You'll see the Document Permissions Matrix where you can configure permissions for different user groups

## Features Implemented

### Share Document Dialog (Following the mockup design)
The Share Document dialog includes 4 tabs:

1. **Users & Groups Tab**
   - Add individual users or groups with specific permission levels
   - Search and autocomplete for existing users in the system
   - Permission levels: View Only, View & Download, Edit, Full Access
   - Shows existing shared users with their current permissions

2. **Role Templates Tab**
   - Pre-configured permission templates for common roles
   - Quick assignment of permissions based on user roles

3. **Link Sharing Tab**
   - Generate shareable links with expiration dates
   - Control what external users can do with shared links

4. **Activity Log Tab**
   - View all document activities (views, downloads, edits, shares)
   - Real-time tracking of user interactions with the document

### Permission Levels
- **View Only**: Can only view the document in the browser
- **View & Download**: Can view and download the document
- **Edit**: Can edit document metadata and properties
- **Full Access**: Can share, delete, and manage all aspects of the document

### Additional Features
- Real-time activity tracking
- Version history
- Email document with attachments
- Download in multiple formats
- Contextual actions based on document type
- Permission-based UI controls (buttons only show if user has permission)

## Important Notes
- Admin and Superadmin users have Full Access by default
- Regular users have View Only access by default
- The Share Document button is styled with a gold/yellow color to make it stand out
- All user data is fetched from the real system (no dummy data)

## Troubleshooting
If you don't see the Share Document button:
1. Make sure you're logged in as an admin or superadmin
2. Click on a document to open the document viewer
3. Look in the right sidebar under "Quick Actions"
4. The button should be visible with a gold/yellow color

If you still don't see it, try:
- Refreshing the page (Cmd+R or Ctrl+R)
- Clearing your browser cache
- Checking the browser console for any errors