import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const { movieId, time } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 🔥 NEW: payment modal state
  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("");

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

  // 🔥 FOGLALÁS FUNKCIÓ (MÓDOSÍTVA: paymentType is megy)
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

    if (!paymentType) {
      alert("Válassz fizetési módot!");
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
<<<<<<< HEAD
          movieId: movie.id,
          time: selectedTime,
          seats: selectedSeats,
          userId: loggedInUser.id
=======
          movieId,
          time,
          seats: selectedSeats,
          payment_type: paymentType // 🔥 ÚJ
>>>>>>> 1008ca38fab0446f76e598b3b5b865b67274e744
        })
      });

      if (!res.ok) throw new Error();

      alert("Foglalás sikeres!");
      setShowPayment(false);
      navigate("/my-bookings");

    } catch {
      alert("Hiba foglalás közben");
    }
  };

  // 🔥 NEW: megnyitja a payment modalt
  const openPayment = () => {
    if (!isLoggedIn) {
      alert("Először jelentkezz be!");
      navigate("/");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Válassz helyet!");
      return;
    }

    setShowPayment(true);
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

        {/* 🔥 FOGLALÁS GOMB (MOST MODALT NYIT) */}
        <button className="btn-primary" onClick={openPayment}>
          Foglalás
        </button>
      </section>

      {/* 🔥 PAYMENT MODAL */}
      {showPayment && (
        <div className="modal">
          <div className="modal-content">

            <span className="close" onClick={() => setShowPayment(false)}>
              &times;
            </span>

            <h2>Fizetés</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
              
              <button
                className={`btn-primary ${paymentType === "cash" ? "active" : ""}`}
                onClick={() => setPaymentType("cash")}
              >
                💵 Készpénz
              </button>

              <button
                className={`btn-primary ${paymentType === "card" ? "active" : ""}`}
                onClick={() => setPaymentType("card")}
              >
                💳 Bankkártya
              </button>

              <button
                className="btn-primary"
                onClick={handleBooking}
                style={{ marginTop: "20px" }}
              >
                Fizetés és foglalás
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;