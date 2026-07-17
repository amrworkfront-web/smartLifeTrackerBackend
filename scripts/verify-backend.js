const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
    try {
        console.log('--- Starting Backend Verification ---');

        console.log('1. Registering User...');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123',
            }),
        });

        console.log('   Status:', regRes.status);

        if (regRes.status !== 201) {
            const data = await regRes.json();
            console.error('   Registration Failed:', data);
            return;
        }

        const setCookie = regRes.headers.get('set-cookie');
        const headers = {
            'Content-Type': 'application/json',
            Cookie: setCookie,
        };

        console.log('2. Creating Task...');
        const taskRes = await fetch(`${BASE_URL}/tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                title: 'Verify Backend',
                description: 'Running verification script',
                priority: 'High',
            }),
        });
        console.log('   Status:', taskRes.status);
        const taskData = await taskRes.json();
        console.log('   Task Created:', taskData.data?.title);

        console.log('3. Getting Tasks...');
        const tasksRes = await fetch(`${BASE_URL}/tasks`, { headers });
        console.log('   Status:', tasksRes.status);
        const tasksData = await tasksRes.json();
        console.log('   Tasks Count:', tasksData.pagination?.total ?? tasksData.data?.length);

        if (tasksData.success) {
            console.log('--- VERIFICATION SUCCESSFUL ---');
        } else {
            console.log('--- VERIFICATION FAILED ---');
        }
    } catch (error) {
        console.error('Verification Error:', error.message);
    }
};

runTests();
