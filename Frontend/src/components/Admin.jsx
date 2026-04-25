import { useEffect, useState } from "react";

function Admin() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/my-bookings")
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  return (
    <div>
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