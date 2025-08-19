Customer
Multiple access scopes needed — refer to each endpoint for access scope requirements.
Requires access to protected customer data.
The Customer resource stores information about a shop's customers, such as their contact details, their order history, and whether they've agreed to receive email marketing.


The Customer resource also holds information on the status of a customer's account. Customers with accounts save time at checkout when they're logged in because they don't need to enter their contact information. You can use the Customer API to check whether a customer has an active account, and then invite them to create one if they don't.

For security reasons, the Customer resource doesn't store credit card information. Customers always need to enter this information at checkout.

In a shop's checkout settings, there are three options for customer accounts:

Accounts are disabled: Customers can't create accounts and can check out only as guests.
Accounts are optional: Customers have the choice of either signing into their account or checking out as a guest. Customers can create accounts for themselves, and the shop owner can create an account for a customer and then invite them by email to use it.
Accounts are required: Customers can't check out unless they're logged in, and the shop owner must create their accounts.
Caution: Only use this data if it is necessary for the intended app functionality. Shopify retains the ability to restrict access to API Access scopes for apps not requiring legitimate use of the associated data.

Was this section helpful?

Yes

No
#
Endpoints
post
/admin/api/latest/customers.json
Creates a customer

customerCreate
post
/admin/api/latest/customers/{customer_id}/account_activation_url.json
Creates an account activation URL for a customer

customerGenerateAccountActivationUrl
post
/admin/api/latest/customers/{customer_id}/send_invite.json
Sends an account invite to a customer

customerSendAccountInviteEmail
get
/admin/api/latest/customers.json?ids=207119551,562393516,1073339464
Retrieves a list of customers

customers
get
/admin/api/latest/customers/{customer_id}.json
Retrieves a single customer

customer
get
/admin/api/latest/customers/{customer_id}/orders.json
Retrieves all orders that belong to a customer

customer
get
/admin/api/latest/customers/count.json
Retrieves a count of customers

customersCount
get
/admin/api/latest/customers/search.json?query=email:bob.norman@mail.example.com
Searches for customers that match a supplied query

customers
put
/admin/api/latest/customers/{customer_id}.json
Updates a customer

customerUpdate
del
/admin/api/latest/customers/{customer_id}.json
Deletes a customer

customerDelete
Anchor to
The Customer resource
Anchor to
Properties
addresses
->

addresses
A list of the ten most recently updated addresses for the customer. Each address has the following properties:

Show addresses properties
currency
deprecated
The three-letter code (ISO 4217 format) for the currency that the customer used when they paid for their last order. Defaults to the shop currency. Returns the shop currency for test orders.

created_at
read-only
->

createdAt
The date and time (ISO 8601 format) when the customer was created.

default_address
read-only
->

defaultAddress
The default address for the customer. The default address has the following properties:

Show default_address properties
email
->

email
The unique email address of the customer. Attempting to assign the same email address to multiple customers returns an error.

email_marketing_consent
->

emailMarketingConsent
The marketing consent information when the customer consented to receiving marketing material by email. The email property is required to create a customer with email consent information and to update a customer for email consent that doesn't have an email recorded. The customer must have a unique email address associated to the record. The email marketing consent has the following properties:

Show email_marketing_consent properties
first_name
->

firstName
The customer's first name.

id
->

id
A unique identifier for the customer.

last_name
->

lastName
The customer's last name.

last_order_id
read-only
->

lastOrder
The ID of the customer's last order.

last_order_name
read-only
->

lastOrder
The name of the customer's last order. This is directly related to the name field on the Order resource.

metafield
->

metafield
Attaches additional metadata to a shop's resources:

Show metafield properties
Show 15 hidden fields
Was this section helpful?

Yes

