/**
 * Cartiva Day 11: Comprehensive Automated Checkout & Multi-Vendor Order Management Test Suite
 * Tests all 20 required backend checkout, multi-vendor isolation, inventory, and authorization scenarios.
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

const runDay11TestSuite = async () => {
  console.log('\n========================================================================');
  console.log('🧪 CARTIVA DAY 11: CHECKOUT & MULTI-VENDOR ORDER TEST SUITE');
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
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');

    // 1. Setup clean test accounts
    const testEmails = [
      'd11_customer_a@example.com',
      'd11_customer_b@example.com',
      'd11_seller_alpha@example.com',
      'd11_seller_beta@example.com',
      'd11_seller_gamma@example.com',
      'd11_admin@example.com'
    ];
    await User.deleteMany({ email: { $in: testEmails } });

    // Customer A
    const customerA = await User.create({
      name: 'Aditi Rao',
      email: 'd11_customer_a@example.com',
      password: 'Password123!',
      role: 'customer'
    });
    const tokenCustomerA = jwt.sign({ id: customerA._id }, JWT_SECRET, { expiresIn: '1d' });

    // Customer B (for IDOR attack testing)
    const customerB = await User.create({
      name: 'Rohan Sharma',
      email: 'd11_customer_b@example.com',
      password: 'Password123!',
      role: 'customer'
    });
    const tokenCustomerB = jwt.sign({ id: customerB._id }, JWT_SECRET, { expiresIn: '1d' });

    // Seller Alpha (Approved)
    const sellerAlpha = await User.create({
      name: 'Kanso Studio Master',
      email: 'd11_seller_alpha@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Kanso Acoustic Atelier',
      sellerApprovalStatus: 'approved'
    });
    const tokenSellerAlpha = jwt.sign({ id: sellerAlpha._id }, JWT_SECRET, { expiresIn: '1d' });

    // Seller Beta (Approved)
    const sellerBeta = await User.create({
      name: 'Terra Stoneware Master',
      email: 'd11_seller_beta@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Terra Ceramics Studio',
      sellerApprovalStatus: 'approved'
    });
    const tokenSellerBeta = jwt.sign({ id: sellerBeta._id }, JWT_SECRET, { expiresIn: '1d' });

    // Seller Gamma (Approved, but unrelated to order)
    const sellerGamma = await User.create({
      name: 'Sonder Books Master',
      email: 'd11_seller_gamma@example.com',
      password: 'Password123!',
      role: 'seller',
      businessName: 'Sonder Press',
      sellerApprovalStatus: 'approved'
    });
    const tokenSellerGamma = jwt.sign({ id: sellerGamma._id }, JWT_SECRET, { expiresIn: '1d' });

    // Admin
    const adminUser = await User.create({
      name: 'Curator Admin',
      email: 'd11_admin@example.com',
      password: 'Password123!',
      role: 'admin'
    });
    const tokenAdmin = jwt.sign({ id: adminUser._id }, JWT_SECRET, { expiresIn: '1d' });

    // 2. Setup clean test products
    await Product.deleteMany({ title: { $regex: /^\[D11\]/ } });

    const prodAlpha = await Product.create({
      title: '[D11] Bio-Cellulose Headphones',
      description: 'Handcrafted master acoustic headphones',
      price: 3499,
      category: 'Electronics',
      stockCount: 10,
      seller: sellerAlpha._id,
      storeName: sellerAlpha.businessName,
      isPublished: true,
      isArchived: false
    });

    const prodBeta = await Product.create({
      title: '[D11] Stoneware Espresso Carafe',
      description: 'Hand-thrown speckled stoneware ceramic carafe',
      price: 1850,
      category: 'Home & Kitchen',
      stockCount: 5,
      seller: sellerBeta._id,
      storeName: sellerBeta.businessName,
      isPublished: true,
      isArchived: false
    });

    const prodLowStock = await Product.create({
      title: '[D11] Limited Edition Brass Ruler',
      description: 'Solid brass millimetre ruler',
      price: 890,
      category: 'Other',
      stockCount: 1,
      seller: sellerAlpha._id,
      storeName: sellerAlpha.businessName,
      isPublished: true,
      isArchived: false
    });

    const prodArchived = await Product.create({
      title: '[D11] Archived Wool Scarf',
      description: 'Archived product not for sale',
      price: 2200,
      category: 'Fashion',
      stockCount: 10,
      seller: sellerBeta._id,
      storeName: sellerBeta.businessName,
      isPublished: true,
      isArchived: true
    });

    const prodUnpublished = await Product.create({
      title: '[D11] Draft Leather Bag',
      description: 'Unpublished prototype piece',
      price: 5400,
      category: 'Fashion',
      stockCount: 8,
      seller: sellerAlpha._id,
      storeName: sellerAlpha.businessName,
      isPublished: false,
      isArchived: false
    });

    console.log('✅ Clean test users and products initialized.\n');

    // -------------------------------------------------------------
    // SECTION A: INPUT & ADDRESS VALIDATIONS
    // -------------------------------------------------------------
    console.log('--- 🛡️ SECTION A: INPUT & ADDRESS VALIDATION ---');

    // Test 1: Empty items bag rejected
    const res1 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [],
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    assert(res1.status === 400, 'Test 1: Empty cart/items array rejected (HTTP 400)');

    // Test 2: Missing shipping address rejected
    const res2 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [{ productId: prodAlpha._id, quantity: 1 }]
      })
    });
    assert(res2.status === 400, 'Test 2: Missing shipping address rejected (HTTP 400)');

    // Test 3: Incomplete address fields rejected
    const res3 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [{ productId: prodAlpha._id, quantity: 1 }],
        shippingAddress: {
          fullName: '',
          phone: '123', // too short
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    assert(res3.status === 400, 'Test 3: Incomplete address or invalid phone rejected (HTTP 400)');

    // Test 4: Invalid product ID format rejected
    const res4 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [{ productId: 'invalid-hex-id', quantity: 1 }],
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    assert(res4.status === 400, 'Test 4: Malformed product ObjectId rejected (HTTP 400)');

    // Test 5: Non-existent product ID rejected with 404
    const fakeId = new mongoose.Types.ObjectId();
    const res5 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [{ productId: fakeId, quantity: 1 }],
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    assert(res5.status === 404, 'Test 5: Non-existent product ID returns HTTP 404');

    // -------------------------------------------------------------
    // SECTION B: INVENTORY & CATALOGUE AVAILABILITY RULES
    // -------------------------------------------------------------
    console.log('\n--- 📦 SECTION B: INVENTORY & CATALOGUE AVAILABILITY ---');

    // Test 6: Archived product rejected
    const res6 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [{ productId: prodArchived._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    assert(res6.status === 400, 'Test 6: Purchasing archived product rejected (HTTP 400)');

    // Test 7: Unpublished product rejected
    const res7 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [{ productId: prodUnpublished._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    assert(res7.status === 400, 'Test 7: Purchasing unpublished product rejected (HTTP 400)');

    // Test 8: Insufficient stock rejected
    const res8 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [{ productId: prodLowStock._id, quantity: 5 }], // only 1 in stock
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    assert(res8.status === 400, 'Test 8: Requesting quantity > available stock rejected (HTTP 400)');

    // -------------------------------------------------------------
    // SECTION C: MULTI-VENDOR ORDER CREATION & PRICE INTEGRITY
    // -------------------------------------------------------------
    console.log('\n--- 🛒 SECTION C: MULTI-VENDOR ORDER & PRICE INTEGRITY ---');

    // Test 9: Client price tampering strictly ignored
    // prodAlpha actual price is 3499; client attempts to pass price: 1 and totalAmount: 1
    const res9 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [
          { productId: prodAlpha._id, quantity: 1, price: 1 } // Tampered price
        ],
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        },
        totalAmount: 1 // Tampered total
      })
    });
    const data9 = await res9.json();
    assert(
      res9.status === 201 && data9.order.itemsSubtotal === 3499 && data9.order.totalAmount === 3499,
      'Test 9: Server-side price recalculation overrides client tampering (HTTP 201, Total: 3499)'
    );

    // Test 10: Multi-vendor order containing products from Seller Alpha & Seller Beta
    const stockAlphaBefore = (await Product.findById(prodAlpha._id)).stockCount;
    const stockBetaBefore = (await Product.findById(prodBeta._id)).stockCount;

    const res10 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [
          { productId: prodAlpha._id, quantity: 2 }, // 3499 * 2 = 6998 (Seller Alpha)
          { productId: prodBeta._id, quantity: 1 }   // 1850 * 1 = 1850 (Seller Beta)
        ],
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        },
        paymentMethod: 'cod'
      })
    });
    const data10 = await res10.json();
    const orderCreated = data10.order;

    assert(
      res10.status === 201 &&
      orderCreated.sellerGroups.length === 2 &&
      orderCreated.orderReference.startsWith('CTV-'),
      'Test 10: Multi-vendor checkout creates 1 parent reference & 2 distinct seller groups'
    );

    // Test 11: Seller groups have unique subOrderReferences and accurate subtotals
    const groupAlpha = orderCreated.sellerGroups.find(
      (g) => g.seller.toString() === sellerAlpha._id.toString()
    );
    const groupBeta = orderCreated.sellerGroups.find(
      (g) => g.seller.toString() === sellerBeta._id.toString()
    );

    assert(
      groupAlpha && groupAlpha.subtotal === 6998 && groupAlpha.subOrderReference.includes('-S') &&
      groupBeta && groupBeta.subtotal === 1850 && groupBeta.subOrderReference.includes('-S'),
      'Test 11: Each seller group has correct subtotal, items allocation, and subOrderReference'
    );

    // Test 12: Atomic stock decrement applied accurately for all purchased items
    const stockAlphaAfter = (await Product.findById(prodAlpha._id)).stockCount;
    const stockBetaAfter = (await Product.findById(prodBeta._id)).stockCount;

    assert(
      stockAlphaAfter === stockAlphaBefore - 2 && stockBetaAfter === stockBetaBefore - 1,
      `Test 12: Atomic inventory decrement verified (Alpha: ${stockAlphaBefore}->${stockAlphaAfter}, Beta: ${stockBetaBefore}->${stockBetaAfter})`
    );

    // -------------------------------------------------------------
    // SECTION D: CUSTOMER ORDER HISTORY & LOOKUP
    // -------------------------------------------------------------
    console.log('\n--- 👤 SECTION D: CUSTOMER ORDER HISTORY & LOOKUP ---');

    // Test 13: Customer fetches their orders
    const res13 = await fetch(`${API_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${tokenCustomerA}` }
    });
    const data13 = await res13.json();
    assert(
      res13.status === 200 && data13.orders.length >= 2,
      `Test 13: Customer fetches order history (HTTP 200, count: ${data13.count})`
    );

    // Test 14: Customer retrieves order by Mongo ID
    const res14 = await fetch(`${API_URL}/orders/${orderCreated._id}`, {
      headers: { Authorization: `Bearer ${tokenCustomerA}` }
    });
    const data14 = await res14.json();
    assert(
      res14.status === 200 && data14.order.orderReference === orderCreated.orderReference,
      'Test 14: Customer fetches order details by MongoDB ObjectId (HTTP 200)'
    );

    // Test 15: Customer retrieves order by orderReference
    const res15 = await fetch(`${API_URL}/orders/${orderCreated.orderReference}`, {
      headers: { Authorization: `Bearer ${tokenCustomerA}` }
    });
    const data15 = await res15.json();
    assert(
      res15.status === 200 && data15.order._id === orderCreated._id,
      'Test 15: Order can be queried by public orderReference ID (HTTP 200)'
    );

    // Test 16: BOLA / IDOR Protection - Customer B forbidden from viewing Customer A order
    const res16 = await fetch(`${API_URL}/orders/${orderCreated._id}`, {
      headers: { Authorization: `Bearer ${tokenCustomerB}` }
    });
    assert(
      res16.status === 403,
      'Test 16: BOLA/IDOR Blocked - Customer B forbidden from viewing Customer A order (HTTP 403)'
    );

    // -------------------------------------------------------------
    // SECTION E: MULTI-VENDOR SELLER ISOLATION
    // -------------------------------------------------------------
    console.log('\n--- 🔒 SECTION E: MULTI-VENDOR SELLER ISOLATION ---');

    // Test 17: Seller Alpha views their incoming orders via /api/orders/seller/my-orders
    const res17 = await fetch(`${API_URL}/orders/seller/my-orders`, {
      headers: { Authorization: `Bearer ${tokenSellerAlpha}` }
    });
    const data17 = await res17.json();
    const alphaOrderView = data17.orders.find((o) => o.orderReference === orderCreated.orderReference);

    assert(
      res17.status === 200 &&
      alphaOrderView &&
      alphaOrderView.items.length === 1 && // Only prodAlpha!
      alphaOrderView.subtotal === 6998,
      'Test 17: Seller Alpha portal isolates Seller Alpha products only (Seller Beta items redacted)'
    );

    // Test 18: Seller Alpha accesses order directly by ID; receives sanitized view
    const res18 = await fetch(`${API_URL}/orders/${orderCreated._id}`, {
      headers: { Authorization: `Bearer ${tokenSellerAlpha}` }
    });
    const data18 = await res18.json();
    assert(
      res18.status === 200 &&
      data18.isSellerView === true &&
      data18.order.items.length === 1 &&
      data18.order.items[0].title.includes('Bio-Cellulose') &&
      data18.order.sellerSubtotal === 6998,
      'Test 18: Participating Seller A receives strictly isolated order view (HTTP 200, isSellerView: true)'
    );

    // Test 19: Unrelated Seller Gamma forbidden from accessing order
    const res19 = await fetch(`${API_URL}/orders/${orderCreated._id}`, {
      headers: { Authorization: `Bearer ${tokenSellerGamma}` }
    });
    assert(
      res19.status === 403,
      'Test 19: Unrelated Seller Gamma forbidden from viewing order (HTTP 403 Forbidden)'
    );

    // -------------------------------------------------------------
    // SECTION F: ADMIN OMNISCIENCE & STATUS MANAGEMENT
    // -------------------------------------------------------------
    console.log('\n--- 👑 SECTION F: ADMIN & ORDER STATUS MANAGEMENT ---');

    // Test 20: Admin views full order and all platform orders
    const res20a = await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const data20a = await res20a.json();

    const res20b = await fetch(`${API_URL}/orders/${orderCreated._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ orderStatus: 'Processing' })
    });
    const data20b = await res20b.json();

    assert(
      res20a.status === 200 &&
      data20a.count >= 2 &&
      res20b.status === 200 &&
      data20b.order.orderStatus === 'Processing',
      'Test 20: Admin can view all marketplace orders and update status (HTTP 200)'
    );

    // -------------------------------------------------------------
    // SECTION G: UNAUTHORIZED & DUPLICATE SUBMISSION DEFENSE
    // -------------------------------------------------------------
    console.log('\n--- 🛑 SECTION G: UNAUTHORIZED & DUPLICATE DEFENSE ---');

    // Test 21: Unauthorized order creation without Bearer token rejected
    const res21 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ productId: prodAlpha._id, quantity: 1 }],
        shippingAddress: {
          fullName: 'Unauthenticated User',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        }
      })
    });
    assert(
      res21.status === 401,
      'Test 21: Unauthorized order creation rejected without token (HTTP 401)'
    );

    // Test 22: Duplicate order submission prevention (same user, identical items within 15s)
    const stockAlphaBeforeDup = (await Product.findById(prodAlpha._id)).stockCount;
    const res22 = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenCustomerA}`
      },
      body: JSON.stringify({
        items: [
          { productId: prodAlpha._id, quantity: 2 },
          { productId: prodBeta._id, quantity: 1 }
        ],
        shippingAddress: {
          fullName: 'Aditi Rao',
          phone: '+919876543210',
          street: '12 Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038'
        },
        paymentMethod: 'cod'
      })
    });
    const data22 = await res22.json();
    const stockAlphaAfterDup = (await Product.findById(prodAlpha._id)).stockCount;

    assert(
      res22.status === 409 &&
      data22.success === false &&
      stockAlphaAfterDup === stockAlphaBeforeDup,
      'Test 22: Duplicate order submission prevented with HTTP 409 & zero stock re-decrement'
    );

    // Final summary
    console.log('\n========================================================================');
    console.log(`📊 DAY 11 TEST SUITE SUMMARY: ${passed}/${passed + failed} Passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('========================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('💥 Test suite fatal error:', err);
    process.exit(1);
  }
};

runDay11TestSuite();
