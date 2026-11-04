/**
 * Cartiva Day 5: Comprehensive Automated Authentication & Authorization Test Suite
 * Tests all 12 required test cases for login, JWT tokens, and role-based access control.
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');

const BASE_URL = 'http://localhost:5001/api/auth';
const JWT_SECRET = process.env.JWT_SECRET || 'cartiva_dev_secret_key';

const runDay5TestSuite = async () => {
  console.log('\n================================================================');
  console.log('🧪 CARTIVA DAY 5: LOGIN & JWT AUTHENTICATION TEST SUITE');
  console.log('================================================================\n');

  // Step A: Seed / Ensure Clean Test Accounts in MongoDB
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');

  // Clean prior test accounts
  const testEmails = [
    'test_cust_day5@example.com',
    'test_pend_seller_day5@example.com',
    'test_appr_seller_day5@example.com',
    'test_admin_day5@example.com'
  ];
  await User.deleteMany({ email: { $in: testEmails } });

  // 1. Customer user
  const customerUser = await User.create({
    name: 'Day5 Customer',
    email: 'test_cust_day5@example.com',
    password: 'ValidPassword123',
    role: 'customer'
  });

  // 2. Pending Seller user
  const pendingSellerUser = await User.create({
    name: 'Day5 Pending Seller',
    email: 'test_pend_seller_day5@example.com',
    password: 'ValidPassword123',
    role: 'seller',
    businessName: 'Pending Gadgets Store',
    sellerApprovalStatus: 'pending'
  });

  // 3. Approved Seller user
  const approvedSellerUser = await User.create({
    name: 'Day5 Approved Seller',
    email: 'test_appr_seller_day5@example.com',
    password: 'ValidPassword123',
    role: 'seller',
    businessName: 'Prime Electronics Hub',
    sellerApprovalStatus: 'approved'
  });

  // 4. Admin user
  const adminUser = await User.create({
    name: 'Day5 Administrator',
    email: 'test_admin_day5@example.com',
    password: 'ValidPassword123',
    role: 'admin'
  });

  await mongoose.disconnect();
  console.log('✅ Test accounts seeded in database.\n');

  let passed = 0;
  let total = 0;

  const test = (num, title, condition, details) => {
    total++;
    if (condition) {
      passed++;
      console.log(`✅ [PASS] Test ${num}: ${title}`);
    } else {
      console.error(`❌ [FAIL] Test ${num}: ${title}`);
      if (details) console.error('   Details:', details);
    }
  };

  // --- CASE 1: Successful customer login ---
  const res1 = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_cust_day5@example.com',
      password: 'ValidPassword123'
    })
  });
  const data1 = await res1.json();
  const customerToken = data1.token;
  test(
    1,
    'Successful Customer Login (HTTP 200, JWT returned, safe user object)',
    res1.status === 200 && data1.success === true && Boolean(customerToken) && data1.user.role === 'customer' && !('password' in data1.user),
    data1
  );

  // --- CASE 2: Successful seller login ---
  const res2 = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_appr_seller_day5@example.com',
      password: 'ValidPassword123'
    })
  });
  const data2 = await res2.json();
  const approvedSellerToken = data2.token;
  test(
    2,
    'Successful Seller Login (HTTP 200, JWT returned, seller attributes)',
    res2.status === 200 && data2.success === true && Boolean(approvedSellerToken) && data2.user.role === 'seller' && data2.user.businessName === 'Prime Electronics Hub',
    data2
  );

  // --- CASE 3: Incorrect password ---
  const res3 = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_cust_day5@example.com',
      password: 'WrongPassword999'
    })
  });
  const data3 = await res3.json();
  test(
    3,
    'Incorrect Password Rejection (HTTP 401, Generic Error Message)',
    res3.status === 401 && data3.success === false && data3.message === 'Invalid email or password',
    data3
  );

  // --- CASE 4: Unknown email ---
  const res4 = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'unknown_user_999@example.com',
      password: 'SomePassword123'
    })
  });
  const data4 = await res4.json();
  test(
    4,
    'Unknown Email Rejection (HTTP 401, Generic Error Message)',
    res4.status === 401 && data4.success === false && data4.message === 'Invalid email or password',
    data4
  );

  // --- CASE 5: Missing credentials ---
  const res5 = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '' })
  });
  const data5 = await res5.json();
  test(
    5,
    'Missing Credentials Rejection (HTTP 400)',
    res5.status === 400 && data5.success === false && data5.message.includes('provide email and password'),
    data5
  );

  // --- CASE 6: Missing JWT ---
  const res6 = await fetch(`${BASE_URL}/profile`);
  const data6 = await res6.json();
  test(
    6,
    'Missing JWT on Protected Route Rejection (HTTP 401)',
    res6.status === 401 && data6.success === false && data6.message.includes('no token provided'),
    data6
  );

  // --- CASE 7: Invalid JWT ---
  const res7 = await fetch(`${BASE_URL}/profile`, {
    headers: { Authorization: 'Bearer this.is.an.invalid.token' }
  });
  const data7 = await res7.json();
  test(
    7,
    'Invalid JWT on Protected Route Rejection (HTTP 401)',
    res7.status === 401 && data7.success === false && data7.message.includes('invalid token'),
    data7
  );

  // --- CASE 8: Expired JWT ---
  const expiredToken = jwt.sign({ id: customerUser._id }, JWT_SECRET, { expiresIn: '1ms' });
  await new Promise((r) => setTimeout(r, 20)); // wait for token to expire
  const res8 = await fetch(`${BASE_URL}/profile`, {
    headers: { Authorization: `Bearer ${expiredToken}` }
  });
  const data8 = await res8.json();
  test(
    8,
    'Expired JWT on Protected Route Rejection (HTTP 401)',
    res8.status === 401 && data8.success === false && data8.message.includes('token has expired'),
    data8
  );

  // --- CASE 9: Customer attempting seller-only access ---
  const res9 = await fetch(`${BASE_URL}/seller/dashboard`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const data9 = await res9.json();
  test(
    9,
    'Customer Attempting Seller-Only Route Rejection (HTTP 403 Forbidden)',
    res9.status === 403 && data9.success === false && data9.message.includes('Seller account required'),
    data9
  );

  // --- CASE 10: Pending seller attempting seller route ---
  // Login as pending seller
  const resPendLogin = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_pend_seller_day5@example.com',
      password: 'ValidPassword123'
    })
  });
  const dataPendLogin = await resPendLogin.json();
  const pendingSellerToken = dataPendLogin.token;

  const res10 = await fetch(`${BASE_URL}/seller/dashboard`, {
    headers: { Authorization: `Bearer ${pendingSellerToken}` }
  });
  const data10 = await res10.json();
  test(
    10,
    'Pending Seller Attempting Storefront Management Rejection (HTTP 403 Forbidden)',
    res10.status === 403 && data10.success === false && data10.message.includes('pending approval'),
    data10
  );

  // --- CASE 11: Approved seller accessing seller-only route ---
  const res11 = await fetch(`${BASE_URL}/seller/dashboard`, {
    headers: { Authorization: `Bearer ${approvedSellerToken}` }
  });
  const data11 = await res11.json();
  test(
    11,
    'Approved Seller Accessing Seller-Only Route (HTTP 200 OK)',
    res11.status === 200 && data11.success === true && data11.seller.status === 'approved',
    data11
  );

  // --- CASE 12: Non-admin attempting admin access ---
  const res12NonAdmin = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const data12NonAdmin = await res12NonAdmin.json();

  // Also verify admin can access
  const adminLoginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_admin_day5@example.com',
      password: 'ValidPassword123'
    })
  });
  const adminData = await adminLoginRes.json();
  const adminRes = await fetch(`${BASE_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminData.token}` }
  });
  const adminAccessData = await adminRes.json();

  test(
    12,
    'Non-Admin Blocked from Admin Route (HTTP 403) & Admin Allowed (HTTP 200)',
    res12NonAdmin.status === 403 &&
      data12NonAdmin.message.includes('Admin privileges required') &&
      adminRes.status === 200 &&
      adminAccessData.success === true,
    { nonAdmin: data12NonAdmin, admin: adminAccessData }
  );

  console.log('\n================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');
};

runDay5TestSuite();
