/**
 * Cartiva Day 4 — Automated Test Suite for User Registration API
 * Tests both Customer and Seller registration, validations, and security rules.
 */

const BASE_URL = 'http://localhost:5001/api/auth/register';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 CARTIVA DAY 4: SECURE USER REGISTRATION TEST SUITE');
  console.log('======================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  const testCase = async (testNumber, title, payload, expectedStatus, validateFn) => {
    totalCount++;
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      const statusMatches = response.status === expectedStatus;
      const logicMatches = validateFn(data);

      if (statusMatches && logicMatches) {
        passedCount++;
        console.log(`✅ [PASS] Test ${testNumber}: ${title} (Status: ${response.status})`);
      } else {
        console.error(`❌ [FAIL] Test ${testNumber}: ${title}`);
        console.error(`   Expected Status: ${expectedStatus}, Received: ${response.status}`);
        console.error(`   Response Body:`, JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error(`❌ [ERROR] Test ${testNumber}: ${title} — ${err.message}`);
    }
  };

  // Test 1: Successful customer registration
  await testCase(
    1,
    'Successful Customer Registration',
    {
      name: 'Alice Customer',
      email: 'alice@example.com',
      password: 'SecurePassword123'
    },
    201,
    (d) => d.success === true && d.user.role === 'customer' && !('password' in d.user)
  );

  // Test 2: Successful seller registration
  await testCase(
    2,
    'Successful Seller Registration (Pending Approval)',
    {
      name: 'Bob Seller',
      email: 'bob@example.com',
      password: 'SecurePassword123',
      role: 'seller',
      businessName: 'Bob Electronics & Gadgets'
    },
    201,
    (d) =>
      d.success === true &&
      d.user.role === 'seller' &&
      d.user.businessName === 'Bob Electronics & Gadgets' &&
      d.user.sellerApprovalStatus === 'pending' &&
      !('password' in d.user)
  );

  // Test 3: Duplicate email registration
  await testCase(
    3,
    'Duplicate Email Rejection',
    {
      name: 'Alice Duplicate',
      email: 'alice@example.com',
      password: 'DifferentPassword123'
    },
    400,
    (d) => d.success === false && d.message.toLowerCase().includes('already exists')
  );

  // Test 4: Invalid email format
  await testCase(
    4,
    'Invalid Email Format Rejection',
    {
      name: 'Charlie Invalid',
      email: 'charlie-not-an-email',
      password: 'SecurePassword123'
    },
    400,
    (d) => d.success === false && d.message.toLowerCase().includes('valid email')
  );

  // Test 5: Missing required fields (e.g. missing businessName for seller)
  await testCase(
    5,
    'Missing Required Field (Seller missing businessName)',
    {
      name: 'Dave Seller',
      email: 'dave@example.com',
      password: 'SecurePassword123',
      role: 'seller'
    },
    400,
    (d) => d.success === false && d.message.toLowerCase().includes('business name is required')
  );

  // Test 6: Weak or invalid password (< 6 characters)
  await testCase(
    6,
    'Weak Password Rejection (< 6 chars)',
    {
      name: 'Eve Short',
      email: 'eve@example.com',
      password: '123'
    },
    400,
    (d) => d.success === false && d.message.toLowerCase().includes('at least 6 characters')
  );

  // Test 7: Attempted admin registration
  await testCase(
    7,
    'Attempted Admin Registration Rejection',
    {
      name: 'Malicious User',
      email: 'attacker@example.com',
      password: 'SecurePassword123',
      role: 'admin'
    },
    400,
    (d) => d.success === false && d.message.toLowerCase().includes('admin registration is not permitted')
  );

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedCount}/${totalCount} Passed (${Math.round((passedCount / totalCount) * 100)}%)`);
  console.log('======================================================\n');
};

runTests();
