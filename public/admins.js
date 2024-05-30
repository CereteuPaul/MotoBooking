// admins.js

async function fetchAdmins() {
    try {
        const response = await fetch('/users'); // Adjust the endpoint as necessary
        const admins = await response.json();
        displayAdmins(admins);
    } catch (error) {
        console.error('Error fetching admins:', error.message);
    }
}

function displayAdmins(admins) {
    const adminsContainer = document.querySelector('.admins-container');
    adminsContainer.innerHTML = '';

    admins.forEach(admin => {
        const card = document.createElement('div');
        card.classList.add('admin-card');

        const fullName = document.createElement('h3');
        fullName.textContent = `Name: ${admin.first_name} ${admin.last_name}`;
        card.appendChild(fullName);

        const username = document.createElement('p');
        username.textContent = `Username: ${admin.username}`;
        card.appendChild(username);

        const email = document.createElement('p');
        email.textContent = `Email: ${admin.email}`;
        card.appendChild(email);

        const role = document.createElement('p');
        role.textContent = `Role: ${admin.role}`;
        card.appendChild(role);

        const deleteBtn = createButton('Delete', 'delete-btn');
        const updateBtn = createButton('Update', 'update-btn');

        deleteBtn.addEventListener('click', () => deleteAdmin(admin.admin_id));
        updateBtn.addEventListener('click', () => showUpdateRoleModal(admin));

        card.appendChild(deleteBtn);
        card.appendChild(updateBtn);

        adminsContainer.appendChild(card);
    });
}

function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className);
    return button;
}

async function deleteAdmin(adminId) {
    try {
        const response = await fetch(`/users/${adminId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log(`Admin with ID ${adminId} deleted successfully`);
            fetchAdmins(); // Refresh the list of admins
        } else {
            console.error('Failed to delete admin:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting admin:', error.message);
    }
}

function showUpdateRoleModal(admin) {
    const modal = document.getElementById('updateRoleModal');
    const select = document.getElementById('newRole');

    // Set the current role as the selected option
    select.value = admin.role;

    // Show the modal
    modal.style.display = 'block';

    // Add event listeners to the buttons
    document.getElementById('cancelBtn').addEventListener('click', () => {
        modal.style.display = 'none'; // Hide the modal
    });

    document.getElementById('saveBtn').addEventListener('click', () => {
        const newRole = select.value;
        saveUpdatedRole(admin.admin_id, newRole);
        modal.style.display = 'none'; // Hide the modal after saving
    });
}

// Function to save the updated role of an admin
async function saveUpdatedRole(adminId, newRole) {
    try {
        const response = await fetch(`/users/${adminId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role: newRole })
        });
        if (response.ok) {
            console.log(`Role for admin with ID ${adminId} updated successfully`);
            fetchAdmins(); // Refresh the list of admins
        } else {
            console.error('Failed to update role:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating role:', error.message);
    }
}

window.onload = fetchAdmins;
