import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // 🔥 ÚJ

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    setIsLoggedIn(!!token);

    if (user?.username === "admin") {
      setIsAdmin(true);
    }
  }, []);

  const openLogin = () => {
    setShowModal(true);
    setIsLogin(true);
  };

  const closeLogin = () => setShowModal(false);

  const openMovie = (id) => {
    navigate(`/movie/${id}`);
  };

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
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Hibás felhasználónév vagy jelszó");
        return;
      }

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setIsLoggedIn(true);

        if (data.user?.username === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        alert("Sikeres bejelentkezés!");
        closeLogin();
      }
    } catch (error) {
      console.error("Login hiba:", error);
      alert("Hiba login közben");
    }
  };

  //REGISTER
  const register = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const password2 = formData.get("password2");

    if (password !== password2) {
      alert("A jelszavak nem egyeznek!");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user)); // 🔥

        setIsLoggedIn(true);

        if (data.user?.username === "admin") {
          setIsAdmin(true);
        }
      }

      alert("Sikeres regisztráció!");
      closeLogin();
    } catch {
      alert("Hiba regisztráció");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // 🔥
    setIsLoggedIn(false);
    setIsAdmin(false); // 🔥
  };

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin} // 🔥
        onLoginClick={openLogin}
        onLogout={logout}
      />

      <section className="hero">
        <h1>Foglalj jegyet egyszerűen</h1>
        <p>Modern mozi rendszer 🎬</p>
      </section>

      <main className="content">
        <h2 className="section-title">Most futó filmek</h2>

        {loading ? (
          <p>Betöltés...</p>
        ) : (
          <div className="movies">
            {movies.map(movie => (
              <div
                key={movie.id}
                className="movie card"
                onClick={() => openMovie(movie.id)}
              >
                <h3>{movie.title}</h3>
                <img src={movie.poster_url} alt={movie.title} className="movie-thumb" />
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <span className="close" onClick={closeLogin}>
              &times;
            </span>

            <h2>{isLogin ? "Bejelentkezés" : "Regisztráció"}</h2>

            {isLogin ? (
              <form className="modal-form" onSubmit={login}>
                <input name="username" placeholder="Felhasználónév" required />
                <input name="password" type="password" placeholder="Jelszó" required />

                <button className="btn-primary">Belépés</button>

                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => setIsLogin(false)}
                >
                  Nincs fiókod? Regisztráció
                </button>
              </form>
            ) : (
              <form className="modal-form" onSubmit={register}>
                <input name="username" placeholder="Név" required />
                <input name="email" type="email" placeholder="Email" required />
                <input name="password" type="password" placeholder="Jelszó" required />
                <input name="password2" type="password" placeholder="Jelszó újra" required />

                <button className="btn-primary">Regisztráció</button>

                <button
                  type="button"
                  className="switch-btn"
                  onClick={() => setIsLogin(true)}
                >
                  Van fiókod? Bejelentkezés
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