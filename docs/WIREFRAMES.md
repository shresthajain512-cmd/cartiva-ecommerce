# Cartiva — UI Wireframes & Layout Blueprint 📐

> **ALTA Builder 30 Challenge — Day 2: User Interface Wireframes**  
> Target Platform: **Responsive Web (Desktop, Tablet, Mobile)**

This document provides visual wireframe schematics and layout specifications for the four core screens of Cartiva:
1. **Login & Signup Modal / Screen**
2. **Main Product Listing Page (Storefront Catalogue)**
3. **Product Detail Page**
4. **Admin Dashboard (Product CRUD & Store Overview)**

---

## 🎨 Consistent Design System Principles

Across all four screens, Cartiva maintains a cohesive layout and visual hierarchy:
- **Global Header / Navigation Bar:**
  - Left: Logo (`Cartiva 🛒`) & tagline.
  - Center: Global product search bar with category selector.
  - Right: Cart counter badge `[ 🛒 Cart (3) ]` and User Account menu / Login button.
- **Color Palette & Contrast Tokens:**
  - Primary Accent: Indigo / Deep Blue (`#4F46E5`) for primary actions.
  - Neutral Surface: Crisp white cards (`#FFFFFF`) with subtle slate borders (`#E2E8F0`).
  - Dark Mode Ready: Slate dark background (`#0F172A`) with frosted glassmorphism cards.
  - Semantic Badges: Success Green for in-stock, Amber for low-stock, Rose for out-of-stock.
- **Responsive Breakpoints:**
  - Mobile: `< 640px` (Single-column stacked layouts, hamburger drawer).
  - Tablet: `640px – 1024px` (2-column grids, condensed sidebar).
  - Desktop: `> 1024px` (Full multi-column layout, sticky filters and sidebars).

---

## 🖥️ Wireframe 1: Login & Signup Screen

### Layout Concept:
Centered modal card with toggleable tabs between **Sign In** and **Create Account**, featuring real-time client validation and role-based feedback.

```text
+-----------------------------------------------------------------------+
|  Cartiva 🛒                                      [ Back to Store ]    |
+-----------------------------------------------------------------------+
|                                                                       |
|                     +-------------------------------+                 |
|                     |         Cartiva 🛒            |                 |
|                     |   Welcome to Smart Shopping   |                 |
|                     +-------------------------------+                 |
|                     |  [ Sign In ]   |  Create Acc  | <--- Tabs       |
|                     +-------------------------------+                 |
|                     |                               |                 |
|                     |  Email Address                |                 |
|                     |  [ user@example.com         ] |                 |
|                     |                               |                 |
|                     |  Password                     |                 |
|                     |  [ ••••••••••••••••       👁 ] |                 |
|                     |                               |                 |
|                     |  [ ] Remember me  Forgot pwd? |                 |
|                     |                               |                 |
|                     |  +-------------------------+  |                 |
|                     |  |       Sign In ➔         |  | <--- Primary CTA|
|                     |  +-------------------------+  |                 |
|                     |                               |                 |
|                     |  ---------------- or -------- |                 |
|                     |                               |                 |
|                     |  Don't have an account?       |                 |
|                     |  [ Create a free account ]    |                 |
|                     +-------------------------------+                 |
|                                                                       |
+-----------------------------------------------------------------------+
```

### Signup Tab State:
```text
|                     +-------------------------------+                 |
|                     |   Sign In   | [ Create Acc ]  |                 |
|                     +-------------------------------+                 |
|                     |  Full Name                    |                 |
|                     |  [ Jane Doe                 ] |                 |
|                     |                               |                 |
|                     |  Email Address                |                 |
|                     |  [ jane@example.com         ] |                 |
|                     |                               |                 |
|                     |  Create Password              |                 |
|                     |  [ ••••••••••••••••       👁 ] |                 |
|                     |  Password Strength: [Strong ■■■]                |
|                     |                               |                 |
|                     |  Confirm Password             |                 |
|                     |  [ ••••••••••••••••         ] |                 |
|                     |                               |                 |
|                     |  +-------------------------+  |                 |
|                     |  |    Create Account ➔     |  |                 |
|                     |  +-------------------------+  |                 |
|                     +-------------------------------+                 |
```

### Responsive Behavior:
- **Desktop:** Floating centered card (width `420px`) with subtle backdrop blur.
- **Mobile:** Full-screen mobile view with thumb-accessible input controls and sticky bottom submit button.

---

## 🖥️ Wireframe 2: Main Product Listing Page (Catalogue)

### Layout Concept:
Two-column desktop storefront layout featuring a filter sidebar on the left and a responsive product card grid on the right.

