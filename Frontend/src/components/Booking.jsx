import { useLocation } from "react-router-dom";
import { useState } from "react";

function Booking() {
  const location = useLocation();
  const { movie, time } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (index) => {
    if (selectedSeats.includes(index)) {
      setSelectedSeats(selectedSeats.filter(s => s !== index));
    } else {
      setSelectedSeats([...selectedSeats, index]);
    }
  };

  const confirmBooking = () => {
    alert(`Foglalva: ${movie} - ${time}\nHelyek: ${selectedSeats.join(", ")}`);
  };

  return (
    <div>
      <header className="navbar">
        <div className="logo">MOZI</div>
      </header>

      <section className="content">
        <h1 className="section-title">Helyfoglalás</h1>

        <p>{movie} - {time}</p>

        <div className="seats">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={`seat ${selectedSeats.includes(i) ? "selected" : ""}`}
              onClick={() => toggleSeat(i)}
            >
              {i + 1}
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={confirmBooking}>
          Foglalás
        </button>
      </section>
    </div>
  );
}

export default Booking;