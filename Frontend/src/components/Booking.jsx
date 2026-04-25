import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

function Booking() {
  const location = useLocation();
  const { movieId, time } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);

  if (!movieId || !time) return <h1>Hiányzó adat</h1>;

  const toggleSeat = (i) => {
    setSelectedSeats(prev =>
      prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]
    );
  };

  return (
    <div>
      <Navbar />

      <section className="content">
        <h1>Helyfoglalás</h1>

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
      </section>
    </div>
  );
}

export default Booking;