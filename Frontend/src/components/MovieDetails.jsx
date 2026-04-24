import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedTime, setSelectedTime] = useState(null);

  const movies = {
    avatar: {
      title: "Avatar 2",
      desc: "Sci-fi kaland film",
      times: ["18:00", "20:30"]
    },
    oppenheimer: {
      title: "Oppenheimer",
      desc: "Történelmi dráma",
      times: ["17:00", "21:00"]
    }
  };

  const movie = movies[id];

  if (!movie) return <h1>Nincs ilyen film</h1>;

  const selectTime = (time) => {
    setSelectedTime(time);
    setTimeout(() => {
      navigate("/booking", { state: { movie: movie.title, time } });
    }, 200);
  };

  return (
    <div className="movie-details">
      <header className="navbar">
        <h1>{movie.title}</h1>
      </header>

      <main className="content">
        <p className="movie-desc">{movie.desc}</p>

        <h3 className="section-title">Időpontok</h3>

        <div className="times-grid">
          {movie.times.map((time, i) => (
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