No
{}
The Customer resource
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
{
  "addresses": [
    {
      "id": 207119551,
      "customer_id": 6940095564,
      "first_name": "Bob",
      "last_name": "Norman",
      "company": null,
      "address1": "Chestnut Street 92",
      "address2": "Apartment 2",
      "city": "Louisville",
      "province": "Kentucky",
      "country": "United States",
      "zip": "40202",
      "phone": "555-625-1199",
      "province_code": "KY",
      "country_code": "US",
      "country_name": "United States",
      "default": true
    }
  ],
  "currency": "JPY",
  "created_at": "2013-06-27T08:48:27-04:00",
  "default_address": {
    "address1": "Chestnut Street 92",
    "address2": "Apartment 2",
    "city": "Louisville",
    "company": null,
    "country": "united states",
    "first_name": "Bob",
    "id": 207119551,
    "last_name": "Norman",
    "phone": "555-625-1199",
    "province": "Kentucky",
    "zip": "40202",
    "province_code": "KY",
    "country_code": "US",
    "country_name": "United States",
    "default": true
  },
  "email": "bob.norman@mail.example.com",
  "email_marketing_consent": {
    "state": "subscribed",
    "opt_in_level": "confirmed_opt_in",
    "consent_updated_at": "2022-04-01T11:22:06-04:00"
  },
  "first_name": "John",
  "id": 207119551,
  "last_name": "Norman",
  "last_order_id": 234132602919,
  "last_order_name": "#1169",
  "metafield": {
    "key": "new",
    "namespace": "global",
    "value": "newvalue",
    "type": "string"
  },
  "marketing_opt_in_level": "confirmed_opt_in",
  "multipass_identifier": null,
  "note": "Placed an order that had a fraud warning",
}
Anchor to POST request, Creates a customer
post
Creates a customer

customerCreate
Requires customers access scope.
Creates a customer.

Anchor to Parameters of Creates a customerParameters
api_version
string
required
Was this section helpful?

Yes

No
Anchor to post-customers-examplesExamples

Request body
customer
Customer resource
Show customer properties






Was this section helpful?

Yes

No
post
/admin/api/2025-07/customers.json
cURL
Remix
Ruby
Node.js
Copy
1
2
3
4
5
curl -d '{"customer":{"first_name":"Steve","last_name":"Lastnameson","email":"steve.lastnameson@example.com","phone":"+15142546011","verified_email":true,"addresses":[{"address1":"123 Oak St","city":"Ottawa","province":"ON","phone":"555-1212","zip":"123 ABC","last_name":"Lastnameson","first_name":"Mother","country":"CA"}],"password":"newpass","password_confirmation":"newpass","send_email_welcome":false}}' \
-X POST "https://your-development-store.myshopify.com/admin/api/2025-07/customers.json" \
-H "X-Shopify-Access-Token: {access_token}" \
-H "Content-Type: application/json"

