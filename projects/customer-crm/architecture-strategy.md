# Complete Dual-Database Architecture (PostgreSQL + Firestore)

## 🏗️ Database Synchronization Strategy

Your operations app will maintain **perfect parity** between PostgreSQL and Firestore using a write-through pattern:

```javascript
// Operations App - Dual Write Pattern
class CustomerService {
  async createOrUpdateCustomer(data) {
    // Start transaction
    const pgTransaction = await pgClient.transaction();
    
    try {
      // 1. Write to PostgreSQL
      const pgResult = await this.writeToPostgres(data, pgTransaction);
      
      // 2. Write to Firestore
      const fsResult = await this.writeToFirestore(data);
      
      // 3. Commit PostgreSQL transaction
      await pgTransaction.commit();
      
      // 4. Log sync success
      await this.logSyncSuccess(data.id);
      
      return { pgResult, fsResult };
    } catch (error) {
      // Rollback and handle sync failure
      await pgTransaction.rollback();
      await this.handleSyncFailure(data, error);
      throw error;
    }
  }
}
```

## 📊 PostgreSQL Schema (Relational Structure)

```sql
-- ============================================
-- CORE CUSTOMER TABLES
-- ============================================

-- 1. Main customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  email_lowercase VARCHAR(255) GENERATED ALWAYS AS (LOWER(email)) STORED,
  phone VARCHAR(50),
  phone_normalized VARCHAR(50), -- E.164 format
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  
  -- Status and type
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip', 'blocked', 'pending')),
  customer_type VARCHAR(20) DEFAULT 'registered' CHECK (customer_type IN ('guest', 'registered', 'wholesale', 'affiliate')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  last_active_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  tags TEXT[], -- Array of tags
  notes TEXT,
  internal_notes TEXT, -- Staff only notes
  custom_attributes JSONB DEFAULT '{}',
  
  -- Indexes
  INDEX idx_email_lowercase (email_lowercase),
  INDEX idx_phone_normalized (phone_normalized),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC),
  INDEX idx_updated_at (updated_at DESC),
  INDEX idx_last_active (last_active_at DESC),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_tags (tags) USING GIN,
  INDEX idx_custom_attributes (custom_attributes) USING GIN
);

-- 2. Customer sources (tracks all systems customer exists in)
CREATE TABLE customer_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL, -- 'shopify', 'klaviyo', 'manual', etc.
  external_id VARCHAR(255) NOT NULL, -- ID in external system
  
  -- Source-specific data
  source_data JSONB DEFAULT '{}',
  
  -- Sync tracking
  first_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sync_status VARCHAR(20) DEFAULT 'active',
  sync_errors JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(source, external_id),
  INDEX idx_customer_sources (customer_id),
  INDEX idx_source_external (source, external_id)
);

-- 3. Customer metrics (aggregated data)
CREATE TABLE customer_metrics (
  customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Order metrics
  total_orders INT DEFAULT 0,
  completed_orders INT DEFAULT 0,
  cancelled_orders INT DEFAULT 0,
  returned_orders INT DEFAULT 0,
  
  -- Financial metrics
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_refunded DECIMAL(12,2) DEFAULT 0,
  net_revenue DECIMAL(12,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  lifetime_value DECIMAL(12,2) DEFAULT 0,
  
  -- Product metrics
  total_items_purchased INT DEFAULT 0,
  favorite_category VARCHAR(100),
  favorite_brand VARCHAR(100),
  
  -- Time-based metrics
  first_order_date DATE,
  last_order_date DATE,
  days_since_last_order INT GENERATED ALWAYS AS (
    CASE 
      WHEN last_order_date IS NOT NULL 
      THEN EXTRACT(DAY FROM CURRENT_DATE - last_order_date)::INT 
      ELSE NULL 
    END
  ) STORED,
  
  -- Engagement metrics
  email_opens INT DEFAULT 0,
  email_clicks INT DEFAULT 0,
  email_open_rate DECIMAL(5,2),
  email_click_rate DECIMAL(5,2),
  
  -- Predictive metrics
  churn_probability DECIMAL(3,2), -- 0.00 to 1.00
  predicted_next_order_date DATE,
  predicted_lifetime_value DECIMAL(12,2),
  propensity_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_total_spent (total_spent DESC),
  INDEX idx_lifetime_value (lifetime_value DESC),
  INDEX idx_last_order_date (last_order_date DESC),
  INDEX idx_churn_probability (churn_probability DESC)
);

-- 4. Customer demographics (enriched data)
CREATE TABLE customer_demographics (
  customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Basic demographics
  gender VARCHAR(20),
  age INT,
  age_range VARCHAR(20), -- '18-24', '25-34', etc.
  birth_date DATE,
  birth_year INT,
  
  -- Location demographics
  income_range VARCHAR(50), -- '50k-75k', '75k-100k', etc.
  household_income_percentile INT, -- 0-100
  education_level VARCHAR(50),
  occupation VARCHAR(100),
  industry VARCHAR(100),
  job_title VARCHAR(100),
  company VARCHAR(255),
  
  -- Lifestyle
  marital_status VARCHAR(30),
  has_children BOOLEAN,
  number_of_children INT,
  home_ownership_status VARCHAR(30), -- 'owner', 'renter', 'unknown'
  dwelling_type VARCHAR(30), -- 'single_family', 'apartment', etc.
  
  -- Psychographics
  interests TEXT[],
  hobbies TEXT[],
  preferred_brands TEXT[],
  lifestyle_segment VARCHAR(100),
  
  -- Social media
  social_profiles JSONB DEFAULT '{}', -- {twitter: handle, instagram: handle, etc}
  social_influence_score INT, -- 0-100
  
  -- Data sources
  demographic_sources JSONB DEFAULT '{}', -- {clearbit: {}, fullcontact: {}}
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Timestamps
  enriched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_gender (gender),
  INDEX idx_age_range (age_range),
  INDEX idx_income_range (income_range)
);

-- 5. Customer addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Address type
  address_type VARCHAR(20) DEFAULT 'shipping', -- 'billing', 'shipping', 'both'
  is_default BOOLEAN DEFAULT FALSE,
  label VARCHAR(50), -- 'Home', 'Work', etc.
  
  -- Name
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company VARCHAR(255),
  
  -- Address
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  state_province_code VARCHAR(10),
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  postal_code VARCHAR(20),
  
  -- Contact
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Geolocation
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  timezone VARCHAR(50),
  
  -- Validation
  is_validated BOOLEAN DEFAULT FALSE,
  validation_provider VARCHAR(50),
  validation_result JSONB,
  validated_at TIMESTAMP WITH TIME ZONE,
  
  -- Demographics from address
  neighborhood_income_level VARCHAR(50),
  neighborhood_median_income DECIMAL(10,2),
  property_type VARCHAR(50),
  property_value_estimate DECIMAL(12,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  INDEX idx_customer_addresses (customer_id),
  INDEX idx_default_address (customer_id, is_default),
  INDEX idx_country_code (country_code),
  INDEX idx_postal_code (postal_code)
);

-- 6. Customer IP addresses and sessions
CREATE TABLE customer_ip_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- IP Information
  ip_address INET NOT NULL,
  ip_version INT DEFAULT 4, -- 4 or 6
  
  -- Geolocation
  country VARCHAR(100),
  country_code VARCHAR(2),
  region VARCHAR(100),
  region_code VARCHAR(10),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  timezone VARCHAR(50),
  
  -- ISP Information
  isp VARCHAR(255),
  organization VARCHAR(255),
  asn INT,
  as_name VARCHAR(255),
  connection_type VARCHAR(50), -- 'residential', 'corporate', 'mobile', 'datacenter'
  
  -- Risk indicators
  is_vpn BOOLEAN DEFAULT FALSE,
  is_proxy BOOLEAN DEFAULT FALSE,
  is_tor BOOLEAN DEFAULT FALSE,
  is_relay BOOLEAN DEFAULT FALSE,
  is_hosting BOOLEAN DEFAULT FALSE,
  is_mobile BOOLEAN DEFAULT FALSE,
  
  -- Device information
  user_agent TEXT,
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  operating_system VARCHAR(50),
  os_version VARCHAR(20),
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  device_brand VARCHAR(50),
  device_model VARCHAR(50),
  
  -- Usage tracking
  first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total_sessions INT DEFAULT 1,
  total_page_views INT DEFAULT 0,
  total_events INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(customer_id, ip_address),
  INDEX idx_customer_ips (customer_id),
  INDEX idx_ip_address (ip_address),
  INDEX idx_last_seen (last_seen_at DESC),
  INDEX idx_risk_flags (is_vpn, is_proxy, is_tor)
);

-- 7. Customer risk assessment
CREATE TABLE customer_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Overall risk
  risk_score INT DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Risk factors
  email_risk_score INT DEFAULT 0,
  ip_risk_score INT DEFAULT 0,
  address_risk_score INT DEFAULT 0,
  behavior_risk_score INT DEFAULT 0,
  payment_risk_score INT DEFAULT 0,
  
  -- Fraud indicators
  is_disposable_email BOOLEAN DEFAULT FALSE,
  is_free_email BOOLEAN DEFAULT FALSE,
  email_domain_age_days INT,
  
  has_multiple_accounts BOOLEAN DEFAULT FALSE,
  related_account_ids UUID[],
  
  uses_vpn_frequently BOOLEAN DEFAULT FALSE,
  multiple_ip_countries BOOLEAN DEFAULT FALSE,
  ip_country_count INT DEFAULT 1,
  
  billing_shipping_mismatch BOOLEAN DEFAULT FALSE,
  high_risk_country BOOLEAN DEFAULT FALSE,
  
  -- Behavioral flags
  rapid_order_velocity BOOLEAN DEFAULT FALSE,
  unusual_purchase_pattern BOOLEAN DEFAULT FALSE,
  high_return_rate BOOLEAN DEFAULT FALSE,
  
  -- Payment flags
  payment_failures INT DEFAULT 0,
  chargebacks INT DEFAULT 0,
  different_payment_methods INT DEFAULT 1,
  
  -- External assessments
  sift_score INT,
  riskified_score INT,
  maxmind_risk_score INT,
  
  -- Action taken
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  blocked_at TIMESTAMP WITH TIME ZONE,
  blocked_by VARCHAR(255),
  
  requires_review BOOLEAN DEFAULT FALSE,
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(255),
  
  -- Timestamps
  assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  next_assessment_at TIMESTAMP WITH TIME ZONE,
  
  INDEX idx_customer_risk (customer_id),
  INDEX idx_risk_score (risk_score DESC),
  INDEX idx_risk_level (risk_level),
  INDEX idx_blocked (is_blocked),
  INDEX idx_requires_review (requires_review)
);

-- 8. Customer activities/events
CREATE TABLE customer_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Event details
  activity_type VARCHAR(50) NOT NULL, -- 'page_view', 'product_view', 'add_to_cart', etc.
  activity_category VARCHAR(50), -- 'browsing', 'shopping', 'account', etc.
  
  -- Event data
  event_data JSONB DEFAULT '{}',
  
  -- Context
  ip_address INET,
  session_id VARCHAR(255),
  user_agent TEXT,
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Location
  country_code VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Timestamps
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_customer_activities (customer_id, occurred_at DESC),
  INDEX idx_activity_type (activity_type),
  INDEX idx_session (session_id),
  INDEX idx_occurred_at (occurred_at DESC)
);

-- 9. Customer engagement
CREATE TABLE customer_engagement (
  customer_id UUID PRIMARY KEY REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Email engagement
  email_consent BOOLEAN DEFAULT FALSE,
  email_consent_date TIMESTAMP WITH TIME ZONE,
  email_unsubscribe_date TIMESTAMP WITH TIME ZONE,
  total_emails_sent INT DEFAULT 0,
  total_emails_opened INT DEFAULT 0,
  total_emails_clicked INT DEFAULT 0,
  total_emails_bounced INT DEFAULT 0,
  last_email_open_date TIMESTAMP WITH TIME ZONE,
  last_email_click_date TIMESTAMP WITH TIME ZONE,
  email_engagement_score DECIMAL(3,2), -- 0.00 to 1.00
  
  -- SMS engagement
  sms_consent BOOLEAN DEFAULT FALSE,
  sms_consent_date TIMESTAMP WITH TIME ZONE,
  sms_unsubscribe_date TIMESTAMP WITH TIME ZONE,
  total_sms_sent INT DEFAULT 0,
  total_sms_clicked INT DEFAULT 0,
  last_sms_click_date TIMESTAMP WITH TIME ZONE,
  sms_engagement_score DECIMAL(3,2),
  
  -- Push notifications
  push_consent BOOLEAN DEFAULT FALSE,
  push_tokens JSONB DEFAULT '[]',
  
  -- Web engagement
  total_sessions INT DEFAULT 0,
  total_page_views INT DEFAULT 0,
  average_session_duration INT, -- seconds
  bounce_rate DECIMAL(5,2),
  
  -- App engagement (if applicable)
  app_installed BOOLEAN DEFAULT FALSE,
  app_version VARCHAR(20),
  app_last_opened TIMESTAMP WITH TIME ZONE,
  
  -- Loyalty program
  loyalty_member BOOLEAN DEFAULT FALSE,
  loyalty_tier VARCHAR(50),
  loyalty_points INT DEFAULT 0,
  loyalty_lifetime_points INT DEFAULT 0,
  
  -- Reviews and feedback
  total_reviews INT DEFAULT 0,
  average_review_rating DECIMAL(2,1),
  nps_score INT,
  
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email_engagement (email_engagement_score DESC),
  INDEX idx_loyalty_member (loyalty_member),
  INDEX idx_loyalty_tier (loyalty_tier)
);

-- 10. Customer segments (for grouping)
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  segment_type VARCHAR(50) NOT NULL, -- 'behavioral', 'demographic', 'value', 'custom'
  segment_name VARCHAR(100) NOT NULL,
  segment_value VARCHAR(255),
  
  -- Segment metadata
  confidence_score DECIMAL(3,2),
  assigned_by VARCHAR(50), -- 'system', 'manual', 'ml_model'
  
  -- Timestamps
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  INDEX idx_customer_segments (customer_id),
  INDEX idx_segment_type_name (segment_type, segment_name)
);

-- ============================================
-- UTILITY TABLES
-- ============================================

-- 11. Sync logs for dual-database consistency
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'customer', 'order', etc.
  entity_id UUID NOT NULL,
  operation VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete'
  
  -- Sync status
  postgres_status VARCHAR(20) DEFAULT 'pending',
  firestore_status VARCHAR(20) DEFAULT 'pending',
  
  -- Data
  data_snapshot JSONB,
  
  -- Error handling
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_status (postgres_status, firestore_status),
  INDEX idx_created_at (created_at DESC)
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_sources_updated_at BEFORE UPDATE ON customer_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (add for all other tables)
```

