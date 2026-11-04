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

### 1.2 User Login (Customer / Admin)
- **Method & Route:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securePassword123"
  }
  ```
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "user": {
      "id": "6727a8bc9d1e2f0012345678",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```

### 1.3 Get Current User Profile
- **Method & Route:** `GET /api/auth/profile`
- **Access:** Protected (Logged-in User)
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "user": {
      "id": "6727a8bc9d1e2f0012345678",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer"
    }
  }
  ```

---

## 🛍️ 2. Product Endpoints (`/api/products`)

### 2.1 Get Product Catalogue (With Search, Filter, & Sort)
- **Method & Route:** `GET /api/products`
- **Access:** Public
- **Query Parameters (Optional):**
  - `category`: Filter by category (e.g., `?category=Electronics`)
  - `keyword`: Search by title/description (e.g., `?keyword=headphones`)
  - `sort`: Order results (e.g., `?sort=price_asc`, `?sort=price_desc`, `?sort=newest`)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "count": 2,
    "products": [
      {
        "_id": "6727b1029d1e2f0012345679",
        "title": "Wireless Noise-Canceling Headphones",
        "price": 2499,
        "category": "Electronics",
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "stockCount": 15
      }
    ]
  }
  ```

### 2.2 Get Single Product Details
- **Method & Route:** `GET /api/products/:id`
- **Access:** Public
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "product": {
      "_id": "6727b1029d1e2f0012345679",
      "title": "Wireless Noise-Canceling Headphones",
      "description": "High-fidelity audio with 30-hour battery life and fast charging.",
      "price": 2499,
      "category": "Electronics",
      "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
      "stockCount": 15,
      "createdAt": "2026-11-03T18:00:00.000Z"
    }
  }
  ```

### 2.3 Create Product (Admin Only)
- **Method & Route:** `POST /api/products`
- **Access:** Protected (Admin Only)
- **Headers:** `Authorization: Bearer <ADMIN_TOKEN>`
- **Request Body:**
  ```json
  {
    "title": "Mechanical Gaming Keyboard",
    "description": "RGB tactile mechanical switches with detachable braided cable.",
    "price": 3299,
    "category": "Electronics",
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    "stockCount": 20
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Product created successfully",
    "product": {
      "_id": "6727b2049d1e2f0012345680",
      "title": "Mechanical Gaming Keyboard",
      "price": 3299,
      "category": "Electronics",
      "stockCount": 20
    }
  }
  ```

### 2.4 Update Product (Admin Only)
- **Method & Route:** `PUT /api/products/:id`
- **Access:** Protected (Admin Only)
- **Request Body:** Partial or complete product updates.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Product updated successfully",
    "product": { ... }
  }
  ```

### 2.5 Delete Product (Admin Only)
- **Method & Route:** `DELETE /api/products/:id`
- **Access:** Protected (Admin Only)
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Product deleted successfully"
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
