# Cartiva 🛒 — Smart E-commerce Platform

> **ALTA Builder 30 Challenge — Day 1: Project Planning & Architecture**

A modern, responsive, and full-stack e-commerce web platform designed to deliver a smooth shopping experience for customers and an intuitive administrative interface for store managers.

---

## 📌 Project Overview

**Cartiva** is a full-stack Smart E-commerce Platform being developed step-by-step as part of the **ALTA Builder 30 challenge**. The goal is to design, architect, and build a production-grade web application from scratch with clean code separation, security best practices, and a learner-friendly structure.

---

## 🎯 Problem Statement

Modern e-commerce solutions often present steep barriers: shoppers struggle with cluttered interfaces, unpreserved cart states, and cumbersome checkouts, while small store administrators face overly complicated management backends.

**Cartiva addresses this by:**
- Providing an intuitive, fast, and responsive storefront for customers with search, categories, and reliable persistent carts.
- Offering a safe, test-mode checkout experience to simulate transactions without real money.
- Delivering a streamlined admin panel for product management (add, edit, delete).
- Utilizing a decoupled, scalable MERN (React + Node.js/Express + MongoDB) architecture.

---

## 🛠️ Planned Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [React](https://react.dev/) | Component-driven Single Page Application (SPA), state management, responsive UI, and persistent cart state. |
| **Backend** | [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) | RESTful API server, middleware pipeline, JWT authentication, and business logic. |
| **Database** | [MongoDB](https://www.mongodb.com/) (with Mongoose) | Flexible NoSQL document database for users, product catalog, categories, and orders. |
| **Authentication**| JSON Web Tokens (JWT) & bcrypt | Secure, stateless authentication with salted password encryption. |
| **Payment Testing** | Mock / Sandbox Gateway | Simulated payment processing for risk-free checkout validation. |
| **API Testing** | Postman / Thunder Client | REST endpoint testing and response validation. |

---

## 🚀 MVP Feature Summary (10 Core Features)

The MVP scope is divided into 5 logical sections across **Customer** and **Admin** roles:

1. **Authentication & Accounts:** Customer registration and login `[P0]`
2. **Product Discovery & Catalog:**
   - Product catalogue `[P0]`
   - Product categories `[P1]`
   - Product search `[P1]`
   - Product details page with images `[P0]`
3. **Cart & Checkout Experience:**
   - Shopping cart that persists after refresh `[P0]`
   - Order placement `[P0]`
   - Test-mode payment checkout `[P0]`
4. **Order Tracking:** Order history `[P1]`
5. **Store Administration:** Admin panel to add, edit, and delete products `[P0]`

For full specifications and role permissions, refer to [FEATURES.md](./FEATURES.md).

---

## 🗺️ Project Roadmap & ALTA Challenge Milestones

- ✅ **Day 1: Project Planning & Architecture Scope** *(Complete)*
  - Problem statement, user roles (Customer & Admin), 10 MVP features, and stack selection.
- ✅ **Day 2: Database Schema, API Design & UI Wireframes** *(Complete)*
  - Mongoose models ([SCHEMA.md](./SCHEMA.md)), REST endpoint contracts ([API.md](./API.md)), and UI Wireframes ([WIREFRAMES.md](./docs/WIREFRAMES.md)).
- ✅ **Day 3: Backend Setup & Server Implementation** *(Complete)*
  - Node.js/Express server scaffolding, Mongoose models, error handling, graceful shutdown, and `/health` API endpoint.
- ✅ **Day 4: Secure User Registration API** *(Complete)*
  - Customer & Seller registration (`POST /api/auth/register`), input sanitization, duplicate email protection, salted bcrypt hashing, and admin registration protection.
- ✅ **Day 5: Login API, JWT Authentication & Role-Based Authorization** *(Complete)*
  - Secure login (`POST /api/auth/login`), email normalization, constant-time bcrypt verification, signed JSON Web Tokens (`jwt.sign`), HTTP Bearer middleware verification (`protect`), role guards (`authorize`), approved storefront status checks (`approvedSellerOnly`), and admin access guards (`adminOnly`).
- ⏳ **Day 6+: Product Catalogue & Category Management**
  - Product model, multi-vendor catalogue listing, seller product publishing, and inventory tracking.
- ⏳ **Day 7+: Frontend Architecture & UI Components**
  - React setup, component hierarchy, product grid, details view, and persistent cart.

---

## ⚙️ Backend Setup & Running Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or newer
- **npm**: v9.0.0 or newer
- **MongoDB**: Local MongoDB instance (running on port `27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

### 2. Configure Environment Variables
Copy the example configuration to create your local `.env`:
```bash
cp backend/.env.example backend/.env
```
Default configuration values in `backend/.env`:
- `PORT=5001` *(Defaulted to 5001 to avoid Apple AirPlay receiver conflicts on port 5000)*
- `NODE_ENV=development`
- `MONGO_URI=mongodb://localhost:27017/cartiva` *(or your MongoDB Atlas connection string)*
- `JWT_SECRET=cartiva_super_secret_jwt_key_2026_dev_mode`
- `JWT_EXPIRE=30d`

### 3. Install Dependencies
```bash
cd backend
npm install
```

### 4. Run the Backend Server
- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

### 5. Verify Server Health
Visit `http://localhost:5001/health` in your browser or run:
```bash
curl http://localhost:5001/health
```
Expected response:
```json
{
  "status": "ok",
  "message": "Cartiva Backend Server is running healthy 🚀",
  "uptime": "20s",
  "environment": "development",
  "database": {
    "status": "disconnected",
    "connected": false
  }
}
```

---

## 📖 Related Documents

- [FEATURES.md](./FEATURES.md) — Detailed breakdown of user roles, the 10 MVP features with priorities, and future enhancements.
- [SCHEMA.md](./SCHEMA.md) — Complete database design for Users, Products, Cart, and Orders with Mongoose.
- [API.md](./API.md) — RESTful API endpoint specifications and payload contracts.
- [WIREFRAMES.md](./docs/WIREFRAMES.md) — UI wireframes and responsive layouts for Login/Signup, Catalogue, Details, and Admin Dashboard.
