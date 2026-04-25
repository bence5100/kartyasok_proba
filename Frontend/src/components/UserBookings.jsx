import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

function UserBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/my-bookings")
      .then(res => res.json())
      .then(data => setBookings(data));
  }, []);

  return (
    <div>
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