let reservations = [];
async function fetchMyReservations() {
    const token = localStorage.getItem('token');
    if (token) {
        const email = jwt_decode(token).email;
        const response = await fetch(`/my-reservations/${email}`);
        reservations =  await response.json();

        reservations.forEach(async (reservation) => {
            await fetchCircuitInfo(reservation.CircuitID, reservation).then(() => {
                displayReservations(reservations);
            });
        });

        if(reservations.length === 0) {
            const section = document.getElementById('reservations-section');
            section.style = 'display: flex; flex-direction: column; align-items: center; height: 650px';
            const bookNowButton = document.getElementById('book-now-btn');
            bookNowButton.style.display = 'block';
            const message = document.getElementById("no-reservations-container");
            message.textContent = 'You don`t have any available reservations at the moment. Visit our Book Now Page to create one!';
        }

    } else {
        console.error('No token found in localStorage');
    }
}

function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className);
    return button;
}

function displayReservations(reservations) {
    const reservationsContainer = document.querySelector('.my-reservations-container');
    reservationsContainer.innerHTML = '';

    if(reservations.length === 0) {
        reservationsContainer.innerHTML = '';
    }

    if(reservations.length > 0) {
        reservations.forEach(reservation => {
        console.log("!!!", reservation);
        const reservationCard = document.createElement('div');
        reservationCard.classList.add('reservation-card');

        const photo = document.createElement('img');
        photo.src = `${reservation.circuitInfo?.CircuitPhoto}`;

        const emailElement = document.createElement('p');
        emailElement.textContent = `Email: ${reservation.Email}`;

        const riderName = document.createElement('p');
        riderName.textContent = `Full Name: ${reservation.FirstName} ${reservation.LastName}`;

        const riderNumber = document.createElement('p');
        riderNumber.textContent = `Rider Number: ${reservation.RiderNumber}`;

        const dateElement = document.createElement('p');
        dateElement.textContent = `Date: ${reservation.Date}`;

        const circuitElement = document.createElement('p');
        circuitElement.textContent = `Circuit ID: ${reservation.CircuitID}`;

        const circuitName = document.createElement('p');
        circuitName.textContent = `Circuit Name: ${reservation.circuitInfo?.CircuitName}`;

        const country = document.createElement('p');
        country.textContent = `Country: ${reservation.circuitInfo?.Country}`;

        const length = document.createElement('p');
        length.textContent = `Length: ${reservation.circuitInfo?.Length}`;

        const pitSpeedLimit = document.createElement('p');
        pitSpeedLimit.textContent = `Pit Speed Limit: ${reservation.circuitInfo?.PitSpeedLimit}`;

        const deleteBtn = createButton('Delete', 'delete-btn');

        deleteBtn.addEventListener('click', () => deleteReservation(reservation.RiderNumber));

        reservationCard.appendChild(photo);
        reservationCard.appendChild(emailElement);
        reservationCard.appendChild(riderName);
        reservationCard.appendChild(riderNumber);
        reservationCard.appendChild(dateElement);
        reservationCard.appendChild(circuitElement);
        reservationCard.appendChild(circuitName);
        reservationCard.appendChild(country);
        reservationCard.appendChild(length);
        reservationCard.appendChild(pitSpeedLimit);

        reservationCard.appendChild(deleteBtn);

        reservationsContainer.appendChild(reservationCard);
    });
    }

}

async function fetchCircuitInfo(circuitId, reservation) {
    const response = await fetch(`/circuit-info/${circuitId}`);
    const circuitInfo = await response.json();
    reservation.circuitInfo = circuitInfo;
}

async function deleteReservation(riderNumber) {
    try {
        const response = await fetch(`/reservations/${riderNumber}`, {method: 'DELETE'});
        if(response.ok) {
            console.log('Reservation was successfully deleted');
            window.location.reload();
            fetchMyReservations();
        }
    } catch(e) {
        console.error(e);
    }

}

window.onload = fetchMyReservations;
