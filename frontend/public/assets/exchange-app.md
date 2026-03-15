AABM App

## Prompt for Caffeine AI

Create a modular, scalable, resilient, decentralized-inspired multi-vendor dropship marketplace web app called “Secoinfi Exchange App” at a *.caffeine.ai domain.

The app’s core concept:
We (#Secoinfi) act as a brokerage / match service between Buyers (Collectors) and Sellers (Providers). Buyers are always anonymous to Sellers. Sellers compete in FIXTURES (odd vs even seller groups, etc.) to offer the best overall bundle (Price, Quantity, Quality, Service, Guarantees) to climb a LEADERBOARD and win orders.

### 1. Roles and Identity

Implement four base roles:

- ADMIN (Secoinfi operators)
- BUYER (Collector / Client)
- SELLER (Provider / Vendor)
- VIEWER (public / unauthenticated, can only browse)

Constraints:

- Buyers never expose direct contact details to Sellers.
- Buyers are identified by an internal BUYER_ID plus a masked identity string derived from hashing their registration data.
- System should remember only a short “user-visible” suffix of the hash/nonce (e.g., last 4 characters) so the buyer can recognize their own transactions without exposing full hashes.

### 2. Data Models (Stage 1)

Define and implement the following core models (TypeScript/DB schemas plus APIs):

1) User
- id
- role (ADMIN | BUYER | SELLER | VIEWER)
- email (for ADMIN and SELLER only; BUYER optional)
- mobile (for BUYER only, stored securely, never shown to Sellers)
- hashed_identity (for BUYER, irreversible hash of key identity data)
- masked_tag (short string, e.g., last 4 chars of hashed_identity or nonce, used in UI)
- created_at, updated_at

2) Product
- id
- title
- description
- category
- base_sku_code
- attributes (JSON: brand, variant, specs, etc.)
- created_at, updated_at

3) SellerProductOffer
Each Seller’s specific quote for a Product.
- id
- seller_id (User with role SELLER)
- product_id
- price_mrp (declared MRP)
- price_offer (their quoted price)
- quantity_available
- quality_score (0–100)
- service_score (0–100)
- warranty_months
- shipping_time_days
- terms_summary (short text)
- is_active
- created_at, updated_at

4) Fixture
A Fixture is a competition round where groups of Sellers (e.g., odd vs even ids or group A vs group B) compete for buyer demand in a time window.
- id
- name
- product_id (or product_category_id; for now link directly to Product)
- group_a_seller_ids (array of seller ids)
- group_b_seller_ids (array of seller ids)
- starts_at, ends_at
- status (PLANNED | LIVE | CLOSED)
- scoring_formula_version (string)
- created_at, updated_at

5) LeaderboardEntry
This is the resolved scoring of each Seller in a Fixture for a given Product.
- id
- fixture_id
- seller_id
- product_id
- price_score (normalized 0–100)
- quality_score (normalized 0–100)
- service_score (normalized 0–100)
- warranty_score (normalized 0–100)
- overall_score (0–100, computed)
- rank (1, 2, 3, …)
- is_winner (boolean)
- created_at

6) BuyerIntent / CartRequest
Represents a Buyer’s desire to purchase something (stocks, goods, services, etc.) without revealing identity to Sellers.
- id
- buyer_id
- product_id (or generic category)
- requested_quantity
- constraints_json (e.g., min_quality_score, max_delivery_days, preferred_price_range)
- status (OPEN | MATCHED | FULFILLED | CANCELLED)
- created_at, updated_at

7) Match / Order
Actual match between a BuyerIntent and a SellerProductOffer chosen via fixture + leaderboard.
- id
- buyer_intent_id
- seller_product_offer_id
- fixture_id (optional if matched via fixture)
- agreed_price
- quantity
- status (PLACED | SHIPPED | DELIVERED | DISPUTED | REFUNDED)
- settlement_status (PENDING | PAID_TO_SELLER)
- created_at, updated_at

