# Admin Products Page Implementation TODO

## Overview
Implementing a new admin-only product listing page at `/admin/products` that shows products with supplier pricing comparison, variants, and metrics.

## Operations Service Backend (In Progress)
- [x] Research existing product listing implementation and API structure in operations app
- [x] Design operations API endpoint /api/admin/products to aggregate data from firebase_products and firebase-product-variants
- [x] Create operations endpoint to fetch product metrics (total products, SKUs, brands, suppliers, low stock)
- [x] Implement operations logic to join products with their variants from two Algolia indices
- [x] Build supplier price comparison logic in operations to find best prices per variant
- [ ] Add more robust error handling for API endpoints
- [ ] Implement caching for metrics endpoint
- [ ] Add filtering by multiple suppliers simultaneously

## Admin UI Frontend
### Page Setup
- [x] Create new route at /admin/products for admin-only product listing (separate from /dashboard/products)
- [x] Create API proxy endpoints in admin app to call operations service
- [ ] Add menu item for admin products page in navigation config

### Header Section
- [x] Create admin UI header with title "Products" and subtitle "Manage your product catalog and supplier pricing"
- [x] Add Export button with download icon
- [x] Add "Add Product" primary button

### Search & Filters
- [x] Implement search bar that calls operations API for product search
- [x] Add search by name, SKU, or brand functionality
- [ ] Add filter dropdowns for brand, season, supplier

### Metrics Grid
- [x] Build metrics grid with 5 cards using data from operations API
  - [x] Total Products card with trend indicator
  - [x] Total SKUs card with trend indicator
  - [x] Active Brands card with new count
  - [x] Active Suppliers card with verification status
  - [x] Low Stock SKUs card with warning indicator

### Product Table
- [x] Create main product table structure with proper column widths
  - 40% Product
  - 15% SKU/Variants
  - 10% Season
  - 25% Suppliers
  - 10% Actions

### Table Columns Implementation
- [x] Implement Product column with image from gallery field (handle object/array formats)
  - [x] Handle gallery as array format
  - [x] Handle gallery as object with color keys format
  - [x] Show placeholder when no image
  - [x] Display product name and brand

- [x] Build SKU/Variants column showing variant count from firebase-product-variants
  - [x] Show single SKU for products with one variant
  - [x] Show "X variants" button for multiple variants
  - [x] Make variants button expandable

- [x] Add Season column with colored badges based on product.season field
  - [x] SS25 badge (pink background)
  - [x] FW25 badge (blue background)
  - [x] FW24 badge (purple background)
  - [x] Carryover badge (gray background)

- [x] Implement Suppliers column aggregating supplier data from variants
  - [x] Show green badges for suppliers with best prices
  - [x] Display variant win count per supplier
  - [ ] Gray badges for alternative suppliers

- [x] Add Actions column with View and Edit buttons
  - [x] View button opens product detail page
  - [x] Edit button opens product edit modal/page

### Expandable Variants Section
- [x] Build expandable variants section fetching from firebase-product-variants
- [x] Implement expand/collapse functionality for variant rows
- [x] Create variant card grid layout (auto-fill, min 280px width)

### Variant Cards
- [x] Create variant card component showing:
  - [x] Variant SKU (monospace font)
  - [x] Size and color attributes as badges
  - [x] Stock status indicator (green/yellow/red dot)
  - [x] Stock quantity

- [x] Implement supplier pricing comparison showing multiple suppliers per variant
  - [x] List all suppliers with their prices
  - [x] Highlight best price with green background and "BEST" tag
  - [x] Sort suppliers by price

### Tooltips System
- [ ] Add tooltip system for column headers with help icons
  - [ ] Product column tooltip explaining click behavior
  - [ ] SKU/Variants tooltip explaining expansion
  - [ ] Season tooltip with abbreviation meanings
  - [ ] Suppliers tooltip explaining color coding

- [ ] Create advanced tooltips for supplier badges with variant win counts
  - [ ] Show which variants each supplier wins
  - [ ] Explain green vs gray coloring
  - [ ] Include note about customer visibility

### Pagination
- [ ] Implement pagination with operations API handling offset/limit
- [ ] Add page number buttons (1-5 with ellipsis)
- [ ] Add previous/next navigation buttons
- [ ] Show "X-Y of Z products" info text

### Styling
- [ ] Style components to match mockup's premium Apple-inspired design
  - [ ] Implement rounded corners (border-radius: 16px for cards, 8px for buttons)
  - [ ] Add subtle shadows (0 2px 8px rgba(0,0,0,0.04))
  - [ ] Use proper spacing (24px padding for cards)
  - [ ] Implement hover states with transitions
  - [ ] Add gradient background for expanded variants section

## API Response Structure Design
```typescript
// Products list response
{
  products: [{
    objectID: string,
    name: string,
    brand: string,
    sku: string,
    season: string,
    categories: string[],
    gallery: any, // array or object
    variantCount: number,
    bestPriceSuppliers: [{
      supplier: string,
      variantCount: number,
      isBest: boolean
    }]
  }],
  totalHits: number,
  facets: object,
  page: number,
  limit: number
}

// Metrics response
{
  totalProducts: number,
  totalSKUs: number,
  activeBrands: number,
  activeSuppliers: number,
  lowStockSKUs: number
}

// Variants response
{
  variants: [{
    key: string,
    size: string,
    color: string,
    sku: string,
    quantity: number,
    suppliers: [{
      supplier: string,
      supply_price: number,
      msrp: number,
      quantity: number,
      isBest: boolean
    }]
  }]
}
```

## Testing Checklist
- [ ] Test with products that have no variants
- [ ] Test with products that have multiple variants
- [ ] Test with products that have gallery as array
- [ ] Test with products that have gallery as object with color keys
- [ ] Test pagination with large dataset
- [ ] Test search functionality
- [ ] Test filter combinations
- [ ] Test expand/collapse of variants
- [ ] Test responsive design on different screen sizes
- [ ] Test loading states
- [ ] Test error states when API fails

## Performance Considerations
- [ ] Implement virtual scrolling for large product lists
- [ ] Add loading skeletons while fetching data
- [ ] Implement debounced search
- [ ] Cache product images
- [ ] Lazy load variant data only when expanded
- [ ] Use React.memo for expensive components

## Security & Permissions
- [ ] Ensure admin-only access with AdminRouteGuard
- [ ] Add role check for superadmin features (if any)
- [ ] Validate all inputs before sending to API
- [ ] Handle API errors gracefully

## Notes
- Products are in Algolia index: `firebase_products`
- Variants are in Algolia index: `firebase-product-variants`
- Each product can have multiple variants from different suppliers
- Best price calculation should be per variant (size/color combination)
- The page should NOT directly access Algolia - all data through operations API

## Current Status
- ✅ Operations API backend is implemented and builds successfully
- ✅ Admin UI frontend is implemented with all core features
- ✅ Authentication and authorization properly configured
- ✅ Environment variables fixed to use correct naming convention
- Ready for testing and adding navigation menu item