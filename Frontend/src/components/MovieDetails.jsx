import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";

function extractVideoId(url) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/watch\?v=)([^&]+)/);
  return match ? match[1] : '';
}


function MovieDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:8000/movies/${id}`)
      .then(res => res.json())
      .then(data =>{
        setMovie(data);})
  }, [id]);

  if (!movie) return <h1>Betöltés...</h1>;


  return (
    <div>
      <Navbar />

      <main className="content">
        <h1>{movie.title}</h1>
        <img src={movie.poster_url} alt={movie.title} className="movie-poster" />
         
        
        <div style={{ margin: '20px 0', padding: '10px',  }}>
          <button 
            onClick={() => {
              console.log("Gombra kattintottál, showTrailer eddig:", showTrailer);
              setShowTrailer(!showTrailer);
            }}
            style={{
              backgroundColor: '#ff0000',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showTrailer ? "Elrejtés" : "Előzetes megtekintése"} ▶️
          </button>
        </div>

        {showTrailer && (
          <div style={{ marginTop: '20px', padding: '20px', }}>
            {movie.url ? (
              <div>
                <iframe
                  width="100%"
                  height="400"
                  src={movie.url.replace('watch?v=', 'embed/')}
                  title="YouTube video"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            ) : (
              <p style={{ color: 'red' }}>NINCS URL a filmhez!</p>
            )}
          </div>
        )}

        <p>{movie.duration} perc</p>
        <p>Leírás:{movie.description}</p>
        <p>Zsáner:{movie.genre}</p>
        <p>Korhatár:{movie.age_limit}+ év</p>
        <p>Nyelv:{movie.language}</p>
        <p> Feliratok:{movie.subtitle}</p>
        <p>Értékelés: {movie.rating}/10</p>



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