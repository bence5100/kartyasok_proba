import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  // LOGIN STATE
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const openLogin = () => {
    setShowModal(true);
    setIsLogin(true);
  };

  const closeLogin = () => setShowModal(false);
  const showRegister = () => setIsLogin(false);
  const showLogin = () => setIsLogin(true);

  const openMovie = (id) => {
    navigate(`/movie/${id}`);
  };

  // MOVIES
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const res = await fetch("http://localhost:8000/movies");
        const data = await res.json();
        setMovies(data);
      } catch {
        console.log("backend nincs");
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  // LOGIN
  const login = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
      }

      alert("Sikeres login");
      closeLogin();
    } catch {
      alert("Hiba login közben");
    }
  };

  // REGISTER
  const register = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const password2 = formData.get("password2");

    if (password !== password2) {
      alert("Jelszavak nem egyeznek");
      return;
    }

    try {
      await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      alert("Regisztráció OK");
      setIsLogin(true);
    } catch {
      alert("Hiba regisztráció");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <>
      {/* NAVBAR */}
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

          {!isLoggedIn ? (
            <button className="btn-outline" onClick={openLogin}>
              Bejelentkezés
            </button>
          ) : (
            <button className="btn-outline" onClick={logout}>
              Kijelentkezés
            </button>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <h1>Foglalj jegyet egyszerűen</h1>
        <p>Gyors, modern mozi rendszer 🎬</p>
      </section>

      {/* FILMEK */}
      <main className="content">
        <h2 className="section-title">Most futó filmek</h2>

        {loading ? (
          <p>Betöltés...</p>
        ) : movies.length === 0 ? (
          <p style={{ textAlign: "center" }}>Nincs film (backend off)</p>
        ) : (
          <div className="movies">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="movie card"
                onClick={() => openMovie(movie.id)}
              >
                <h3>{movie.title}</h3>
                <p>{movie.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isLogin ? "Bejelentkezés" : "Regisztráció"}</h2>

            {isLogin ? (
              <form className="modal-form" onSubmit={login}>
                <input name="username" placeholder="Felhasználónév" />
                <input name="password" type="password" placeholder="Jelszó" />
                <button className="btn-primary">Belépés</button>
                <button type="button" className="switch-btn" onClick={showRegister}>
                  Regisztráció
                </button>
              </form>
            ) : (
              <form className="modal-form" onSubmit={register}>
                <input name="username" placeholder="Név" />
                <input name="email" placeholder="Email" />
                <input name="password" type="password" placeholder="Jelszó" />
                <input name="password2" type="password" placeholder="Jelszó újra" />
                <button className="btn-primary">Regisztráció</button>
                <button type="button" className="switch-btn" onClick={showLogin}>
                  Bejelentkezés
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Home;