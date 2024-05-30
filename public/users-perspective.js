const bookNowBtn = document.getElementById('book-now-btn');
const myreservations= document.getElementById('my-reservations');

myreservations.addEventListener('click', () => {
    window.location.href = '/my-reservations';
})

bookNowBtn.addEventListener('click', () => {
    window.location.href = '/book-now-page';
});