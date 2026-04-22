function openLogin() {
    document.getElementById('loginModal').style.display = 'flex';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

function login(event) {
    event.preventDefault();
    window.location.reload();
}

function openMovie(movie) {
    localStorage.setItem('movie', movie);
    window.location.href = 'movies.html';
}

if (window.location.pathname.includes('movies.html')) {
    const movie = localStorage.getItem('movie');

    const title = document.getElementById('movieTitle');
    const desc = document.getElementById('movieDesc');
    const timesDiv = document.getElementById('times');

    if (movie === 'avatar') {
        title.innerText = 'Avatar 2';
        desc.innerText = 'Egy epikus sci-fi kaland Pandora világában.';
        createTimes(['18:00','21:00']);
    }

    if (movie === 'oppenheimer') {
        title.innerText = 'Oppenheimer';
        desc.innerText = 'A modern atombomba története.';
        createTimes(['17:00','20:00']);
    }

    function createTimes(times) {
        times.forEach(t => {
            const btn = document.createElement('button');
            btn.innerText = t;
            btn.onclick = () => {
                localStorage.setItem('time', t);
                window.location.href = 'booking.html';
            };
            timesDiv.appendChild(btn);
        });
    }
}

if (window.location.pathname.includes('booking.html')) {
    const movie = localStorage.getItem('movie');
    const time = localStorage.getItem('time');

    document.getElementById('selectedMovie').innerText = movie + ' - ' + time;

    const seatsContainer = document.getElementById('seats');
    seatsContainer.innerHTML = "";

    const rows = 8;
    const cols = 8;

    // korábban lefoglalt helyek (mentés)
    let bookedSeats = JSON.parse(localStorage.getItem('bookedSeats')) || [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {

            const seat = document.createElement('div');
            seat.classList.add('seat');

            const seatId = r + "-" + c;

            // ha már foglalt
            if (bookedSeats.includes(seatId)) {
                seat.classList.add('booked');
            }

            seat.onclick = () => {
                if (seat.classList.contains('booked')) return;

                seat.classList.toggle('selected');
            };

            seatsContainer.appendChild(seat);
        }
    }
}

function confirmBooking() {
    const selectedSeats = document.querySelectorAll('.seat.selected');

    let bookedSeats = JSON.parse(localStorage.getItem('bookedSeats')) || [];

    selectedSeats.forEach(seat => {
        const index = Array.from(seat.parentNode.children).indexOf(seat);
        const row = Math.floor(index / 8);
        const col = index % 8;

        const seatId = row + "-" + col;
        bookedSeats.push(seatId);
    });

    localStorage.setItem('bookedSeats', JSON.stringify(bookedSeats));

    alert('Foglalás sikeres!');
    window.location.reload();
}

function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('modalTitle').innerText = 'Regisztráció';
}

function showLogin() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('modalTitle').innerText = 'Bejelentkezés';
}

function register(event) {
    event.preventDefault();

    const pass = document.getElementById('regPass').value;
    const pass2 = document.getElementById('regPass2').value;

    if (pass !== pass2) {
        alert('A jelszavak nem egyeznek!');
        return;
    }

    alert('Sikeres regisztráció!');
    showLogin();
}