# Coutr Pricing Strategy System

## Overview

The Coutr platform implements a sophisticated pricing analysis system that provides vendors with competitive intelligence while maintaining market integrity. The system uses different strategies for regular vendors versus aggregators, encouraging honest pricing and healthy competition.

## Core Philosophy

1. **Truthful Feedback**: We show vendors their real market position
2. **Encourage Competition**: Push vendors to offer competitive prices
3. **Prevent Gaming**: Aggregators can't claim "best price" just by being exclusive
4. **Market Intelligence**: Provide actionable pricing targets

## Vendor Types

### Regular Vendors
Direct suppliers who source products from manufacturers or brands directly.

### Aggregators
Vendors who aggregate products from multiple sources and typically add markup. These vendors have `isAggregator: true` in their supplier record.

## Pricing Status Categories

### 1. Best Price ✅
- **Regular Vendors**: Have the lowest price OR are the exclusive supplier
- **Aggregators**: Must be at least 5% better than competition (exclusive doesn't count)
- **Display**: Green badge, no "Avg to Beat" shown

### 2. Competitive 💪
- **All Vendors**: Within 2% of market average
- **Display**: Blue badge, shows "Avg to Beat" to encourage improvement

### 3. Slightly High ⚠️
- **All Vendors**: 2-10% above market average
- **Display**: Yellow badge, shows "Avg to Beat" price

### 4. High Price 🔴
- **All Vendors**: 10-20% above market average
- **Aggregators**: Also applied to ALL exclusive products (assumed markup)
- **Display**: Red badge, shows "Avg to Beat" price

### 5. Review Suggested 🚨
- **All Vendors**: More than 20% above market average
- **Display**: Dark red badge, urgent pricing review needed

## Special Rules for Aggregators

### Exclusive Products
When an aggregator is the only supplier:
- **Status**: Automatically marked as "High Price"
- **Reasoning**: Assumes ~13% markup (hidden from vendor)
- **Target Price**: Shows current price × 0.8673 (appears market-derived, not calculated)
- **Goal**: Push aggregators to reduce margins on exclusive products

### Competitive Products
When aggregators compete with others:
- **Best Price Threshold**: Must be 5% better than lowest competitor
- **Competitive Range**: Within 2% of market average
- **No Exclusive Advantage**: Being the only supplier doesn't grant "best price"

## Pricing Analysis Algorithm

### For Each Product Variant:

1. **Identify Competition**
   - Find variants with same size/color from other suppliers
   - Filter by positive supply price

2. **Calculate Market Metrics**
   - Lowest competitor price
   - Average competitor price
   - Price difference percentage

3. **Apply Vendor Type Rules**
   ```
   IF no competition exists:
     IF regular vendor:
       → Best Price (they're exclusive)
     IF aggregator:
       → High Price (suspected markup)
       → Suggest price × 0.8673
   
   IF competition exists:
     IF price ≤ lowest competitor:
       IF regular vendor:
         → Best Price
       IF aggregator AND price < lowest × 0.95:
         → Best Price
       ELSE:
         → Competitive
     
     IF price ≤ average × 1.02:
       → Competitive
     IF price ≤ average × 1.10:
       → Slightly High
     IF price ≤ average × 1.20:
       → High Price
     ELSE:
       → Review Suggested
   ```

## "Avg to Beat" Price Display

### Purpose
Shows vendors a target price to become more competitive.

### Calculation
- **With Competition**: Real average × 0.9 (10% better than average)
- **Aggregator Exclusive**: Current price × 0.8673 (non-obvious reduction)
- **Best Price**: Not shown (they're already winning)

### Psychology
- Makes vendors feel they're close to being competitive
- Provides concrete target for improvement
- For aggregators, pushes margin reduction without revealing strategy

## Product-Level Status Aggregation

The overall product status is determined by variant distribution:

1. **All Exclusive + Aggregator** → High Price
2. **All Exclusive + Regular** → Best Price
3. **≥30% High Price Variants** → High Price
4. **All Best Price** → Best Price
5. **≥50% Best Price OR ≥70% Competitive** → Competitive
6. **Mixed Results** → Mixed Pricing
7. **Default** → Competitive

## Metrics Calculation

### Products Dashboard Metrics

#### Average Overprice
- Only calculated for non-competitive products (>5% above market)
- Shows average percentage above market for these products
- If 0%, banner doesn't show (all products are competitive)

#### Products Need Review
- Count of products with >5% above market average
- Extrapolated from sample to total catalog

#### Stock Availability
- Percentage of variants in stock
- Direct count from Algolia queries

## Implementation Details

### Data Sources
- **Products**: Algolia `firebase_products` index
- **Variants**: Algolia `firebase-product-variants` index
- **Suppliers**: Algolia `firestore_suppliers` index
- **Aggregator Flag**: `isAggregator` field in supplier document

### Performance Optimizations
- Sample-based analysis for large catalogs
- Maximum 10 products analyzed for metrics
- Deep pagination support for large result sets
- Faceted search for filtering

### Configuration
```javascript
// Aggregator detection
const isAggregator = vendorDoc.isAggregator || false;

// Exclusive product multiplier (not obvious)
const AGGREGATOR_MARKUP_MULTIPLIER = 0.8673;

// Competitive thresholds
const COMPETITIVE_THRESHOLD = 1.02;  // Within 2% of average
const SLIGHTLY_HIGH_THRESHOLD = 1.10; // Within 10% of average
const HIGH_THRESHOLD = 1.20;          // Within 20% of average
```

## Business Impact

### For Regular Vendors
- Transparent, honest pricing feedback
- Rewards exclusive suppliers with "best price" status
- Encourages competitive pricing through clear targets

### For Aggregators
- Prevents gaming through exclusive sourcing
- Pushes margin reduction on marked-up products
- Requires genuine value to claim "best price"

### For Coutr
- Ensures competitive marketplace
- Reduces customer complaints about pricing
- Maintains vendor trust through transparency
- Drives overall price competitiveness

## Monitoring & Adjustment

### Key Metrics to Track
- Average marketplace prices by category
- Vendor response to pricing feedback
- Aggregator margin changes over time
- Customer price satisfaction scores

### Adjustment Levers
- `isAggregator` flag per vendor
- Competitive threshold percentages
- Aggregator markup multiplier (currently 0.8673)
- Exclusive product handling rules

## FAQ

**Q: Why do aggregators see "High Price" on exclusive products?**
A: Aggregators typically add 10-20% markup. When they're exclusive, we assume they're marking up and push them to reduce prices.

**Q: Why is the "Avg to Beat" sometimes lower than actual average?**
A: We show 90% of actual average to encourage vendors to be better than average, not just match it.

**Q: Can a vendor dispute their aggregator status?**
A: Yes, admins can toggle the `isAggregator` flag in the supplier configuration.

**Q: Why 0.8673 specifically?**
A: It's approximately 13% reduction but appears as a market-derived number, not an obvious calculation.

## Security & Trust

### What Vendors Don't See
- Whether they're marked as an aggregator
- The actual average price (we show 90% of it)
- Number of competitors
- Which specific vendors they're competing against
- The markup assumption calculation

### What Vendors Do See
- Their pricing status (Best/Competitive/High/etc.)
- A target price to beat
- Percentage difference from market
- Stock availability metrics
- Category-level competition indicators

## Future Enhancements

1. **Dynamic Markup Detection**: Auto-detect aggregators based on pricing patterns
2. **Category-Specific Thresholds**: Different competitive ranges for different product types
3. **Seasonal Adjustments**: Account for seasonal pricing variations
4. **Vendor Performance Scoring**: Long-term pricing competitiveness metrics
5. **ML-Based Price Predictions**: Suggest optimal prices based on historical data

---

*Last Updated: August 2025*
*Version: 1.0*
*Classification: Internal - Confidential*