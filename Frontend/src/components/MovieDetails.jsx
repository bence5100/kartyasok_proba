import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  console.log("ID:", id);

  const [selectedTime, setSelectedTime] = useState(null);
  const [movie, setMovie] = useState(null);

  // 🎬 FILM BETÖLTÉSE BACKENDBŐL
  useEffect(() => {
    fetch(`http://localhost:8000/movies/${id}`)
      .then(res => res.json())
      .then(data => setMovie(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!movie) return <h1>Betöltés...</h1>;

  const selectTime = (time) => {
    setSelectedTime(time);
    setTimeout(() => {
      navigate("/booking", { state: { movieId: movie.id, time } }); // ✅ EZ A FIX
    }, 200);
  };

  return (
    <div className="movie-details">
      <header className="navbar">
        <h1>{movie.title}</h1>
      </header>

      <main className="content">
        <p className="movie-desc">{movie.description}</p>

        <h3 className="section-title">Időpontok</h3>

        <div className="times-grid">
          {movie.times?.map((time, i) => (
            <div
              key={i}
              className={`time-card ${selectedTime === time ? "active" : ""}`}
              onClick={() => selectTime(time)}
            >
              {time}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MovieDetails;