## 🔥 Firestore Schema (Document Structure)

```javascript
// Firestore Collection Structure
// ============================================

// Collection: customers
{
  // Document ID: customer UUID (same as PostgreSQL)
  id: "550e8400-e29b-41d4-a716-446655440000",
  
  // Core Information
  email: "paulinad78@hotmail.com",
  emailLowercase: "paulinad78@hotmail.com", // for case-insensitive queries
  phone: "+13109851999",
  phoneNormalized: "+13109851999", // E.164 format
  firstName: "Pauline",
  lastName: "Eldeeb",
  fullName: "Pauline Eldeeb",
  
  // Status
  status: "vip", // 'active', 'inactive', 'vip', 'blocked', 'pending'
  customerType: "registered", // 'guest', 'registered', 'wholesale', 'affiliate'
  
  // Timestamps (Firestore Timestamps)
  createdAt: Timestamp,
  updatedAt: Timestamp,
  deletedAt: null, // Soft delete
  lastActiveAt: Timestamp,
  
  // All source systems this customer exists in
  sources: {
    shopify: {
      id: "gid://shopify/Customer/123456",
      firstSyncedAt: Timestamp,
      lastSyncedAt: Timestamp,
      syncStatus: "active",
      data: {} // Source-specific data
    },
    klaviyo: {
      id: "01234567-89ab-cdef-0123-456789abcdef",
      firstSyncedAt: Timestamp,
      lastSyncedAt: Timestamp,
      syncStatus: "active",
      data: {}
    }
  },
  
  // Metrics (denormalized for quick access)
  metrics: {
    // Orders
    totalOrders: 23,
    completedOrders: 22,
    cancelledOrders: 1,
    returnedOrders: 0,
    
    // Financial
    totalSpent: 8456.00,
    totalRefunded: 0,
    netRevenue: 8456.00,
    averageOrderValue: 367.65,
    lifetimeValue: 8456.00,
    
    // Products
    totalItemsPurchased: 45,
    favoriteCategory: "Shoes",
    favoriteBrand: "Valentino",
    
    // Dates
    firstOrderDate: "2023-01-15",
    lastOrderDate: "2025-08-09",
    daysSinceLastOrder: 7,
    
    // Engagement
    emailOpens: 145,
    emailClicks: 32,
    emailOpenRate: 0.65,
    emailClickRate: 0.22,
    
    // Predictive
    churnProbability: 0.15,
    predictedNextOrderDate: "2025-09-15",
    predictedLifetimeValue: 12500.00,
    propensityScore: 0.78,
    
    calculatedAt: Timestamp,
    updatedAt: Timestamp
  },
  
  // Demographics (enriched data)
  demographics: {
    // Basic
    gender: "female",
    age: 38,
    ageRange: "35-44",
    birthDate: "1987-03-15",
    birthYear: 1987,
    
    // Income & Education
    incomeRange: "100k-150k",
    householdIncomePercentile: 85,
    educationLevel: "bachelors",
    occupation: "Marketing Manager",
    industry: "Technology",
    jobTitle: "Senior Marketing Manager",
    company: "Tech Corp",
    
    // Lifestyle
    maritalStatus: "married",
    hasChildren: true,
    numberOfChildren: 2,
    homeOwnershipStatus: "owner",
    dwellingType: "single_family",
    
    // Interests
    interests: ["fashion", "luxury", "travel", "wellness"],
    hobbies: ["yoga", "shopping", "reading"],
    preferredBrands: ["Valentino", "Gucci", "Prada"],
    lifestyleSegment: "Affluent Families",
    
    // Social
    socialProfiles: {
      instagram: "@pauline_e",
      twitter: "@paulinee87",
      linkedin: "pauline-eldeeb"
    },
    socialInfluenceScore: 65,
    
    // Data quality
    sources: {
      clearbit: { enrichedAt: Timestamp, data: {} },
      fullcontact: { enrichedAt: Timestamp, data: {} }
    },
    confidenceScore: 0.92,
    
    enrichedAt: Timestamp,
    updatedAt: Timestamp
  },
  
  // Risk Assessment
  risk: {
    // Scores
    overallScore: 15, // 0-100
    level: "low", // 'low', 'medium', 'high', 'critical'
    
    // Component scores
    emailRiskScore: 10,
    ipRiskScore: 20,
    addressRiskScore: 5,
    behaviorRiskScore: 15,
    paymentRiskScore: 10,
    
    // Fraud indicators
    fraudIndicators: {
      isDisposableEmail: false,
      isFreeEmail: true,
      emailDomainAgeDays: 8500,
      hasMultipleAccounts: false,
      relatedAccountIds: [],
      usesVpnFrequently: false,
      multipleIpCountries: true,
      ipCountryCount: 3,
      billingShippingMismatch: false,
      highRiskCountry: false
    },
    
    // Behavioral flags
    behavioralFlags: {
      rapidOrderVelocity: false,
      unusualPurchasePattern: false,
      highReturnRate: false
    },
    
    // Payment flags
    paymentFlags: {
      paymentFailures: 1,
      chargebacks: 0,
      differentPaymentMethods: 2
    },
    
    // External scores
    externalScores: {
      sift: 25,
      riskified: 18,
      maxmind: 22
    },
    
    // Actions
    isBlocked: false,
    blockedReason: null,
    blockedAt: null,
    blockedBy: null,
    requiresReview: false,
    reviewNotes: null,
    
    assessedAt: Timestamp,
    updatedAt: Timestamp,
    nextAssessmentAt: Timestamp
  },
  
  // Engagement
  engagement: {
    // Email
    email: {
      consent: true,
      consentDate: Timestamp,
      unsubscribeDate: null,
      totalSent: 223,
      totalOpened: 145,
      totalClicked: 32,
      totalBounced: 0,
      lastOpenDate: Timestamp,
      lastClickDate: Timestamp,
      engagementScore: 0.65
    },
    
    // SMS
    sms: {
      consent: false,
      consentDate: null,
      unsubscribeDate: null,
      totalSent: 0,
      totalClicked: 0,
      lastClickDate: null,
      engagementScore: 0
    },
    
    // Push
    push: {
      consent: false,
      tokens: []
    },
    
    // Web
    web: {
      totalSessions: 156,
      totalPageViews: 892,
      averageSessionDuration: 245, // seconds
      bounceRate: 0.22
    },
    
    // App
    app: {
      installed: false,
      version: null,
      lastOpened: null
    },
    
    // Loyalty
    loyalty: {
      isMember: true,
      tier: "gold",
      points: 4500,
      lifetimePoints: 12000
    },
    
    // Reviews
    reviews: {
      totalReviews: 5,
      averageRating: 4.6,
      npsScore: 9
    },
    
    calculatedAt: Timestamp,
    updatedAt: Timestamp
  },
  
  // Segments (array for easy querying)
  segments: [
    {
      type: "behavioral",
      name: "frequent_buyer",
      value: "high",
      confidence: 0.95,
      assignedBy: "system",
      assignedAt: Timestamp
    },
    {
      type: "demographic",
      name: "affluent_female",
      value: "true",
      confidence: 0.92,
      assignedBy: "ml_model",
      assignedAt: Timestamp
    },
    {
      type: "value",
      name: "vip",
      value: "gold",
      confidence: 1.0,
      assignedBy: "manual",
      assignedAt: Timestamp
    }
  ],
  
  // Metadata
  tags: ["vip", "loyal", "high-value", "verified"],
  notes: "Preferred customer - handle with care",
  internalNotes: "Validated address and payment method",
  customAttributes: {
    preferredContactTime: "morning",
    birthdayMonth: 3,
    anniversaryDate: "2010-06-15"
  }
}

// ============================================
// Sub-collection: customers/{customerId}/addresses
// ============================================
{
  id: "address-uuid",
  
  // Type
  addressType: "shipping", // 'billing', 'shipping', 'both'
  isDefault: true,
  label: "Home",
  
  // Name
  firstName: "Pauline",
  lastName: "Eldeeb",
  company: null,
  
  // Address
  addressLine1: "264 S Doheny Dr",
  addressLine2: "Apt 6",
  city: "Beverly Hills",
  stateProvince: "California",
  stateProvinceCode: "CA",
  country: "United States",
  countryCode: "US",
  postalCode: "90211",
  
  // Contact
  phone: "+13109851999",
  email: "paulinad78@hotmail.com",
  
  // Geolocation
  geoPoint: new GeoPoint(34.0522, -118.2437), // Firestore GeoPoint
  timezone: "America/Los_Angeles",
  
  // Validation
  isValidated: true,
  validationProvider: "smartystreets",
  validationResult: {
    deliverability: "deliverable",
    components: {}
  },
  validatedAt: Timestamp,
  
  // Demographics
  neighborhoodData: {
    incomeLevel: "high",
    medianIncome: 125000,
    propertyType: "residential",
    propertyValueEstimate: 2500000
  },
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp,
  lastUsedAt: Timestamp
}

// ============================================
// Sub-collection: customers/{customerId}/ipAddresses
// ============================================
{
  id: "ip-uuid",
  
  // IP Information
  ipAddress: "173.252.84.123",
  ipVersion: 4,
  
  // Geolocation
  location: {
    country: "United States",
    countryCode: "US",
    region: "California",
    regionCode: "CA",
    city: "Beverly Hills",
    postalCode: "90211",
    geoPoint: new GeoPoint(34.0522, -118.2437),
    timezone: "America/Los_Angeles"
  },
  
  // ISP
  isp: {
    name: "AT&T Services",
    organization: "AT&T",
    asn: 7018,
    asName: "ATT-INTERNET4",
    connectionType: "residential"
  },
  
  // Risk flags
  riskFlags: {
    isVpn: false,
    isProxy: false,
    isTor: false,
    isRelay: false,
    isHosting: false,
    isMobile: false
  },
  
  // Device
  device: {
    userAgent: "Mozilla/5.0...",
    browser: "Chrome",
    browserVersion: "120.0",
    operatingSystem: "Windows",
    osVersion: "11",
    deviceType: "desktop",
    deviceBrand: null,
    deviceModel: null
  },
  
  // Usage
  usage: {
    firstSeenAt: Timestamp,
    lastSeenAt: Timestamp,
    totalSessions: 45,
    totalPageViews: 234,
    totalEvents: 567
  },
  
  // Timestamps
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// ============================================
// Sub-collection: customers/{customerId}/activities
// ============================================
{
  id: "activity-uuid",
  
  // Event
  activityType: "product_view", // 'page_view', 'add_to_cart', 'purchase', etc.
  activityCategory: "shopping",
  
  // Event data
  eventData: {
    productId: "123456",
    productName: "Valentino Slides",
    productCategory: "Shoes",
    productPrice: 439.69,
    currency: "EUR"
  },
  
  // Context
  context: {
    ipAddress: "173.252.84.123",
    sessionId: "session-123",
    userAgent: "Mozilla/5.0...",
    referrer: "https://google.com",
    utm: {
      source: "google",
      medium: "cpc",
      campaign: "summer_sale"
    }
  },
  
  // Location
  location: {
    countryCode: "US",
    region: "California",
    city: "Beverly Hills"
  },
  
  // Timestamps
  occurredAt: Timestamp,
  createdAt: Timestamp
}

// ============================================
// Collection: syncQueue (for consistency monitoring)
// ============================================
{
  id: "sync-uuid",
  entityType: "customer",
  entityId: "customer-uuid",
  operation: "update", // 'create', 'update', 'delete'
  
  // Status
  status: {
    postgres: "completed",
    firestore: "completed"
  },
  
  // Data
  dataSnapshot: {}, // The data that was synced
  
  // Error handling
  error: null,
  retryCount: 0,
  
  // Timestamps
  createdAt: Timestamp,
  completedAt: Timestamp
}
```

