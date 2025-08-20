# Order Detail Page Data Sources Documentation

This document outlines all data sources and fields used in the order detail page (`/admin/orders/[orderId]`).

## Primary Data Sources

### 1. Main Order Data
**Source**: `/api/orders/[orderId]` → Firestore Orders collection → Algolia `shopify_orders` index
**Component**: AdminOrderDetailsContent
**Fields Used**:
- `id` - Order document ID
- `order_number` - Shopify order number
- `line_item_id` - Unique line item identifier 
- `supplier` - Vendor key/name
- `currency` - Order currency (USD, EUR, etc.)
- `status` - Order status (Created, Shipped, etc.)
- `created_at` - Order creation timestamp
- `updated_at` - Last update timestamp
- `email` - Customer email
- `shipping_address` - Complete shipping address object
- `shipping_lines` - Shipping cost breakdown
- `total_tax` - Tax amount
- `total_discounts` - Discount amount
- `total_price` - Total amount paid by customer
- `tracking_number` - Main order tracking number
- `isTestOrder` - Boolean flag for test orders
- `line_items[]` - Array of line items (see Line Items section)

### 2. Line Items Data
**Source**: Order data + enrichment via `/api/line-items/[lineItemId]/details`
**Component**: Order Items table, Timeline
**Fields Used**:
- `id` / `line_item_id` / `shopify_line_item_id` - Line item identifiers
- `name` - Product name
- `sku` - Product SKU
- `quantity` - Quantity ordered
- `price` - Selling price per unit
- `supply_price` - Cost price per unit (COGS)
- `image` - Product image URL
- `tracking_number` - Individual item tracking
- `shippingCost` - Per-item shipping cost
- `handlingCost` - Per-item handling cost
- `handlingCostCurrency` - Currency for handling cost
- `fb_product_id` - Firebase product reference
- `payment_status` - Payment status (paid, authorized, refunded, etc.)
- `payment_paid_at` - Payment completion timestamp
- `payment_refunded_at` - Refund timestamp
- `fulfillment_status` - Fulfillment status (fulfilled, pending, etc.)
- `fulfillment_fulfilled_at` - Fulfillment completion timestamp
- `delivery_status` - Delivery status (delivered, in_transit, etc.)
- `delivery_delivered_at` - Delivery completion timestamp
- `refund_data` - Refund information object
- `apInvoiceId` / `apInvoiceNumber` - AP Invoice references
- `vendor_invoice_id` / `vendorInvoiceNumber` - Vendor Invoice references

### 3. AP Invoice Data
**Source**: `/api/line-items/[lineItemId]/details` → Algolia `firebase_apinvoices` index
**Component**: AP Invoice card (right sidebar)
**Fields Used**:
- `objectID` / `invoiceNumber` - Invoice identifiers
- `status` - Payment status (paid, pending, etc.)
- `paymentDate` - Payment completion date
- `totalAmount` - Invoice amount
- `currency` - Invoice currency

### 4. Vendor Invoice Data  
**Source**: `/api/line-items/[lineItemId]/details` → Algolia `firebase_vendorinvoices` index
**Component**: Vendor Invoice card (right sidebar)
**Fields Used**:
- `objectID` / `vendorInvoiceNumber` - Invoice identifiers
- `status` - Invoice status
- `totalAmount` - Invoice amount
- `currency` - Invoice currency
- `vendorInvoiceDate` / `createdAt` - Invoice date
- `orderIds[]` - Associated order IDs
- `vendorOrderNumbers[]` - Associated vendor order numbers

### 5. Product Image Data
**Source**: Firestore Products collection (via line item `fb_product_id`)
**Component**: Order items table
**Fields Used**:
- `image` - Product image URL

## Data Flow Architecture

### Initial Load
1. Page component (`/admin/orders/[orderId]/page.tsx`) fetches order via `/api/orders/[orderId]`
2. API checks Firestore Orders collection first, falls back to Algolia `shopify_orders` search
3. Order data passed to `AdminOrderDetailsContent` component

### Enrichment Process  
1. `AdminOrderDetailsContent` calls `/api/line-items/[lineItemId]/details` for each line item
2. Line item details API searches:
   - Firestore Orders collection for line item data
   - Algolia `firebase_apinvoices` for AP invoice details
   - Algolia `firebase_vendorinvoices` for vendor invoice details
3. Product images fetched from Firestore Products collection
4. Enriched data stored in `enrichedLineItems` state

## Key Calculations

### Financial Metrics
- **Customer Subtotal**: `Σ(line_item.price × quantity)`
- **Customer Shipping**: `Σ(shipping_lines.price)`
- **Customer Tax**: `order.total_tax`
- **Customer Discounts**: `order.total_discounts`
- **Customer Total**: `order.total_price`
- **Total Cost**: `Σ(supply_price × quantity + shippingCost + handlingCost)`
- **Total Profit**: `Customer Subtotal - Total Cost`
- **Margin**: `(Total Profit / Total Cost) × 100`

### Timeline Status
- **Payment**: Based on `payment_status` and `payment_paid_at`
- **Fulfillment**: Based on `fulfillment_status` and `fulfillment_fulfilled_at`  
- **Delivery**: Based on `delivery_status` and `delivery_delivered_at`

## Critical Notes

### Field Mapping Inconsistencies
- Order number: `order_number` vs `name` 
- Line item ID: `line_item_id` vs `id` vs `shopify_line_item_id`
- Vendor: `supplier` vs `vendor` vs `vendorName`
- Status: `status` vs `fulfillment_status` vs `customerPaymentStatus`

### Data Source Priority
1. **Firestore**: Primary source of truth for orders
2. **Algolia**: Search index, may have different field names
3. **API Enrichment**: Additional data fetched separately

### Performance Considerations
- Line item enrichment happens after initial render
- Multiple API calls per line item for invoice data
- Product images fetched from Firestore for each line item

## Operations Dashboard Requirements

Based on the order detail analysis, the operations dashboard should use:

### Primary Data Source
- **API**: `/api/admin/orders` (NOT individual order APIs)
- **Index**: Algolia `shopify_orders` 
- **Enrichment**: Vendor configs from Firestore, AP invoice statuses

### Required Fields for Operations Dashboard
- `orderNumber` - From admin API response
- `vendorOrderNumber` - From admin API response  
- `vendorName` - From admin API response
- `status` - Order status from admin API
- `customerPaymentStatus` - Payment status from admin API
- `apInvoiceNumber` - From admin API response
- `apInvoiceStatus` - From admin API response
- `fulfillment_status` - Needs to be added to admin API
- `delivery_status` - Needs to be added to admin API
- `created` - Order creation date
- `sellingPrice` - Revenue amount
- Vendor processing/shipping times for SLA calculations

### Missing Fields in Current Operations Dashboard
The operations dashboard is using wrong field names and missing critical data. It should use the admin orders API structure, not make assumptions about field names.