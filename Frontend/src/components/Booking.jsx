import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const { movieId, time } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  if (!movieId || !time) return <h1>Hiányzó adat</h1>;

  const toggleSeat = (i) => {
    setSelectedSeats(prev =>
      prev.includes(i) ? prev.filter(s => s !== i) : [...prev, i]
    );
  };

  // 🔥 FOGLALÁS FUNKCIÓ
  const handleBooking = async () => {
    if (!isLoggedIn) {
      alert("Először jelentkezz be!");
      navigate("/");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Válassz helyet!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          movieId: movie.id,
          time: selectedTime,
          seats: selectedSeats,
          userId: loggedInUser.id
        })
      });

      if (!res.ok) throw new Error();

      alert("Foglalás sikeres!");
      navigate("/my-bookings");

    } catch {
      alert("Hiba foglalás közben");
    }
  };

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} />

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

        {/* 🔥 FOGLALÁS GOMB */}
        <button className="btn-primary" onClick={handleBooking}>
          Foglalás
        </button>
      </section>
    </div>
  );
}

export default Booking;