8) SessionTxn (Merkle leaf)
Represents a transactional event in a client session that will be included in a Merkle tree.
- id
- buyer_id or seller_id (nullable depending on who initiated)
- session_id (UUID)
- event_type (REGISTRATION | BUYER_INTENT_CREATED | ORDER_MATCHED | PAYMENT_INITIATED | PAYMENT_CONFIRMED | DISPUTE_OPENED | etc.)
- event_payload (JSON)
- nonce (unique per event, random string)
- nonce_suffix (last 4 characters of nonce, stored for user display)
- created_at

9) SessionMerkleRoot
Per-session Merkle root anchor for all SessionTxn rows of that session.
- id
- session_id
- merkle_root_hash
- num_leaves
- created_at

### 3. Core Flows (Stage 1)

Implement the following flows end-to-end (UI + APIs):

#### 3.1 Buyer Registration and Waitlist (UPI Arbitrage Fee)

- Simple onboarding page for BUYER:
  - Collect: name (optional or alias), mobile10, minimal KYC fields as needed (configurable).
  - DO NOT share mobile/email with any Seller.
- On successful form submission:
  - Create User with role=BUYER, hashed_identity = secure hash of (mobile + timestamp + salt).
  - Generate masked_tag as last 4 chars of hashed_identity or a nonce.
  - Create a SessionTxn entry with event_type=REGISTRATION and a fresh nonce; store nonce_suffix.
- Show instructions:
  - “Pay Arbitrage Fee (difference between min price and max MRP) to UPI ID: secoin@uboi to activate your waitlist entry.”
  - For now, mock UPI confirmation in the UI with a “Mark as Paid” button (we will integrate real UPI later).
- After manual confirmation, mark buyer as ACTIVE and eligible for matching.

#### 3.2 Seller Onboarding

- Seller registration page: collect business name, email, basic KYC fields.
- ADMIN must approve Seller via an Admin panel toggle “approved = true”.
- On approval, Seller can create Product offers via “Add Offer” forms.
- Each SellerProductOffer becomes a potential competitor in Fixtures.

#### 3.3 Fixture Creation and Leaderboard Logic

- Admin dashboard: create Fixtures specifying:
  - Product for the fixture.
  - Group A: list of seller_ids.
  - Group B: list of seller_ids.
  - Start and end times.
  - Scoring formula version (text label).

- Implement a scoring engine (on backend) that, for each SellerProductOffer in the fixture, computes:
  - price_score: cheaper price_offer gets higher score (normalize e.g., 0–100 based on min–max within fixture).
  - quality_score: use SellerProductOffer.quality_score.
  - service_score: use SellerProductOffer.service_score and shipping_time_days.
  - warranty_score: map warranty_months into 0–100.
  - overall_score: weighted sum, e.g., 40% price, 30% quality, 20% service, 10% warranty.
  - rank sellers within the fixture by overall_score descending.

- Store results in LeaderboardEntry; mark top N as winners.

- Build a public “Fixture Leaderboard” UI:
  - Show Group A vs Group B with visual emphasis.
  - For each seller in the fixture: show name (or alias), offer price, quality, service, warranty, overall_score, rank.
  - Filter/sort options for buyers (price-first, quality-first, balanced, etc.).

#### 3.4 Buyer Intent Creation and Matching

- BUYER UI:
  - From any product detail page, buyer can click “Request Best Deal”.
  - Show a form: requested_quantity, optional constraints (max price, min quality score, max delivery days, etc.).
  - On submit, create BuyerIntent and a SessionTxn with event_type=BUYER_INTENT_CREATED.

- Matching engine (Stage 1 simple logic):
  - For each open BuyerIntent, find active Fixtures for that product.
  - Pick the current/most recent fixture.
  - From LeaderboardEntry for that fixture, find the highest-ranked Seller whose SellerProductOffer satisfies buyer constraints.
  - Create a Match/Order linking BuyerIntent and SellerProductOffer with agreed_price = seller’s price_offer.
  - Create a SessionTxn event_type=ORDER_MATCHED including fixture_id and seller_id in payload.

- BUYER can see their orders with masked_tag and nonce_suffix to identify each txn, without showing full internal IDs or personal details to Sellers.

#### 3.5 Merkle Root Computation per Session

Implement a simple Merkle-tree style process for SessionTxn:

