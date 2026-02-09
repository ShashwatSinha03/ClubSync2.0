const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({
  baseURL: 'http://localhost:5001/api',
  jar,
  withCredentials: true
}));

async function verifyRefinement() {
  console.log('🚀 Starting Refinement Phase Verification...');

  try {
    // 1. Identity Check: Fail on detailed Gmail
    console.log('\n1️⃣  Identity: Register with Gmail (Should Fail)...');
    try {
        await client.post('/auth/register', {
            name: 'Bad Email User',
            email: 'bad@gmail.com',
            password: 'password123',
            phone: '1234567890',
            instrument: 'Guitar'
        });
        console.error('   ❌ Failed: Gmail registration should have been rejected');
    } catch (e) {
        if (e.response && e.response.status === 400 && e.response.data.message.includes('Rishihood')) {
            console.log('   ✅ Success: Rejected non-Rishihood email');
        } else {
            console.error('   ❌ Unexpected error:', e.response?.data || e.message);
        }
    }

    // 2. Identity Check: Succeed with Rishihood
    const rishiEmail = `test_${Date.now()}@rishihood.edu.in`;
    console.log(`\n2️⃣  Identity: Register with ${rishiEmail} (Should Succeed)...`);
    let newUser;
    try {
        const res = await client.post('/auth/register', {
            name: 'Rishi Student',
            email: rishiEmail,
            password: 'password123',
            phone: '9876543210',
            instrument: 'Piano'
        });
        newUser = res.data;
        console.log('   ✅ Registration successful (Status: PENDING)');
    } catch (e) {
        console.error('   ❌ Registration failed:', e.response?.data || e.message);
        return;
    }

    // 3. Admin Login
    console.log('\n3️⃣  Authority: Admin Login...');
    const adminJar = new CookieJar();
    const adminClient = wrapper(axios.create({
        baseURL: 'http://localhost:5001/api',
        jar: adminJar,
        withCredentials: true
    }));

    try {
        await adminClient.post('/auth/login', {
            email: 'admin@saarang.com', // Admin seed email doesn't strictly need rishihood domain if seeded directly, hopefully logic allows seeded users or we need to update seed?
            // Wait, my middleware check matches login too. If admin@saarang.com is NOT @rishihood, login will fail!
            // Let's check my logic in authRoutes.js:
            // if (!email || !email.endsWith('@rishihood.edu.in')) return 400
            // Uh oh. admin@saarang.com will be LOCKED OUT.
            // I should either exception the admin email or change admin email to admin@rishihood.edu.in
            password: 'admin123'
        });
        console.log('   ✅ Admin login successful');
    } catch (e) {
        if (e.response?.status === 400 && e.response.data.message.includes('Rishihood')) {
            console.log('   🛑 Admin Login BLOCKED by Domain Check! (Expected if unmodified)');
            // I need to fix this either by exempting specific admin or changing seed.
            // I will update authRoutes.js to allow 'admin@saarang.com' explicitly OR update seed.
            // Updating authRoutes is safer for now to preserve existing credentials.
            return; 
        }
        console.error('   ❌ Admin login failed:', e.response?.data || e.message);
        return;
    }

    // 4. Fetch Pending & Approve
    console.log('\n4️⃣  Authority: Approve User (Check console for Mock Email)...');
    try {
        // Need to find the user ID from pending list (since we don't have it from register resp fully maybe? actually register returned it? No, register returns email/status but maybe not ID if pending)
        // Let's fetch pending
        const pendingRes = await adminClient.get('/admin/pending-users');
        const targetUser = pendingRes.data.find(u => u.email === rishiEmail);
        
        if (!targetUser) {
            console.error('   ❌ User not found in pending list');
            return;
        }

        await adminClient.post(`/admin/approve-user/${targetUser._id}`);
        console.log('   ✅ User Approved');
        console.log('   (Verify backend console for "Access Granted" email log)');

    } catch (e) {
        console.error('   ❌ Approval failed:', e.response?.data || e.message);
        return;
    }

    // 5. Promote to Admin
    console.log('\n5️⃣  Authority: Promote to Admin...');
    // We need the ID again.
    const pendingRes = await adminClient.get('/admin/users'); // now they are in active users
    const targetUser = pendingRes.data.find(u => u.email === rishiEmail);
    
    try {
        await adminClient.put('/admin/role', {
            userId: targetUser._id,
            role: 'ADMIN'
        });
        console.log('   ✅ Promoted to ADMIN');
    } catch (e) {
        console.error('   ❌ Promotion failed:', e.response?.data || e.message);
    }

    // 6. Demote to Member
    console.log('\n6️⃣  Authority: Demote to Member...');
    try {
         await adminClient.put('/admin/role', {
            userId: targetUser._id,
            role: 'MEMBER'
        });
        console.log('   ✅ Demoted to MEMBER');
    } catch (e) {
        console.error('   ❌ Demotion failed:', e.response?.data || e.message);
    }

    console.log('\n✅ Verification Logic Complete!');

  } catch (error) {
    console.error('❌ Script Error:', error);
  }
}

verifyRefinement();
