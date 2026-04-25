import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

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

  // 🎟️ FOGLALÁS + PAYMENT + QR
  const confirmBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Válassz ki legalább egy helyet!");
      return;
    }

    try {
      // 1️⃣ BOOKING
      const res = await fetch("http://localhost:8000/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          movieId: Number(movieId),
          time: time,
          seats: selectedSeats
        })
      });

      const bookingData = await res.json();

      if (!res.ok) {
        throw new Error("Foglalás sikertelen");
      }

      // 2️⃣ PAYMENT VERIFY
      const verifyRes = await fetch(
        `http://localhost:8000/payment/verify/${bookingData.booking_id}`,
        { method: "POST" }
      );

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error("Fizetés ellenőrzés sikertelen");
      }

      // 3️⃣ QR KEY MENTÉS
      if (verifyData.qr_code_key) {
        localStorage.setItem("qr", verifyData.qr_code_key);
      }

      alert("Foglalás sikeres!");

      // 4️⃣ NAVIGATE USER OLDALRA
      navigate("/my-bookings");

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