- For each session_id, consider all SessionTxn rows in that session as leaves.
- Compute a Merkle root hash (can be a simple binary Merkle tree over hash(event_id + event_payload)) when the session “ends”.
  - For Stage 1, you can treat “end” as:
    - explicit “End Session” button in UI, or
    - on user logout.
- Store in SessionMerkleRoot with session_id, merkle_root_hash, num_leaves.
- Ensure that the backend does not need to resend all leaf data when the client reconnects; instead, it can send:
  - session_id, merkle_root_hash, and incremental updates only.
- Expose an Admin API to verify Merkle root by recomputing from leaves for debugging.

### 4. Anonymity and Data Segregation Rules

Enforce the following rules in UI and APIs:

- Sellers must never see: buyer mobile, email, real name (unless ADMIN explicitly approves in a special flow later).
- Sellers interacting with orders only see:
  - an internal buyer reference (e.g., “Buyer #B12345”) and masked_tag (e.g., “…9d3a”).
  - order line items, delivery address proxy (for now, mock an anonymized address; we’ll refine later).
- Buyers never see seller’s internal cost structures, only the offer terms and scoreboard ranking.
- Store sensitive buyer data in separate tables or fields, with clear boundaries to avoid accidental leaks in API responses.

### 5. Buyer & Seller Pros in UX Copy

Use the following high-level benefits in the marketing / landing page content and in relevant onboarding screens:

For BUYERS (Collectors), highlight:

- Multiple sellers compete in real time via fixtures to give you best price–quality bundles.
- Always see a transparent spread between min price and max MRP, so you understand your savings.
- Your identity and contact details are always hidden from sellers; Secoinfi stands in the middle as your broker.
- Anonymous hashes and nonce suffixes let you verify your transactions without revealing full details.
- Merkle-based session logging and decentralized-style storage give you tamper-evident transaction history.

For SELLERS (Providers), highlight:

- No need to hold inventory for low-demand products; you can operate as a pure dropship / on-demand provider.
- Access a shared buyer pool aggregated by Secoinfi without building your own e-commerce stack.
- Leaderboard and fixture systems reward best-performing offers with more orders.
- Central brokerage handles buyer privacy, contracts, and dispute frameworks, reducing your compliance burden.
- Modular, scalable platform lets you expand catalog and markets quickly.

You can shorten the exact copy, but keep the essence.

### 6. Technical and Architectural Requirements

- Language: TypeScript for backend APIs and frontend components.
- Pattern: API routes + React-style frontend, similar to previous Caffeine projects.
- Persistence: Use Caffeine’s default database layer, with clear schema definitions for the models above.
- Architecture goals:
  - Modular: separate modules for identity, catalog, fixtures, scoring, matching, and logging.
  - Scalable: design APIs so we can later plug in external providers (logistics, UPI, stock brokers).
  - Resilient: handle partial failures and allow retry or re-computation of leaderboard and Merkle roots.
  - “Decentral-inspired”: even though this is a standard app, implement tamper-evident logs via hashes and Merkle roots.

### 7. Staging and Scope Control

Treat this as Stage 1:

- Must-have:
  - User roles and auth.
  - Product + SellerProductOffer models and CRUD UIs.
  - Buyer registration + masked identity + waitlist flow with mock UPI confirmation.
  - Fixture creation and automatic leaderboard scoring engine.
  - BuyerIntent creation and basic auto-matching via leaderboard.
  - Order/Match model and simple order status flow.
  - SessionTxn + SessionMerkleRoot models and minimal Merkle root calculation on “End Session”.
  - Basic landing page with clear BUYER and SELLER value propositions.

- Nice-to-have (if easy, but not mandatory for first build):
  - Admin dashboards for analytics (e.g., top sellers, savings vs MRP).
  - Simple dispute status handling (DISPUTED, REFUNDED).
  - Filters on the leaderboard UI (cost-first vs quality-first).

Do not simplify the business logic above, but if something is too heavy for a single iteration, implement the data models and core flows first, and then we will ask you to extend with more advanced analytics, external integrations, and more complex Merkle/ledger behavior in later stages.
--

Use this as your master prompt to Caffeine AI (paste it as the first message in a new app chat). It already encodes your pros, arbitrage model, privacy, Merkle-root tracking, fixtures, and leaderboard.



## Prompt for Caffeine AI

Create a modular, scalable, resilient, decentralized-inspired multi-vendor dropship marketplace web app called “Secoinfi Exchange App” at a *.caffeine.ai domain.

The app’s core concept:
We (#Secoinfi) act as a brokerage / match service between Buyers (Collectors) and Sellers (Providers). Buyers are always anonymous to Sellers. Sellers compete in FIXTURES (odd vs even seller groups, etc.) to offer the best overall bundle (Price, Quantity, Quality, Service, Guarantees) to climb a LEADERBOARD and win orders.

### 1. Roles and Identity

Implement four base roles:

- ADMIN (Secoinfi operators)
- BUYER (Collector / Client)
- SELLER (Provider / Vendor)
- VIEWER (public / unauthenticated, can only browse)

Constraints:

- Buyers never expose direct contact details to Sellers.
- Buyers are identified by an internal BUYER_ID plus a masked identity string derived from hashing their registration data.
- System should remember only a short “user-visible” suffix of the hash/nonce (e.g., last 4 characters) so the buyer can recognize their own transactions without exposing full hashes.

### 2. Data Models (Stage 1)

Define and implement the following core models (TypeScript/DB schemas plus APIs):

1) User
- id
- role (ADMIN | BUYER | SELLER | VIEWER)
- email (for ADMIN and SELLER only; BUYER optional)
- mobile (for BUYER only, stored securely, never shown to Sellers)
- hashed_identity (for BUYER, irreversible hash of key identity data)
- masked_tag (short string, e.g., last 4 chars of hashed_identity or nonce, used in UI)
- created_at, updated_at

2) Product
- id
- title
- description
- category
- base_sku_code
- attributes (JSON: brand, variant, specs, etc.)
- created_at, updated_at

