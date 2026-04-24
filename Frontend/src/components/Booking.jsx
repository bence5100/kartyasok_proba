import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Booking() {
  const location = useLocation();

  console.log("STATE:", location.state);

  const { movieId, time } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  // 🪑 FOGLALT HELYEK BETÖLTÉSE
  useEffect(() => {
    if (!movieId || !time) return;

    fetch(`http://localhost:8000/seats/${movieId}/${time}`)
      .then(res => res.json())
      .then(data => setBookedSeats(data))
      .catch(err => console.error(err));
  }, [movieId, time]);

  // 🧠 SEAT KATTINTÁS
  const toggleSeat = (index) => {
    if (bookedSeats.includes(index)) return;

    if (selectedSeats.includes(index)) {
      setSelectedSeats(selectedSeats.filter(s => s !== index));
    } else {
      setSelectedSeats([...selectedSeats, index]);
    }
  };

  // 🎟️ FOGLALÁS
  const confirmBooking = async () => {
    try {
      await fetch("http://localhost:8000/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          movie_id: movieId,
          time: time,
          seats: selectedSeats
        })
      });

      alert("Foglalás sikeres!");
      setSelectedSeats([]);

    } catch (err) {
      console.error(err);
      alert("Hiba történt!");
    }
  };

  // ⚠️ ha nincs adat (pl refresh)
  if (!movieId || !time) {
    return <h1>Hiányzó adatok</h1>;
  }

  return (
    <div>
      <header className="navbar">
        <div className="logo">MOZI</div>
      </header>

      <section className="content">
        <h1 className="section-title">Helyfoglalás</h1>

        <p>{movieId} - {time}</p>

        <div className="seats">
          {Array.from({ length: 100 }).map((_, i) => {
            const isSelected = selectedSeats.includes(i);
            const isBooked = bookedSeats.includes(i);

            return (
              <div
                key={i}
                className={`seat 
                  ${isSelected ? "selected" : ""} 
                  ${isBooked ? "booked" : ""}`}
                onClick={() => toggleSeat(i)}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        <button className="btn-primary" onClick={confirmBooking}>
          Foglalás
        </button>
      </section>
    </div>
  );
}

export default Booking;