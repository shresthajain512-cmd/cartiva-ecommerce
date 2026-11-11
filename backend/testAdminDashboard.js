/**
 * Cartiva Day 13: Comprehensive Automated Admin Dashboard & Full System Integration Test Suite
 * Tests admin metrics, seller application review/lifecycle, user management & suspension,
 * product moderation, platform order oversight, and strict RBAC enforcement.
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const BASE_URL = 'http://localhost:5001';
const API_URL = `${BASE_URL}/api`;
const JWT_SECRET = process.env.JWT_SECRET || 'cartiva_dev_secret_key';

const runDay13TestSuite = async () => {
  console.log('\n========================================================================');
  console.log('🧪 CARTIVA DAY 13: ADMIN DASHBOARD & FULL SYSTEM INTEGRATION TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');

    // 1. Setup clean test entities
    const testEmails = [
      'd13_admin@example.com',
      'd13_customer@example.com',
      'd13_seller_approved@example.com',
      'd13_seller_applicant_1@example.com',
      'd13_seller_applicant_2@example.com'
    ];
    await User.deleteMany({ email: { $in: testEmails } });

    // Admin Account
    const admin = await User.create({
      name: 'Cartiva Overseer',
      email: 'd13_admin@example.com',
      password: 'Password123!',
      role: 'admin'
    });
    const tokenAdmin = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1d' });

    // Standard Customer Account
    const customer = await User.create({
      name: 'Sofia Martinez',
      email: 'd13_customer@example.com',
      password: 'Password123!',
      role: 'customer'
    });
    const tokenCustomer = jwt.sign({ id: customer._id }, JWT_SECRET, { expiresIn: '1d' });

    // Pre-approved Seller
    const sellerApproved = await User.create({
      name: 'Aurelia Vance',
      email: 'd13_seller_approved@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Vance Artisanal Ceramics',
      sellerApprovalStatus: 'approved'
    });
    const tokenSellerApproved = jwt.sign({ id: sellerApproved._id }, JWT_SECRET, { expiresIn: '1d' });

    // Pending Seller Applicants
    const applicant1 = await User.create({
      name: 'Marcus Thorne',
      email: 'd13_seller_applicant_1@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Thorne Leather Goods',
      sellerApprovalStatus: 'pending'
    });
    const tokenApplicant1 = jwt.sign({ id: applicant1._id }, JWT_SECRET, { expiresIn: '1d' });

    const applicant2 = await User.create({
      name: 'Chloe Monet',
      email: 'd13_seller_applicant_2@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Monet Botanical Fragrances',
      sellerApprovalStatus: 'pending'
    });

    // Clean test products
    await Product.deleteMany({ title: { $regex: /^D13 / } });

    const testProduct = await Product.create({
      title: 'D13 Sculpted Stone Vase',
      description: 'Hand-carved limestone vase by Vance Artisanal.',
      price: 4500,
      category: 'Home & Kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      stockCount: 10,
      seller: sellerApproved._id,
      storeName: sellerApproved.businessName,
      isPublished: true,
      isArchived: false
    });

    // -------------------------------------------------------------
    // SECTION A: ADMIN METRICS & RBAC DEFENSE
    // -------------------------------------------------------------
    console.log('\n--- 📊 SECTION A: ADMIN METRICS & RBAC DEFENSE ---');

    // Test 1: Admin successfully fetches aggregated platform metrics
    const res1 = await fetch(`${API_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const data1 = await res1.json();
    assert(
      res1.status === 200 &&
      data1.success &&
      data1.metrics.users.total >= 4 &&
      data1.metrics.sellers.total >= 3 &&
      data1.metrics.sellers.pending >= 2 &&
      data1.metrics.products.total >= 1 &&
      typeof data1.metrics.orders.total === 'number',
      'Test 1: Admin fetches platform metrics with live database aggregates (HTTP 200)'
    );

    // Test 2: Customer denied admin metrics access
    const res2 = await fetch(`${API_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${tokenCustomer}` }
    });
    assert(
      res2.status === 403,
      'Test 2: Customer denied admin metrics access (HTTP 403 Forbidden)'
    );

    // Test 3: Seller denied admin metrics access
    const res3 = await fetch(`${API_URL}/admin/metrics`, {
      headers: { Authorization: `Bearer ${tokenSellerApproved}` }
    });
    assert(
      res3.status === 403,
      'Test 3: Seller denied admin metrics access (HTTP 403 Forbidden)'
    );

    // Test 4: Unauthenticated request denied admin metrics
    const res4 = await fetch(`${API_URL}/admin/metrics`);
    assert(
      res4.status === 401,
      'Test 4: Unauthenticated request denied admin metrics (HTTP 401 Unauthorized)'
    );

    // -------------------------------------------------------------
    // SECTION B: SELLER APPLICATION LIFECYCLE MANAGEMENT
    // -------------------------------------------------------------
    console.log('\n--- 🏛️ SECTION B: SELLER APPLICATION LIFECYCLE MANAGEMENT ---');

    // Test 5: Admin lists pending seller applications
    const res5 = await fetch(`${API_URL}/admin/sellers?status=pending`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const data5 = await res5.json();
    const hasApplicant1 = data5.sellers?.some((s) => s.email === applicant1.email);
    assert(
      res5.status === 200 && data5.success && hasApplicant1,
      'Test 5: Admin lists pending seller applications with status filter (HTTP 200)'
    );

    // Test 6: Admin approves pending seller
    const res6 = await fetch(`${API_URL}/admin/sellers/${applicant1._id}/approval`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    const data6 = await res6.json();
    assert(
      res6.status === 200 &&
      data6.seller.sellerApprovalStatus === 'approved',
      'Test 6: Admin approves pending seller applicant (HTTP 200, status: approved)'
    );

    // Test 7: Newly approved seller can now publish products
    const res7 = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenApplicant1}`
      },
      body: JSON.stringify({
        title: 'D13 Handcrafted Leather Journal',
        description: 'Full-grain Horween leather notebook.',
        price: 2400,
        category: 'Books',
        stockCount: 15,
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
      })
    });
    const data7 = await res7.json();
    assert(
      res7.status === 201 && data7.success && data7.product.seller.toString() === applicant1._id.toString(),
      'Test 7: Newly approved seller can create products immediately (HTTP 201)'
    );

    // Test 8: Admin rejects seller applicant 2
    const res8 = await fetch(`${API_URL}/admin/sellers/${applicant2._id}/approval`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ status: 'rejected' })
    });
    const data8 = await res8.json();
    assert(
      res8.status === 200 && data8.seller.sellerApprovalStatus === 'rejected',
      'Test 8: Admin rejects seller application (HTTP 200, status: rejected)'
    );

    // Test 9: Admin suspends an approved seller
    const res9 = await fetch(`${API_URL}/admin/sellers/${applicant1._id}/approval`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ status: 'suspended' })
    });
    const data9 = await res9.json();
    assert(
      res9.status === 200 && data9.seller.sellerApprovalStatus === 'suspended',
      'Test 9: Admin suspends approved seller (HTTP 200, status: suspended)'
    );

    // Test 10: Suspended seller is immediately blocked from product publishing
    const res10 = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenApplicant1}`
      },
      body: JSON.stringify({
        title: 'D13 Forbidden Leather Belt',
        description: 'Should be rejected because seller is suspended.',
        price: 1800,
        category: 'Fashion',
        stockCount: 5,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'
      })
    });
    assert(
      res10.status === 403,
      'Test 10: Suspended seller is blocked from publishing products (HTTP 403 Forbidden)'
    );

    // Test 11: Admin reactivates suspended seller
    const res11 = await fetch(`${API_URL}/admin/sellers/${applicant1._id}/approval`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    assert(
      res11.status === 200,
      'Test 11: Admin reactivates suspended seller to approved (HTTP 200)'
    );

    // -------------------------------------------------------------
    // SECTION C: USER DIRECTORY & ACCOUNT SUSPENSION
    // -------------------------------------------------------------
    console.log('\n--- 👥 SECTION C: USER DIRECTORY & ACCOUNT SUSPENSION ---');

    // Test 12: Admin searches user directory with search query
    const res12 = await fetch(`${API_URL}/admin/users?q=Sofia&role=customer`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const data12 = await res12.json();
    assert(
      res12.status === 200 &&
      data12.users?.length >= 1 &&
      data12.users[0].email === customer.email,
      'Test 12: Admin searches user directory with query and role filter (HTTP 200)'
    );

    // Test 13: User directory excludes sensitive password hashes
    const passwordLeaked = data12.users?.some((u) => u.password !== undefined);
    assert(
      !passwordLeaked,
      'Test 13: Password hashes are strictly excluded from user list results'
    );

    // Test 14: Admin suspends a customer account
    const res14 = await fetch(`${API_URL}/admin/users/${customer._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ accountStatus: 'suspended' })
    });
    const data14 = await res14.json();
    assert(
      res14.status === 200 && data14.user.accountStatus === 'suspended',
      'Test 14: Admin suspends customer account standing (HTTP 200, accountStatus: suspended)'
    );

    // Test 15: Suspended customer denied access to protected endpoints
    const res15 = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenCustomer}` }
    });
    const data15 = await res15.json();
    assert(
      res15.status === 403 && data15.message.includes('suspended'),
      'Test 15: Suspended customer denied access to protected API routes (HTTP 403)'
    );

    // Test 16: Admin cannot suspend their own administrative account
    const res16 = await fetch(`${API_URL}/admin/users/${admin._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ accountStatus: 'suspended' })
    });
    const data16 = await res16.json();
    assert(
      res16.status === 400 && data16.message.includes('cannot suspend their own account'),
      'Test 16: Self-Protection Guard: Admin cannot suspend their own account (HTTP 400)'
    );

    // Test 17: Admin reactivates customer account
    const res17 = await fetch(`${API_URL}/admin/users/${customer._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ accountStatus: 'active' })
    });
    const res17Profile = await fetch(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${tokenCustomer}` }
    });
    assert(
      res17.status === 200 && res17Profile.status === 200,
      'Test 17: Admin reactivates user account and user access is immediately restored (HTTP 200)'
    );

    // -------------------------------------------------------------
    // SECTION D: PRODUCT MODERATION & PLATFORM ORDERS
    // -------------------------------------------------------------
    console.log('\n--- 📦 SECTION D: PRODUCT MODERATION & PLATFORM ORDERS ---');

    // Test 18: Admin fetches marketplace products including archived ones
    const res18 = await fetch(`${API_URL}/admin/products?keyword=D13`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const data18 = await res18.json();
    assert(
      res18.status === 200 && data18.products?.length >= 1,
      'Test 18: Admin views marketplace products across all sellers (HTTP 200)'
    );

    // Test 19: Admin archives an active product
    const res19 = await fetch(`${API_URL}/admin/products/${testProduct._id}/moderate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ isArchived: true })
    });
    const data19 = await res19.json();
    const res19Public = await fetch(`${API_URL}/products?keyword=D13%20Sculpted`);
    const data19Public = await res19Public.json();
    assert(
      res19.status === 200 &&
      data19.product.isArchived === true &&
      data19Public.products.length === 0,
      'Test 19: Admin archives product and it is hidden from public catalogue (HTTP 200)'
    );

    // Test 20: Admin unarchives / restores product
    const res20 = await fetch(`${API_URL}/admin/products/${testProduct._id}/moderate`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ isArchived: false, isPublished: true, isFeatured: true })
    });
    const data20 = await res20.json();
    const res20Public = await fetch(`${API_URL}/products?keyword=D13%20Sculpted`);
    const data20Public = await res20Public.json();
    assert(
      res20.status === 200 &&
      data20.product.isArchived === false &&
      data20.product.isFeatured === true &&
      data20Public.products.length >= 1,
      'Test 20: Admin restores product and marks featured; visible in public catalogue (HTTP 200)'
    );

    // Test 21: Admin views all platform orders
    const res21 = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const data21 = await res21.json();
    assert(
      res21.status === 200 && data21.success && Array.isArray(data21.orders),
      'Test 21: Admin accesses comprehensive platform orders ledger (HTTP 200)'
    );

    // Test 22: Non-admin customer forbidden from platform orders ledger
    const res22 = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${tokenCustomer}` }
    });
    assert(
      res22.status === 403,
      'Test 22: Customer forbidden from platform-wide orders ledger (HTTP 403 Forbidden)'
    );

    console.log('\n========================================================================');
    console.log(`📊 DAY 13 TEST SUITE SUMMARY: ${passed}/${passed + failed} Passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('========================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('💥 Test suite fatal error:', err);
    process.exit(1);
  }
};

runDay13TestSuite();

