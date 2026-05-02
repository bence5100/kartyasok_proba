import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const API_URL = "http://localhost:8000";

function Admin() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editSeat, setEditSeat] = useState("");
  const [editTicketType, setEditTicketType] = useState("full price");

  const getStoredUser = () => {
    return JSON.parse(localStorage.getItem("user") || "null");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/");
  };

  const loadBookings = async () => {
    const token = localStorage.getItem("token");
    const user = getStoredUser();

    if (!token || !user) {
      navigate("/");
      return;
    }

    const userIsAdmin = user?.is_admin === true || user?.username === "admin";

    setIsLoggedIn(true);
    setIsAdmin(userIsAdmin);

    if (!userIsAdmin) {
      setErrorMessage("Nincs admin jogosultságod.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const res = await fetch(`${API_URL}/admin/bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Nem sikerült lekérni az admin foglalásokat."
        );
      }

      const data = await res.json();

      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Admin foglalások lekérési hiba:", err);
      setErrorMessage(err.message || "Ismeretlen hiba történt.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return bookings.filter((booking) => {
      const searchableText = [
        booking.id,
        booking.user,
        booking.movie,
        booking.time,
        booking.seat,
        booking.type,
        booking.payment_method,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(term);

      const isPaid =
        booking.is_paid === true ||
        booking.is_piad === true ||
        booking.paid === true;

      let matchesPayment = true;

      if (paymentFilter === "paid") {
        matchesPayment = isPaid;
      }

      if (paymentFilter === "unpaid") {
        matchesPayment = !isPaid;
      }

      return matchesSearch && matchesPayment;
    });
  }, [bookings, searchTerm, paymentFilter]);

  const stats = useMemo(() => {
    const total = bookings.length;

    const paid = bookings.filter(
      (booking) =>
        booking.is_paid === true ||
        booking.is_piad === true ||
        booking.paid === true
    ).length;

    const unpaid = total - paid;

    const uniqueUsers = new Set(bookings.map((booking) => booking.user)).size;

    return {
      total,
      paid,
      unpaid,
      uniqueUsers,
    };
  }, [bookings]);

  const startEdit = (booking) => {
    setEditingId(booking.id);
    setEditSeat(booking.seat || "");
    setEditTicketType(booking.type || "full price");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditSeat("");
    setEditTicketType("full price");
  };

  const saveBooking = async (bookingId) => {
    const token = localStorage.getItem("token");

    if (!editSeat.trim()) {
      alert("A szék mező nem lehet üres.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/bookings/${bookingId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          seat_id: editSeat,
          ticket_type: editTicketType,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Nem sikerült módosítani a foglalást.");
      }

      await loadBookings();
      cancelEdit();
      alert("Foglalás sikeresen módosítva.");
    } catch (err) {
      console.error("Foglalás módosítási hiba:", err);
      alert(err.message || "Ismeretlen hiba történt.");
    }
  };

  const confirmCashPayment = async (bookingId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/payment/admin/confirm-cash/${bookingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || "Nem sikerült jóváhagyni a készpénzes fizetést."
        );
      }

      await loadBookings();
      alert("Készpénzes fizetés jóváhagyva.");
    } catch (err) {
      console.error("Készpénzes fizetés jóváhagyási hiba:", err);
      alert(err.message || "Ismeretlen hiba történt.");
    }
  };

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={logout} />

      <main className="admin-page">
        <section className="admin-header">
          <div>
            <p className="admin-kicker">Admin felület</p>
            <h1>Foglalások kezelése</h1>
            <p className="admin-subtitle">
              Itt láthatod az összes foglalást, kereshetsz, szűrhetsz és módosíthatod
              a jegyadatokat.
            </p>
          </div>

          <button className="admin-refresh-btn" onClick={loadBookings}>
            Frissítés
          </button>
        </section>

        {errorMessage && (
          <div className="admin-alert">
            {errorMessage}
          </div>
        )}

        <section className="admin-stats">
          <div className="admin-stat-card">
            <span>Összes foglalás</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Kifizetve</span>
            <strong>{stats.paid}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Fizetésre vár</span>
            <strong>{stats.unpaid}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Felhasználók</span>
            <strong>{stats.uniqueUsers}</strong>
          </div>
        </section>

        <section className="admin-toolbar">
          <input
            className="admin-search"
            placeholder="Keresés film, user, időpont, szék alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="admin-select"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">Összes fizetési állapot</option>
            <option value="paid">Csak kifizetett</option>
            <option value="unpaid">Csak fizetésre vár</option>
          </select>
        </section>

        <section className="admin-table-card">
          {loading ? (
            <p className="admin-empty">Foglalások betöltése...</p>
          ) : filteredBookings.length === 0 ? (
            <p className="admin-empty">Nincs megjeleníthető foglalás.</p>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Felhasználó</th>
                    <th>Film</th>
                    <th>Időpont</th>
                    <th>Szék</th>
                    <th>Jegytípus</th>
                    <th>Fizetés</th>
                    <th>Művelet</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => {
                    const isEditing = editingId === booking.id;

                    const isPaid =
                      booking.is_paid === true ||
                      booking.is_piad === true ||
                      booking.paid === true;

                    return (
                      <tr key={booking.id}>
                        <td>#{booking.id}</td>

                        <td>
                          <strong>{booking.user || "Ismeretlen"}</strong>
                        </td>

                        <td>{booking.movie || "N/A"}</td>

                        <td>{booking.time || "N/A"}</td>

                        <td>
                          {isEditing ? (
                            <input
                              className="admin-small-input"
                              value={editSeat}
                              onChange={(e) => setEditSeat(e.target.value)}
                            />
                          ) : (
                            <span className="admin-seat-pill">
                              {booking.seat || "N/A"}
                            </span>
                          )}
                        </td>

                        <td>
                          {isEditing ? (
                            <select
                              className="admin-small-select"
                              value={editTicketType}
                              onChange={(e) => setEditTicketType(e.target.value)}
                            >
                              <option value="full price">Teljes árú</option>
                              <option value="student">Diák</option>
                              <option value="senior">Nyugdíjas</option>
                              <option value="child">Gyerek</option>
                            </select>
                          ) : (
                            booking.type || "N/A"
                          )}
                        </td>

                        <td>
                          {isPaid ? (
                            <span className="admin-status paid">Kifizetve</span>
                          ) : (
                            <span className="admin-status unpaid">
                              Fizetésre vár
                            </span>
                          )}
                        </td>

                        <td>
                          <div className="admin-actions">
                            {isEditing ? (
                              <>
                                <button
                                  className="admin-action-btn save"
                                  onClick={() => saveBooking(booking.id)}
                                >
                                  Mentés
                                </button>

                                <button
                                  className="admin-action-btn cancel"
                                  onClick={cancelEdit}
                                >
                                  Mégse
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="admin-action-btn"
                                  onClick={() => startEdit(booking)}
                                >
                                  Szerkesztés
                                </button>

                                {!isPaid && (
                                  <button
                                    className="admin-action-btn cash"
                                    onClick={() => confirmCashPayment(booking.id)}
                                  >
                                    Készpénz jóváhagyás
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Admin;