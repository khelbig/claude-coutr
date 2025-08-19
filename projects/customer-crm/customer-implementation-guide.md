I'll provide you with detailed integration specifications for your operations app to implement the complete customer tracking system. This will be a comprehensive guide for Claude Code to build the backend services.

## 🔧 Complete Integration Specifications for Customer Tracking System

### 1. **Primary Data Sources - Webhooks**

#### **Shopify Webhooks**
```javascript
// Webhook endpoints to register:
- customers/create
- customers/update
- customers/delete
- orders/create
- orders/updated
- checkouts/create
- checkouts/update
- carts/create
- carts/update

// Required Shopify API Scopes:
- read_customers
- write_customers
- read_orders
- read_checkouts
- read_behavior
- read_analytics
- read_locations
- read_fulfillments

// Data to extract from Shopify:
{
  customer: {
    id, email, phone, first_name, last_name,
    created_at, updated_at, verified_email,
    total_spent, orders_count, last_order_id,
    accepts_marketing, marketing_opt_in_level,
    tags, note, tax_exempt, currency,
    addresses: [{
      address1, address2, city, province, country,
      zip, phone, province_code, country_code
    }],
    default_address: {},
    metafields: {
      risk_score, fraud_analysis, customer_lifetime_value
    }
  },
  shopping_behavior: {
    abandoned_checkouts_count,
    average_order_value,
    last_abandoned_checkout_at,
    browser_ip, browser_user_agent,
    landing_site, referring_site,
    accept_language
  }
}
```

#### **Klaviyo Webhooks & API**
```javascript
// Klaviyo API v3 endpoints:
GET /api/profiles
GET /api/events
GET /api/metrics
GET /api/segments
GET /api/lists

// Webhook events to subscribe:
- profile.created
- profile.updated
- profile.subscribed
- profile.unsubscribed
- email.opened
- email.clicked
- email.bounced
- sms.sent
- sms.delivered

// Data to extract:
{
  profile: {
    id, email, phone_number, external_id,
    first_name, last_name, title, organization,
    created, updated, last_event_date,
    location: { address1, address2, city, region, country, zip, timezone },
    properties: {
      lifetime_value, average_order_value,
      total_orders, last_purchase_date,
      predicted_lifetime_value,
      churn_probability, engagement_score
    },
    predictive_analytics: {
      expected_date_of_next_order,
      predicted_gender, predicted_age_range,
      predicted_household_income
    }
  },
  engagement: {
    email_consent, sms_consent, push_consent,
    email_engagement_score, click_rate, open_rate,
    unsubscribe_date, hard_bounce, spam_report
  }
}
```

### 2. **IP Intelligence & Geolocation Services**

#### **IPQualityScore API**
```javascript
// API Endpoint: https://ipqualityscore.com/api/json/ip
// API Key required

// Request:
GET /api/json/ip/{IP_ADDRESS}?key={API_KEY}&strictness=1&allow_public_access_points=true

// Response data to store:
{
  fraud_score: 0-100,
  country_code, region, city, ISP, organization,
  is_crawler: boolean,
  vpn: boolean,
  tor: boolean,
  proxy: boolean,
  bot_status: boolean,
  recent_abuse: boolean,
  abuse_velocity: "none|low|medium|high",
  
  // Risk factors:
  mobile: boolean,
  connection_type: "Residential|Corporate|Education|Mobile|Data Center",
  
  // Additional intelligence:
  timezone, latitude, longitude,
  zip_code, operating_system, browser,
  device_brand, device_model
}
```

#### **MaxMind GeoIP2 Insights**
```javascript
// API Endpoint: https://geoip.maxmind.com/geoip/v2.1/insights/
// Account ID & License Key required

// Response enrichment data:
{
  city: { name, confidence },
  country: { iso_code, name, is_in_european_union },
  location: { 
    latitude, longitude, accuracy_radius,
    metro_code, time_zone, 
    average_income, population_density
  },
  traits: {
    user_type: "business|residential|hosting|vpn|tor",
    autonomous_system_number,
    autonomous_system_organization,
    isp, organization,
    is_anonymous_proxy, is_satellite_provider,
    is_legitimate_proxy, is_anycast
  },
  risk: {
    score: 0-100,
    reasons: []
  }
}
```

### 3. **Customer Enrichment Services**

