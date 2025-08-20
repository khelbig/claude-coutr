# Vendor Report System - Complete Technical Documentation

## 1. System Overview

### Purpose
This system provides comprehensive financial reporting for vendor relationships, tracking orders, payments, invoices, and calculating real-time balances. It serves as an admin-only tool for accounts payable reconciliation and vendor management.

### Core Functionality
- **Vendor Selection & Filtering**: Choose specific vendors and date ranges
- **Order Management**: Track all purchase orders with itemized costs
- **Payment Tracking**: Record all outgoing payments to vendors
- **Invoice Verification**: Monitor which orders have proper documentation
- **Balance Calculation**: Real-time running balance with debit/credit tracking
- **Data Export**: Generate Excel reports with multiple worksheets

---

## 2. Data Structure & Relationships

### 2.1 Vendor Object
```javascript
vendor: {
    id: 'v1',                    // Unique identifier
    name: 'ABC Supplies Co.',    // Display name
    status: 'premium',           // 'premium' or 'regular' - affects UI styling
    vendor_code: 'VEN-001',      // Optional: Internal vendor code
    transactions: 245            // Total historical transaction count
}
```

### 2.2 Order Object
```javascript
order: {
    id: 'ORD-001',                          // Unique order ID
    date: '2024-01-15',                     // Order date (YYYY-MM-DD)
    vendorOrderNumber: 'VO-2024-001',       // Vendor's reference number
    supplyPrice: 5000.00,                   // Base cost of supplies
    handling: 150.00,                       // Handling fees
    shipping: 250.00,                       // Shipping costs
    total: 5400.00,                         // Sum of all costs
    hasVendorInvoice: true,                 // Boolean: invoice received?
    vendorInvoiceNumber: 'INV-2024-001',    // Vendor invoice reference
    hasShippingInvoice: true,               // Boolean: shipping docs received?
    shippingInvoiceNumber: 'SHIP-2024-001', // Shipping invoice reference
    status: 'completed',                    // 'completed', 'pending', 'cancelled'
    daysOutstanding: 0                      // Days since order without payment
}
```

### 2.3 Payment Object
```javascript
payment: {
    id: 'PAY-001',                 // Unique payment ID
    date: '2024-01-10',            // Payment date
    type: 'Deposit',               // 'Deposit', 'AP Invoice', 'Payment', 'Credit', 'Refund'
    amount: 10000.00,              // Payment amount (always positive)
    reference: 'DEP-2024-001',     // Internal reference number
    method: 'Bank Transfer',       // 'Check', 'ACH', 'Wire Transfer', 'Bank Transfer', 'Credit Card'
    status: 'cleared'              // 'cleared', 'pending', 'processing'
}
```

### 2.4 Transaction Object (Computed)
```javascript
transaction: {
    date: '2024-01-15',
    type: 'Order',                        // 'Order' or payment type
    description: 'Order VO-2024-001',     // Human-readable description
    vendorOrderNumber: 'VO-2024-001',     // Reference to order
    vendorInvoice: 'INV-2024-001',        // Invoice reference
    shippingInvoice: 'SHIP-2024-001',     // Shipping reference
    debit: 5400.00,                       // Amount owed (orders)
    credit: 0,                            // Amount paid (payments)
    balance: -5400.00                     // Running balance (negative = we owe)
}
```

### 2.5 Summary Object (Computed)
```javascript
summary: {
    totalOrders: 45000.00,         // Sum of all order totals
    totalPayments: 42500.00,       // Sum of all payment amounts
    balance: -2500.00,             // totalPayments - totalOrders (negative = owe vendor)
    orderCount: 12,                // Number of orders
    paymentCount: 8,               // Number of payments
    avgOrderValue: 3750.00,        // totalOrders / orderCount
    lastPaymentDate: '2024-01-28', // Most recent payment date
    invoiceCompletionRate: 83,     // % of orders with both invoices
    onTimePaymentRate: 92          // % of payments made on time
}
```

---

## 3. Component Breakdown

### 3.1 Header Component
**Location**: Top of page, sticky positioning