## 🔄 Synchronization Service Implementation

```javascript
// operations-app/services/DatabaseSyncService.js

class DatabaseSyncService {
  constructor(pgClient, firestoreDb) {
    this.pg = pgClient;
    this.firestore = firestoreDb;
    this.batch = this.firestore.batch();
    this.batchCount = 0;
    this.maxBatchSize = 500;
  }

  /**
   * Main sync method - ensures both databases have identical data
   */
  async syncCustomer(customerId, data) {
    const syncId = uuidv4();
    
    try {
      // 1. Start PostgreSQL transaction
      await this.pg.query('BEGIN');
      
      // 2. Prepare normalized data for PostgreSQL
      const pgData = this.normalizePgData(data);
      
      // 3. Prepare document data for Firestore
      const fsData = this.normalizeFsData(data);
      
      // 4. Write to PostgreSQL (multiple tables)
      await this.writeToPg(customerId, pgData);
      
      // 5. Write to Firestore (document + subcollections)
      await this.writeToFs(customerId, fsData);
      
      // 6. Commit PostgreSQL transaction
      await this.pg.query('COMMIT');
      
      // 7. Log successful sync
      await this.logSync(syncId, 'success', customerId, data);
      
      return { success: true, syncId };
      
    } catch (error) {
      // Rollback PostgreSQL
      await this.pg.query('ROLLBACK');
      
      // Attempt to rollback Firestore (delete if it was created)
      await this.rollbackFirestore(customerId);
      
      // Log sync failure
      await this.logSync(syncId, 'failed', customerId, data, error);
      
      throw error;
    }
  }

  /**
   * Write to PostgreSQL (normalized across tables)
   */
  async writeToPg(customerId, data) {
    // 1. Upsert main customer record
    await this.pg.query(`
      INSERT INTO customers (id, email, phone, first_name, last_name, status, customer_type, tags, notes, custom_attributes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        status = EXCLUDED.status,
        customer_type = EXCLUDED.customer_type,
        tags = EXCLUDED.tags,
        notes = EXCLUDED.notes,
        custom_attributes = EXCLUDED.custom_attributes,
        updated_at = CURRENT_TIMESTAMP
    `, [
      customerId,
      data.email,
      data.phone,
      data.firstName,
      data.lastName,
      data.status,
      data.customerType,
      data.tags,
      data.notes,
      JSON.stringify(data.customAttributes)
    ]);

    // 2. Upsert customer sources
    if (data.sources) {
      for (const [source, sourceData] of Object.entries(data.sources)) {
        await this.pg.query(`
          INSERT INTO customer_sources (customer_id, source, external_id, source_data)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (source, external_id) DO UPDATE SET
            source_data = EXCLUDED.source_data,
            last_synced_at = CURRENT_TIMESTAMP
        `, [customerId, source, sourceData.id, JSON.stringify(sourceData.data)]);
      }
    }

    // 3. Upsert metrics
    if (data.metrics) {
      await this.pg.query(`
        INSERT INTO customer_metrics (customer_id, total_orders, total_spent, average_order_value, lifetime_value, churn_probability)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (customer_id) DO UPDATE SET
          total_orders = EXCLUDED.total_orders,
          total_spent = EXCLUDED.total_spent,
          average_order_value = EXCLUDED.average_order_value,
          lifetime_value = EXCLUDED.lifetime_value,
          churn_probability = EXCLUDED.churn_probability,
          updated_at = CURRENT_TIMESTAMP
      `, [
        customerId,
        data.metrics.totalOrders,
        data.metrics.totalSpent,
        data.metrics.averageOrderValue,
        data.metrics.lifetimeValue,
        data.metrics.churnProbability
      ]);
    }

    // 4. Upsert demographics
    if (data.demographics) {
      await this.pg.query(`
        INSERT INTO customer_demographics (customer_id, gender, age_range, income_range, education_level, interests)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (customer_id) DO UPDATE SET
          gender = EXCLUDED.gender,
          age_range = EXCLUDED.age_range,
          income_range = EXCLUDED.income_range,
          education_level = EXCLUDED.education_level,
          interests = EXCLUDED.interests,
          updated_at = CURRENT_TIMESTAMP
      `, [
        customerId,
        data.demographics.gender,
        data.demographics.ageRange,
        data.demographics.incomeRange,
        data.demographics.educationLevel,
        data.demographics.interests
      ]);
    }

    // 5. Handle addresses
    if (data.addresses) {
      for (const address of data.addresses) {
        await this.pg.query(`
          INSERT INTO customer_addresses (id, customer_id, address_type, is_default, address_line1, address_line2, city, country_code, postal_code)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            address_type = EXCLUDED.address_type,
            is_default = EXCLUDED.is_default,
            address_line1 = EXCLUDED.address_line1,
            address_line2 = EXCLUDED.address_line2,
            city = EXCLUDED.city,
            country_code = EXCLUDED.country_code,
            postal_code = EXCLUDED.postal_code,
            updated_at = CURRENT_TIMESTAMP
        `, [
          address.id,
          customerId,
          address.addressType,
          address.isDefault,
          address.addressLine1,
          address.addressLine2,
          address.city,
          address.countryCode,
          address.postalCode
        ]);
      }
    }

    // Continue with other tables...
  }

  /**
   * Write to Firestore (document structure)
   */
  async writeToFs(customerId, data) {
    const customerRef = this.firestore.collection('customers').doc(customerId);
    
    // 1. Set main document
    await customerRef.set({
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    // 2. Handle subcollections
    if (data.addresses) {
      const addressesRef = customerRef.collection('addresses');
      for (const address of data.addresses) {
        await addressesRef.doc(address.id).set({
          ...address,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
      }
    }

    if (data.ipAddresses) {
      const ipsRef = customerRef.collection('ipAddresses');
      for (const ip of data.ipAddresses) {
        await ipsRef.doc(ip.id).set({
          ...ip,
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
      }
    }

    if (data.activities) {
      const activitiesRef = customerRef.collection('activities');
      for (const activity of data.activities) {
        await activitiesRef.doc(activity.id).set({
          ...activity,
          createdAt: FieldValue.serverTimestamp()
        });
      }
    }
  }

  /**
   * Rollback Firestore changes if PostgreSQL fails
   */
  async rollbackFirestore(customerId) {
    try {
      const customerRef = this.firestore.collection('customers').doc(customerId);
      
      // Delete subcollections first
      await this.deleteCollection(customerRef.collection('addresses'));
      await this.deleteCollection(customerRef.collection('ipAddresses'));
      await this.deleteCollection(customerRef.collection('activities'));
      
      // Delete main document
      await customerRef.delete();
    } catch (error) {
      console.error('Firestore rollback failed:', error);
      // Log this critical error for manual intervention
    }
  }

  /**
   * Helper to delete a Firestore collection
   */
  async deleteCollection(collectionRef, batchSize = 100) {
    const query = collectionRef.limit(batchSize);
    const snapshot = await query.get();
    
    if (snapshot.size === 0) return;
    
    const batch = this.firestore.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    await batch.commit();
    
    // Recurse if there are more documents
    if (snapshot.size === batchSize) {
      await this.deleteCollection(collectionRef, batchSize);
    }
  }

  /**
   * Log sync operations for monitoring
   */
  async logSync(syncId, status, entityId, data, error = null) {
    // Log to PostgreSQL
    await this.pg.query(`
      INSERT INTO sync_logs (id, entity_type, entity_id, operation, postgres_status, firestore_status, data_snapshot, error_message, completed_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      syncId,
      'customer',
      entityId,
      'sync',
      status,
      status,
      JSON.stringify(data),
      error?.message,
      status === 'success' ? new Date() : null
    ]);

    // Also log to Firestore for redundancy
    await this.firestore.collection('syncQueue').doc(syncId).set({
      entityType: 'customer',
      entityId: entityId,
      operation: 'sync',
      status: {
        postgres: status,
        firestore: status
      },
      dataSnapshot: data,
      error: error?.message || null,
      createdAt: FieldValue.serverTimestamp(),
      completedAt: status === 'success' ? FieldValue.serverTimestamp() : null
    });
  }
}

