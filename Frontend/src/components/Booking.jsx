import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const { movieId, time } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("");

  const [bookingId, setBookingId] = useState(null);

  // 🔥 NEW: card adatok
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

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

  // 🔥 1. BOOKING
  const createBooking = async () => {
    const res = await fetch("http://localhost:8000/booking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        movieId,
        time,
        seats: selectedSeats
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error();
    return data.booking_id;
  };

  // 🔥 2. CHECKOUT
  const checkout = async (bookingId) => {
    const res = await fetch(`http://localhost:8000/payment/checkout/${bookingId}`, {
      method: "POST"
    });

    return await res.json();
  };

  // 🔥 3. FIZETÉS
  const pay = async (bookingId) => {
    const res = await fetch(`http://localhost:8000/payment/pay/${bookingId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        payment_type: paymentType
      })
    });

    return await res.json();
  };

  // 🔥 4. VERIFY
  const verify = async (bookingId) => {
    await fetch(`http://localhost:8000/payment/verify/${bookingId}`, {
      method: "POST"
    });
  };

  // 🔥 FULL FLOW
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

    // 🔥 CARD VALIDÁCIÓ
    if (paymentType === "card") {
      if (!cardNumber || !cardName || !expiry || !cvc) {
        alert("Tölts ki minden kártyaadatot!");
        return;
      }
    }

    try {
      const id = await createBooking();
      setBookingId(id);

      await checkout(id);

      const payRes = await pay(id);

      if (paymentType === "card") {
        alert(`Kártyás fizetés OK\nTicket: ${payRes.ticket_key}`);
      } else {
        alert("Készpénzes fizetés rögzítve!");
      }

      await verify(id);

      alert("Foglalás véglegesítve!");
      setShowPayment(false);
      navigate("/my-bookings");

    } catch (err) {
      console.error(err);
      alert("Hiba a folyamatban");
    }
  };

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

        <button className="btn-primary" onClick={openPayment}>
          Foglalás
        </button>
      </section>

      {showPayment && (
        <div className="modal">
          <div className="modal-content">

            <span className="close" onClick={() => setShowPayment(false)}>
              &times;
            </span>

            <h2>Fizetés</h2>

            <button onClick={() => setPaymentType("cash")}>
              💵 Készpénz
            </button>

            <button onClick={() => setPaymentType("card")}>
              💳 Bankkártya
            </button>

            {/* 🔥 CARD FORM */}
            {paymentType === "card" && (
              <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                
                <input
                  placeholder="Kártyaszám"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  maxLength={16}
                />

                <input
                  placeholder="Kártyatulajdonos neve"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                />

                <input
                  placeholder="Lejárat (MM/YY)"
                  value={expiry}
                  onChange={e => setExpiry(e.target.value)}
                />

                <input
                  placeholder="CVC"
                  value={cvc}
                  onChange={e => setCvc(e.target.value)}
                  maxLength={3}
                />

              </div>
            )}

            <button onClick={handleBooking} style={{ marginTop: "15px" }}>
              Fizetés és foglalás
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;