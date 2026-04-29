from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.models import User, Movie, Showtime, Booking

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def register_user(data, db: Session):
    existing_user = db.query(User).filter(User.username == data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = pwd_context.hash(data.password)

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed_password
    )

    db.add(user)
    db.commit()

    return {"message": "User created"}

def login_user(data, db: Session):
    user = db.query(User).filter(User.username == data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": f"token_{user.id}",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username
        }
    }

def get_movies_logic(db: Session):
    movies = db.query(Movie).all()

    return [
        {
            "id": movie.id,
            "title": movie.title,
            "poster_url": movie.poster_url
            
        }
        for movie in movies
    ]


def get_movie_logic(movie_id: int, db: Session):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    showtimes = db.query(Showtime).filter(Showtime.movie_id == movie.id).all()

    return {
        "id": movie.id,
        "title": movie.title,
        "description": movie.description,
        "poster_url": movie.poster_url,
        "duration": movie.duration_minutes,
        "genre": movie.genre,
        "age_limit": movie.age_limit,
        "language": movie.language,
        "subtitle": movie.subtitles,
        "rating": movie.rating,
        "url": movie.trailer_url,
        
        "times": [s.start_time.strftime("%H:%M") for s in showtimes]
    }


def get_taken_seats_logic(movie_id: int, time: str, db: Session):
    showtimes = db.query(Showtime).filter(Showtime.movie_id == movie_id).all()

    selected_showtime = None
    for showtime in showtimes:
        if showtime.start_time.strftime("%H:%M") == time:
            selected_showtime = showtime
            break

    if not selected_showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    bookings = db.query(Booking).filter(
        Booking.showtime_id == selected_showtime.id
    ).all()

    return [
        int(booking.seat_id)
        for booking in bookings
        if booking.seat_id and booking.seat_id.isdigit()
    ]


def create_booking_logic(data, db: Session):
    showtimes = db.query(Showtime).filter(
        Showtime.movie_id == data.movieId
    ).all()

    selected_showtime = None
    for showtime in showtimes:
        if showtime.start_time.strftime("%H:%M") == data.time:
            selected_showtime = showtime
            break

    if not selected_showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    existing_bookings = db.query(Booking).filter(
        Booking.showtime_id == selected_showtime.id
    ).all()

    taken_seats = {booking.seat_id for booking in existing_bookings}        ##TODO ??

    for seat in data.seats:
        if str(seat) in taken_seats:
            raise HTTPException(
                status_code=400,
                detail=f"Seat {seat} is already booked"
            )

    for seat in data.seats:
        booking = Booking(
            user_id=1,              ##TODO jo ez igy =1?-re
            showtime_id=selected_showtime.id,
            seat_id=str(seat),
            ticket_type="full price"
        )
        db.add(booking)

    db.commit()

    return {"message": "Booking successful"}