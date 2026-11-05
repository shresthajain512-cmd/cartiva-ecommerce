/**
 * Cartiva Day 6: Comprehensive Automated Product Model & Multi-Vendor Catalogue Test Suite
 * Validates:
 * 1. Seller identity derivation on backend (never trusting body/URL)
 * 2. Public catalogue displays ONLY published products from APPROVED sellers
 * 3. Strict price and non-negative integer stock validation
 * 4. Soft deletion / archive preservation for order integrity
 * 5. Parameter validation and whitelisting (category, sort, search regex, pagination)
 * 6. Seller isolation and Object-Level Authorization (BOLA/IDOR prevention)
 * 7. Admin moderation capabilities
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');
const Product = require('./models/Product');

const BASE_URL = 'http://localhost:5001';
const PRODUCTS_URL = `${BASE_URL}/api/products`;
const JWT_SECRET = process.env.JWT_SECRET || 'cartiva_dev_secret_key';

const runDay6TestSuite = async () => {
  console.log('\n========================================================================');
  console.log('🧪 CARTIVA DAY 6: MULTI-VENDOR PRODUCT & CATALOGUE TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   Details: ${details}`);
      failed++;
    }
  };

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');

    // 2. Setup Clean Test Accounts
    const testUserEmails = [
      'd6_customer@example.com',
      'd6_seller_a@example.com',
      'd6_seller_b@example.com',
      'd6_pending_seller@example.com',
      'd6_suspended_seller@example.com',
      'd6_admin@example.com'
    ];

    await User.deleteMany({ email: { $in: testUserEmails } });

    const customerUser = await User.create({
      name: 'Day6 Customer',
      email: 'd6_customer@example.com',
      password: 'ValidPassword123',
      role: 'customer'
    });

    const sellerAUser = await User.create({
      name: 'Day6 Seller Alice',
      email: 'd6_seller_a@example.com',
      password: 'ValidPassword123',
      role: 'seller',
      businessName: 'Alice Apex Gadgets',
      sellerApprovalStatus: 'approved'
    });

    const sellerBUser = await User.create({
      name: 'Day6 Seller Bob',
      email: 'd6_seller_b@example.com',
      password: 'ValidPassword123',
      role: 'seller',
      businessName: 'Bob Boutique Books',
      sellerApprovalStatus: 'approved'
    });

    const pendingSellerUser = await User.create({
      name: 'Day6 Pending Paul',
      email: 'd6_pending_seller@example.com',
      password: 'ValidPassword123',
      role: 'seller',
      businessName: 'Paul Pending Electronics',
      sellerApprovalStatus: 'pending'
    });

    const suspendedSellerUser = await User.create({
      name: 'Day6 Suspended Sam',
      email: 'd6_suspended_seller@example.com',
      password: 'ValidPassword123',
      role: 'seller',
      businessName: 'Sam Shady Emporium',
      sellerApprovalStatus: 'suspended'
    });

    const adminUser = await User.create({
      name: 'Day6 Administrator',
      email: 'd6_admin@example.com',
      password: 'ValidPassword123',
      role: 'admin'
    });

    // Helper to generate JWT
    const tokenFor = (user) => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    const customerToken = tokenFor(customerUser);
    const sellerAToken = tokenFor(sellerAUser);
    const sellerBToken = tokenFor(sellerBUser);
    const pendingSellerToken = tokenFor(pendingSellerUser);
    const suspendedSellerToken = tokenFor(suspendedSellerUser);
    const adminToken = tokenFor(adminUser);

    // Clean prior test products
    await Product.deleteMany({
      seller: {
        $in: [
          customerUser._id,
          sellerAUser._id,
          sellerBUser._id,
          pendingSellerUser._id,
          suspendedSellerUser._id,
          adminUser._id
        ]
      }
    });

    console.log('✅ Clean multi-vendor test users and products initialized.\n');

    // -----------------------------------------------------------------------------------
    // SECTION A: PRODUCT CREATION & SELLER AUTHORIZATION
    // -----------------------------------------------------------------------------------
    console.log('--- 🛡️ SECTION A: PRODUCT CREATION & SELLER AUTHORIZATION ---');

    // Test 1: Customer attempting to create product (HTTP 403 Forbidden)
    const res1 = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`
      },
      body: JSON.stringify({
        title: 'Customer Unauthorized Product',
        description: 'Should be rejected',
        price: 999,
        category: 'Electronics',
        stockCount: 10
      })
    });
    const data1 = await res1.json();
    assert(
      res1.status === 403 && data1.success === false,
      'Test 1: Customer attempting to publish product rejected (HTTP 403 Forbidden)'
    );

    // Test 2: Pending Seller attempting to create product (HTTP 403 Forbidden)
    const res2 = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pendingSellerToken}`
      },
      body: JSON.stringify({
        title: 'Pending Seller Product',
        description: 'Should be rejected because seller is pending',
        price: 499,
        category: 'Electronics',
        stockCount: 5
      })
    });
    const data2 = await res2.json();
    assert(
      res2.status === 403 && data2.message.includes('pending approval'),
      'Test 2: Pending seller cannot publish products (HTTP 403 Forbidden)'
    );

    // Test 3: Suspended Seller attempting to create product (HTTP 403 Forbidden)
    const res3 = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${suspendedSellerToken}`
      },
      body: JSON.stringify({
        title: 'Suspended Seller Product',
        description: 'Should be rejected',
        price: 199,
        category: 'Books',
        stockCount: 2
      })
    });
    const data3 = await res3.json();
    assert(
      res3.status === 403 && data3.message.includes('suspended'),
      'Test 3: Suspended seller cannot publish products (HTTP 403 Forbidden)'
    );

    // Test 4: Approved Seller successfully creates product (HTTP 201 Created)
    const res4 = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        title: 'Wireless Ergonomic Mechanical Keyboard',
        description: 'High-grade PBT keycaps with Bluetooth 5.3 and 2.4GHz dongle.',
        price: 4599,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
        stockCount: 25
      })
    });
    const data4 = await res4.json();
    const productA1 = data4.product;
    assert(
      res4.status === 201 &&
        data4.success === true &&
        productA1.seller.toString() === sellerAUser._id.toString() &&
        productA1.storeName === 'Alice Apex Gadgets',
      'Test 4: Approved seller successfully creates product with bound storeName (HTTP 201)'
    );

    // Test 5: Backend derives seller identity, never trusting fake seller in body
    const res5 = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        title: 'Noise Canceling ANC Headphones',
        description: 'Immersive sound with 40-hour battery life.',
        price: 3499,
        category: 'Electronics',
        stockCount: 15,
        seller: sellerBUser._id.toString(), // FAKE SELLER SPOOF ATTEMPT
        createdBy: sellerBUser._id.toString()
      })
    });
    const data5 = await res5.json();
    const productA2 = data5.product;
    assert(
      res5.status === 201 &&
        productA2.seller.toString() === sellerAUser._id.toString() &&
        productA2.seller.toString() !== sellerBUser._id.toString(),
      'Test 5: Backend overrides spoofed seller body and derives seller from token (HTTP 201)'
    );

    // -----------------------------------------------------------------------------------
    // SECTION B: PRICE & INVENTORY VALIDATIONS
    // -----------------------------------------------------------------------------------
    console.log('\n--- 📐 SECTION B: PRICE & INVENTORY VALIDATIONS ---');

    // Test 6: Missing title or description rejected (HTTP 400)
    const res6 = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        title: '',
        description: 'Missing title test',
        price: 299,
        stockCount: 10
      })
    });
    assert(res6.status === 400, 'Test 6: Missing or blank title rejected (HTTP 400)');

    // Test 7: Negative or non-number price rejected (HTTP 400)
    const res7a = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        title: 'Negative Price Product',
        description: 'Valid description',
        price: -50,
        stockCount: 10
      })
    });
    const res7b = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        title: 'String Price Product',
        description: 'Valid description',
        price: 'cheap',
        stockCount: 10
      })
    });
    assert(
      res7a.status === 400 && res7b.status === 400,
      'Test 7: Negative price and string price rejected (HTTP 400)'
    );

    // Test 8: Non-integer or negative stockCount rejected (HTTP 400)
    const res8a = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        title: 'Float Stock Product',
        description: 'Valid description',
        price: 299,
        stockCount: 3.7
      })
    });
    const res8b = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        title: 'Negative Stock Product',
        description: 'Valid description',
        price: 299,
        stockCount: -5
      })
    });
    assert(
      res8a.status === 400 && res8b.status === 400,
      'Test 8: Fractional float and negative stockCount rejected (HTTP 400)'
    );

    // Test 9: Invalid category rejected (HTTP 400)
    const res9 = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        title: 'Invalid Category Product',
        description: 'Valid description',
        price: 299,
        category: 'WeaponsAndTanks',
        stockCount: 10
      })
    });
    assert(res9.status === 400, 'Test 9: Non-whitelisted category rejected (HTTP 400)');

    // -----------------------------------------------------------------------------------
    // SECTION C: MULTI-VENDOR CATALOGUE & APPROVED SELLER ISOLATION
    // -----------------------------------------------------------------------------------
    console.log('\n--- 🌐 SECTION C: PUBLIC CATALOGUE & APPROVED SELLER ENFORCEMENT ---');

    // Create a product for Seller B
    const resSellerB = await fetch(PRODUCTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerBToken}`
      },
      body: JSON.stringify({
        title: 'The Clean Code Craftsmanship Manual',
        description: 'Essential software engineering handbook on agile practices.',
        price: 899,
        category: 'Books',
        stockCount: 50
      })
    });
    const productB1 = (await resSellerB.json()).product;

    // Directly seed a rogue product belonging to the suspended seller in DB to test catalogue filtering
    const rogueProduct = await Product.create({
      title: 'Suspended Seller Rogue Product',
      description: 'Must never appear in public catalogue',
      price: 99,
      category: 'Other',
      stockCount: 10,
      seller: suspendedSellerUser._id,
      createdBy: suspendedSellerUser._id,
      storeName: 'Sam Shady Emporium',
      isPublished: true,
      isArchived: false
    });

    // Test 10: Public Catalogue includes published products from approved sellers
    const res10 = await fetch(PRODUCTS_URL);
    const data10 = await res10.json();
    const productTitles = data10.products.map((p) => p.title);
    assert(
      res10.status === 200 &&
        productTitles.includes('Wireless Ergonomic Mechanical Keyboard') &&
        productTitles.includes('The Clean Code Craftsmanship Manual'),
      'Test 10: Public catalogue displays products from multiple approved sellers (HTTP 200)'
    );

    // Test 11: Public Catalogue excludes products from unapproved/suspended sellers
    assert(
      !productTitles.includes('Suspended Seller Rogue Product'),
      'Test 11: Products from suspended sellers are strictly filtered out of public catalogue'
    );

    // Test 12: Public Single Product GET /:id returns approved seller product
    const res12 = await fetch(`${PRODUCTS_URL}/${productA1._id}`);
    const data12 = await res12.json();
    assert(
      res12.status === 200 && data12.product.title === productA1.title,
      'Test 12: Single product detail endpoint accessible for approved seller product (HTTP 200)'
    );

    // Test 13: Single Product GET /:id rejects unapproved seller product (HTTP 404)
    const res13 = await fetch(`${PRODUCTS_URL}/${rogueProduct._id}`);
    assert(
      res13.status === 404,
      'Test 13: Single product detail returns 404 for unapproved/suspended seller product'
    );

    // -----------------------------------------------------------------------------------
    // SECTION D: DISCOVERY, SEARCH, WHITELISTED FILTERS & STOREFRONTS
    // -----------------------------------------------------------------------------------
    console.log('\n--- 🔍 SECTION D: DISCOVERY, SEARCH, WHITELISTING & STOREFRONTS ---');

    // Test 14: Categories endpoint
    const res14 = await fetch(`${PRODUCTS_URL}/categories`);
    const data14 = await res14.json();
    assert(
      res14.status === 200 &&
        Array.isArray(data14.categories) &&
        data14.categories.includes('Electronics') &&
        data14.categories.includes('Books'),
      'Test 14: GET /api/products/categories returns valid category list'
    );

    // Test 15: Category filtering & Whitelisting
    const res15Valid = await fetch(`${PRODUCTS_URL}?category=Books`);
    const data15Valid = await res15Valid.json();
    const allBooks = data15Valid.products.every((p) => p.category === 'Books');

    const res15Invalid = await fetch(`${PRODUCTS_URL}?category=InvalidCatXYZ`);
    assert(
      res15Valid.status === 200 && allBooks && res15Invalid.status === 400,
      'Test 15: Whitelisted category filter works and invalid category returns HTTP 400'
    );

    // Test 16: Safe keyword search with regex characters (No ReDoS)
    const res16 = await fetch(`${PRODUCTS_URL}?keyword=Keyboard+.*[()`);
    const data16 = await res16.json();
    assert(
      res16.status === 200 && Array.isArray(data16.products),
      'Test 16: Search safely handles regex metacharacters without ReDoS or crashing'
    );

    // Test 17: Sorting whitelisting (price_asc, price_desc)
    const res17Asc = await fetch(`${PRODUCTS_URL}?sort=price_asc`);
    const data17Asc = await res17Asc.json();
    const isSortedAsc =
      data17Asc.products.length >= 2 &&
      data17Asc.products[0].price <= data17Asc.products[1].price;

    const res17Invalid = await fetch(`${PRODUCTS_URL}?sort=unsupported_sort`);
    assert(
      res17Asc.status === 200 && isSortedAsc && res17Invalid.status === 400,
      'Test 17: Sort whitelisting works (price_asc) and invalid sort returns HTTP 400'
    );

    // Test 18: Storefront endpoint GET /api/products/store/:sellerId
    const res18 = await fetch(`${PRODUCTS_URL}/store/${sellerAUser._id}`);
    const data18 = await res18.json();
    const onlySellerA = data18.products.every(
      (p) => p.seller.toString() === sellerAUser._id.toString()
    );
    assert(
      res18.status === 200 &&
        data18.store.businessName === 'Alice Apex Gadgets' &&
        onlySellerA,
      'Test 18: GET /api/products/store/:sellerId returns isolated storefront catalogue'
    );

    // Test 19: Storefront endpoint for suspended seller returns 404
    const res19 = await fetch(`${PRODUCTS_URL}/store/${suspendedSellerUser._id}`);
    assert(
      res19.status === 404,
      'Test 19: Storefront endpoint returns 404 for unapproved/suspended seller'
    );

    // -----------------------------------------------------------------------------------
    // SECTION E: SELLER ISOLATION & OBJECT-LEVEL AUTHORIZATION (BOLA/IDOR)
    // -----------------------------------------------------------------------------------
    console.log('\n--- 🔒 SECTION E: SELLER ISOLATION & OBJECT-LEVEL AUTHORIZATION ---');

    // Test 20: Seller A views only their own products in seller management
    const res20 = await fetch(`${PRODUCTS_URL}/seller/my-products`, {
      headers: { Authorization: `Bearer ${sellerAToken}` }
    });
    const data20 = await res20.json();
    const onlyOwnProductsA = data20.products.every(
      (p) => p.seller.toString() === sellerAUser._id.toString()
    );
    assert(
      res20.status === 200 && onlyOwnProductsA && data20.products.length === 2,
      'Test 20: GET /api/products/seller/my-products isolates Seller A catalogue'
    );

    // Test 21: Seller B views only their own products
    const res21 = await fetch(`${PRODUCTS_URL}/seller/my-products`, {
      headers: { Authorization: `Bearer ${sellerBToken}` }
    });
    const data21 = await res21.json();
    const onlyOwnProductsB = data21.products.every(
      (p) => p.seller.toString() === sellerBUser._id.toString()
    );
    assert(
      res21.status === 200 && onlyOwnProductsB && data21.products.length === 1,
      'Test 21: GET /api/products/seller/my-products isolates Seller B catalogue'
    );

    // Test 22: BOLA / IDOR Prevention - Seller B attempts to update Seller A product (HTTP 403 Forbidden)
    const res22 = await fetch(`${PRODUCTS_URL}/${productA1._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerBToken}`
      },
      body: JSON.stringify({
        price: 1 // Malicious price tampering
      })
    });
    const data22 = await res22.json();
    assert(
      res22.status === 403 && data22.message.includes('not authorized to modify'),
      'Test 22: BOLA/IDOR Blocked - Seller B forbidden from updating Seller A product (HTTP 403)'
    );

    // Test 23: Seller A updates their own product successfully (HTTP 200 OK)
    const res23 = await fetch(`${PRODUCTS_URL}/${productA1._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sellerAToken}`
      },
      body: JSON.stringify({
        price: 4999,
        stockCount: 30
      })
    });
    const data23 = await res23.json();
    assert(
      res23.status === 200 &&
        data23.product.price === 4999 &&
        data23.product.stockCount === 30,
      'Test 23: Seller A successfully updates their own product price & stock (HTTP 200)'
    );

    // Test 24: BOLA / IDOR Prevention - Seller B attempts to delete Seller A product (HTTP 403 Forbidden)
    const res24 = await fetch(`${PRODUCTS_URL}/${productA1._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sellerBToken}` }
    });
    assert(
      res24.status === 403,
      'Test 24: BOLA/IDOR Blocked - Seller B forbidden from deleting Seller A product (HTTP 403)'
    );

    // -----------------------------------------------------------------------------------
    // SECTION F: SOFT DELETION & ORDER INTEGRITY
    // -----------------------------------------------------------------------------------
    console.log('\n--- 📦 SECTION F: SOFT DELETION & ORDER INTEGRITY ---');

    // Test 25: Seller A archives (soft deletes) their own product
    const res25 = await fetch(`${PRODUCTS_URL}/${productA1._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${sellerAToken}` }
    });
    const data25 = await res25.json();
    assert(
      res25.status === 200 && data25.message.includes('archived successfully'),
      'Test 25: Seller A soft deletes/archives product (HTTP 200)'
    );

    // Test 26: Archived product no longer appears in public catalogue
    const res26 = await fetch(PRODUCTS_URL);
    const data26 = await res26.json();
    const productA1InPublic = data26.products.some((p) => p._id === productA1._id);
    assert(
      !productA1InPublic,
      'Test 26: Archived product is completely hidden from public catalogue'
    );

    // Test 27: Archived product preserved in MongoDB database for historical order receipts
    const archivedDoc = await Product.findById(productA1._id);
    assert(
      archivedDoc !== null &&
        archivedDoc.isArchived === true &&
        archivedDoc.isPublished === false,
      'Test 27: Archived product preserved in database (isArchived: true) for order integrity'
    );

    // -----------------------------------------------------------------------------------
    // SECTION G: ADMIN PRIVILEGES
    // -----------------------------------------------------------------------------------
    console.log('\n--- 👑 SECTION G: ADMIN PRIVILEGES ---');

    // Test 28: Admin can update any product
    const res28 = await fetch(`${PRODUCTS_URL}/${productB1._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Admin Moderated: Clean Code',
        price: 950
      })
    });
    const data28 = await res28.json();
    assert(
      res28.status === 200 && data28.product.title === 'Admin Moderated: Clean Code',
      'Test 28: Admin can update/moderate any seller product (HTTP 200)'
    );

    // Test 29: Admin can archive/delete any product
    const res29 = await fetch(`${PRODUCTS_URL}/${productB1._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(
      res29.status === 200,
      'Test 29: Admin can archive/delete any seller product (HTTP 200)'
    );

    // Cleanup rogue product
    await Product.findByIdAndDelete(rogueProduct._id);

    console.log('\n========================================================================');
    console.log(`📊 TEST SUITE SUMMARY: ${passed}/${passed + failed} Passed (${Math.round((passed / (passed + failed)) * 100)}%)`);
    console.log('========================================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('💥 Test suite encountered fatal error:', error);
    process.exit(1);
  }
};

runDay6TestSuite();