#### **Clearbit Enrichment API**
```javascript
// API Endpoint: https://person-stream.clearbit.com/v2/people/find
// API Key required

// Request:
GET /v2/people/find?email={email}

// Response data:
{
  person: {
    name: { fullName, givenName, familyName },
    email, gender, age_range,
    location: { city, state, country, lat, lng },
    timeZone, utcOffset,
    bio, site, avatar,
    
    employment: {
      domain, name, title, role, subRole,
      seniority, company_size
    },
    
    social_profiles: {
      facebook: { handle },
      github: { handle, followers },
      twitter: { handle, followers },
      linkedin: { handle }
    },
    
    demographics: {
      gender: "male|female",
      age_range: "18-24|25-34|35-44|45-54|55-64|65+",
      household_income: "0-50k|50-100k|100-150k|150k+",
      education_level: "high_school|college|graduate"
    }
  }
}
```

#### **FullContact Person API**
```javascript
// API Endpoint: https://api.fullcontact.com/v3/person.enrich
// API Key required

// Request body:
POST /v3/person.enrich
{
  email: "customer@example.com",
  phone: "+13109851999",
  location: { addressLine1, city, region, postalCode }
}

// Response:
{
  fullName, ageRange, gender, location,
  title, organization,
  linkedin, twitter, facebook,
  
  demographics: {
    age, gender, locationGeneral,
    affluence: "Lower|Middle|Upper Middle|Wealthy",
    homeOwnerStatus, householdIncome,
    maritalStatus, presenceOfChildren
  },
  
  interests: [],
  affinities: {
    brands: [], stores: [], categories: []
  }
}
```

### 4. **Fraud Detection & Risk Scoring**

#### **Sift Science API**
```javascript
// API Endpoint: https://api.sift.com/v205/events
// API Key required

// Create/Update User:
POST /v205/events
{
  "$type": "$create_account",
  "$user_id": "customer_id",
  "$session_id": "session_id",
  "$ip": "192.168.1.1",
  "$user_email": "email@example.com",
  
  "$billing_address": {
    "$name", "$phone", "$address_1", "$address_2",
    "$city", "$region", "$country", "$zipcode"
  },
  
  "$browser": {
    "$user_agent": "Mozilla/5.0...",
    "$accept_language": "en-US",
    "$content_language": "en-US"
  },
  
  "$brand_name": "your_store",
  "$site_country": "US",
  "$site_domain": "yourstore.com"
}

// Get Risk Score:
GET /v205/score/{user_id}

// Response:
{
  score: 0-1 (multiply by 100 for percentage),
  reasons: [
    {
      name: "Suspicious IP",
      value: "Known fraudulent IP range"
    }
  ],
  latest_labels: {
    payment_abuse: { is_bad: boolean, time: timestamp },
    account_abuse: { is_bad: boolean },
    promo_abuse: { is_bad: boolean }
  }
}
```

#### **Riskified API**
```javascript
// API Endpoint: https://api.riskified.com/api/checkout_denied
// HMAC Authentication required

// Submit for analysis:
POST /api/checkout_denied
{
  customer: {
    email, first_name, last_name, id,
    created_at, updated_at, verified_email,
    account_type: "guest|registered",
    
    social: {
      network: "facebook|google|twitter",
      public_username, account_url,
      email, community_score, profile_picture,
      bio, location, created_at
    }
  },
  
  device: {
    user_agent, accept_language,
    screen_resolution, window_resolution,
    timezone_offset, session_hash
  }
}

// Response:
{
  order: {
    id, status: "approved|declined|submitted",
    recommendation: "approve|decline|review",
    risk_score: 0-100,
    warnings: [],
    decision_grounds: []
  }
}
```

### 5. **Email Verification & Reputation**

#### **SendGrid Email Validation API**
```javascript
// API Endpoint: https://api.sendgrid.com/v3/validations/email
// API Key required

POST /v3/validations/email
{
  email: "customer@example.com",
  source: "signup"
}

// Response:
{
  result: {
    email, verdict: "Valid|Risky|Invalid",
    score: 0-1,
    local, host, domain,
    
    checks: {
      domain: { has_valid_address_syntax, has_mx_or_a_record },
      local_part: { is_suspected_role_address },
      additional: {
        has_known_bounces, has_suspected_bounces,
        is_disposable_address, is_free_address
      }
    },
    
    reputation: {
      abuse_score: "none|low|medium|high",
      domain_reputation: "good|neutral|poor",
      suspicious_activity: boolean
    }
  }
}
```

### 6. **Behavioral Analytics**

