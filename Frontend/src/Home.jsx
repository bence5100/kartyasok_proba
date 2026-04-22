import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

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

  const login = (e) => {
    e.preventDefault();
    alert("Bejelentkezés (később backend)");
  };

  const register = (e) => {
    e.preventDefault();
    alert("Regisztráció (később backend)");
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
          <div className="movie card" onClick={() => openMovie("avatar")}>
            <div className="card-body">
              <h3>Avatar 2</h3>
              <p>Sci-fi kaland</p>
            </div>
          </div>

          <div className="movie card" onClick={() => openMovie("oppenheimer")}>
            <div className="card-body">
              <h3>Oppenheimer</h3>
              <p>Történelmi dráma</p>
            </div>
          </div>
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