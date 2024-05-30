function checkAuthentication() {
    const token = localStorage.getItem('token');


    if (!token) {
        window.location.href = '/login';
    }

    if (token) {
        document.getElementById('logout-btn').style.display = 'block';
    } else {
        document.getElementById('logout-btn').style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

document.getElementById('logout-btn').addEventListener('click', logout);


checkAuthentication();
