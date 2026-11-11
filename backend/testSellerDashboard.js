/**
 * Cartiva Day 12: Comprehensive Automated Seller Dashboard & Order Management Test Suite
 * Tests all 20 required seller dashboard, status transitions, isolation, and RBAC scenarios.
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

const runDay12TestSuite = async () => {
  console.log('\n========================================================================');
  console.log('🧪 CARTIVA DAY 12: SELLER DASHBOARD & ORDER MANAGEMENT TEST SUITE');
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

    // 1. Setup clean test accounts with all roles and approval statuses
    const testEmails = [
      'd12_seller_approved_a@example.com',
      'd12_seller_approved_b@example.com',
      'd12_seller_unrelated@example.com',
      'd12_seller_pending@example.com',
      'd12_seller_rejected@example.com',
      'd12_seller_suspended@example.com',
      'd12_customer@example.com',
      'd12_admin@example.com'
    ];
    await User.deleteMany({ email: { $in: testEmails } });

    // Approved Seller A
    const sellerA = await User.create({
      name: 'Elena Rostova',
      email: 'd12_seller_approved_a@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Nordic Oak & Timber Studio',
      sellerApprovalStatus: 'approved'
    });
    const tokenSellerA = jwt.sign({ id: sellerA._id }, JWT_SECRET, { expiresIn: '1d' });

    // Approved Seller B
    const sellerB = await User.create({
      name: 'Kenji Takahashi',
      email: 'd12_seller_approved_b@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Kyoto Washi Paper Atelier',
      sellerApprovalStatus: 'approved'
    });
    const tokenSellerB = jwt.sign({ id: sellerB._id }, JWT_SECRET, { expiresIn: '1d' });

    // Approved Unrelated Seller
    const sellerUnrelated = await User.create({
      name: 'Marco Rossi',
      email: 'd12_seller_unrelated@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Milano Leather Guild',
      sellerApprovalStatus: 'approved'
    });
    const tokenSellerUnrelated = jwt.sign({ id: sellerUnrelated._id }, JWT_SECRET, { expiresIn: '1d' });

    // Pending Seller
    const sellerPending = await User.create({
      name: 'Pending Maker',
      email: 'd12_seller_pending@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Pending Crafts Co',
      sellerApprovalStatus: 'pending'
    });
    const tokenPending = jwt.sign({ id: sellerPending._id }, JWT_SECRET, { expiresIn: '1d' });

    // Rejected Seller
    const sellerRejected = await User.create({
      name: 'Rejected Maker',
      email: 'd12_seller_rejected@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Rejected Goods',
      sellerApprovalStatus: 'rejected'
    });
    const tokenRejected = jwt.sign({ id: sellerRejected._id }, JWT_SECRET, { expiresIn: '1d' });

    // Suspended Seller
    const sellerSuspended = await User.create({
      name: 'Suspended Maker',
      email: 'd12_seller_suspended@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Suspended Studio',
      sellerApprovalStatus: 'suspended'
    });
    const tokenSuspended = jwt.sign({ id: sellerSuspended._id }, JWT_SECRET, { expiresIn: '1d' });

    // Customer
    const customer = await User.create({
      name: 'Priya Patel',
      email: 'd12_customer@example.com',
      password: 'Password123!',
      role: 'customer'
    });
    const tokenCustomer = jwt.sign({ id: customer._id }, JWT_SECRET, { expiresIn: '1d' });

    // Admin
    const admin = await User.create({
      name: 'Marketplace Curator Admin',
      email: 'd12_admin@example.com',
      password: 'Password123!',
      role: 'admin'
    });
    const tokenAdmin = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1d' });

    // 2. Setup clean test products
    await Product.deleteMany({ title: { $regex: /^\[D12\]/ } });

    const prodA = await Product.create({
      title: '[D12] Solid Oak Catchall Tray',
      description: 'Hand-carved solid European oak tray',
      price: 2400,
      category: 'Home & Kitchen',
      stockCount: 15,
      seller: sellerA._id,
      storeName: sellerA.businessName,
      isPublished: true,
      isArchived: false
    });

    const prodB = await Product.create({
      title: '[D12] Handcrafted Washi Journal',
      description: 'Hand-bound mulberry washi paper notebook',
      price: 1600,
      category: 'Other',
      stockCount: 20,
      seller: sellerB._id,
      storeName: sellerB.businessName,
      isPublished: true,
      isArchived: false
    });

    // 3. Create a multi-vendor test order containing items from Seller A and Seller B
    const createOrderRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomer}`
      },
      body: JSON.stringify({
        items: [
          { productId: prodA._id, quantity: 2 }, // 2400 * 2 = 4800 (Seller A)
          { productId: prodB._id, quantity: 1 }  // 1600 * 1 = 1600 (Seller B)
        ],
        shippingAddress: {
          fullName: 'Priya Patel',
          phone: '+919876543210',
          street: '55 Cunningham Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560052'
        },
        paymentMethod: 'cod'
      })
    });
    const orderData = await createOrderRes.json();
    const testOrder = orderData.order;

    console.log('✅ Clean multi-vendor test order created successfully.\n');

    // -------------------------------------------------------------
    // SECTION A: SELLER RBAC & ACCESS AUTHORIZATION
    // -------------------------------------------------------------
    console.log('--- 🛡️ SECTION A: SELLER DASHBOARD RBAC & ACCESS CONTROL ---');

    // Test 1: Approved seller accesses dashboard orders and stats
    const res1 = await fetch(`${API_URL}/orders/seller/my-orders`, {
      headers: { Authorization: `Bearer ${tokenSellerA}` }
    });
    const data1 = await res1.json();
    assert(
      res1.status === 200 &&
      data1.success === true &&
      data1.stats &&
      data1.stats.totalOrders >= 1 &&
      data1.stats.totalSales >= 4800,
      `Test 1: Approved seller accesses dashboard orders and verified stats (HTTP 200, Orders: ${data1.count}, Sales: ₹${data1.stats?.totalSales})`
    );

    // Test 2: Pending seller denied access
    const res2 = await fetch(`${API_URL}/orders/seller/my-orders`, {
      headers: { Authorization: `Bearer ${tokenPending}` }
    });
    assert(res2.status === 403, 'Test 2: Pending seller denied dashboard access (HTTP 403 Forbidden)');

    // Test 3: Rejected seller denied access
    const res3 = await fetch(`${API_URL}/orders/seller/my-orders`, {
      headers: { Authorization: `Bearer ${tokenRejected}` }
    });
    assert(res3.status === 403, 'Test 3: Rejected seller denied dashboard access (HTTP 403 Forbidden)');

    // Test 4: Suspended seller denied access
    const res4 = await fetch(`${API_URL}/orders/seller/my-orders`, {
      headers: { Authorization: `Bearer ${tokenSuspended}` }
    });
    assert(res4.status === 403, 'Test 4: Suspended seller denied dashboard access (HTTP 403 Forbidden)');

    // Test 5: Customer denied access to seller order portal
    const res5 = await fetch(`${API_URL}/orders/seller/my-orders`, {
      headers: { Authorization: `Bearer ${tokenCustomer}` }
    });
    assert(res5.status === 403, 'Test 5: Customer denied seller dashboard access (HTTP 403 Forbidden)');

    // -------------------------------------------------------------
    // SECTION B: MULTI-VENDOR SELLER ORDER ISOLATION
    // -------------------------------------------------------------
    console.log('\n--- 🔒 SECTION B: MULTI-VENDOR SELLER ORDER ISOLATION ---');

    // Test 6: Seller A order list contains ONLY Seller A items (Seller B items redacted)
    const sellerAOrder = data1.orders.find((o) => o.orderReference === testOrder.orderReference);
    const sellerAHasOnlyOwnItems =
      sellerAOrder &&
      sellerAOrder.items.length === 1 &&
      sellerAOrder.items[0].title.includes('Catchall Tray') &&
      sellerAOrder.subtotal === 4800;
    assert(
      sellerAHasOnlyOwnItems,
      'Test 6: Seller A portal strictly isolates Seller A products (Seller B products redacted)'
    );

    // Test 7: Single order detail lookup by participating Seller A returns sanitized view
    const res7 = await fetch(`${API_URL}/orders/${testOrder._id}`, {
      headers: { Authorization: `Bearer ${tokenSellerA}` }
    });
    const data7 = await res7.json();
    assert(
      res7.status === 200 &&
      data7.isSellerView === true &&
      data7.order.items.length === 1 &&
      data7.order.sellerSubtotal === 4800,
      'Test 7: Participating Seller A retrieves sanitized isolated order detail (HTTP 200)'
    );

    // Test 8: Unrelated seller forbidden from viewing order details
    const res8 = await fetch(`${API_URL}/orders/${testOrder._id}`, {
      headers: { Authorization: `Bearer ${tokenSellerUnrelated}` }
    });
    assert(
      res8.status === 403,
      'Test 8: Unrelated seller forbidden from viewing order details (HTTP 403 Forbidden)'
    );

    // Test 9: Seller A forbidden from modifying Seller B sub-order or order where they have no products
    // Let's create an order containing only Seller B's product
    const orderOnlyBRes = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomer}`
      },
      body: JSON.stringify({
        items: [{ productId: prodB._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Priya Patel',
          phone: '+919876543210',
          street: '55 Cunningham Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560052'
        }
      })
    });
    const orderOnlyB = (await orderOnlyBRes.json()).order;

    const res9 = await fetch(`${API_URL}/orders/${orderOnlyB._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerA}`
      },
      body: JSON.stringify({ orderStatus: 'Processing' })
    });
    assert(
      res9.status === 403,
      'Test 9: Seller A forbidden from modifying order containing only Seller B products (HTTP 403)'
    );

    // Test 10: Customer forbidden from updating order status
    const res10 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomer}`
      },
      body: JSON.stringify({ orderStatus: 'Processing' })
    });
    assert(
      res10.status === 403,
      'Test 10: Customer forbidden from updating order status (HTTP 403 Forbidden)'
    );

    // -------------------------------------------------------------
    // SECTION C: SERVER-SIDE STATUS TRANSITIONS
    // -------------------------------------------------------------
    console.log('\n--- 🔄 SECTION C: SERVER-SIDE STATUS TRANSITIONS & STATE MACHINE ---');

    // Test 11: Valid transition: Placed -> Processing
    const res11 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerA}`
      },
      body: JSON.stringify({ orderStatus: 'Processing' })
    });
    const data11 = await res11.json();
    assert(
      res11.status === 200 &&
      data11.success === true &&
      data11.sellerGroup?.status === 'Processing',
      'Test 11: Valid status transition: Placed -> Processing (HTTP 200)'
    );

    // Test 12: Invalid transition: Placed -> Delivered (skipping Shipped from Placed state)
    // Seller B's sub-order is currently Placed; attempt direct transition to Delivered
    const res12 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerB}`
      },
      body: JSON.stringify({ orderStatus: 'Delivered' })
    });
    assert(
      res12.status === 400,
      'Test 12: Invalid transition: Placed -> Delivered directly rejected (HTTP 400)'
    );

    // Test 13: Valid transition: Processing -> Shipped
    const res13 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerA}`
      },
      body: JSON.stringify({ orderStatus: 'Shipped' })
    });
    const data13 = await res13.json();
    assert(
      res13.status === 200 &&
      data13.success === true &&
      data13.sellerGroup?.status === 'Shipped',
      'Test 13: Valid status transition: Processing -> Shipped (HTTP 200)'
    );

    // Test 14: Valid transition: Shipped -> Delivered
    const res14 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerA}`
      },
      body: JSON.stringify({ orderStatus: 'Delivered' })
    });
    const data14 = await res14.json();
    assert(
      res14.status === 200 &&
      data14.success === true &&
      data14.sellerGroup?.status === 'Delivered',
      'Test 14: Valid status transition: Shipped -> Delivered (HTTP 200)'
    );

    // Test 15: Invalid backward transition: Delivered -> Placed rejected
    const res15 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerA}`
      },
      body: JSON.stringify({ orderStatus: 'Placed' })
    });
    assert(
      res15.status === 400,
      'Test 15: Invalid backward transition: Delivered -> Placed rejected (HTTP 400)'
    );

    // Test 16: Invalid backward transition: Delivered -> Processing rejected
    const res16 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerA}`
      },
      body: JSON.stringify({ orderStatus: 'Processing' })
    });
    assert(
      res16.status === 400,
      'Test 16: Invalid backward transition: Delivered -> Processing rejected (HTTP 400)'
    );

    // Test 17: Valid cancellation from Placed: Seller B cancels their sub-order
    const res17 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerB}`
      },
      body: JSON.stringify({ orderStatus: 'Cancelled' })
    });
    const data17 = await res17.json();
    assert(
      res17.status === 200 && data17.sellerGroup?.status === 'Cancelled',
      'Test 17: Valid cancellation: Placed -> Cancelled permitted (HTTP 200)'
    );

    // Test 18: Invalid resurrection: Cancelled -> Shipped rejected
    const res18 = await fetch(`${API_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSellerB}`
      },
      body: JSON.stringify({ orderStatus: 'Shipped' })
    });
    assert(
      res18.status === 400,
      'Test 18: Invalid transition: Cancelled -> Shipped terminal state rejected (HTTP 400)'
    );

    // -------------------------------------------------------------
    // SECTION D: ADMIN OMNISCIENCE & REGRESSION CHECKS
    // -------------------------------------------------------------
    console.log('\n--- 👑 SECTION D: ADMIN VISIBILITY & REGRESSION CHECKS ---');

    // Test 19: Admin can view all orders across marketplace
    const res19 = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const data19 = await res19.json();
    assert(
      res19.status === 200 && data19.orders.length >= 2,
      `Test 19: Admin views complete marketplace order ledger (HTTP 200, count: ${data19.count})`
    );

    // Test 20: Customer order history remains accurate and untouched
    const res20 = await fetch(`${API_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${tokenCustomer}` }
    });
    const data20 = await res20.json();
    const customerOrderView = data20.orders.find((o) => o.orderReference === testOrder.orderReference);
    assert(
      res20.status === 200 &&
      customerOrderView &&
      customerOrderView.orderItems.length === 2,
      'Test 20: Day 11 Customer order history regression check (HTTP 200, full multi-vendor items)'
    );

    console.log('\n========================================================================');
    console.log(`📊 DAY 12 TEST SUITE SUMMARY: ${passed}/${passed + failed} Passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('========================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('💥 Test suite fatal error:', err);
    process.exit(1);
  }
};

runDay12TestSuite();

