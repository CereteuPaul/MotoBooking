const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = loginForm.elements['email'].value;
    const password = loginForm.elements['password'].value;

    console.log('Submitting login form with email:', email, 'and password:', password);
    console.log("123123", JSON.stringify({ email, password }))

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if(response.ok) {
            const data = await response.json();
            const token = data.token;
            const role = data.role;
            console.log(role)
            localStorage.setItem('token', token);
            console.log('data', data);
            if(data.role === 'admin') {
                window.location.href = '/';
            } else {
                window.location.href = '/users-perspective';
            }

        }


    } catch (error) {
        console.error('Error:', error);
    }
});
