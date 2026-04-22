import { useParams, useNavigate } from "react-router-dom";

function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    navigate("/booking", { state: { movie: movie.title, time } });
  };

  return (
    <div>
      <header>
        <h1>{movie.title}</h1>
      </header>

      <main>
        <p>{movie.desc}</p>

        <h3>Időpontok</h3>
        <div>
          {movie.times.map((time, i) => (
            <button key={i} onClick={() => selectTime(time)}>
              {time}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

export default MovieDetails;