3) SellerProductOffer
Each Seller’s specific quote for a Product.
- id
- seller_id (User with role SELLER)
- product_id
- price_mrp (declared MRP)
- price_offer (their quoted price)
- quantity_available
- quality_score (0–100)
- service_score (0–100)
- warranty_months
- shipping_time_days
- terms_summary (short text)
- is_active
- created_at, updated_at

4) Fixture
A Fixture is a competition round where groups of Sellers (e.g., odd vs even ids or group A vs group B) compete for buyer demand in a time window.
- id
- name
- product_id (or product_category_id; for now link directly to Product)
- group_a_seller_ids (array of seller ids)
- group_b_seller_ids (array of seller ids)
- starts_at, ends_at
- status (PLANNED | LIVE | CLOSED)
- scoring_formula_version (string)
- created_at, updated_at

5) LeaderboardEntry
This is the resolved scoring of each Seller in a Fixture for a given Product.
- id
- fixture_id
- seller_id
- product_id
- price_score (normalized 0–100)
- quality_score (normalized 0–100)
- service_score (normalized 0–100)
- warranty_score (normalized 0–100)
- overall_score (0–100, computed)
- rank (1, 2, 3, …)
- is_winner (boolean)
- created_at

6) BuyerIntent / CartRequest
Represents a Buyer’s desire to purchase something (stocks, goods, services, etc.) without revealing identity to Sellers.
- id
- buyer_id
- product_id (or generic category)
- requested_quantity
- constraints_json (e.g., min_quality_score, max_delivery_days, preferred_price_range)
- status (OPEN | MATCHED | FULFILLED | CANCELLED)
- created_at, updated_at

7) Match / Order
Actual match between a BuyerIntent and a SellerProductOffer chosen via fixture + leaderboard.
- id
- buyer_intent_id
- seller_product_offer_id
- fixture_id (optional if matched via fixture)
- agreed_price
- quantity
- status (PLACED | SHIPPED | DELIVERED | DISPUTED | REFUNDED)
- settlement_status (PENDING | PAID_TO_SELLER)
- created_at, updated_at

