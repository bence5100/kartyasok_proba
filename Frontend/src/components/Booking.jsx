import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const { movieId, time } = location.state || {};

  // --- ÁLLAPOTOK (STATE) ---
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // Fizetéshez tartozó állapotok
  const [paymentType, setPaymentType] = useState("");
  const [ticketType, setTicketType] = useState("full price");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  if (!movieId || !time) return <h1>Hiányzó adat</h1>;

  const toggleSeat = (seatNumber) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  // 🔥 1. FOGLALÁS LÉTREHOZÁSA
  const createBooking = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.id;

    if (!userId) {
      throw new Error("Nem található a felhasználó ID-ja! Jelentkezz be újra.");
    }

    const res = await fetch(`http://localhost:8000/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        movieId: movieId,
        time: time,
        seats: selectedSeats,
        userId: userId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Backend hiba a foglalásnál:", errorData);
      throw new Error(errorData.detail || "Hiba a foglalás létrehozásakor");
    }

    const data = await res.json();

    return data.booking_ids;
  };

  // 🔥 2. CHECKOUT
  const checkout = async (id) => {
    const res = await fetch(
      `http://localhost:8000/payment/checkout/${id}?ticket_type=${encodeURIComponent(
        ticketType
      )}`,
      { method: "POST" }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Hiba az ár kalkulációjakor");
    }

    const data = await res.json();
    console.log("Végleges ár:", data.final_price);
    return data;
  };

  // 🔥 3. FIZETÉS FELDOLGOZÁSA
  const processPayment = async (id) => {
    let url = "";

    if (paymentType === "card") {
      url = `http://localhost:8000/payment/simulate-card/${id}?card_number=${encodeURIComponent(
        cardNumber
      )}`;
    } else if (paymentType === "cash") {
      url = `http://localhost:8000/payment/initiate-cash/${id}`;
    } else {
      throw new Error("Nincs kiválasztva fizetési mód.");
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.detail || "Fizetési hiba történt");
    }

    return await res.json();
  };

  // 🔥 4. VERIFY
  const verify = async (id) => {
    const res = await fetch(`http://localhost:8000/payment/verify/${id}`, {
      method: "POST",
    });

    if (!res.ok) {
      console.warn("Verify végpont hibát dobott, de a fizetés már lement.");
    }
  };

  // 🔥 TELJES FOLYAMAT
  const handleBooking = async () => {
    if (!paymentType) {
      alert("Válassz fizetési módot!");
      return;
    }

    if (paymentType === "card") {
      if (!cardNumber || !cardName || !expiry || !cvc) {
        alert("Tölts ki minden kártyaadatot!");
        return;
      }
    }

    try {
      // 1. Foglalás
      const ids = await createBooking();
      setBookingId(ids);

      let lastPaymentResult = null;

      for (const id of ids) {
        await checkout(id);
        lastPaymentResult = await processPayment(id);

        // Csak kártyás fizetésnél futtatjuk a verify-t
        if (paymentType === "card") {
          await verify(id);
        }
      }

      // Siker üzenetek
      if (paymentType === "card") {
        alert(
          `Sikeres kártyás fizetés!\nJegy kód: ${lastPaymentResult?.ticket_key || "N/A"
          }`
        );
      } else {
        alert("Készpénzes fizetés rögzítve! Kérjük, fizesse ki a pénztárnál.");
      }

      setShowPayment(false);
      navigate("/my-bookings");
    } catch (err) {
      console.error(err);
      alert(err.message);
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
          {Array.from({ length: 40 }).map((_, i) => {
            const seatNumber = i + 1;

            return (
              <div
                key={seatNumber}
                className={`seat ${selectedSeats.includes(seatNumber) ? "selected" : ""
                  }`}
                onClick={() => toggleSeat(seatNumber)}
              >
                {seatNumber}
              </div>
            );
          })}
        </div>

        <button className="btn-primary" onClick={openPayment}>
          Foglalás
        </button>
      </section>

      {/* 🔥 MODAL */}
      {showPayment && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowPayment(false)}>
              &times;
            </span>

            <h2>Fizetés</h2>

            {/* Jegytípus választó */}
            <div style={{ marginBottom: "15px" }}>
              <label>Jegytípus: </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
              >
                <option value="full price">Teljes árú</option>
                <option value="student">Diák</option>
                <option value="senior">Nyugdíjas</option>
                <option value="child">Gyerek</option>
              </select>
            </div>

            <button
              onClick={() => setPaymentType("cash")}
              className={paymentType === "cash" ? "selected-btn" : ""}
            >
              💵 Készpénz
            </button>

            <button
              onClick={() => setPaymentType("card")}
              className={paymentType === "card" ? "selected-btn" : ""}
            >
              💳 Bankkártya
            </button>

            {/* 🔥 KÁRTYA FORM */}
            {paymentType === "card" && (
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <input
                  placeholder="Kártyaszám (Páros = Siker)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                />
                <input
                  placeholder="Kártyatulajdonos neve"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
                <input
                  placeholder="Lejárat (MM/YY)"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
                <input
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  maxLength={3}
                />
              </div>
            )}

            <button
              onClick={handleBooking}
              style={{
                marginTop: "20px",
                background: "#4CAF50",
                color: "white",
              }}
            >
              Véglegesítés
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;