**Elements**:
- **Logo Badge**: Gradient purple/blue square with building icon, has floating animation
- **Title**: "Vendor Financial Report" with gradient text effect
- **Subtitle**: Description text in gray
- **Live Clock**: Real-time clock showing current time, updates every second

**Functions**:
```javascript
updateClock() {
    // Gets current time and formats as HH:MM
    // Updates DOM element with id 'timeText'
    // Called every 1000ms via setInterval
}
```

### 3.2 Filter/Parameters Section
**Purpose**: Controls what data is displayed in the report

**Components**:

#### Quick Date Range Buttons
- **Last 30 Days**: Sets date range from today minus 30 days to today
- **Last 90 Days**: Sets date range from today minus 90 days to today
- **Year to Date**: Sets date range from January 1st of current year to today
- **Last Year**: Sets entire previous year as date range

```javascript
setQuickDateRange(range) {
    // Takes range parameter: 'last30', 'last90', 'ytd', 'lastYear'
    // Calculates start and end dates based on current date
    // Updates both date input fields
}
```

#### Vendor Dropdown
- **Select Element**: Dropdown showing all available vendors
- **Data Attributes**: Each option has `data-status` and `data-transactions`
- **Badge Display**: Shows premium/regular status after selection

```javascript
updateVendorBadge() {
    // Triggered on vendor selection change
    // Reads data attributes from selected option
    // Creates and displays appropriate badge (Premium with star or Regular)
    // Shows transaction count
}
```

#### Date Inputs
- **Start Date**: Beginning of report period
- **End Date**: End of report period
- **Default Values**: Last 30 days on page load

```javascript
setDefaultDates() {
    // Sets default date range on page load
    // End date = today
    // Start date = today minus 1 month
}
```

#### Generate Button
- **Primary Action**: Triggers report generation
- **States**: Normal, Loading (with spinner), Disabled
- **Validation**: Checks if vendor is selected

```javascript
generateReport() {
    // Validates vendor selection
    // Shows loading state with spinner
    // Simulates API call (setTimeout in demo)
    // Creates mock data structure
    // Calls transaction generation
    // Calls balance calculation
    // Displays report sections
    // Enables export button
}
```

#### Export Button
- **Initially Hidden**: Only shows after report generation
- **Function**: Exports data to Excel format

---

## 4. Main Report Display

### 4.1 Metrics Cards (Top Row)
Five cards showing key performance indicators:

1. **Total Orders Card**
   - Icon: Blue gradient box icon
   - Main Value: Sum of all order totals
   - Subtitle: Count of orders
   - Hover Effect: Lifts up with shadow

2. **Total Payments Card**
   - Icon: Green gradient credit card icon
   - Main Value: Sum of all payments
   - Subtitle: Number of payments processed
   - Hover Effect: Lifts up with shadow

3. **Balance Card**
   - Icon: Red/Green dollar sign (color based on balance)
   - Main Value: Current balance (absolute value)
   - Subtitle: "Amount owed" or "Credit balance"
   - Special: Border color changes based on positive/negative

4. **Invoice Rate Card**
   - Icon: Purple document icon
   - Main Value: Percentage (0-100)
   - Progress Bar: Visual representation of completion
   - Calculation: (Orders with both invoices / Total orders) × 100

5. **On-Time Payment Card**
   - Icon: Amber lightning bolt
   - Main Value: Percentage (0-100)
   - Progress Bar: Visual representation
   - Calculation: (On-time payments / Total payments) × 100

### 4.2 Tab Navigation
Four tabs for different views:

```javascript
switchTab(tabName) {
    // Updates active tab styling
    // Calls appropriate display function
    // Adds/removes 'active' class
    // Triggers content animation
}
```

---

## 5. Tab Content Details

### 5.1 Overview Tab
**Purpose**: High-level summary and recent activity

**Components**:

#### Statistics Row (3 cards)
1. **Average Order Value**
   - Calculation: Total Orders ÷ Order Count
   - Display: Currency format
   - Background: Blue gradient

2. **Last Payment Date**
   - Shows most recent payment date
   - Format: YYYY-MM-DD
   - Background: Green gradient

3. **Vendor Status**
   - Shows Premium (with star) or Regular badge
   - Partnership level indicator
   - Background: Purple gradient

