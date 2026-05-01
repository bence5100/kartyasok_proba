import { useEffect, useState } from "react";
import Navbar from "./Navbar";

function Admin() {
  const [bookings, setBookings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    fetch("http://localhost:8000/my-bookings", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  return (
    <div>
      <Navbar isLoggedIn={isLoggedIn} />

      <h1>Admin</h1>

      {bookings.map((b, i) => (
        <div key={i} className="card">
          <h3>{b.movie_title}</h3>
          <p>{b.time}</p>
          <p>Seat: {b.seat}</p>
          <p>Type: {b.type}</p>
        </div>
      ))}
    </div>
  );
}

export default Admin;