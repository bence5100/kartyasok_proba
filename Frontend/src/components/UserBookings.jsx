import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { QRCodeCanvas } from "qrcode.react";

function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    setIsLoggedIn(true);

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

      <h1>Foglalásaim</h1>

      {bookings.map((b, i) => (
        <div key={i} className="card">
          <h3>{b.movie_title}</h3>
          <p>{b.time}</p>
          <p>Hely: {b.seat}</p>

          <QRCodeCanvas value={b.qr_code_content} size={150} />
        </div>
      ))}
    </div>
  );
}

export default UserBookings;