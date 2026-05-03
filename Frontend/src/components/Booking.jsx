import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

const API_URL = "http://localhost:8000";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();

  const { movieId, time } = location.state || {};

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [takenSeats, setTakenSeats] = useState([]);
  const [room, setRoom] = useState(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [paymentType, setPaymentType] = useState("");
  const [ticketType, setTicketType] = useState("full price");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    const loadBookingLayout = async () => {
      if (!movieId || !time) return;

      try {
        setLoadingSeats(true);

        const res = await fetch(
          `${API_URL}/booking-layout/${movieId}/${encodeURIComponent(time)}`
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.detail || "Nem sikerült lekérni a terem adatait."
          );
        }

        const data = await res.json();

        setRoom(data.room);
        setTakenSeats(Array.isArray(data.taken_seats) ? data.taken_seats : []);
      } catch (err) {
        console.error("Terem/szék lekérési hiba:", err);
        alert(err.message);
      } finally {
        setLoadingSeats(false);
      }
    };

    loadBookingLayout();
  }, [movieId, time]);

  if (!movieId || !time) {
    return (
      <div>
        <Navbar isLoggedIn={isLoggedIn} />
        <section className="content">
          <h1>Hiányzó foglalási adat</h1>
          <p>Menj vissza a film oldalára, és válassz vetítési időpontot.</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Vissza a főoldalra
          </button>
        </section>
      </div>
    );
  }

  const toggleSeat = (seatNumber) => {
    if (takenSeats.includes(seatNumber)) return;

    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((seat) => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const openPayment = () => {
    if (!isLoggedIn) {
      alert("Először jelentkezz be!");
      navigate("/");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Válassz legalább egy helyet!");
      return;
    }

    setShowPayment(true);
  };

  const createBooking = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (!user?.id || !token) {
      throw new Error("Nem található a felhasználó. Jelentkezz be újra.");
    }

    const res = await fetch(`${API_URL}/booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        movieId,
        time,
        seats: selectedSeats,
        userId: user.id,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(
        errorData?.detail || "Hiba történt a foglalás létrehozásakor."
      );
    }

    const data = await res.json();

    if (!Array.isArray(data.booking_ids) || data.booking_ids.length === 0) {
      throw new Error("A backend nem adott vissza foglalási azonosítót.");
    }

    return data.booking_ids;
  };

  const checkout = async (bookingId) => {
    const res = await fetch(
      `${API_URL}/payment/checkout/${bookingId}?ticket_type=${encodeURIComponent(
        ticketType
      )}`,
      {
        method: "POST",
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Hiba történt az ár kiszámításakor.");
    }

    return await res.json();
  };

  const payWithCard = async (bookingId) => {
    const res = await fetch(
      `${API_URL}/payment/simulate-card/${bookingId}?card_number=${encodeURIComponent(
        cardNumber
      )}`,
      {
        method: "POST",
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Sikertelen kártyás fizetés.");
    }

    return await res.json();
  };

  const payWithCash = async (bookingId) => {
    const res = await fetch(`${API_URL}/payment/initiate-cash/${bookingId}`, {
      method: "POST",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.detail || "Sikertelen készpénzes foglalás.");
    }

    return await res.json();
  };

  const validatePaymentForm = () => {
    if (!paymentType) {
      alert("Válassz fizetési módot!");
      return false;
    }

    if (paymentType === "card") {
      if (!cardNumber.trim() || !cardName.trim() || !expiry.trim() || !cvc.trim()) {
        alert("Tölts ki minden kártyaadatot!");
        return false;
      }

      const cleanCardNumber = cardNumber.replaceAll(" ", "");

      if (!/^\d+$/.test(cleanCardNumber)) {
        alert("A kártyaszám csak számokat tartalmazhat!");
        return false;
      }

      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        alert("A kártyaszám 13 és 19 számjegy között legyen!");
        return false;
      }
    }

    return true;
  };

  const handleBooking = async () => {
    if (!validatePaymentForm()) return;

    try {
      setSubmitting(true);

      const bookingIds = await createBooking();

      let lastPaymentResult = null;
      let totalPrice = 0;

      for (const id of bookingIds) {
        const checkoutResult = await checkout(id);
        totalPrice += Number(checkoutResult.final_price || 0);

        if (paymentType === "card") {
          lastPaymentResult = await payWithCard(id);
        }

        if (paymentType === "cash") {
          lastPaymentResult = await payWithCash(id);
        }
      }

      if (paymentType === "card") {
        alert(
          `Sikeres kártyás fizetés!\nÖsszeg: ${totalPrice} HUF\nJegykód: ${
            lastPaymentResult?.ticket_key || "N/A"
          }`
        );
      } else {
        alert(
          `Foglalás rögzítve!\nFizetendő összeg: ${totalPrice} HUF\nKérjük, fizesd ki a pénztárnál.`
        );
      }

      setShowPayment(false);
      setSelectedSeats([]);
      navigate("/my-bookings");
    } catch (err) {
      console.error("Foglalási/fizetési hiba:", err);
      alert(err.message || "Ismeretlen hiba történt.");
    } finally {
      setSubmitting(false);
    }
  };

  const seatCount = room?.capacity || 0;
  const columnCount = room?.cols || 8;

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} />

      <section className="content">
        <h1>Helyfoglalás</h1>

        <p>Vetítés időpontja: {time}</p>

        {room && (
          <p>
            Terem: {room.name} | Sorok: {room.rows} | Oszlopok: {room.cols} |
            Férőhely: {room.capacity}
          </p>
        )}

        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <span style={{ marginRight: "20px" }}>⬛ Szabad</span>
          <span style={{ marginRight: "20px" }}>🟦 Kiválasztva</span>
          <span>🟥 Foglalt</span>
        </div>

        {loadingSeats ? (
          <p>Terem és foglalt székek betöltése...</p>
        ) : (
          <div
            className="seats"
            style={{
              gridTemplateColumns: `repeat(${columnCount}, 50px)`,
            }}
          >
            {Array.from({ length: seatCount }).map((_, index) => {
              const seatNumber = index + 1;
              const isSelected = selectedSeats.includes(seatNumber);
              const isTaken = takenSeats.includes(seatNumber);

              return (
                <div
                  key={seatNumber}
                  className={`seat ${isSelected ? "selected" : ""} ${
                    isTaken ? "booked" : ""
                  }`}
                  onClick={() => toggleSeat(seatNumber)}
                  title={isTaken ? "Ez a hely már foglalt" : "Szabad hely"}
                >
                  {seatNumber}
                </div>
              );
            })}
          </div>
        )}

        <p>
          Kiválasztott helyek:{" "}
          {selectedSeats.length > 0 ? selectedSeats.join(", ") : "nincs"}
        </p>

        <button className="btn-primary" onClick={openPayment}>
          Foglalás
        </button>
      </section>

      {showPayment && (
        <div className="modal">
          <div className="modal-content">
            <span
              className="close"
              onClick={() => !submitting && setShowPayment(false)}
            >
              &times;
            </span>

            <h2>Fizetés</h2>

            <p>Helyek: {selectedSeats.join(", ")}</p>

            <div style={{ marginBottom: "15px" }}>
              <label>Jegytípus: </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                disabled={submitting}
              >
                <option value="full price">Teljes árú</option>
                <option value="student">Diák</option>
                <option value="senior">Nyugdíjas</option>
                <option value="child">Gyerek</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              <button
                type="button"
                onClick={() => setPaymentType("cash")}
                className={paymentType === "cash" ? "active-payment" : ""}
                disabled={submitting}
              >
                Készpénz
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("card")}
                className={paymentType === "card" ? "active-payment" : ""}
                disabled={submitting}
              >
                Bankkártya
              </button>
            </div>

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
                  className="payment-input"
                  placeholder="Kártyaszám, páros utolsó számjegy = siker"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  disabled={submitting}
                />

                <input
                  className="payment-input"
                  placeholder="Kártyatulajdonos neve"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  disabled={submitting}
                />

                <input
                  className="payment-input"
                  placeholder="Lejárat, pl. 12/28"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  disabled={submitting}
                />

                <input
                  className="payment-input"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  maxLength={3}
                  disabled={submitting}
                />
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleBooking}
              disabled={submitting}
              style={{ marginTop: "20px" }}
            >
              {submitting ? "Feldolgozás..." : "Véglegesítés"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Booking;