async function verifyAll() {
  const BASE_URL = 'http://localhost:5001/api';
  
  try {
    // 1. Login to get token
    console.log('Attempting Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login/user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'arathi.nair@gmail.com',
        password: 'password123'
      })
    });

    let loginData = await loginRes.json();
    
    if (!loginRes.ok) {
        console.log('User not found, registering...');
        const regRes = await fetch(`${BASE_URL}/auth/register/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Arathi Nair',
                email: 'arathi.nair@gmail.com',
                password: 'password123'
            })
        });
        loginData = await regRes.json();
    }

    const token = loginData.token;
    console.log('Token obtained');

    // 2. Get Experts
    const expertsRes = await fetch(`${BASE_URL}/experts`);
    const experts = await expertsRes.json();
    const expertId = experts[0]._id;
    console.log('Target Expert ID:', expertId);

    // 3. Book Session
    console.log('Testing booking...');
    const bookRes = await fetch(`${BASE_URL}/consultations/book`, {
      method: 'POST',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        expertId: expertId,
        date: '2026-07-01',
        time: '10:00 AM',
        type: 'Video'
      })
    });

    const bookData = await bookRes.json();
    console.log('Booking Result:', bookData);
    
    if (bookRes.ok) {
        console.log('TEST PASSED');
    } else {
        console.log('BOOKING TEST FAILED');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('TEST EXCEPTION:', err.message);
    process.exit(1);
  }
}

verifyAll();
