import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [movies, setMovies] = useState([]);

  const openLogin = () => {
    setShowModal(true);
    setIsLogin(true);
  };

  const closeLogin = () => {
    setShowModal(false);
  };

  const showRegister = () => {
    setIsLogin(false);
  };

  const showLogin = () => {
    setIsLogin(true);
  };

  const navigate = useNavigate();

  const openMovie = (movie) => {
    navigate(`/movie/${movie}`);
  };

  // 🎬 FILMEK BETÖLTÉSE BACKENDBŐL
  useEffect(() => {
  fetch("http://localhost:8000/movies")
    .then(res => res.json())
    .then(data => {
      console.log("FILMEK:", data);
      setMovies(data);
    })
    .catch(err => console.error(err));
}, []);

  // 🔐 LOGIN
  const login = async (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form[0].value;
    const password = form[1].value;

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await res.json();
      console.log(data);

      alert("Sikeres bejelentkezés!");
      closeLogin();

    } catch (err) {
      console.error(err);
      alert("Hiba történt!");
    }
  };

  // 📝 REGISTER
  const register = async (e) => {
    e.preventDefault();

    const form = e.target;
    const username = form[0].value;
    const email = form[1].value;
    const password = form[2].value;

    try {
      const res = await fetch("http://localhost:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const data = await res.json();
      console.log(data);

      alert("Sikeres regisztráció!");
      setIsLogin(true);

    } catch (err) {
      console.error(err);
      alert("Hiba történt!");
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <header className="navbar">
        <div className="logo">MOZI</div>
        <nav>
          <button className="btn-outline" onClick={openLogin}>
            Bejelentkezés
          </button>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <h1>Foglalj jegyet egyszerűen</h1>
          <p>Válaszd ki a filmed, időpontot és helyet pár kattintással.</p>
        </div>
      </section>

      {/* FILMEK */}
      <main className="content">
        <h2 className="section-title">Most futó filmek</h2>

        <div className="movies grid">
          {movies.map(movie => (
            <div
              key={movie.id}
              className="movie card"
              onClick={() => openMovie(movie.id)}
            >
              <div className="card-body">
                <h3>{movie.title}</h3>
                <p>{movie.description}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">

            <div className="modal-header">
              <h2>{isLogin ? "Bejelentkezés" : "Regisztráció"}</h2>
              <span className="close" onClick={closeLogin}>
                &times;
              </span>
            </div>

            {isLogin ? (
              <form className="modal-form" onSubmit={login}>
                <input type="text" placeholder="Felhasználónév" required />
                <input type="password" placeholder="Jelszó" required />
                <button type="submit" className="btn-primary">Belépés</button>
                <button type="button" className="switch-btn" onClick={showRegister}>
                  Nincs fiókod? Regisztráció
                </button>
              </form>
            ) : (
              <form className="modal-form" onSubmit={register}>
                <input type="text" placeholder="Név" required />
                <input type="email" placeholder="Email" required />
                <input type="password" placeholder="Jelszó" required />
                <input type="password" placeholder="Jelszó újra" required />
                <button type="submit" className="btn-primary">Regisztráció</button>
                <button type="button" className="switch-btn" onClick={showLogin}>
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