# Cartiva — RESTful API Endpoint Specifications 🌐

> **ALTA Builder 30 Challenge — Day 2: API Architecture & Endpoint Contracts**  
> Server: **Node.js & Express** | Format: **JSON**

This document specifies the REST API endpoints for Cartiva, describing HTTP methods, path parameters, request bodies, authentication requirements, and response structures.

---

## 🧭 RESTful API Fundamentals for Beginners

1. **HTTP Methods:**
   - `GET` : Retrieve resources without modifying server state (e.g., fetch catalogue).
   - `POST`: Create a new resource on the server (e.g., register user, place order).
   - `PUT` : Update or modify an existing resource (e.g., edit product details).
   - `DELETE`: Remove a resource from the server (e.g., delete a product).
2. **HTTP Status Codes:**
   - `200 OK`: Request succeeded.
   - `201 Created`: Resource successfully created.
   - `400 Bad Request`: Client validation error (e.g., missing password or invalid price).
   - `401 Unauthorized`: Authentication missing or invalid JWT.
   - `403 Forbidden`: Authenticated user lacks permission (e.g., non-admin calling admin route).
   - `404 Not Found`: Target resource does not exist.
   - `500 Internal Server Error`: Unhandled backend exception.
3. **Authentication Header:**
   - Protected routes require the header: `Authorization: Bearer <JWT_TOKEN>`.

---

## 🔐 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User (Customer or Seller)
- **Method & Route:** `POST /api/auth/register`
- **Access:** Public

#### Customer Registration Request:
```json
{
  "name": "Alice Customer",
  "email": "alice@example.com",
  "password": "SecurePassword123"
}
```

#### Customer Registration Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": "6727a8bc9d1e2f0012345678",
    "name": "Alice Customer",
    "email": "alice@example.com",
    "role": "customer",
    "createdAt": "2026-11-05T00:15:00.000Z"
  }
}
```

#### Seller Registration Request:
```json
{
  "name": "Bob Seller",
  "businessName": "Bob Tech Store",
  "email": "bob@example.com",
  "password": "SecurePassword123",
  "role": "seller"
}
```

#### Seller Registration Success Response (`201 Created`):
```json
{
  "success": true,
  "message": "Seller account registered successfully and is pending approval",
  "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
  "user": {
    "id": "6727a8bc9d1e2f0012345679",
    "name": "Bob Seller",
    "email": "bob@example.com",
    "role": "seller",
    "businessName": "Bob Tech Store",
    "sellerApprovalStatus": "pending",
    "createdAt": "2026-11-05T00:15:00.000Z"
  }
}
```

#### Error Responses (`400 Bad Request`):
- **Missing Required Field:**
  ```json
  {
    "success": false,
    "message": "Please provide your full name"
  }
  ```
- **Missing Business Name for Seller:**
  ```json
  {
    "success": false,
    "message": "Business name is required for seller registration"
  }
  ```
- **Invalid Email Format:**
  ```json
  {
    "success": false,
    "message": "Please provide a valid email address"
  }
  ```
- **Weak Password:**
  ```json
  {
    "success": false,
    "message": "Password must be at least 6 characters long"
  }
  ```
- **Duplicate Email:**
  ```json
  {
    "success": false,
    "message": "An account with this email already exists"
  }
  ```
- **Disallowed Admin Role:**
  ```json
  {
    "success": false,
    "message": "Admin registration is not permitted via public registration"
  }
  ```

### 1.2 User Login (Customer / Seller / Admin)
- **Method & Route:** `POST /api/auth/login`
- **Access:** Public

#### Customer Login Request:
```json
{
  "email": "alice@example.com",
  "password": "SecurePassword123"
}
```

#### Customer Login Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...",
  "user": {
    "id": "6727a8bc9d1e2f0012345678",
    "name": "Alice Customer",
    "email": "alice@example.com",
    "role": "customer",
    "createdAt": "2026-11-05T00:15:00.000Z"
  }
}
```

#### Seller Login Request:
```json
{
  "email": "bob@example.com",
  "password": "SecurePassword123"
}
```

#### Seller Login Success Response (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...",
  "user": {
    "id": "6727a8bc9d1e2f0012345679",
    "name": "Bob Seller",
    "email": "bob@example.com",
    "role": "seller",
    "businessName": "Bob Electronics & Gadgets",
    "sellerApprovalStatus": "approved",
    "createdAt": "2026-11-05T00:15:00.000Z"
  }
}
```

#### Error Responses for Login:
- **Missing Email (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Please provide an email address"
  }
  ```