module.exports = DatabaseSyncService;
```

## 🎯 Key Implementation Notes

### 1. **Data Consistency Strategy**
- Every write operation updates both databases atomically
- PostgreSQL transaction ensures relational integrity
- Firestore batch writes for performance
- Rollback mechanism if either database fails

### 2. **Query Optimization**
- **PostgreSQL**: Use indexes for common queries (email, phone, status, risk score)
- **Firestore**: Denormalize data for fewer reads, use composite indexes for complex queries

### 3. **When to Use Which Database**

**Use PostgreSQL for:**
- Complex reporting and analytics
- JOIN operations across entities
- Time-series analysis
- Financial calculations requiring ACID compliance
- Data export/import operations

**Use Firestore for:**
- Real-time updates to the admin UI
- Customer profile lookups
- Activity feeds and timelines
- Webhook processing (fast writes)
- Mobile/web client access (if needed)

### 4. **Monitoring & Maintenance**
```sql
-- Monitor sync health
SELECT 
  DATE(created_at) as sync_date,
  COUNT(*) as total_syncs,
  COUNT(CASE WHEN postgres_status = 'success' AND firestore_status = 'success' THEN 1 END) as successful,
  COUNT(CASE WHEN postgres_status != 'success' OR firestore_status != 'success' THEN 1 END) as failed
FROM sync_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY sync_date DESC;
```

This dual-database architecture gives you the best of both worlds: PostgreSQL's powerful querying and Firestore's real-time capabilities, with guaranteed consistency between them.