```text
+-------------------------------------------------------------------------------------------------+
|  Cartiva 🛒     [ All Categories ▼ ] [ Search products, brands, electronics... 🔍 ]   [🛒 Cart(2)] [Login] |
+-------------------------------------------------------------------------------------------------+
|  Home > Products > Electronics                                           Showing 12 of 48 items |
+--------------------+----------------------------------------------------------------------------+
|  FILTERS & SEARCH  |  SORT BY: [ Price: Low to High ▼ ]                     [ Grid View | List View ]|
|                    +----------------------------------------------------------------------------+
|  Categories:       |  +--------------------+  +--------------------+  +--------------------+    |
|  [x] All Items     |  | [ Product Image ]  |  | [ Product Image ]  |  | [ Product Image ]  |    |
|  [ ] Electronics   |  |                    |  |                    |  |                    |    |
|  [ ] Fashion       |  | Electronics        |  | Electronics        |  | Audio & Sound      |    |
|  [ ] Home & Kitchen|  | Wireless Earbuds   |  | Mechanical Keyboard|  | Smart Speaker Mini |    |
|  [ ] Books         |  | ₹1,999  (In Stock) |  | ₹3,499  (In Stock) |  | ₹2,499 (Low Stock) |    |
|                    |  | [ Add to Cart ]    |  | [ Add to Cart ]    |  | [ Add to Cart ]    |    |
|  Price Range:      |  +--------------------+  +--------------------+  +--------------------+    |
|  Min: ₹0  Max:₹10k |                                                                            |
|  [====O==========] |  +--------------------+  +--------------------+  +--------------------+    |
|                    |  | [ Product Image ]  |  | [ Product Image ]  |  | [ Product Image ]  |    |
|  Availability:     |  |                    |  |                    |  |                    |    |
|  [ ] In Stock Only |  | Fitness Band Pro   |  | 4K Action Camera   |  | USB-C Hub 7-in-1   |    |
|                    |  | ₹2,799  (In Stock) |  | ₹7,999 (Sold Out)  |  | ₹1,299  (In Stock) |    |
|  [ Clear Filters ] |  | [ Add to Cart ]    |  | [ Notify Me ]      |  | [ Add to Cart ]    |    |
|                    |  +--------------------+  +--------------------+  +--------------------+    |
|                    |                                                                            |
|                    |             PAGINATION:  [ < Previous ]  [ 1 ]  [ 2 ]  [ 3 ]  [ Next > ]   |
+--------------------+----------------------------------------------------------------------------+
|  © 2026 Cartiva Inc. • Safe Test Checkout • Fast Shipping • Terms • Privacy                     |
+-------------------------------------------------------------------------------------------------+
```

### Key Interactive Components:
- **Instant Search & Filter:** Updates catalogue results dynamically without full page reloads.
- **Card Action Button:** Clicking `[ Add to Cart ]` triggers an animation, increments the navbar badge, and persists items into state.
- **Mobile View:** Filter sidebar collapses into a slide-up "Filter & Sort" sheet triggered by a sticky bottom bar.

---

## 🖥️ Wireframe 3: Product Detail Page

### Layout Concept:
High-conversion detailed product showcase featuring high-res imagery on the left and purchasing controls on the right.

```text
+-------------------------------------------------------------------------------------------------+
|  Cartiva 🛒     [ Search products... 🔍 ]                                  [🛒 Cart(2)] [My Account] |
+-------------------------------------------------------------------------------------------------+
|  Home > Electronics > Audio > Wireless Noise-Canceling Headphones                              |
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
|  +-----------------------------+      +------------------------------------------------------+  |
|  |                             |      |  Electronics  •  Brand: SonicPro                     |  |
|  |                             |      |                                                      |  |
|  |                             |      |  Wireless Noise-Canceling Over-Ear Headphones        |  |
|  |     PRIMARY PRODUCT         |      |  ⭐⭐⭐⭐☆ (4.5 / 5 based on 84 reviews)             |  |
|  |     HIGH-RES IMAGE          |      |                                                      |  |
|  |                             |      |  ₹2,499  (Inclusive of all taxes)                   |  |
|  |                             |      |  Status: [ ✅ In Stock - 15 items remaining ]         |  |
|  |                             |      +------------------------------------------------------+  |
|  +-----------------------------+      |  Description:                                        |  |
|                                       |  Experience studio-quality sound with active noise   |  |
|  THUMBNAIL GALLERY:                   |  cancellation, 30-hour battery life, and ultra-soft  |  |
|  [img1] [img2] [img3] [img4]          |  memory foam ear cushions.                           |  |
|                                       |                                                      |  |
|                                       |  Quantity:                                           |  |
|                                       |  [ - ]  [ 1 ]  [ + ]                                 |  |
|                                       |                                                      |  |
|                                       |  +-------------------------+  +-------------------+  |  |
|                                       |  | 🛒 Add to Cart          |  | ⚡ Buy Now (Test) |  |  |
|                                       |  +-------------------------+  +-------------------+  |  |
|                                       |                                                      |  |
|                                       |  🛡️ 100% Secure Test Mode Checkout                   |  |
|                                       |  🚚 Free Delivery across India in 3-5 days           |  |
|                                       |  🔄 Easy 7-Day Replacement Guarantee                 |  |
|                                       +------------------------------------------------------+  |
|                                                                                                 |
+-------------------------------------------------------------------------------------------------+
|  SPECIFICATIONS & FEATURES:                                                                     |
|  • Bluetooth 5.3  • Battery: 30 Hours  • Weight: 240g  • Fast Charging: 10 min = 5 hours      |
+-------------------------------------------------------------------------------------------------+
```