- **Missing Password (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Please provide a password"
  }
  ```
- **Invalid Email Format (`400 Bad Request`):**
  ```json
  {
    "success": false,
    "message": "Please provide a valid email address"
  }
  ```
- **Invalid Credentials - Wrong Password or Unknown Email (`401 Unauthorized`):**
  *(Note: A generic message is deliberately returned to prevent user enumeration attacks)*
  ```json
  {
    "success": false,
    "message": "Invalid email or password"
  }
  ```

---

### 1.3 JWT Authentication & Protected Routes

All protected routes require sending the JWT access token in the HTTP `Authorization` request header:
```http
Authorization: Bearer <your_jwt_token_here>
```

#### JWT Middleware Authentication Errors (`401 Unauthorized`):
- **Missing Token:**
  ```json
  {
    "success": false,
    "message": "Not authorized, no token provided"
  }
  ```
- **Malformed / Tampered Token:**
  ```json
  {
    "success": false,
    "message": "Not authorized, invalid token"
  }
  ```
- **Expired Token:**
  ```json
  {
    "success": false,
    "message": "Not authorized, token has expired"
  }
  ```

---

### 1.4 Get Current User Profile (Any Authenticated User)
- **Method & Route:** `GET /api/auth/profile`
- **Access:** Protected (`customer`, `seller`, `admin`)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "user": {
      "id": "6727a8bc9d1e2f0012345678",
      "name": "Alice Customer",
      "email": "alice@example.com",
      "role": "customer"
    }
  }
  ```

---

### 1.5 Seller Dashboard & Product Management (Approved Sellers Only)
- **Method & Routes:**
  - `GET /api/auth/seller/dashboard` (Storefront dashboard)
  - `GET /api/auth/seller/products` (Product catalog management)
- **Access:** Protected (`approved` sellers only)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Welcome to the approved seller portal",
    "seller": {
      "id": "6727a8bc9d1e2f0012345679",
      "name": "Bob Seller",
      "businessName": "Prime Electronics Hub",
      "status": "approved"
    }
  }
  ```
- **Forbidden - Non-Seller Role (`403 Forbidden`):**
  ```json
  {
    "success": false,
    "message": "Access denied: Seller account required (current role: 'customer')"
  }
  ```
- **Forbidden - Pending Seller (`403 Forbidden`):**
  ```json
  {
    "success": false,
    "message": "Access denied: Seller storefront is pending approval. You cannot publish products or manage orders yet."
  }
  ```
- **Forbidden - Rejected Seller (`403 Forbidden`):**
  ```json
  {
    "success": false,
    "message": "Access denied: Seller account has been rejected. You cannot access seller management features."
  }
  ```
- **Forbidden - Suspended Seller (`403 Forbidden`):**
  ```json
  {
    "success": false,
    "message": "Access denied: Seller account has been suspended. You cannot access seller management features."
  }
  ```

---

### 1.6 Administrator Dashboard
- **Method & Route:** `GET /api/auth/admin/dashboard`
- **Access:** Protected (`admin` role only)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Welcome to the admin control center",
    "admin": {
      "id": "6727a8bc9d1e2f0012345680",
      "name": "Day5 Administrator",
      "email": "admin@cartiva.com",
      "role": "admin"
    }
  }
  ```
- **Forbidden - Non-Admin User (`403 Forbidden`):**
  ```json
  {
    "success": false,
    "message": "Access denied: Admin privileges required"
  }
  ```

---

### 1.7 Required Environment Variables (Names Only)
For secure execution, the backend requires the following environment variables (stored locally in `backend/.env`):
- `PORT`: Server listening port (default: `5001`).
- `NODE_ENV`: Runtime environment (`development` / `production`).
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Cryptographic secret key used to sign and verify JSON Web Tokens.
- `JWT_EXPIRE`: Token lifespan duration (e.g., `30d`).

---

## 🛍️ 2. Product Endpoints (`/api/products`)

### 2.1 Get Multi-Vendor Product Catalogue (With Whitelisted Search, Filter, Sort & Pagination)
- **Method & Route:** `GET /api/products`
- **Access:** Public (Only displays published products from approved sellers)
- **Query Parameters (Whitelisted & Optional):**
  - `keyword`: Search title or description (e.g., `?keyword=keyboard`). Regex characters safely escaped.
  - `category`: Whitelisted filter: `Electronics`, `Fashion`, `Home & Kitchen`, `Books`, `Fitness`, `Other`.
  - `seller`: Filter by specific approved seller's MongoDB `ObjectId`.
  - `inStock`: `true` to filter items where `stockCount > 0`.
  - `sort`: Whitelisted options: `price_asc`, `price_desc`, `newest` (default), `oldest`.
  - `page`: Positive integer (default: `1`).
  - `limit`: Integer between 1 and 100 (default: `20`).
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "count": 2,
    "totalProducts": 2,
    "totalPages": 1,
    "currentPage": 1,
    "products": [
      {
        "_id": "6727b1029d1e2f0012345679",
        "title": "Wireless Ergonomic Mechanical Keyboard",
        "price": 4599,
        "category": "Electronics",
        "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
        "stockCount": 25,
        "storeName": "Alice Apex Gadgets",
        "seller": {
          "_id": "6727a8bc9d1e2f0012345679",
          "name": "Day6 Seller Alice",
          "businessName": "Alice Apex Gadgets"
        }
      }
    ]
  }
  ```

### 2.2 Get Supported Product Categories
- **Method & Route:** `GET /api/products/categories`
- **Access:** Public
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "categories": [
      "Electronics",
      "Fashion",
      "Home & Kitchen",
      "Books",
      "Fitness",
      "Other"
    ]
  }
  ```

