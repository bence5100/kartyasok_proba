import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedTime, setSelectedTime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🎬 FILM BETÖLTÉSE
  useEffect(() => {
    const loadMovie = async () => {
      try {
        const res = await fetch(`http://localhost:8000/movies/${id}`);

        if (!res.ok) {
          throw new Error("Nem sikerült betölteni a filmet");
        }

        const data = await res.json();
        setMovie(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id]);

  const selectTime = (time) => {
    setSelectedTime(time);

    // 👉 azonnali navigate (nincs hack)
    navigate("/booking", {
      state: {
        movieId: movie.id,
        time
      }
    });
  };

  if (loading) return <h1>Betöltés...</h1>;
  if (error) return <h1>{error}</h1>;
  if (!movie) return <h1>Nincs adat</h1>;

  return (
    <div className="movie-details">
      <header className="navbar">
        <h1>{movie.title}</h1>
      </header>

      <main className="content">
        <p className="movie-desc">{movie.description}</p>

        <h3 className="section-title">Időpontok</h3>

        <div className="times-grid">
          {movie.times && movie.times.length > 0 ? (
            movie.times.map((time) => (
              <div
                key={time}
                className={`time-card ${selectedTime === time ? "active" : ""}`}
                onClick={() => selectTime(time)}
              >
                {time}
              </div>
            ))
          ) : (
            <p>Nincs elérhető időpont</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default MovieDetails;