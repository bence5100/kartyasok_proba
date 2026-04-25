import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        MOZI
      </div>

      <nav className="nav-buttons">
        <button className="nav-btn" onClick={() => navigate("/my-bookings")}>
          Foglalásaim
        </button>

        <button className="nav-btn admin" onClick={() => navigate("/admin")}>
          Admin
        </button>
      </nav>
    </header>
  );
}

export default Navbar;