{}
Response
JSON
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
HTTP/1.1 201 Created
{
  "customer": {
    "email": "steve.lastnameson@example.com",
    "first_name": "Steve",
    "last_name": "Lastnameson",
    "id": 1073339470,
    "updated_at": "2025-07-01T14:37:24-04:00",
    "created_at": "2025-07-01T14:37:23-04:00",
    "orders_count": 0,
    "state": "enabled",
    "total_spent": "0.00",
    "last_order_id": null,
    "note": null,
    "verified_email": true,
    "multipass_identifier": null,
    "tax_exempt": false,
    "tags": "",
    "last_order_name": null,
    "currency": "USD",
    "phone": "+15142546011",
    "addresses": [
      {
        "id": 1053317300,
        "customer_id": 1073339470,
        "first_name": "Mother",
        "last_name": "Lastnameson",
        "company": null,
        "address1": "123 Oak St",
        "address2": null,
        "city": "Ottawa",
        "province": "Ontario",
        "country": "Canada",
        "zip": "123 ABC",
        "phone": "555-1212",
        "name": "Mother Lastnameson",
Anchor to POST request, Creates an account activation URL for a customer
post
Creates an account activation URL for a customer

customerGenerateAccountActivationUrl
Requires customers access scope.
Generate an account activation URL for a customer whose account is not yet enabled. This is useful when you've imported a large number of customers and want to send them activation emails all at once. Using this approach, you'll need to generate and send the activation emails yourself.

The account activation URL generated by this endpoint is for one-time use and will expire after 30 days. If you make a new POST request to this endpoint, then a new URL will be generated. The new URL will be again valid for 30 days, but the previous URL will no longer be valid.

Anchor to Parameters of Creates an account activation URL for a customerParameters
api_version
string
required
customer_id
string
required
Was this section helpful?

Yes

No
Anchor to post-customers-customer-id-account-activation-url-examplesExamples

Path parameters
customer_id=207119551
string
required

Was this section helpful?

Yes

No
post
/admin/api/2025-07/customers/207119551/account_activation_url.json
cURL
Remix
Ruby
Node.js
Copy
1
2
3
4
5
curl -d '{}' \
-X POST "https://your-development-store.myshopify.com/admin/api/2025-07/customers/207119551/account_activation_url.json" \
-H "X-Shopify-Access-Token: {access_token}" \
-H "Content-Type: application/json"

{}
Response
JSON
1
2
3
4
HTTP/1.1 200 OK
{
  "account_activation_url": "https://jsmith.myshopify.com/account/activate/207119551/5fb848100b352ca81ee88f58094c9977-1751394901"
}
Anchor to POST request, Sends an account invite to a customer
post
Sends an account invite to a customer

customerSendAccountInviteEmail
Requires customers access scope.
Sends an account invite to a customer.

Anchor to Parameters of Sends an account invite to a customerParameters
api_version
string
required
customer_id
string
required
Was this section helpful?

Yes

No
Anchor to post-customers-customer-id-send-invite-examplesExamples

Path parameters
customer_id=207119551
string
required

Was this section helpful?

Yes

No
post
/admin/api/2025-07/customers/207119551/send_invite.json
cURL
Remix
Ruby
Node.js
Copy
1
2
3
4
5
curl -d '{"customer_invite":{"to":"new_test_email@shopify.com","from":"j.limited@example.com","bcc":["j.limited@example.com"],"subject":"Welcome to my new shop","custom_message":"My awesome new store"}}' \
-X POST "https://your-development-store.myshopify.com/admin/api/2025-07/customers/207119551/send_invite.json" \
-H "X-Shopify-Access-Token: {access_token}" \
-H "Content-Type: application/json"

{}
Response
JSON
1
2
3
4
5
6
7
8
9
10
11
12
HTTP/1.1 201 Created
{
  "customer_invite": {
    "to": "new_test_email@shopify.com",
    "from": "j.limited@example.com",
    "subject": "Welcome to my new shop",
    "custom_message": "My awesome new store",
    "bcc": [
      "j.limited@example.com"
    ]
  }
}
Anchor to GET request, Retrieves a list of customers
get
Retrieves a list of customers

customers
Requires customers access scope.
Retrieves a list of customers. Note: This endpoint implements pagination by using links that are provided in the response header. To learn more, refer to Make paginated requests to the REST Admin API.

Anchor to Parameters of Retrieves a list of customersParameters
api_version
string
required
created_at_max
Show customers created before a specified date.
(format: 2014-04-25T16:15:47-04:00)

created_at_min
Show customers created after a specified date.
(format: 2014-04-25T16:15:47-04:00)

fields
Show only certain fields, specified by a comma-separated list of field names.

ids
Restrict results to customers specified by a comma-separated list of IDs.

limit
≤ 250
default 50
The maximum number of results to show.

since_id
Restrict results to those after the specified ID.

updated_at_max
Show customers last updated before a specified date.
(format: 2014-04-25T16:15:47-04:00)

updated_at_min
Show customers last updated after a specified date.
(format: 2014-04-25T16:15:47-04:00)

Was this section helpful?

Yes

No
Anchor to get-customers?ids=207119551,562393516,1073339464-examplesExamples

Query parameters
ids=207119551,562393516,1073339464
Restrict results to customers specified by a comma-separated list of IDs.





Was this section helpful?

Yes

No
get
/admin/api/2025-07/customers.json?ids=207119551,562393516,1073339464
cURL
Remix
Ruby
Node.js
Copy
1
2
3
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-07/customers.json?ids=207119551%2C562393516%2C1073339464" \
-H "X-Shopify-Access-Token: {access_token}"

{}
Response
JSON
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
HTTP/1.1 200 OK
      "last_order_id": 450789469,
      "note": null,
      "verified_email": true,
      "multipass_identifier": null,
      "tax_exempt": false,
      "tags": "",
      "last_order_name": "#1001",
      "currency": "USD",
      "phone": "+1(201)625-1199",
      "addresses": [
        {
          "id": 562393516,
          "customer_id": 562393516,
          "first_name": "Dom",
          "last_name": "Toretto",
          "company": null,
          "address1": "Chestnut Street 93",
          "address2": "",
          "city": "Louisville",
          "province": "Kentucky",
          "country": "United States",
          "zip": "40202",
          "phone": "+1(201)625-1199",
          "name": "Dom Toretto",
          "province_code": "KY",
          "country_code": "US",
          "country_name": "United States",
          "default": true
        }
      ],
      "tax_exemptions": [],
      "email_marketing_consent": {
        "state": "not_subscribed",
        "opt_in_level": null,
        "consent_updated_at": "2004-06-13T11:57:11-04:00"
      },
      "sms_marketing_consent": null,
      "admin_graphql_api_id": "gid://shopify/Customer/562393516",
      "default_address": {
        "id": 562393516,
        "customer_id": 562393516,
        "first_name": "Dom",
        "last_name": "Toretto",
        "company": null,
        "address1": "Chestnut Street 93",
        "address2": "",
        "city": "Louisville",
        "province": "Kentucky",
        "country": "United States",
        "zip": "40202",
        "phone": "+1(201)625-1199",
        "name": "Dom Toretto",
        "province_code": "KY",
        "country_code": "US",
        "country_name": "United States",
        "default": true
      }
    },
    {
      "id": 207119551,
      "email": "bob.norman@mail.example.com",
      "created_at": "2025-07-01T14:34:17-04:00",
      "updated_at": "2025-07-01T14:34:17-04:00",
      "first_name": "Bob",
      "last_name": "Norman",
      "orders_count": 1,
      "state": "disabled",
      "total_spent": "199.65",
      "last_order_id": 450789469,
      "note": null,
      "verified_email": true,
      "multipass_identifier": null,
      "tax_exempt": false,
      "tags": "Léon, Noël",
      "last_order_name": "#1001",
      "currency": "USD",
      "phone": "+16136120707",
      "addresses": [
        {
          "id": 207119551,
          "customer_id": 207119551,
Anchor to GET request, Retrieves a single customer
get
Retrieves a single customer

customer
Requires customers access scope.
Retrieves a single customer.

Anchor to Parameters of Retrieves a single customerParameters
api_version
string
required
customer_id
string
required
fields
Show only certain fields, specified by a comma-separated list of field names.

Was this section helpful?

Yes

No
Anchor to get-customers-customer-id-examplesExamples

Path parameters
customer_id=207119551
string
required
Was this section helpful?

Yes

No
get
/admin/api/2025-07/customers/207119551.json
cURL
Remix
Ruby
Node.js
Copy
1
2
3
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-07/customers/207119551.json" \
-H "X-Shopify-Access-Token: {access_token}"

{}
Response
JSON
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
HTTP/1.1 200 OK
{
  "customer": {
    "id": 207119551,
    "email": "bob.norman@mail.example.com",
    "created_at": "2025-07-01T14:33:13-04:00",
    "updated_at": "2025-07-01T14:33:13-04:00",
    "first_name": "Bob",
    "last_name": "Norman",
    "orders_count": 1,
    "state": "disabled",
    "total_spent": "199.65",
    "last_order_id": 450789469,
    "note": null,
    "verified_email": true,
    "multipass_identifier": null,
    "tax_exempt": false,
    "tags": "Léon, Noël",
    "last_order_name": "#1001",
    "currency": "USD",
    "phone": "+16136120707",
    "addresses": [
      {
        "id": 207119551,
        "customer_id": 207119551,
        "first_name": null,
        "last_name": null,
        "company": null,
        "address1": "Chestnut Street 92",
        "address2": "",
        "city": "Louisville",
        "province": "Kentucky",
        "country": "United States",
        "zip": "40202",
        "phone": "555-625-1199",
        "name": "",
Anchor to GET request, Retrieves all orders that belong to a customer
get
Retrieves all orders that belong to a customer

customer
Retrieves all orders that belong to a customer. By default, only open orders are returned. The query string parameters in the Order resource are also available at this endpoint.

Anchor to Parameters of Retrieves all orders that belong to a customerParameters
api_version
string
required
customer_id
string
required
status
enum
default open
The status of the orders to return.

Show status properties
Was this section helpful?

Yes

No
Anchor to get-customers-customer-id-orders-examplesExamples

Path parameters
customer_id=207119551
string
required

Was this section helpful?

Yes

No
get
/admin/api/2025-07/customers/207119551/orders.json
cURL
Remix
Ruby
Node.js
Copy
1
2
3
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-07/customers/207119551/orders.json" \
-H "X-Shopify-Access-Token: {access_token}"

{}
Response
JSON
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
HTTP/1.1 200 OK
{
  "orders": [
    {
      "id": 450789469,
      "admin_graphql_api_id": "gid://shopify/Order/450789469",
      "app_id": null,
      "browser_ip": "0.0.0.0",
      "buyer_accepts_marketing": false,
      "cancel_reason": null,
      "cancelled_at": null,
      "cart_token": "68778783ad298f1c80c3bafcddeea02f",
      "checkout_id": 901414060,
      "checkout_token": "bd5a8aa1ecd019dd3520ff791ee3a24c",
      "client_details": {
        "accept_language": null,
        "browser_height": null,
        "browser_ip": "0.0.0.0",
        "browser_width": null,
        "session_hash": null,
        "user_agent": null
      },
      "closed_at": null,
      "confirmation_number": null,
      "confirmed": true,
      "contact_email": "bob.norman@mail.example.com",
      "created_at": "2008-01-10T11:00:00-05:00",
      "currency": "USD",
      "current_subtotal_price": "195.67",
      "current_subtotal_price_set": {
        "shop_money": {
          "amount": "195.67",
          "currency_code": "USD"
        },
        "presentment_money": {
          "amount": "195.67",
Anchor to GET request, Retrieves a count of customers
get
Retrieves a count of customers

customersCount
Requires customers access scope.
Retrieves a count of all customers.

Anchor to Parameters of Retrieves a count of customersParameters
api_version
string
required
created_at_max
Count customers created before a specified date.
(format: 2014-04-25T16:15:47-04:00)

created_at_min
Count customers created after a specified date.
(format: 2014-04-25T16:15:47-04:00)

updated_at_max
Count customers last updated before a specified date.
(format: 2014-04-25T16:15:47-04:00)

updated_at_min
Count customers last updated after a specified date.
(format: 2014-04-25T16:15:47-04:00)

Was this section helpful?

Yes

No
Anchor to get-customers-count-examplesExamples



Was this section helpful?

Yes

No
get
/admin/api/2025-07/customers/count.json
cURL
Remix
Ruby
Node.js
Copy
1
2
3
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-07/customers/count.json" \
-H "X-Shopify-Access-Token: {access_token}"

{}
Response
JSON
1
2
3
4
HTTP/1.1 200 OK
{
  "count": 2
}
Anchor to GET request, Searches for customers that match a supplied query
get
Searches for customers that match a supplied query

customers
Requires customers access scope.
Searches for customers that match a supplied query. Note: This endpoint implements pagination by using links that are provided in the response header. To learn more, refer to Make paginated requests to the REST Admin API.

Anchor to Parameters of Searches for customers that match a supplied queryParameters
api_version
string
required
fields
Show only certain fields, specified by a comma-separated list of field names.

limit
≤ 250
default 50
The maximum number of results to show.

order
default last_order_date DESC
Set the field and direction by which to order results.

query
Text to search for in the shop's customer data. Note: Supported queries: accepts_marketing, activation_date, address1, address2, city, company, country, customer_date, customer_first_name, customer_id, customer_last_name, customer_tag, email, email_marketing_state, first_name, first_order_date, id, last_abandoned_order_date, last_name, multipass_identifier, orders_count, order_date, phone, province, shop_id, state, tag, total_spent, updated_at, verified_email, product_subscriber_status. All other queries returns all customers.

Was this section helpful?

Yes

No
Anchor to get-customers-search?query=email:bob.norman@mail.example.com-examplesExamples

Query parameters
query=email:bob.norman@mail.example.com
Text to search for in the shop's customer data. Note: Supported queries: accepts_marketing, activation_date, address1, address2, city, company, country, customer_date, customer_first_name, customer_id, customer_last_name, customer_tag, email, email_marketing_state, first_name, first_order_date, id, last_abandoned_order_date, last_name, multipass_identifier, orders_count, order_date, phone, province, shop_id, state, tag, total_spent, updated_at, verified_email, product_subscriber_status. All other queries returns all customers.






Was this section helpful?

Yes

No
get
/admin/api/2025-07/customers/search.json?query=email:bob.norman@mail.example.com
cURL
Remix
Ruby
Node.js
Copy
1
2
3
curl -X GET "https://your-development-store.myshopify.com/admin/api/2025-07/customers/search.json?query=email%3Abob.norman%40mail.example.com" \
-H "X-Shopify-Access-Token: {access_token}"

{}
Response
JSON
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
HTTP/1.1 200 OK
{
  "customers": [
    {
      "id": 207119551,
      "email": "bob.norman@mail.example.com",
      "created_at": "2025-07-01T14:33:50-04:00",
      "updated_at": "2025-07-01T14:33:50-04:00",
      "first_name": "Bob",
      "last_name": "Norman",
      "orders_count": 1,
      "state": "disabled",
      "total_spent": "199.65",
      "last_order_id": 450789469,
      "note": null,
      "verified_email": true,
      "multipass_identifier": null,
      "tax_exempt": false,
      "tags": "Léon, Noël",
      "last_order_name": "#1001",
      "currency": "USD",
      "phone": "+16136120707",
      "addresses": [
        {
          "id": 207119551,
          "customer_id": 207119551,
          "first_name": null,
          "last_name": null,
          "company": null,
          "address1": "Chestnut Street 92",
          "address2": "",
          "city": "Louisville",
          "province": "Kentucky",
          "country": "United States",
          "zip": "40202",
          "phone": "555-625-1199",
Anchor to PUT request, Updates a customer
put
Updates a customer

customerUpdate
Requires customers access scope.
Updates a customer.

Anchor to Parameters of Updates a customerParameters
api_version
string
required
customer_id
string
required
Was this section helpful?

Yes

No
Anchor to put-customers-customer-id-examplesExamples

Path parameters
customer_id=207119551
string
required
Request body
customer
Customer resource
Show customer properties



Was this section helpful?

Yes

No
put
/admin/api/2025-07/customers/207119551.json
cURL
Remix
Ruby
Node.js
Copy
1
2
3
4
5
curl -d '{"customer":{"id":207119551,"metafields":[{"key":"new","value":"newvalue","type":"single_line_text_field","namespace":"global"}]}}' \
-X PUT "https://your-development-store.myshopify.com/admin/api/2025-07/customers/207119551.json" \
-H "X-Shopify-Access-Token: {access_token}" \
-H "Content-Type: application/json"

{}
Response
JSON
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
HTTP/1.1 200 OK
{
  "customer": {
    "email": "bob.norman@mail.example.com",
    "first_name": "Bob",
    "last_name": "Norman",
    "id": 207119551,
    "created_at": "2025-07-01T14:35:46-04:00",
    "updated_at": "2025-07-01T14:35:46-04:00",
    "orders_count": 1,
    "state": "disabled",
    "total_spent": "199.65",
    "last_order_id": 450789469,
    "note": null,
    "verified_email": true,
    "multipass_identifier": null,
    "tax_exempt": false,
    "tags": "Léon, Noël",
    "last_order_name": "#1001",
    "currency": "USD",
    "phone": "+16136120707",
    "addresses": [
      {
        "id": 207119551,
        "customer_id": 207119551,
        "first_name": null,
        "last_name": null,
        "company": null,
        "address1": "Chestnut Street 92",
        "address2": "",
        "city": "Louisville",
        "province": "Kentucky",
        "country": "United States",
        "zip": "40202",
        "phone": "555-625-1199",
        "name": "",
Anchor to DELETE request, Deletes a customer
del
Deletes a customer

customerDelete
Requires customers access scope.
Deletes a customer. A customer can't be deleted if they have existing orders.

Anchor to Parameters of Deletes a customerParameters
api_version
string
required
customer_id
string
required
Was this section helpful?

Yes

No
Anchor to delete-customers-customer-id-examplesExamples

Path parameters
customer_id=207119551
string
required
Was this section helpful?

Yes

No
del
/admin/api/2025-07/customers/207119551.json
cURL
Remix
Ruby
Node.js
Copy
1
2
3
curl -X DELETE "https://your-development-store.myshopify.com/admin/api/2025-07/customers/207119551.json" \
-H "X-Shopify-Access-Token: {access_token}"

{}
Response
JSON
1
2
HTTP/1.1 200 OK
{}
Updates
Developer changelog
Shopify Partners Slack
Shopify Editions
Business growth
Shopify Partners Program
Shopify App Store
Shopify Academy
Legal
Terms of service
API terms of use
Privacy policy
Partners Program Agreement