8) SessionTxn (Merkle leaf)
Represents a transactional event in a client session that will be included in a Merkle tree.
- id
- buyer_id or seller_id (nullable depending on who initiated)
- session_id (UUID)
- event_type (REGISTRATION | BUYER_INTENT_CREATED | ORDER_MATCHED | PAYMENT_INITIATED | PAYMENT_CONFIRMED | DISPUTE_OPENED | etc.)
- event_payload (JSON)
- nonce (unique per event, random string)
- nonce_suffix (last 4 characters of nonce, stored for user display)
- created_at

9) SessionMerkleRoot
Per-session Merkle root anchor for all SessionTxn rows of that session.
- id
- session_id
- merkle_root_hash
- num_leaves
- created_at

### 3. Core Flows (Stage 1)

Implement the following flows end-to-end (UI + APIs):

#### 3.1 Buyer Registration and Waitlist (UPI Arbitrage Fee)

- Simple onboarding page for BUYER:
  - Collect: name (optional or alias), mobile10, minimal KYC fields as needed (configurable).
  - DO NOT share mobile/email with any Seller.
- On successful form submission:
  - Create User with role=BUYER, hashed_identity = secure hash of (mobile + timestamp + salt).
  - Generate masked_tag as last 4 chars of hashed_identity or a nonce.
  - Create a SessionTxn entry with event_type=REGISTRATION and a fresh nonce; store nonce_suffix.
- Show instructions:
  - “Pay Arbitrage Fee (difference between min price and max MRP) to UPI ID: secoin@uboi to activate your waitlist entry.”
  - For now, mock UPI confirmation in the UI with a “Mark as Paid” button (we will integrate real UPI later).
- After manual confirmation, mark buyer as ACTIVE and eligible for matching.

#### 3.2 Seller Onboarding

- Seller registration page: collect business name, email, basic KYC fields.
- ADMIN must approve Seller via an Admin panel toggle “approved = true”.
- On approval, Seller can create Product offers via “Add Offer” forms.
- Each SellerProductOffer becomes a potential competitor in Fixtures.

#### 3.3 Fixture Creation and Leaderboard Logic

- Admin dashboard: create Fixtures specifying:
  - Product for the fixture.
  - Group A: list of seller_ids.
  - Group B: list of seller_ids.
  - Start and end times.
  - Scoring formula version (text label).

- Implement a scoring engine (on backend) that, for each SellerProductOffer in the fixture, computes:
  - price_score: cheaper price_offer gets higher score (normalize e.g., 0–100 based on min–max within fixture).
  - quality_score: use SellerProductOffer.quality_score.
  - service_score: use SellerProductOffer.service_score and shipping_time_days.
  - warranty_score: map warranty_months into 0–100.
  - overall_score: weighted sum, e.g., 40% price, 30% quality, 20% service, 10% warranty.
  - rank sellers within the fixture by overall_score descending.

- Store results in LeaderboardEntry; mark top N as winners.

- Build a public “Fixture Leaderboard” UI:
  - Show Group A vs Group B with visual emphasis.
  - For each seller in the fixture: show name (or alias), offer price, quality, service, warranty, overall_score, rank.
  - Filter/sort options for buyers (price-first, quality-first, balanced, etc.).

#### 3.4 Buyer Intent Creation and Matching

- BUYER UI:
  - From any product detail page, buyer can click “Request Best Deal”.
  - Show a form: requested_quantity, optional constraints (max price, min quality score, max delivery days, etc.).
  - On submit, create BuyerIntent and a SessionTxn with event_type=BUYER_INTENT_CREATED.

- Matching engine (Stage 1 simple logic):
  - For each open BuyerIntent, find active Fixtures for that product.
  - Pick the current/most recent fixture.
  - From LeaderboardEntry for that fixture, find the highest-ranked Seller whose SellerProductOffer satisfies buyer constraints.
  - Create a Match/Order linking BuyerIntent and SellerProductOffer with agreed_price = seller’s price_offer.
  - Create a SessionTxn event_type=ORDER_MATCHED including fixture_id and seller_id in payload.

- BUYER can see their orders with masked_tag and nonce_suffix to identify each txn, without showing full internal IDs or personal details to Sellers.

#### 3.5 Merkle Root Computation per Session

