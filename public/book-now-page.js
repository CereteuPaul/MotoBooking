const bookingForm = document.getElementById('book-now-form');
const circuitsList = document.getElementById('circuitsList');
const circuit = document.getElementById('circuitId');
const date = document.getElementById('date');
// const jwt = require('jsonwebtoken');

async function fetchAvailableCircuits() {
    // const token = localStorage.getItem('token');
    // console.log('decode 11111111', jwt.decode(token));
    try {
        const response = await fetch('/circuits');
        const data = await response.json();

        const today = new Date();

        return data.filter(circuit => new Date(circuit.NextRaceDate) > today);


    } catch (err) {
        console.error(err);
        return [];
    }
}

async function populateCircuitsList() {
    const circuits = await fetchAvailableCircuits();

    console.log('circuits', circuits);

    circuits.forEach(circuit => {
        const listItem = document.createElement('li');

        listItem.innerHTML = `
<h3>${circuit.CircuitName}</h3>
<p>Country: ${circuit.Country}</p>
<p>Next Race Date: ${new Date(circuit.NextRaceDate).toLocaleDateString()}</p>
`;
        circuitsList.appendChild(listItem);

        const option = document.createElement('option');
        option.value = circuit.CircuitID;
        option.text = circuit.CircuitName;
        document.getElementById('circuitId').appendChild(option);
    });

    circuit.addEventListener('change', () => {
        const selectedCircuit = circuits.find((c) => {
            return c.CircuitID === Number(circuit.value)
        });
        console.log('selected circuit', selectedCircuit);
        date.value = selectedCircuit.NextRaceDate.split('T')[0];
    })
}

async function bookNow(){
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const phoneNumber = document.getElementById('phoneNumber');
    const email = document.getElementById('email');
    const riderNumber = document.getElementById('riderNumber');
    const errorMessage = document.getElementById('error-message');

    const bookNowBtn = document.getElementById('book-now-create-btn');

    bookNowBtn.onclick = async (e) => {
        e.preventDefault();
        const newReservation = {
            FirstName: firstName.value ?? "",
            LastName: lastName.value?? "",
            PhoneNumber: phoneNumber.value?? "",
            Email: email.value?? "",
            RiderNumber: riderNumber.value?? "",
            CircuitID: circuit.value?? "",
            Date: date.value ?? ""
        };

        try {
            const response = await fetch('/book-now', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newReservation)
            });
            window.location = '/my-reservations';
            if (!response.ok) {
                errorMessage.textContent = response.message;
                errorMessage.style.display = 'block';
            } else {
                errorMessage.style.display = 'none';
                // window.location = '/my-reservations';
            }
        } catch (error) {
            console.error("Error creating a reservation", error)
        }

    }

}

bookNow();

populateCircuitsList();