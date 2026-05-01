import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function Admin() {
  const [bookings, setBookings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (!token) return;

    fetch("http://localhost:8000/my-bookings", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("ADMIN DATA:", data);

        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          setBookings([]);
        }
      })
      .catch(err => {
        console.error("Fetch hiba:", err);
        setBookings([]);
      });
  }, []);

  return (
    <div>
      <Navbar 
        isLoggedIn={isLoggedIn}
        isAdmin={true}
      />

      <h1>Admin</h1>

      {bookings.length === 0 ? (
        <p>Nincs adat vagy nincs jogosultság</p>
      ) : (
        bookings.map((b, i) => (
          <div key={i} className="card">
            <h3>{b.movie}</h3>
            <p>{b.time}</p>
            <p>Seat: {b.seat}</p>
            <p>Type: {b.type}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;