### 2.3 Get Storefront Catalogue by Seller
- **Method & Route:** `GET /api/products/store/:sellerId`
- **Access:** Public
- **Success Response (`200 OK`):** Returns published products belonging exclusively to the specified approved seller.
- **Error Response (`404 Not Found`):** Returns 404 if seller does not exist or is not approved (`pending`/`suspended`/`rejected`).

### 2.4 Get Single Product Details
- **Method & Route:** `GET /api/products/:id`
- **Access:** Public
- **Success Response (`200 OK`):** Returns full product details populated with seller credentials.
- **Error Response (`404 Not Found`):** Returns 404 if product does not exist, is archived, or belongs to an unapproved/suspended seller.

### 2.5 Create & Publish Product (Approved Sellers Only)
- **Method & Route:** `POST /api/products`
- **Access:** Protected (`approvedSellerOnly`)
- **Headers:** `Authorization: Bearer <SELLER_TOKEN>`
- **Security Rule:** Seller identity (`seller: req.user._id`, `storeName: req.user.businessName`) is strictly derived from the verified JWT on the server. Client-provided `seller` or `createdBy` bodies are ignored.
- **Request Body:**
  ```json
  {
    "title": "Wireless Ergonomic Mechanical Keyboard",
    "description": "High-grade PBT keycaps with Bluetooth 5.3 and 2.4GHz dongle.",
    "price": 4599,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    "stockCount": 25
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "product": {
      "_id": "6727b2049d1e2f0012345680",
      "title": "Wireless Ergonomic Mechanical Keyboard",
      "price": 4599,
      "category": "Electronics",
      "stockCount": 25,
      "seller": "6727a8bc9d1e2f0012345679",
      "storeName": "Alice Apex Gadgets",
      "isPublished": true,
      "isArchived": false
    }
  }
  ```

### 2.6 Get Seller's Own Products (Seller Management)
- **Method & Route:** `GET /api/products/seller/my-products`
- **Access:** Protected (`approvedSellerOnly`)
- **Headers:** `Authorization: Bearer <SELLER_TOKEN>`
- **Success Response (`200 OK`):** Returns only the products owned by the authenticated seller.

### 2.7 Update Product (Owner Seller or Admin)
- **Method & Route:** `PUT /api/products/:id`
- **Access:** Protected (`approvedSellerOrAdmin`)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Security Rule:** Object-Level Authorization verifies that `product.seller == req.user._id` (or user is `admin`).
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "product": { ... }
  }
  ```
- **Error Response (`403 Forbidden`):** If a seller attempts to modify a product belonging to another vendor:
  ```json
  {
    "success": false,
    "message": "Access denied: You are not authorized to modify products from another seller"
  }
  ```

### 2.8 Soft-Delete / Archive Product (Owner Seller or Admin)
- **Method & Route:** `DELETE /api/products/:id`
- **Access:** Protected (`approvedSellerOrAdmin`)
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Security Rule:** Soft-deletes product (`isArchived: true`, `isPublished: false`) to preserve historical order receipts and prevent orphaned references.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Product archived successfully"
  }
  ```

---

## 📦 3. Order Endpoints (`/api/orders`)

### 3.1 Place New Order (Test-Mode Checkout)
- **Method & Route:** `POST /api/orders`
- **Access:** Protected (Customer)
- **Headers:** `Authorization: Bearer <CUSTOMER_TOKEN>`
- **Request Body:**
  ```json
  {
    "orderItems": [
      {
        "product": "6727b1029d1e2f0012345679",
        "title": "Wireless Noise-Canceling Headphones",
        "quantity": 1,
        "price": 2499,
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
      }
    ],
    "shippingAddress": {
      "street": "123 Tech Park Road",
      "city": "Bengaluru",
      "state": "Karnataka",
      "postalCode": "560100",
      "country": "India"
    },
    "totalAmount": 2499
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Order placed successfully (Test Mode)",
    "order": {
      "_id": "6727c0019d1e2f0012345681",
      "totalAmount": 2499,
      "orderStatus": "Placed",
      "paymentResult": {
        "status": "COMPLETED_TEST_MODE",
        "transactionId": "TEST-TXN-1793740200"
      }
    }
  }
  ```

### 3.2 Get Customer Order History
- **Method & Route:** `GET /api/orders/my-orders`
- **Access:** Protected (Customer)
- **Success Response (`200 OK`):** Returns an array of orders placed by the currently authenticated customer.

### 3.3 Get Single Order by ID
- **Method & Route:** `GET /api/orders/:id`
- **Access:** Protected (Customer who owns order OR Admin)
- **Success Response (`200 OK`):** Detailed breakdown of specific order.

---

## 📖 Related Documents

- [README.md](./README.md) — High-level architecture & roadmap.
- [FEATURES.md](./FEATURES.md) — 10 MVP features & role mappings.
- [SCHEMA.md](./SCHEMA.md) — Mongoose schemas & data relationships.
