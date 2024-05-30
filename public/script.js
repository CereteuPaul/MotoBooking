// Function to handle form submission
function handleSubmit(event) {
    event.preventDefault(); // Prevent form submission to reload the page

    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

}

// Event listener for form submission
document.getElementById('contact-form').addEventListener('submit', handleSubmit);


