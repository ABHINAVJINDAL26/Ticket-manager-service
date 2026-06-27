const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

const testPort = 8085;
const dbFile = path.resolve(__dirname, './database_test.sqlite');

// Clean up previous test database if it exists
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
}

// Start server in background with test configuration
const env = {
  ...process.env,
  PORT: testPort,
  DATABASE_URL: './database_test.sqlite',
  JWT_SECRET: 'test_jwt_secret_key'
};

const serverProcess = fork(path.resolve(__dirname, './src/app.js'), [], { env });

console.log('Waiting for test server to start...');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testsFailed++;
  }
}

async function runTests() {
  // Wait for server to start up
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const baseUrl = `http://localhost:${testPort}`;
  let token1, token2;
  let ticketId1;

  try {
    // 1. Health check
    console.log('\n--- Test 1: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/health`);
    assert(healthRes.status === 200, `Health check status: ${healthRes.status}`);
    const healthJson = await healthRes.json();
    assert(healthJson.status === 'ok', `Health check response: ${JSON.stringify(healthJson)}`);

    // 2. Register User 1
    console.log('\n--- Test 2: Register User 1 ---');
    const reg1Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user1@example.com', password: 'password123' })
    });
    assert(reg1Res.status === 201, `Register User 1 status: ${reg1Res.status}`);
    const reg1Json = await reg1Res.json();
    assert(reg1Json.message === 'User registered successfully', `Register User 1 msg: ${reg1Json.message}`);

    // 3. Register User 1 (duplicate)
    console.log('\n--- Test 3: Duplicate Registration ---');
    const regDupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user1@example.com', password: 'password123' })
    });
    assert(regDupRes.status === 400, `Duplicate register status: ${regDupRes.status}`);

    // 4. Login User 1
    console.log('\n--- Test 4: Login User 1 ---');
    const login1Res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user1@example.com', password: 'password123' })
    });
    assert(login1Res.status === 200, `Login User 1 status: ${login1Res.status}`);
    const login1Json = await login1Res.json();
    token1 = login1Json.token;
    assert(!!token1, 'Token 1 generated');

    // 5. Register User 2
    console.log('\n--- Test 5: Register User 2 ---');
    const reg2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user2@example.com', password: 'password123' })
    });
    assert(reg2Res.status === 201, `Register User 2 status: ${reg2Res.status}`);

    // 6. Login User 2
    console.log('\n--- Test 6: Login User 2 ---');
    const login2Res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user2@example.com', password: 'password123' })
    });
    assert(login2Res.status === 200, `Login User 2 status: ${login2Res.status}`);
    const login2Json = await login2Res.json();
    token2 = login2Json.token;
    assert(!!token2, 'Token 2 generated');

    // 7. Create Ticket for User 1
    console.log('\n--- Test 7: Create Ticket (User 1) ---');
    const createRes = await fetch(`${baseUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ title: 'Fix critical bug', description: 'Page fails on click' })
    });
    assert(createRes.status === 201, `Create ticket status: ${createRes.status}`);
    const ticket1 = await createRes.json();
    ticketId1 = ticket1.id;
    assert(ticket1.title === 'Fix critical bug', `Ticket title: ${ticket1.title}`);
    assert(ticket1.status === 'open', `Ticket status: ${ticket1.status}`);
    assert(ticket1.userId === 1, `Ticket userId: ${ticket1.userId}`);
    assert(!!ticket1.createdAt, 'Ticket createdAt exists');

    // 8. List Tickets User 1
    console.log('\n--- Test 8: List Tickets (User 1) ---');
    const list1Res = await fetch(`${baseUrl}/tickets`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    assert(list1Res.status === 200, `List tickets User 1 status: ${list1Res.status}`);
    const list1Json = await list1Res.json();
    assert(Array.isArray(list1Json), 'Response is array');
    assert(list1Json.length === 1, `List length: ${list1Json.length}`);
    assert(list1Json[0].id === ticketId1, `First ticket id: ${list1Json[0].id}`);
    assert(!list1Json[0].description, 'List does not contain description');

    // 9. List Tickets User 2
    console.log('\n--- Test 9: List Tickets (User 2) ---');
    const list2Res = await fetch(`${baseUrl}/tickets`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    assert(list2Res.status === 200, `List tickets User 2 status: ${list2Res.status}`);
    const list2Json = await list2Res.json();
    assert(Array.isArray(list2Json), 'Response is array');
    assert(list2Json.length === 0, `List length: ${list2Json.length}`);

    // 10. Get Ticket by ID (Owner)
    console.log('\n--- Test 10: Get Ticket by ID (Owner) ---');
    const getOwnerRes = await fetch(`${baseUrl}/tickets/${ticketId1}`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    assert(getOwnerRes.status === 200, `Get ticket status: ${getOwnerRes.status}`);
    const getOwnerJson = await getOwnerRes.json();
    assert(getOwnerJson.id === ticketId1, `Ticket ID matches`);
    assert(getOwnerJson.description === 'Page fails on click', `Description matches`);

    // 11. Get Ticket by ID (Non-owner)
    console.log('\n--- Test 11: Get Ticket by ID (Non-owner) ---');
    const getNonOwnerRes = await fetch(`${baseUrl}/tickets/${ticketId1}`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    assert(getNonOwnerRes.status === 403, `Get ticket non-owner status: ${getNonOwnerRes.status}`);

    // 12. Update Ticket Status (Non-owner)
    console.log('\n--- Test 12: Update Status (Non-owner) ---');
    const updateNonOwnerRes = await fetch(`${baseUrl}/tickets/${ticketId1}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token2}`
      },
      body: JSON.stringify({ status: 'in_progress' })
    });
    assert(updateNonOwnerRes.status === 403, `Update non-owner status: ${updateNonOwnerRes.status}`);

    // 13. Update Ticket Status (Owner) - Invalid transition target
    console.log('\n--- Test 13: Update Status Invalid Target ---');
    const updateInvalidRes = await fetch(`${baseUrl}/tickets/${ticketId1}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ status: 'invalid_status' })
    });
    assert(updateInvalidRes.status === 400, `Update invalid status: ${updateInvalidRes.status}`);

    // 14. Update Ticket Status (Owner) - open -> in_progress
    console.log('\n--- Test 14: Update Status (open -> in_progress) ---');
    const updateIpRes = await fetch(`${baseUrl}/tickets/${ticketId1}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ status: 'in_progress' })
    });
    assert(updateIpRes.status === 200, `Update status response: ${updateIpRes.status}`);
    const updateIpJson = await updateIpRes.json();
    assert(updateIpJson.id === ticketId1, `Updated ticket ID: ${updateIpJson.id}`);
    assert(updateIpJson.status === 'in_progress', `Updated status: ${updateIpJson.status}`);

    // 15. Invalid Transition (in_progress -> open)
    console.log('\n--- Test 15: Invalid Transition (in_progress -> open) ---');
    const updateIpToOpen = await fetch(`${baseUrl}/tickets/${ticketId1}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ status: 'open' })
    });
    assert(updateIpToOpen.status === 400, `Transition in_progress -> open status: ${updateIpToOpen.status}`);

    // 16. Update Ticket Status (Owner) - in_progress -> closed
    console.log('\n--- Test 16: Update Status (in_progress -> closed) ---');
    const updateClosedRes = await fetch(`${baseUrl}/tickets/${ticketId1}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ status: 'closed' })
    });
    assert(updateClosedRes.status === 200, `Update status closed: ${updateClosedRes.status}`);
    const updateClosedJson = await updateClosedRes.json();
    assert(updateClosedJson.status === 'closed', `Updated status: ${updateClosedJson.status}`);

    // 17. Invalid Transition (closed -> open)
    console.log('\n--- Test 17: Invalid Transition (closed -> open) ---');
    const updateClosedToOpen = await fetch(`${baseUrl}/tickets/${ticketId1}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ status: 'open' })
    });
    assert(updateClosedToOpen.status === 400, `Transition closed -> open status: ${updateClosedToOpen.status}`);

    // 18. Invalid Transition (closed -> in_progress)
    console.log('\n--- Test 18: Invalid Transition (closed -> in_progress) ---');
    const updateClosedToIp = await fetch(`${baseUrl}/tickets/${ticketId1}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ status: 'in_progress' })
    });
    assert(updateClosedToIp.status === 400, `Transition closed -> in_progress status: ${updateClosedToIp.status}`);

  } catch (err) {
    console.error('Error during testing:', err);
    testsFailed++;
  } finally {
    // Kill test server
    serverProcess.kill();
    console.log('\n--- Test Summary ---');
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsFailed}`);

    // Clean up test DB file
    if (fs.existsSync(dbFile)) {
      try {
        fs.unlinkSync(dbFile);
      } catch (e) {}
    }

    process.exit(testsFailed > 0 ? 1 : 0);
  }
}

runTests();
