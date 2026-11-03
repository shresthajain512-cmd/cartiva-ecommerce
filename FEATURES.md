# Cartiva — Feature Specifications & MVP Scope 📋

> **ALTA Builder 30 Challenge — Day 1 Planning**  
> Project: **Cartiva (Smart E-commerce Platform)**

This document outlines the user roles, logical groupings, priority levels, and detailed specifications for the **10 Minimum Viable Product (MVP)** features of Cartiva.

---

## 👥 1. User Roles & Permissions

Cartiva implements **Role-Based Access Control (RBAC)** to ensure a clear boundary between shopping and store management:

| Role | Description | Core Capabilities |
| :--- | :--- | :--- |
| **Customer** | Everyday shopper visiting the store | Registers/logs in, browses product catalogue, filters by category, searches items, inspects product details and images, manages persistent cart, executes test checkout, and reviews past orders. |
| **Admin** | Store operator / inventory manager | Authenticated store manager with administrative privileges to manage product listings (add, edit, delete products) and review catalog status. |

---

## 🚀 2. The 10 MVP Features (Organized by Logical Section)

Each feature is labeled with an MVP priority:
- **P0 (Must-Have):** Essential core functionality required for an end-to-end working transaction.
- **P1 (High):** Critical enhancement for usability and organization.

---

### Section A: Authentication & User Accounts

#### 1. Customer Registration and Login
- **Target Role:** Customer (with Admin authentication support)
- **Priority:** `[P0 - Must-Have]`
- **Description:** Enables new users to create an account with email and password, and returning users to log in securely. Uses salted password hashing (bcrypt) and JSON Web Tokens (JWT) for stateless, secure session handling.
- **Why it matters:** Establishes user identity, secures account credentials, and binds carts and orders to specific customer accounts.

---

### Section B: Product Discovery & Catalog

#### 2. Product Catalogue
- **Target Role:** Customer
- **Priority:** `[P0 - Must-Have]`
- **Description:** A clean, responsive grid view displaying available products with their title, featured thumbnail image, price, and category badge.
- **Why it matters:** The primary storefront landing area where users can see what the store sells at a glance.

#### 3. Product Categories
- **Target Role:** Customer
- **Priority:** `[P1 - High]`
- **Description:** Organized product grouping (e.g., Electronics, Fashion, Home & Kitchen) allowing customers to click a category tag to view only relevant items.
- **Why it matters:** Prevents cognitive overload by allowing shoppers to browse structured collections instead of an unsorted list.

#### 4. Product Search
- **Target Role:** Customer
- **Priority:** `[P1 - High]`
- **Description:** An intuitive search bar that matches keywords in product titles and descriptions to return instant search results.
- **Why it matters:** Direct search enables customers with high purchasing intent to locate their target product quickly.

#### 5. Product Details Page with Images
- **Target Role:** Customer
- **Priority:** `[P0 - Must-Have]`
- **Description:** A dedicated page for each product showing high-resolution product imagery, price, detailed description, stock availability status, and an "Add to Cart" button with quantity selection.
- **Why it matters:** Shoppers need clear images and descriptive information to make informed purchasing decisions before committing.

---

### Section C: Cart & Checkout Experience

#### 6. Shopping Cart that Persists after Refresh
- **Target Role:** Customer
- **Priority:** `[P0 - Must-Have]`
- **Description:** An interactive shopping cart where customers can adjust quantities, remove items, and see an updated subtotal in real time. Cart state is synchronized and persisted (via browser LocalStorage and/or authenticated user session) so items remain intact across page reloads.
- **Why it matters:** Eliminates customer frustration from accidental page reloads and abandoned purchases due to lost cart state.

#### 7. Order Placement
- **Target Role:** Customer
- **Priority:** `[P0 - Must-Have]`
- **Description:** A checkout workflow that collects shipping address details, presents an order summary, calculates totals, and creates an official order record in the database.
- **Why it matters:** Represents the core conversion event of an e-commerce platform by transforming cart items into a confirmed customer order.

#### 8. Test-Mode Payment Checkout
- **Target Role:** Customer
- **Priority:** `[P0 - Must-Have]`
- **Description:** A simulated/sandbox payment processing interface (mock payment gateway or sandbox Stripe/Razorpay) allowing users to safely test successful and failed transactions without real financial charges.
- **Why it matters:** Validates the end-to-end payment workflow and error handling during development and user testing safely.

---

### Section D: Order Management & Tracking

#### 9. Order History
- **Target Role:** Customer
- **Priority:** `[P1 - High]`
- **Description:** A customer account dashboard listing all past orders with order ID, date of purchase, itemized summary, payment status, and order status (e.g., *Placed*, *Processing*, *Delivered*).
- **Why it matters:** Provides transparency, allows customers to track their purchases, and establishes trust in the platform.

---

### Section E: Store Administration

#### 10. Admin Panel to Add, Edit, and Delete Products
- **Target Role:** Admin
- **Priority:** `[P0 - Must-Have]`
- **Description:** A protected administrative dashboard providing full CRUD operations on products: creating new product listings with image URLs and categories, editing existing details (price, description, stock), and deleting obsolete items.
- **Why it matters:** Gives store administrators immediate control over the product catalog directly through the UI without requiring database scripting.

---

## 📊 3. MVP Priority & Role Matrix

| # | Feature | Section | Target Role | Priority |
| :-: | :--- | :--- | :---: | :---: |
| 1 | Customer Registration and Login | Authentication & Accounts | Customer & Admin | `P0 - Must-Have` |
| 2 | Product Catalogue | Product Discovery | Customer | `P0 - Must-Have` |
| 3 | Product Categories | Product Discovery | Customer | `P1 - High` |
| 4 | Product Search | Product Discovery | Customer | `P1 - High` |
| 5 | Product Details Page with Images | Product Discovery | Customer | `P0 - Must-Have` |
| 6 | Shopping Cart (Persists after Refresh) | Cart & Checkout | Customer | `P0 - Must-Have` |
| 7 | Order Placement | Cart & Checkout | Customer | `P0 - Must-Have` |
| 8 | Test-Mode Payment Checkout | Cart & Checkout | Customer | `P0 - Must-Have` |
| 9 | Order History | Order Tracking | Customer | `P1 - High` |
| 10 | Admin Panel (Add, Edit, Delete Products) | Store Administration | Admin | `P0 - Must-Have` |

---

## 🔮 4. Post-MVP & Future Enhancements (Day 2+)

Beyond the Day 1 MVP scope, the following capabilities are planned for subsequent iterations:
- **Inventory & Low-Stock Alerts:** Real-time stock decrementing and out-of-stock badges.
- **Admin Order Fulfillment Lifecycle:** Workflow to advance order statuses (*Pending* ➔ *Processing* ➔ *Shipped* ➔ *Delivered*).
- **Sales Analytics & Metrics Dashboard:** Visual reports on revenue, popular products, and order frequency.
- **Product Reviews & Ratings:** Customer feedback and star ratings on product details pages.

---

## 📖 Related Documents

- [README.md](./README.md) — High-level architecture, problem statement, and planned tech stack.
