import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Booking() {
  const location = useLocation();
  const { movieId, time } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🪑 FOGLALT HELYEK BETÖLTÉSE
  useEffect(() => {
    if (!movieId || !time) return;

    const loadSeats = async () => {
      try {
        const res = await fetch(`http://localhost:8000/seats/${movieId}/${time}`);

        if (!res.ok) {
          throw new Error("Nem sikerült betölteni a helyeket");
        }

        const data = await res.json();
        setBookedSeats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [movieId, time]);

  // 🧠 SEAT KATTINTÁS
  const toggleSeat = (index) => {
    if (bookedSeats.includes(index)) return;

    setSelectedSeats(prev => 
      prev.includes(index)
        ? prev.filter(s => s !== index)
        : [...prev, index]
    );
  };

  // 🎟️ FOGLALÁS
  const confirmBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Válassz ki legalább egy helyet!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/booking", {
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

      if (!res.ok) {
        throw new Error("Foglalás sikertelen");
      }

      alert("Foglalás sikeres!");
      setSelectedSeats([]);

    } catch (err) {
      alert(err.message);
    }
  };

  // ⚠️ ha nincs adat (pl refresh)
  if (!movieId || !time) {
    return <h1>Hiányzó adatok</h1>;
  }

  if (loading) return <h1>Betöltés...</h1>;
  if (error) return <h1>{error}</h1>;

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