Implement a simple Merkle-tree style process for SessionTxn:

- For each session_id, consider all SessionTxn rows in that session as leaves.
- Compute a Merkle root hash (can be a simple binary Merkle tree over hash(event_id + event_payload)) when the session “ends”.
  - For Stage 1, you can treat “end” as:
    - explicit “End Session” button in UI, or
    - on user logout.
- Store in SessionMerkleRoot with session_id, merkle_root_hash, num_leaves.
- Ensure that the backend does not need to resend all leaf data when the client reconnects; instead, it can send:
  - session_id, merkle_root_hash, and incremental updates only.
- Expose an Admin API to verify Merkle root by recomputing from leaves for debugging.

### 4. Anonymity and Data Segregation Rules

Enforce the following rules in UI and APIs:

- Sellers must never see: buyer mobile, email, real name (unless ADMIN explicitly approves in a special flow later).
- Sellers interacting with orders only see:
  - an internal buyer reference (e.g., “Buyer #B12345”) and masked_tag (e.g., “…9d3a”).
  - order line items, delivery address proxy (for now, mock an anonymized address; we’ll refine later).
- Buyers never see seller’s internal cost structures, only the offer terms and scoreboard ranking.
- Store sensitive buyer data in separate tables or fields, with clear boundaries to avoid accidental leaks in API responses.

### 5. Buyer & Seller Pros in UX Copy

Use the following high-level benefits in the marketing / landing page content and in relevant onboarding screens:

For BUYERS (Collectors), highlight:

- Multiple sellers compete in real time via fixtures to give you best price–quality bundles.
- Always see a transparent spread between min price and max MRP, so you understand your savings.
- Your identity and contact details are always hidden from sellers; Secoinfi stands in the middle as your broker.
- Anonymous hashes and nonce suffixes let you verify your transactions without revealing full details.
- Merkle-based session logging and decentralized-style storage give you tamper-evident transaction history.

For SELLERS (Providers), highlight:

- No need to hold inventory for low-demand products; you can operate as a pure dropship / on-demand provider.
- Access a shared buyer pool aggregated by Secoinfi without building your own e-commerce stack.
- Leaderboard and fixture systems reward best-performing offers with more orders.
- Central brokerage handles buyer privacy, contracts, and dispute frameworks, reducing your compliance burden.
- Modular, scalable platform lets you expand catalog and markets quickly.

You can shorten the exact copy, but keep the essence.

### 6. Technical and Architectural Requirements

- Language: TypeScript for backend APIs and frontend components.
- Pattern: API routes + React-style frontend, similar to previous Caffeine projects.
- Persistence: Use Caffeine’s default database layer, with clear schema definitions for the models above.
- Architecture goals:
  - Modular: separate modules for identity, catalog, fixtures, scoring, matching, and logging.
  - Scalable: design APIs so we can later plug in external providers (logistics, UPI, stock brokers).
  - Resilient: handle partial failures and allow retry or re-computation of leaderboard and Merkle roots.
  - “Decentral-inspired”: even though this is a standard app, implement tamper-evident logs via hashes and Merkle roots.

### 7. Staging and Scope Control

Treat this as Stage 1:

- Must-have:
  - User roles and auth.
  - Product + SellerProductOffer models and CRUD UIs.
  - Buyer registration + masked identity + waitlist flow with mock UPI confirmation.
  - Fixture creation and automatic leaderboard scoring engine.
  - BuyerIntent creation and basic auto-matching via leaderboard.
  - Order/Match model and simple order status flow.
  - SessionTxn + SessionMerkleRoot models and minimal Merkle root calculation on “End Session”.
  - Basic landing page with clear BUYER and SELLER value propositions.

- Nice-to-have (if easy, but not mandatory for first build):
  - Admin dashboards for analytics (e.g., top sellers, savings vs MRP).
  - Simple dispute status handling (DISPUTED, REFUNDED).
  - Filters on the leaderboard UI (cost-first vs quality-first).

Do not simplify the business logic above, but if something is too heavy for a single iteration, implement the data models and core flows first, and then we will ask you to extend with more advanced analytics, external integrations, and more complex Merkle/ledger behavior in later stages.
