/**
 * Cartiva Day 5: Comprehensive Automated Authentication & Authorization Test Suite
 * Tests all 22 required test cases across Login, JWT tokens, Role Authorization, and Regressions.
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');

const BASE_URL = 'http://localhost:5001';
const AUTH_URL = `${BASE_URL}/api/auth`;
const JWT_SECRET = process.env.JWT_SECRET || 'cartiva_dev_secret_key';

const runDay5TestSuite = async () => {
  console.log('\n================================================================');
  console.log('🧪 CARTIVA DAY 5: COMPLETE AUTHENTICATION & AUTHORIZATION TESTS');
  console.log('================================================================\n');

  // Step A: Seed / Ensure Clean Test Accounts in MongoDB
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');

  // Clean prior test accounts
  const testEmails = [
    'test_cust_day5@example.com',
    'test_pend_seller_day5@example.com',
    'test_appr_seller_day5@example.com',
    'test_rej_seller_day5@example.com',
    'test_susp_seller_day5@example.com',
    'test_admin_day5@example.com',
    'reg_cust_day5@example.com',
    'reg_seller_day5@example.com'
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

  // 4. Rejected Seller user
  const rejectedSellerUser = await User.create({
    name: 'Day5 Rejected Seller',
    email: 'test_rej_seller_day5@example.com',
    password: 'ValidPassword123',
    role: 'seller',
    businessName: 'Rejected Shop',
    sellerApprovalStatus: 'rejected'
  });

  // 5. Suspended Seller user
  const suspendedSellerUser = await User.create({
    name: 'Day5 Suspended Seller',
    email: 'test_susp_seller_day5@example.com',
    password: 'ValidPassword123',
    role: 'seller',
    businessName: 'Suspended Mart',
    sellerApprovalStatus: 'suspended'
  });

  // 6. Admin user
  const adminUser = await User.create({
    name: 'Day5 Administrator',
    email: 'test_admin_day5@example.com',
    password: 'ValidPassword123',
    role: 'admin'
  });

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

  // -------------------------------------------------------------
  // LOGIN TESTS (1 - 7)
  // -------------------------------------------------------------
  console.log('--- 🔑 LOGIN API TESTS ---');

  // Test 1: Customer login with correct credentials
  const res1 = await fetch(`${AUTH_URL}/login`, {
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
    'Customer Login with Correct Credentials (HTTP 200, JWT returned, safe user object)',
    res1.status === 200 && data1.success === true && Boolean(customerToken) && data1.user.role === 'customer' && !('password' in data1.user),
    data1
  );

  // Test 2: Seller login with correct credentials
  const res2 = await fetch(`${AUTH_URL}/login`, {
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
    'Seller Login with Correct Credentials (HTTP 200, JWT returned, seller attributes)',
    res2.status === 200 && data2.success === true && Boolean(approvedSellerToken) && data2.user.role === 'seller' && data2.user.businessName === 'Prime Electronics Hub',
    data2
  );

  // Test 3: Login with incorrect password
  const res3 = await fetch(`${AUTH_URL}/login`, {
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
    'Login with Incorrect Password (HTTP 401, Generic Error Message)',
    res3.status === 401 && data3.success === false && data3.message === 'Invalid email or password',
    data3
  );

  // Test 4: Login with an unknown email
  const res4 = await fetch(`${AUTH_URL}/login`, {
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
    'Login with an Unknown Email (HTTP 401, Generic Error Message to prevent enumeration)',
    res4.status === 401 && data4.success === false && data4.message === 'Invalid email or password',
    data4
  );

  // Test 5: Login with missing email
  const res5 = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password: 'ValidPassword123'
    })
  });
  const data5 = await res5.json();
  test(
    5,
    'Login with Missing Email (HTTP 400)',
    res5.status === 400 && data5.success === false && data5.message.toLowerCase().includes('email'),
    data5
  );

  // Test 6: Login with missing password
  const res6 = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_cust_day5@example.com'
    })
  });
  const data6 = await res6.json();
  test(
    6,
    'Login with Missing Password (HTTP 400)',
    res6.status === 400 && data6.success === false && data6.message.toLowerCase().includes('password'),
    data6
  );

  // Test 7: Login with invalid email format
  const res7 = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'not-an-email-format',
      password: 'ValidPassword123'
    })
  });
  const data7 = await res7.json();
  test(
    7,
    'Login with Invalid Email Format (HTTP 400)',
    res7.status === 400 && data7.success === false && data7.message.toLowerCase().includes('valid email'),
    data7
  );

  // -------------------------------------------------------------
  // JWT TESTS (8 - 11)
  // -------------------------------------------------------------
  console.log('\n--- 🛡️ JWT AUTHENTICATION TESTS ---');

  // Test 8: Request without an authorization token
  const res8 = await fetch(`${AUTH_URL}/profile`);
  const data8 = await res8.json();
  test(
    8,
    'Request without an Authorization Token (HTTP 401)',
    res8.status === 401 && data8.success === false && data8.message.includes('no token provided'),
    data8
  );

  // Test 9: Request with an invalid token
  const res9 = await fetch(`${AUTH_URL}/profile`, {
    headers: { Authorization: 'Bearer this.is.an.invalid.token' }
  });
  const data9 = await res9.json();
  test(
    9,
    'Request with an Invalid Token (HTTP 401)',
    res9.status === 401 && data9.success === false && data9.message.includes('invalid token'),
    data9
  );

  // Test 10: Request with an expired token
  const expiredToken = jwt.sign({ id: customerUser._id }, JWT_SECRET, { expiresIn: '1ms' });
  await new Promise((r) => setTimeout(r, 20)); // wait for token expiry
  const res10 = await fetch(`${AUTH_URL}/profile`, {
    headers: { Authorization: `Bearer ${expiredToken}` }
  });
  const data10 = await res10.json();
  test(
    10,
    'Request with an Expired Token (HTTP 401)',
    res10.status === 401 && data10.success === false && data10.message.includes('token has expired'),
    data10
  );

  // Test 11: Request with a valid token
  const res11 = await fetch(`${AUTH_URL}/profile`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const data11 = await res11.json();
  test(
    11,
    'Request with a Valid Token (HTTP 200, Protected Profile Returned)',
    res11.status === 200 && data11.success === true && data11.user.email === 'test_cust_day5@example.com',
    data11
  );

  // -------------------------------------------------------------
  // AUTHORIZATION TESTS (12 - 16)
  // -------------------------------------------------------------
  console.log('\n--- 🚦 ROLE-BASED AUTHORIZATION TESTS ---');

  // Test 12: Customer attempting to access seller routes
  const res12 = await fetch(`${AUTH_URL}/seller/dashboard`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const data12 = await res12.json();
  test(
    12,
    'Customer Attempting to Access Seller Routes (HTTP 403 Forbidden)',
    res12.status === 403 && data12.success === false && data12.message.includes('Seller account required'),
    data12
  );

  // Test 13: Pending seller attempting product management
  const resPendLogin = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_pend_seller_day5@example.com',
      password: 'ValidPassword123'
    })
  });
  const dataPendLogin = await resPendLogin.json();
  const pendingSellerToken = dataPendLogin.token;

  const res13 = await fetch(`${AUTH_URL}/seller/products`, {
    headers: { Authorization: `Bearer ${pendingSellerToken}` }
  });
  const data13 = await res13.json();
  test(
    13,
    'Pending Seller Attempting Product Management (HTTP 403 Forbidden)',
    res13.status === 403 && data13.success === false && data13.message.includes('pending approval'),
    data13
  );

  // Test 14: Approved seller accessing seller routes
  const res14Dashboard = await fetch(`${AUTH_URL}/seller/dashboard`, {
    headers: { Authorization: `Bearer ${approvedSellerToken}` }
  });
  const data14Dashboard = await res14Dashboard.json();

  const res14Products = await fetch(`${AUTH_URL}/seller/products`, {
    headers: { Authorization: `Bearer ${approvedSellerToken}` }
  });
  const data14Products = await res14Products.json();

  test(
    14,
    'Approved Seller Accessing Seller Routes (HTTP 200 OK for Dashboard & Products)',
    res14Dashboard.status === 200 && data14Dashboard.seller.status === 'approved' && res14Products.status === 200,
    { dashboard: data14Dashboard, products: data14Products }
  );

  // Test 15: Rejected or suspended seller being denied access
  const resRejLogin = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_rej_seller_day5@example.com',
      password: 'ValidPassword123'
    })
  });
  const dataRejLogin = await resRejLogin.json();
  const rejectedSellerToken = dataRejLogin.token;

  const resSuspLogin = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_susp_seller_day5@example.com',
      password: 'ValidPassword123'
    })
  });
  const dataSuspLogin = await resSuspLogin.json();
  const suspendedSellerToken = dataSuspLogin.token;

  const res15Rej = await fetch(`${AUTH_URL}/seller/dashboard`, {
    headers: { Authorization: `Bearer ${rejectedSellerToken}` }
  });
  const data15Rej = await res15Rej.json();

  const res15Susp = await fetch(`${AUTH_URL}/seller/dashboard`, {
    headers: { Authorization: `Bearer ${suspendedSellerToken}` }
  });
  const data15Susp = await res15Susp.json();

  test(
    15,
    'Rejected or Suspended Seller Being Denied Access (HTTP 403 Forbidden for both)',
    res15Rej.status === 403 &&
      data15Rej.message.includes('rejected') &&
      res15Susp.status === 403 &&
      data15Susp.message.includes('suspended'),
    { rejected: data15Rej, suspended: data15Susp }
  );

  // Test 16: Non-admin attempting admin routes & Admin allowed
  const res16NonAdmin = await fetch(`${AUTH_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${customerToken}` }
  });
  const data16NonAdmin = await res16NonAdmin.json();

  const adminLoginRes = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test_admin_day5@example.com',
      password: 'ValidPassword123'
    })
  });
  const adminData = await adminLoginRes.json();
  const adminRes = await fetch(`${AUTH_URL}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminData.token}` }
  });
  const adminAccessData = await adminRes.json();

  test(
    16,
    'Non-Admin Attempting Admin Routes Denied (HTTP 403) & Admin Allowed (HTTP 200)',
    res16NonAdmin.status === 403 &&
      data16NonAdmin.message.includes('Admin privileges required') &&
      adminRes.status === 200 &&
      adminAccessData.success === true,
    { nonAdmin: data16NonAdmin, admin: adminAccessData }
  );

  // -------------------------------------------------------------
  // REGRESSION TESTS (17 - 22)
  // -------------------------------------------------------------
  console.log('\n--- 🔄 REGRESSION & INTEGRITY TESTS ---');

  // Test 17: Day 4 customer registration still works
  const res17 = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Reg Customer Test',
      email: 'reg_cust_day5@example.com',
      password: 'SecurePassword123'
    })
  });
  const data17 = await res17.json();
  test(
    17,
    'Day 4 Customer Registration Still Works (HTTP 201)',
    res17.status === 201 && data17.success === true && data17.user.role === 'customer',
    data17
  );

  // Test 18: Day 4 seller registration still works
  const res18 = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Reg Seller Test',
      email: 'reg_seller_day5@example.com',
      password: 'SecurePassword123',
      role: 'seller',
      businessName: 'Fresh Organic Market'
    })
  });
  const data18 = await res18.json();
  test(
    18,
    'Day 4 Seller Registration Still Works (HTTP 201, status: pending)',
    res18.status === 201 && data18.success === true && data18.user.role === 'seller' && data18.user.sellerApprovalStatus === 'pending',
    data18
  );

  // Test 19: Duplicate registration is still rejected
  const res19 = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Test',
      email: 'reg_cust_day5@example.com',
      password: 'AnotherPassword123'
    })
  });
  const data19 = await res19.json();
  test(
    19,
    'Duplicate Registration is Still Rejected (HTTP 400)',
    res19.status === 400 && data19.success === false && data19.message.includes('already exists'),
    data19
  );

  // Test 20: Passwords remain securely hashed
  const dbUser = await User.findOne({ email: 'reg_cust_day5@example.com' }).select('+password');
  const isPlaintext = dbUser.password === 'SecurePassword123';
  const isBcrypt = typeof dbUser.password === 'string' && dbUser.password.startsWith('$2') && dbUser.password.length === 60;
  test(
    20,
    'Passwords Remain Securely Hashed in Database (Bcrypt 60-char salted format, not plaintext)',
    !isPlaintext && isBcrypt,
    { isPlaintext, isBcrypt }
  );

  // Test 21: Password hashes are never returned in responses
  const hasNoPasswordInReg = !('password' in data17.user);
  const hasNoPasswordInLogin = !('password' in data1.user);
  const hasNoPasswordInProfile = !('password' in data11.user);
  test(
    21,
    'Password Hashes are Never Returned in Responses (Registration, Login, Profile)',
    hasNoPasswordInReg && hasNoPasswordInLogin && hasNoPasswordInProfile,
    { hasNoPasswordInReg, hasNoPasswordInLogin, hasNoPasswordInProfile }
  );

  // Test 22: Day 3 backend health endpoint still works
  const res22 = await fetch(`${BASE_URL}/health`);
  const data22 = await res22.json();
  test(
    22,
    'Day 3 Backend Health Endpoint Still Works (HTTP 200, status: ok, database: connected)',
    res22.status === 200 && data22.status === 'ok' && data22.database && data22.database.connected === true,
    data22
  );

  await mongoose.disconnect();

  console.log('\n================================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
};

runDay5TestSuite();
