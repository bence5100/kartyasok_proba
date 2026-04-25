import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
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

  const login = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const password = formData.get("password");

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
      }

      alert("Login OK");
      closeLogin();
    } catch {
      alert("Hiba login");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <>
      <Navbar />

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
                <p>{movie.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Bejelentkezés</h2>

            <form className="modal-form" onSubmit={login}>
              <input name="username" placeholder="Felhasználónév" />
              <input name="password" type="password" placeholder="Jelszó" />
              <button className="btn-primary">Belépés</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;