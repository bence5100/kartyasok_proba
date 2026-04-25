import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/movies/${id}`)
      .then(res => res.json())
      .then(data => setMovie(data));
  }, [id]);

  if (!movie) return <h1>Betöltés...</h1>;

  return (
    <div>
      <Navbar />

      <main className="content">
        <h1>{movie.title}</h1>
        <p>{movie.description}</p>

        <div className="times-grid">
          {movie.times?.map(time => (
            <div
              key={time}
              className="time-card"
              onClick={() =>
                navigate("/booking", {
                  state: { movieId: movie.id, time }
                })
              }
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