#### Recent Activity (2 columns)

**Recent Orders Column**:
```javascript
displayRecentOrders() {
    // Takes first 3 orders from orders array
    // For each order shows:
    //   - Order number (bold)
    //   - Date (small gray text)
    //   - Total amount (large, right-aligned)
    //   - Invoice status badges:
    //     * Green "✓ Invoice" if hasVendorInvoice = true
    //     * Red "⚠ Missing" if hasVendorInvoice = false
    //     * Blue "🚚 Shipped" if hasShippingInvoice = true
}
```

**Recent Payments Column**:
```javascript
displayRecentPayments() {
    // Takes first 3 payments from payments array
    // For each payment shows:
    //   - Payment type (bold)
    //   - Date and method (small gray text)
    //   - Amount in green with + sign
    //   - Reference number in monospace font
    //   - Status badge:
    //     * Green "✓ Cleared" if status = 'cleared'
    //     * Yellow "⏳ Pending" if status = 'pending'
}
```

### 5.2 Orders Tab
**Purpose**: Detailed list of all orders

**Table Columns**:
1. **Date**: Order date
2. **Order Number**: Vendor order number (bold)
3. **Supply**: Base supply cost (right-aligned)
4. **Handling**: Handling fee (right-aligned)
5. **Shipping**: Shipping cost (right-aligned)
6. **Total**: Sum of all costs (bold, right-aligned)
7. **Invoices**: Two checkmarks or X's for vendor/shipping invoices
8. **Status**: Badge showing completed/pending/cancelled

**Row Styling**:
- Hover effect: Light gray background
- Alternating row colors for readability

### 5.3 Payments Tab
**Purpose**: List all payments made to vendor

**Table Columns**:
1. **Date**: Payment date
2. **Type**: Colored badge (Deposit=blue, AP Invoice=purple, Payment=green)
3. **Amount**: Green text with + sign (right-aligned)
4. **Reference**: Monospace font for reference numbers
5. **Method**: Payment method as text
6. **Status**: Badge (cleared=green, pending=yellow)

### 5.4 Transactions Tab (Ledger)
**Purpose**: Chronological list with running balance

**Table Columns**:
1. **Date**: Transaction date
2. **Type**: Badge (Order=orange, others=green)
3. **Description**: Human-readable description
4. **References**: Shows order number and invoice numbers if applicable
5. **Debit**: Red negative amount for orders
6. **Credit**: Green positive amount for payments
7. **Balance**: Running balance (red if negative, shows "DR" for debit)

**Balance Calculation Logic**:
```javascript
calculateRunningBalance() {
    // Start with balance = 0
    // For each transaction in chronological order:
    //   - If order: balance = balance - order.total (debit)
    //   - If payment: balance = balance + payment.amount (credit)
    //   - Store balance in transaction object
    // Negative balance = we owe vendor
    // Positive balance = vendor owes us (credit)
}
```

---

## 6. Excel Export Functionality

### 6.1 Export Process
```javascript
exportToExcel() {
    // Creates new workbook using XLSX library
    // Generates 4 worksheets:
    //   1. Summary - Overview statistics
    //   2. Transactions - Full ledger with balance
    //   3. Orders - Detailed orders list
    //   4. Payments - Detailed payments list
    // Auto-sizes columns for readability
    // Names file: vendor_report_[VendorName]_[Date].xlsx
}
```

### 6.2 Worksheet Contents

**Summary Sheet**:
- Vendor name
- Report period
- Total orders amount
- Total payments amount
- Current balance
- Order count
- Payment count
- Average order value

**Transactions Sheet**:
- All fields from transaction objects
- Chronological order
- Running balance column

**Orders Sheet**:
- All order details
- Invoice status columns
- Calculated totals

**Payments Sheet**:
- All payment details
- Payment methods
- Status indicators

---

## 7. Styling & Visual Effects

### 7.1 Color System
```css
Primary Gradient: #667eea to #764ba2 (purple-blue)
Success: #10b981 (green)
Warning: #f59e0b (amber)
Error: #dc2626 (red)
Info: #3b82f6 (blue)
Background: #f5f7fa to #c3cfe2 (light gradient)
```