### Key Interactive Components:
- **Image Gallery Switcher:** Hovering or clicking thumbnails changes the main high-res preview.
- **Quantity Selector:** Prevents picking less than 1 or exceeding `stockCount`.
- **Persistent Cart Integration:** `Add to Cart` updates both local state and the database `Cart` model for authenticated users.

---

## 🖥️ Wireframe 4: Admin Dashboard

### Layout Concept:
A modern store management control center with operational KPI summary cards and an intuitive product CRUD data table.

```text
+-------------------------------------------------------------------------------------------------+
|  Cartiva 🛒  [ADMIN PORTAL]                                              [Admin: John Doe ▼] [Logout] |
+--------------------+----------------------------------------------------------------------------+
|  NAVIGATION        |  ADMIN STORE OVERVIEW                                                      |
|                    +----------------------------------------------------------------------------+
|  [📊 Overview    ] |  KEY STORE METRICS (KPIs):                                                 |
|  [🛍 Products    ] |  +------------------+  +------------------+  +------------------+          |
|  [📦 Orders      ] |  | Total Revenue    |  | Total Orders     |  | Low Stock Alerts |          |
|  [👥 Customers   ] |  | ₹1,28,450        |  | 54 Orders        |  | 3 Items Low      |          |
|  [⚙️ Settings    ] |  +------------------+  +------------------+  +------------------+          |
|                    +----------------------------------------------------------------------------+
|                    |  PRODUCT CATALOG MANAGEMENT                                                |
|                    |  [ Search products... 🔍 ]  [ Category: All ▼ ]   [ + Add New Product ]    |
|                    +----------------------------------------------------------------------------+
|                    |  Image | Title                 | Category    | Price   | Stock | Actions   |
|                    |  ------+-----------------------+-------------+---------+-------+---------- |
|                    |  [img] | Wireless Headphones   | Electronics | ₹2,499  | 15    | [Edit][Del]|
|                    |  [img] | Mechanical Keyboard   | Electronics | ₹3,299  | 20    | [Edit][Del]|
|                    |  [img] | Cotton Casual Shirt   | Fashion     | ₹999    | 8     | [Edit][Del]|
|                    |  [img] | Steel Thermos Flask   | Home/Kitchen| ₹749    | 2     | [Edit][Del]|
|                    +----------------------------------------------------------------------------+
|                    |  Showing 4 of 24 products                 [ < Prev ]  [ 1 ] [ 2 ]  [ Next > ]|
+--------------------+----------------------------------------------------------------------------+
```

### "Add / Edit Product" Modal Wireframe:
```text
+-------------------------------------------------------+
|  Add New Product                          [ ✖ Close ] |
+-------------------------------------------------------+
|  Product Title *                                      |
|  [ Ergonomic Office Chair                           ] |
|                                                       |
|  Category *                     Price (₹) *           |
|  [ Home & Kitchen         ▼ ]   [ 8999              ] |
|                                                       |
|  Stock Quantity *               Image URL *           |
|  [ 12                       ]   [ https://images... ] |
|                                                       |
|  Product Description *                                |
|  [ High-back mesh ergonomic chair with lumbar support |
|    and adjustable armrests.                         ] |
|                                                       |
|  +--------------------+         +-------------------+ |
|  | Cancel             |         | Save Product ➔    | |
|  +--------------------+         +-------------------+ |
+-------------------------------------------------------+
```

### Key Administrative Capabilities:
- **Real-Time Catalog Control:** Admins can insert, modify, and delete inventory items without database commands.
- **Low-Stock Visibility:** Highlights items where `stockCount <= 5` in amber so managers can replenish stock.
- **Role Guard:** Protected by backend `adminOnly` middleware and frontend role-based routing.

---

## 📱 Mobile Responsiveness Matrix

| Screen | Desktop Layout (`>1024px`) | Mobile Layout (`<640px`) |
| :--- | :--- | :--- |
| **Login / Signup** | Centered floating glassmorphic card (420px) | Full-screen responsive sheet with large touch targets |
| **Product Catalogue** | Sticky filter sidebar + 3/4 column card grid | Collapsible filter modal + 2-column compact grid |
| **Product Details** | Side-by-side (Image gallery on left, specs on right) | Stacked layout: swipeable image carousel on top, specs below |
| **Admin Dashboard** | Permanent vertical sidebar + full data table | Top drawer hamburger navigation + horizontally scrollable card table |

---

## 📖 Related Documents

- [README.md](../README.md) — Project roadmap & planned architecture.
- [SCHEMA.md](../SCHEMA.md) — Complete MongoDB Mongoose database specifications.
- [FEATURES.md](../FEATURES.md) — The 10 MVP features breakdown.
- [API.md](../API.md) — RESTful API endpoint contracts.
