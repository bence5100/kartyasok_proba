import { useNavigate } from "react-router-dom";

function Navbar({ isLoggedIn, isAdmin, onLoginClick, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        MOZI
      </div>

      <nav className="nav-buttons">
        
        {isLoggedIn && !isAdmin &&(
          <button className="nav-btn" onClick={() => navigate("/my-bookings")}>
            Foglalásaim
          </button>
        )}

        {isAdmin && (
          <button className="nav-btn admin" onClick={() => navigate("/admin")}>
            Admin
          </button>
        )}

        {!isLoggedIn ? (
          <button className="btn-outline" onClick={onLoginClick}>
            Bejelentkezés
          </button>
        ) : (
          <button className="btn-outline" onClick={onLogout}>
            Kijelentkezés
          </button>
        )}
      </nav>
    </header>
  );
}

export default Navbar;