#### **Segment Analytics**
```javascript
// Track all customer events
analytics.track({
  userId: 'customer_id',
  event: 'Product Viewed',
  properties: {
    product_id, price, category, brand,
    currency, quantity, variant,
    position, url, image_url
  },
  context: {
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    page: { path, referrer, search, title, url },
    location: { city, country, latitude, longitude, region }
  }
});

// Events to track:
- Product Viewed
- Product Added
- Cart Viewed
- Checkout Started
- Order Completed
- Product Removed
- Coupon Applied
- Search Performed
- Filter Applied
- Review Submitted
```

### 7. **Database Schema Requirements**

```sql
-- Main customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Source tracking
  primary_source ENUM('shopify', 'klaviyo', 'manual'),
  sources JSON, -- Array of all sources
  external_ids JSON, -- {shopify_id: '', klaviyo_id: ''}
  
  -- Status
  status ENUM('active', 'inactive', 'vip', 'blocked'),
  customer_type ENUM('guest', 'registered', 'wholesale'),
  
  -- Timestamps
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_active_at TIMESTAMP,
  first_purchase_at TIMESTAMP,
  last_purchase_at TIMESTAMP,
  
  -- Metrics
  orders_count INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  average_order_value DECIMAL(10,2),
  lifetime_value DECIMAL(10,2),
  
  -- Risk & Fraud
  risk_score INT DEFAULT 0, -- 0-100
  risk_level ENUM('low', 'medium', 'high', 'critical'),
  fraud_checks JSON,
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  
  -- Demographics (enriched)
  gender ENUM('male', 'female', 'other', 'unknown'),
  age_range VARCHAR(20),
  income_range VARCHAR(50),
  education_level VARCHAR(50),
  occupation VARCHAR(100),
  marital_status VARCHAR(20),
  has_children BOOLEAN,
  
  -- Engagement
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  accepts_marketing BOOLEAN DEFAULT TRUE,
  email_engagement_score DECIMAL(3,2),
  
  -- Predictive
  churn_probability DECIMAL(3,2),
  predicted_next_order_date DATE,
  predicted_lifetime_value DECIMAL(10,2),
  
  -- Metadata
  tags JSON,
  notes TEXT,
  custom_attributes JSON
);

-- IP tracking table
CREATE TABLE customer_ips (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  ip_address INET NOT NULL,
  
  -- Geolocation
  country_code VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  timezone VARCHAR(50),
  
  -- IP Intelligence
  isp VARCHAR(255),
  organization VARCHAR(255),
  connection_type VARCHAR(50),
  is_vpn BOOLEAN DEFAULT FALSE,
  is_proxy BOOLEAN DEFAULT FALSE,
  is_tor BOOLEAN DEFAULT FALSE,
  is_datacenter BOOLEAN DEFAULT FALSE,
  is_mobile BOOLEAN DEFAULT FALSE,
  
  -- Risk
  fraud_score INT,
  abuse_velocity VARCHAR(20),
  recent_abuse BOOLEAN DEFAULT FALSE,
  
  -- Device info
  user_agent TEXT,
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  os VARCHAR(50),
  os_version VARCHAR(20),
  device_type VARCHAR(50),
  device_brand VARCHAR(50),
  device_model VARCHAR(50),
  
  -- Tracking
  first_seen_at TIMESTAMP,
  last_seen_at TIMESTAMP,
  activity_count INT DEFAULT 1,
  
  INDEX idx_customer_id (customer_id),
  INDEX idx_ip_address (ip_address),
  INDEX idx_last_seen (last_seen_at)
);

-- Customer activities table
CREATE TABLE customer_activities (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  activity_type VARCHAR(50), -- page_view, product_view, add_to_cart, etc.
  activity_data JSON,
  ip_address INET,
  session_id VARCHAR(255),
  created_at TIMESTAMP,
  
  INDEX idx_customer_activity (customer_id, created_at),
  INDEX idx_session (session_id)
);

-- Addresses table
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  type ENUM('billing', 'shipping'),
  is_default BOOLEAN DEFAULT FALSE,
  
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state_province VARCHAR(100),
  country_code VARCHAR(2),
  postal_code VARCHAR(20),
  phone VARCHAR(50),
  
  -- Validation
  is_validated BOOLEAN DEFAULT FALSE,
  validation_errors JSON,
  
  -- Demographics from address
  neighborhood_income_level VARCHAR(50),
  property_type VARCHAR(50),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  INDEX idx_customer_addresses (customer_id)
);
```

### 8. **API Endpoints for NextJS Admin**

