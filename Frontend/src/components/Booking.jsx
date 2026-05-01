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

  const toggleSeat = (i) => {
    setSelectedSeats((prev) =>
      prev.includes(i) ? prev.filter((s) => s !== i) : [...prev, i]
    );
  };

  // 🔥 1. FOGLALÁS LÉTREHOZÁSA (Javítva a duplikáció)
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
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        movieId,
        time,
        seats: selectedSeats,
        userId: userId // <--- Itt küldjük el a JSON-ben
      }),
    });

    if (!res.ok) {
        // Hogy pontosan lássuk a böngésző konzoljában, mi a baja a backendnek:
        const errorData = await res.json();
        console.error("Backend hiba a foglalásnál:", errorData);
        throw new Error("Hiba a foglalás létrehozásakor");
    }
    
    const data = await res.json();
    return data.booking_id; // Visszaadja a létrejött ID-t a fizetéshez
  };

  // 🔥 2. CHECKOUT (Ár és jegytípus rögzítése)
  const checkout = async (id) => {
    const res = await fetch(
      `http://localhost:8000/payment/checkout/${id}?ticket_type=${ticketType}`,
      { method: "POST" }
    );
    if (!res.ok) throw new Error("Hiba az ár kalkulációjakor");
    const data = await res.json();
    console.log("Végleges ár:", data.final_price);
    return data;
  };

  // 🔥 3. FIZETÉS FELDOLGOZÁSA
  const processPayment = async (id) => {
    let url = "";

    if (paymentType === "card") {
      url = `http://localhost:8000/payment/simulate-card/${id}?card_number=${cardNumber}`;
    } else if (paymentType === "cash") {
      url = `http://localhost:8000/payment/initiate-cash/${id}`;
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

  // 🔥 4. VERIFY (Megerősítés)
  const verify = async (id) => {
    const res = await fetch(`http://localhost:8000/payment/verify/${id}`, {
      method: "POST",
    });
    if (!res.ok) console.warn("Verify végpont hibát dobott, de a fizetés már lement.");
  };

  // 🔥 TELJES FOLYAMAT (Gombnyomásra)
  const handleBooking = async () => {
    if (!paymentType) {
      alert("Válassz fizetési módot!");
      return;
    }

    // Kártya validáció
    if (paymentType === "card") {
      if (!cardNumber || !cardName || !expiry || !cvc) {
        alert("Tölts ki minden kártyaadatot!");
        return;
      }
    }

    try {
      // 1. Foglalás
      const id = await createBooking();
      setBookingId(id);

      // 2. Checkout (Ár beállítása)
      await checkout(id);

      // 3. Fizetés
      const payRes = await processPayment(id);

      // 4. Verify (Opcionális, de lefuttatjuk)
      await verify(id);

      // Siker üzenetek
      if (paymentType === "card") {
        alert(`Sikeres kártyás fizetés!\nJegy kód: ${payRes.ticket_key || "N/A"}`);
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
              <select value={ticketType} onChange={(e) => setTicketType(e.target.value)}>
                <option value="full price">Teljes árú</option>
                <option value="student">Diák</option>
                <option value="senior">Nyugdíjas</option>
                <option value="child">Gyerek</option>
              </select>
            </div>

            <button onClick={() => setPaymentType("cash")} className={paymentType === "cash" ? "selected-btn" : ""}>
              💵 Készpénz
            </button>

            <button onClick={() => setPaymentType("card")} className={paymentType === "card" ? "selected-btn" : ""}>
              💳 Bankkártya
            </button>

            {/* 🔥 KÁRTYA FORM */}
            {paymentType === "card" && (
              <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <input
                  placeholder="Kártyaszám (Páros = Siker)"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={16}
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

            <button onClick={handleBooking} style={{ marginTop: "20px", background: "#4CAF50", color: "white" }}>
              Véglegesítés
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;