// circuits.js

async function fetchCircuits() {
    try {
        const response = await fetch('/circuits');
        const circuits = await response.json();
        displayCircuits(circuits);
    } catch (error) {
        console.error('Error fetching circuits:', error.message);
    }
}

function displayCircuits(circuits) {
    const circuitsContainer = document.querySelector('.circuits-container');
    circuitsContainer.innerHTML = '';

    circuits.forEach(circuit => {
        const card = document.createElement('div');
        card.classList.add('circuit-card');

        const CircuitPhoto = document.createElement('img');
        CircuitPhoto.src = circuit.CircuitPhoto;
        CircuitPhoto.alt = circuit.name;
        card.appendChild(CircuitPhoto);

        const name = document.createElement('h3');
        name.textContent = circuit.CircuitName;
        card.appendChild(name);

        const country = document.createElement('p');
        country.textContent = `Country: ${circuit.Country}`;
        card.appendChild(country);

        const Length = document.createElement('p');
        Length.textContent = `Length: ${circuit.Length} km`;
        card.appendChild(Length);

        const NextRaceDate = document.createElement('p');
        // Parse the NextRaceDate string to Date object
        const dateObj = new Date(circuit.NextRaceDate);
        // Format the date to YYYY-MM-DD
        const formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
        NextRaceDate.textContent = `Next race date: ${formattedDate}`;
        card.appendChild(NextRaceDate);

        const deleteBtn = createButton('Delete', 'delete-btn');
        const updateBtn = createButton('Update', 'update-btn');
        const infoBtn = createButton('See More Info', 'info-btn');

        // Add event listener to infoBtn
        infoBtn.addEventListener('click', () => showMoreInfo(circuit.CircuitID));
        deleteBtn.addEventListener('click', () => deleteCircuit(circuit.CircuitID));
        updateBtn.addEventListener('click', () => updateCircuit(circuit.CircuitID));

        card.appendChild(deleteBtn);
        card.appendChild(updateBtn);
        card.appendChild(infoBtn);

        circuitsContainer.appendChild(card);
    });

    document.getElementById('circuits-section').style.display = 'block';
}

function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className);
    return button;
}

async function deleteCircuit(circuitId) {
    try {
        const response = await fetch(`/circuits/${circuitId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            console.log(`Circuit with ID ${circuitId} deleted successfully`);
            fetchCircuits(); // Refresh the list of circuits
        } else {
            console.error('Failed to delete circuit:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting circuit:', error.message);
    }
}

function updateCircuit(circuitId) {
    const modal = document.getElementById('updateDateModal');
    const nextRaceDateInput = document.getElementById('nextRaceDate');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    modal.style.display = 'block';

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };


    saveBtn.onclick = async () => {
        const newDate = nextRaceDateInput.value;
        try {
            const response = await fetch(`/circuits/${circuitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ NextRaceDate: newDate })
            });
            if (response.ok) {
                console.log(`Next race date for circuit with ID ${circuitId} updated successfully`);
                fetchCircuits(); // Refresh the list of circuits
                modal.style.display = 'none';
            } else {
                console.error('Failed to update next race date:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating next race date:', error.message);
        }
    };
}

async function addCircuitButton() {
    const addCircuitModal = document.getElementById('addCircuitModal');
    const name = document.getElementById('circuitName');
    const country = document.getElementById('country');
    const circuitPhoto = document.getElementById('circuitPhoto');
    const length = document.getElementById('length');
    const createNextRaceDate = document.getElementById('createNextRaceDate');
    const closeAddCircuitBtn = document.getElementById('closeAddCircuitBtn');
    const saveCircuitBtn = document.getElementById('saveCircuitBtn');

    addCircuitModal.style.display = 'block';

    closeAddCircuitBtn.onclick = () => {
        addCircuitModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == addCircuitModal) {
            addCircuitModal.style.display = 'none';
        }
    };

    saveCircuitBtn.onclick = async () => {
        console.log('nextRaceDate', createNextRaceDate.value);
        const newCircuit = {
            CircuitName: name.value,
            Country: country.value,
            CircuitPhoto: circuitPhoto.value,
            Length: length.value,
            NextRaceDate: createNextRaceDate.value
        };

        try {
            const response = await fetch('/circuits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newCircuit)
            });

            if (response.ok) {
                console.log('New circuit added successfully');
                fetchCircuits();
                addCircuitModal.style.display = 'none';
            } else {
                console.error('Failed to add new circuit:', response.statusText);
            }
        } catch (error) {
            console.error('Error adding new circuit:', error.message);
        }
    };
}

async function showMoreInfo(circuitId) {
    console.log(`Fetching info for circuitId: ${circuitId}`); // Debugging line

    const infoModal = document.getElementById('circuitInfoModal');
    const weatherEl = document.getElementById('weather');
    const conditionsEl = document.getElementById('conditions');
    const pitSpeedLimitEl = document.getElementById('pitSpeedLimit');
    const groupsEl = document.getElementById('groups');
    const countEl = document.getElementById('count');
    const closeInfoBtn = document.getElementById('closeInfoBtn');
    const closeSpan = document.querySelector('.close-info');
    infoModal.style.display = 'block';

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

    try {
        const response = await fetch(`/circuit-info/${circuitId}`);
        const info = await response.json();

        weatherEl.textContent = `Weather: ${info.Weather}`;
        conditionsEl.textContent = `Conditions: ${info.Conditions}`;
        pitSpeedLimitEl.textContent = `Pit Speed Limit: ${info.PitSpeedLimit} km/h`;
        groupsEl.textContent = `Marshalls Groups: ${info.Groups}`;
        countEl.textContent = `Marshalls Count: ${info.Count}`;

    } catch (error) {
        console.error('Error fetching circuit info:', error.message);
    }
}

document.getElementById('addCircuitBtn').addEventListener('click', addCircuitButton);

window.onload = fetchCircuits;