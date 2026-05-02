import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { QRCodeCanvas } from "qrcode.react";

const API_URL = "http://localhost:8000";

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "null");

      if (!token || !user?.id) {
        setIsLoggedIn(false);
        navigate("/");
        return;
      }

      setIsLoggedIn(true);

      try {
        setLoading(true);
        setErrorMessage("");

        const res = await fetch(`${API_URL}/bookings/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          throw new Error(
            errorData?.detail || "Nem sikerült lekérni a foglalásokat."
          );
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setBookings([]);
        }
      } catch (err) {
        console.error("Foglalások lekérési hiba:", err);
        setErrorMessage(err.message || "Ismeretlen hiba történt.");
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} onLogout={logout} />

      <section className="content">
        <h1>Foglalásaim</h1>

        {loading && <p>Foglalások betöltése...</p>}

        {!loading && errorMessage && (
          <p style={{ color: "#ff6b6b" }}>{errorMessage}</p>
        )}

        {!loading && !errorMessage && bookings.length === 0 && (
          <p>Nincs foglalás</p>
        )}

        {!loading &&
          !errorMessage &&
          bookings.map((b) => (
            <div key={b.id} className="movie card" style={{ marginBottom: "20px" }}>
              <h3>{b.movie_title}</h3>

              <p>
                <strong>Időpont:</strong> {b.time}
              </p>

              <p>
                <strong>Hely:</strong> {b.seat_id}
              </p>

              <p>
                <strong>Jegytípus:</strong> {b.ticket_type}
              </p>

              <p>
                <strong>Fizetés:</strong>{" "}
                {b.is_paid ? "Kifizetve" : "Fizetésre vár"}
              </p>

              {b.total_paid !== null && b.total_paid !== undefined && (
                <p>
                  <strong>Fizetett összeg:</strong> {b.total_paid} HUF
                </p>
              )}

              {b.qr_code_content ? (
                <div style={{ marginTop: "15px" }}>
                  <p>
                    <strong>QR-kód:</strong>
                  </p>

                  <div
                    style={{
                      background: "white",
                      padding: "12px",
                      display: "inline-block",
                      borderRadius: "10px",
                    }}
                  >
                    <QRCodeCanvas value={b.qr_code_content} size={150} />
                  </div>

                  <p>
                    <strong>Jegykód:</strong> {b.qr_code_content}
                  </p>
                </div>
              ) : (
                <p style={{ color: "#ffd166" }}>
                  QR-kód még nincs. Készpénzes fizetésnél az admin/pénztáros
                  jóváhagyása után jön létre.
                </p>
              )}
            </div>
          ))}
      </section>
    </div>
  );
}

export default UserBookings;