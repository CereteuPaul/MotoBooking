document.getElementById('signup-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        role: 'user' // Default role
    };

    try {
        const response = await fetch('/api/register', { // Adjust the endpoint as necessary
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Sign up successful!');
            window.location.href = '/login.html'; // Redirect to login page
        } else {
            alert('Sign up failed!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Sign up failed!');
    }
});