### 7.2 Animations
- **Float**: Logo animation, 3s ease-in-out infinite
- **Slide Up**: Cards entrance, 0.5s ease-out
- **Fade In**: Tab content, 0.3s ease
- **Spin**: Loading spinner, 0.6s linear infinite
- **Shimmer**: Stat cards background effect, 3s ease-in-out infinite
- **Hover Lift**: Cards rise on hover with translateY(-5px)

### 7.3 Responsive Breakpoints
- **Desktop**: 1400px container, 5-column grid
- **Laptop**: 1024px, 3-column grid
- **Tablet**: 768px, 2-column grid
- **Mobile**: 480px, single column

---

## 8. Business Logic Rules

### 8.1 Balance Calculation
- **Negative Balance**: Vendor is owed money (shown in red)
- **Positive Balance**: We have credit with vendor (shown in green)
- **Formula**: Total Payments - Total Orders = Balance

### 8.2 Invoice Completion Rate
- **Complete Order**: Has both vendor invoice AND shipping invoice
- **Formula**: (Complete Orders ÷ Total Orders) × 100

### 8.3 On-Time Payment Rate
- **On-Time**: Payment made within agreed terms (e.g., NET 30)
- **Formula**: (On-Time Payments ÷ Total Payments) × 100

### 8.4 Transaction Types
- **Debits** (increase what we owe): Orders
- **Credits** (decrease what we owe): Deposits, Payments, AP Invoices, Credits, Refunds

---

## 9. Error Handling & Validation

### 9.1 Input Validation
```javascript
validateReportGeneration() {
    // Check: Vendor must be selected
    // Check: Start date must be before end date
    // Check: Date range must be reasonable (not > 5 years)
    // Show appropriate error messages
}
```

### 9.2 Data Validation
- Ensure all monetary values are numbers
- Verify dates are in correct format
- Check for required fields in data objects

---

## 10. Implementation Notes for Claude Code

### 10.1 Database Queries Needed
1. **Get vendor list**: `SELECT id, name, status FROM vendors WHERE active = true`
2. **Get orders**: `SELECT * FROM vendor_orders WHERE vendor_id = ? AND date BETWEEN ? AND ?`
3. **Get payments**: `SELECT * FROM vendor_payments WHERE vendor_id = ? AND date BETWEEN ? AND ?`
4. **Get invoices**: `SELECT * FROM vendor_invoices WHERE vendor_order_id IN (?)`

### 10.2 API Endpoints Required
- `GET /api/vendors` - List all active vendors
- `GET /api/vendors/:id/report` - Generate report data
- `GET /api/vendors/:id/export` - Generate Excel file
- `POST /api/vendors/:id/payments` - Record new payment
- `PUT /api/vendor-orders/:id/invoices` - Attach invoice to order

### 10.3 Performance Considerations
- Paginate if more than 100 transactions
- Cache vendor list (updates rarely)
- Index database on vendor_id, date fields
- Use database aggregation for summary calculations
- Stream Excel file generation for large datasets

### 10.4 Security Requirements
- Admin-only access (check user role)
- Validate vendor ownership before data access
- Sanitize all inputs
- Log all report generations for audit trail
- Implement rate limiting on export function

---

## 11. Testing Checklist

### 11.1 Functionality Tests
- [ ] Vendor selection works
- [ ] Date range selection works
- [ ] Quick date buttons set correct ranges
- [ ] Report generates with correct data
- [ ] Balance calculates correctly
- [ ] Tabs switch properly
- [ ] Export creates valid Excel file
- [ ] All amounts format as currency

### 11.2 Visual Tests
- [ ] Responsive on all screen sizes
- [ ] Animations run smoothly
- [ ] Colors match design system
- [ ] Hover effects work
- [ ] Loading states display correctly

### 11.3 Data Tests
- [ ] Handles empty data sets
- [ ] Handles large data sets (1000+ transactions)
- [ ] Calculates negative and positive balances
- [ ] Sorts transactions chronologically
- [ ] Running balance is accurate

This documentation provides everything Claude Code needs to implement the full system with proper database structure, API endpoints, business logic, and UI components.