```javascript
// Customer endpoints your operations app should expose:

GET /api/customers
  ?page=1
  &limit=50
  &search=email@example.com
  &status=active,vip
  &risk_level=low,medium
  &source=shopify,klaviyo
  &country=US,UK
  &date_from=2024-01-01
  &date_to=2024-12-31
  &sort_by=created_at,total_spent,risk_score
  &sort_order=desc

GET /api/customers/:id
  // Returns full customer profile with all enriched data

GET /api/customers/:id/activities
  ?limit=100
  &type=order,page_view,email_open

GET /api/customers/:id/ips
  // Returns all IP addresses used by customer

GET /api/customers/:id/risk-analysis
  // Returns detailed risk assessment

POST /api/customers/:id/enrich
  // Triggers re-enrichment from all services

POST /api/customers/:id/calculate-risk
  // Recalculates risk score

POST /api/customers/:id/block
  { reason: "Fraudulent activity detected" }

POST /api/customers/import
  // Bulk import endpoint
  { source: "shopify", data: [...] }

GET /api/customers/metrics
  // Dashboard metrics
  {
    total_customers: 12458,
    active_customers: 8234,
    vip_customers: 342,
    average_lifetime_value: 1234,
    high_risk_count: 18,
    churn_rate: 2.3,
    growth_rate: 8.4,
    new_customers_30d: 456
  }

GET /api/customers/webhooks/status
  // Check webhook health
  {
    shopify: { status: "active", last_received: "..." },
    klaviyo: { status: "active", last_received: "..." }
  }
```

### 9. **Environment Variables Needed**

```bash
# Shopify
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_WEBHOOK_SECRET=
SHOPIFY_STORE_DOMAIN=

# Klaviyo
KLAVIYO_API_KEY=
KLAVIYO_PRIVATE_KEY=

# IP Intelligence
IPQUALITYSCORE_API_KEY=
MAXMIND_ACCOUNT_ID=
MAXMIND_LICENSE_KEY=

# Enrichment
CLEARBIT_API_KEY=
FULLCONTACT_API_KEY=

# Fraud Detection
SIFT_API_KEY=
SIFT_ACCOUNT_ID=
RISKIFIED_API_KEY=
RISKIFIED_SHOP_DOMAIN=

# Email Validation
SENDGRID_API_KEY=

# Analytics
SEGMENT_WRITE_KEY=

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### 10. **Implementation Priority**

1. **Phase 1 - Core Data Collection** (Week 1)
   - Shopify webhook integration
   - Klaviyo webhook integration
   - Basic customer database

2. **Phase 2 - IP Intelligence** (Week 2)
   - IPQualityScore integration
   - MaxMind GeoIP integration
   - IP tracking and analysis

3. **Phase 3 - Enrichment** (Week 3)
   - Clearbit integration
   - FullContact integration
   - Demographic data storage

4. **Phase 4 - Risk & Fraud** (Week 4)
   - Sift Science integration
   - Risk scoring algorithm
   - Fraud alert system

5. **Phase 5 - Analytics & Optimization** (Week 5)
   - Segment integration
   - Predictive analytics
   - Performance optimization

### 11. **Real-time Processing Queue**

```javascript
// Use Bull Queue for processing
const Queue = require('bull');

const enrichmentQueue = new Queue('customer-enrichment');
const riskAnalysisQueue = new Queue('risk-analysis');
const webhookQueue = new Queue('webhook-processing');

// Process webhook events
webhookQueue.process(async (job) => {
  const { source, event, data } = job.data;
  
  // 1. Store raw event
  await storeWebhookEvent(source, event, data);
  
  // 2. Update customer record
  await updateCustomer(data);
  
  // 3. Trigger enrichment
  await enrichmentQueue.add({ customerId: data.customerId });
  
  // 4. Trigger risk analysis
  await riskAnalysisQueue.add({ customerId: data.customerId });
});

// Process enrichment
enrichmentQueue.process(async (job) => {
  const { customerId } = job.data;
  
  // Run all enrichment services in parallel
  const [clearbit, fullcontact, ipData] = await Promise.all([
    enrichFromClearbit(customerId),
    enrichFromFullContact(customerId),
    enrichIPData(customerId)
  ]);
  
  await updateCustomerEnrichment(customerId, { clearbit, fullcontact, ipData });
});
```

This comprehensive specification should give Claude Code everything needed to build the complete backend infrastructure for your customer tracking system. The system will provide real-time data synchronization, fraud detection, demographic enrichment, and behavioral analytics all feeding into your beautiful NextJS admin interface.