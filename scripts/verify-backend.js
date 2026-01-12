// using native fetch
// Since we are in a modern environment, let's try native fetch or axios if available. 
// But the user said "All required libraries are already installed", but node-fetch might not be.
// Let's use native fetch (available in Node 18+).

const BASE_URL = 'http://localhost:5000/api';
let token = '';

const runTests = async () => {
    try {
        console.log('--- Starting Backend Verification ---');

        // 1. Register User
        console.log('1. Registering User...');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123'
            })
        });
        
        // Check cookies for token if using httpOnly cookies, but we can't access them easily in node script without a cookie jar.
        // However, the dashboard endpoint relies on cookies.
        // The register endpoint does NOT return the token in body (based on my implementation), it sets cookies.
        // So this script needs to handle cookies.
        
        // Since handling cookies in a simple fetch script is tricky without a library like 'node-fetch-cookies' or similar,
        // and I don't want to install new packages.
        // I will temporarily modify the Auth Controller to return the token in the body for testing purposes? 
        // OR, I can just rely on the response headers 'set-cookie' and manually send them back.
        
        const setCookie = regRes.headers.get('set-cookie');
        console.log('   Registration Status:', regRes.status);
        
        if (regRes.status !== 201) {
            const data = await regRes.json();
            console.error('   Registration Failed:', data);
            return;
        }
        
        // Extract Access Token from Set-Cookie header (simple parsing)
        // Set-Cookie: accessToken=...; Path=/; HttpOnly...
        // We need to send this back in subsequent requests.
        
        const cookieHeader = setCookie; 
        // Note: fetch might return multiple set-cookie headers combined or array. 
        // In Node 18+, headers.get('set-cookie') might join them.
        
        const headers = { 
            'Content-Type': 'application/json',
            'Cookie': cookieHeader
        };

        // 2. Create Task
        console.log('2. Creating Task...');
        const taskRes = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                title: 'Verify Backend',
                description: 'Running verification script',
                priority: 'High'
            })
        });
        console.log('   Create Task Status:', taskRes.status);
        const taskData = await taskRes.json();
        console.log('   Task Created:', taskData.title);

        // 3. Get Dashboard Stats
        console.log('3. Fetching Dashboard Stats...');
        const dashRes = await fetch(`${BASE_URL}/dashboard`, {
            headers: headers
        });
        console.log('   Dashboard Status:', dashRes.status);
        const dashData = await dashRes.json();
        console.log('   Dashboard Data:', JSON.stringify(dashData, null, 2));
        
        if (dashData.tasks && dashData.tasks.total >= 1) {
            console.log('--- VERIFICATION SUCCESSFUL ---');
        } else {
            console.log('--- VERIFICATION PARTIAL / FAILED ---');
        }

    } catch (error) {
        console.error('Verification Error:', error);
    }
};

runTests();
