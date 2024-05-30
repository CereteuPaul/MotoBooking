// reservations.js

async function fetchReservations() {
    try {
        const response = await fetch('/reservations');
        const reservations = await response.json();
        displayReservations(reservations);
    } catch (error) {
        console.error('Error fetching reservations:', error.message);
    }
}

function displayReservations(reservations) {
    const reservationsContainer = document.querySelector('.reservations-container');
    reservationsContainer.innerHTML = '';

    reservations.forEach(reservation => {
        const card = document.createElement('div');
        card.classList.add('reservation-card');

        const fullName = document.createElement('h3');
        fullName.textContent = `Name: ${reservation.FirstName} ${reservation.LastName}`;
        card.appendChild(fullName);

        const phoneNumber = document.createElement('p');
        phoneNumber.textContent = `Phone: ${reservation.PhoneNumber}`;
        card.appendChild(phoneNumber);

        const email = document.createElement('p');
        email.textContent = `Email: ${reservation.Email}`;
        card.appendChild(email);

        const riderNumber = document.createElement('p');
        riderNumber.textContent = `Rider Number: ${reservation.RiderNumber}`;
        card.appendChild(riderNumber);

        const date = document.createElement('p');
        date.textContent = `Date: ${formatDate(reservation.Date)}`;
        card.appendChild(date);

        const circuitId = document.createElement('p');
        circuitId.textContent = `Circuit ID: ${reservation.CircuitID}`;
        card.appendChild(circuitId);

        const deleteBtn = createButton('Delete', 'delete-btn');
        const updateBtn = createButton('Update', 'update-btn');
        const infoBtn = createButton('See More Info', 'info-btn');

        deleteBtn.addEventListener('click', () => deleteReservation(reservation.RiderNumber));
        updateBtn.addEventListener('click', () => updateReservation(reservation.RiderNumber));
        infoBtn.addEventListener('click', () => showMoreInfo(reservation));

        card.appendChild(deleteBtn);
        card.appendChild(updateBtn);
        card.appendChild(infoBtn);

        reservationsContainer.appendChild(card);
    });

    document.getElementById('reservations-section').style.display = 'block';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className);
    return button;
}

async function deleteReservation(email) {
    try {
        const response = await fetch(`/reservations/${email}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log(`Reservation with for ${email} deleted successfully`);
            fetchReservations();
        } else {
            console.error(`Error deleting reservation for ${email}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function updateReservation(email) {
    const modal = document.getElementById('updateReservationModal');
    const updateCircuitInput = document.getElementById('newCircuit');
    const date = document.getElementById('date');
    let availableCircuits = [];

    try {
        const response = await fetch('/circuits');
        const circuits = await response.json();
        const today = new Date();
        availableCircuits = circuits.filter((circuit) => new Date(circuit.NextRaceDate) > today);
        availableCircuits.forEach((circuit) => {
            const option = document.createElement('option');
            option.value = circuit.CircuitID;
            option.text = circuit.CircuitName;
            document.getElementById('newCircuit').appendChild(option);
        })
    } catch (e) {
        console.error('e', e);
    }

    updateCircuitInput.addEventListener('change', (e) => {
        console.log("123123", availableCircuits);
        const selectedCircuit = availableCircuits.find((circuit) => {
            return circuit.CircuitID === Number(e.target.value)
        });
        console.log('selected circuit', selectedCircuit);
        date.value = selectedCircuit.NextRaceDate.split('T')[0];
    })

    modal.style.display = 'block';

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    }

    saveBtn.onclick = async () => {
        const newCircuit = updateCircuitInput.value;

        try{
            const response = await fetch(`/reservations/${email}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({CircuitID: newCircuit})
            });
            if(response.ok){
                console.log(`New circuit input for ${email} updated successfully`);
                fetchReservations();
                modal.style.display = 'none';
            } else {
                console.error('Failed to update new circuit:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating new circuit:', error.message);
        }
    };
}

async function showMoreInfo(reservation) {
    console.log(`Fetching info for reservation: ${reservation.RiderNumber}`);

    const infoModal = document.getElementById('reservationInfoModal');
    const name = document.getElementById('circuitName');
    const country = document.getElementById('circuitCountry');
    const closeInfoBtn = document.getElementById('closeInfoBtn');
    const closeSpan = document.querySelector('.close-info');

    try {
        const response = await fetch(`/reservation-info/${reservation.CircuitID}`);
        const info = await response.json();

        name.textContent = `Circuit Name: ${info.CircuitName}`;
        country.textContent = `Circuit Country: ${info.Country}`;

        infoModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching reservation info: ', error.message);
    }

    closeInfoBtn.onclick = () => {
        infoModal.style.display = 'none';
    };

    closeSpan.onclick = () => {
        infoModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == infoModal) {
            infoModal.style.display = 'none';
        }
    };
}



window.onload = fetchReservations;
