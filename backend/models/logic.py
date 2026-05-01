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

    new_user = User(
        username=data.username, email=data.email, hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created and logged in",
        "access_token": f"token_{new_user.id}",
        "token_type": "bearer",
        "user": {"id": new_user.id, "username": new_user.username},
    }


def login_user(data, db: Session):
    user = db.query(User).filter(User.username == data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": f"token_{user.id}",
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username},
    }


def get_movies_logic(db: Session):
    movies = db.query(Movie).all()

    return [
        {"id": movie.id, "title": movie.title, "poster_url": movie.poster_url}
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
        "times": [
            s.start_time.strftime("%m-%d %H:%M") for s in showtimes if s.start_time
        ],
    }


def get_taken_seats_logic(movie_id: int, time: str, db: Session):
    showtimes = db.query(Showtime).filter(Showtime.movie_id == movie_id).all()

    selected_showtime = None
    for showtime in showtimes:
        if showtime.start_time.strftime("%m-%d %H:%M") == time:
            selected_showtime = showtime
            break

    if not selected_showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    bookings = (
        db.query(Booking).filter(Booking.showtime_id == selected_showtime.id).all()
    )

    return [
        int(booking.seat_id)
        for booking in bookings
        if booking.seat_id and booking.seat_id.isdigit()
    ]


def create_booking_logic(data, db: Session):  ## TODO
    showtimes = db.query(Showtime).filter(Showtime.movie_id == data.movieId).all()

    selected_showtime = None
    for showtime in showtimes:
        if showtime.start_time.strftime("%m-%d %H:%M") == data.time:
            selected_showtime = showtime
            break

    if not selected_showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    existing_bookings = (
        db.query(Booking).filter(Booking.showtime_id == selected_showtime.id).all()
    )

    taken_seats = {booking.seat_id for booking in existing_bookings}

    for seat in data.seats:
        if str(seat) in taken_seats:
            raise HTTPException(
                status_code=400, detail=f"Seat {seat} is already booked"
            )

    booking_ids = []

    for seat in data.seats:
            booking = Booking(
            user_id=data.userId,
            showtime_id=selected_showtime.id,
            seat_id=str(seat),
            ticket_type="full price",
        )
    db.add(booking)
    db.flush()
    booking_ids.append(booking.id)

    db.commit()

    return {
        "message": "Booking successful",
        "booking_ids": booking_ids
        }

def get_user_bookings_logic(user_id: int, db: Session):
    # Csak a foglalásokat kérjük le az oszlop alapján
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()

    result = []
    for b in bookings:
        # Kézzel keressük meg a vetítést a showtime_id alapján
        st = db.query(Showtime).filter(Showtime.id == b.showtime_id).first()

        if st:
            # Kézzel keressük meg a filmet a movie_id alapján
            movie = db.query(Movie).filter(Movie.id == st.movie_id).first()

            if movie:
                result.append(
                    {
                        "id": b.id,
                        "movie_title": movie.title,
                        "time": st.start_time.strftime("%m-%d %H:%M")
                        if st.start_time
                        else "N/A",
                        "seat_id": b.seat_id,
                        "ticket_type": b.ticket_type,
                    }
                )
    return result


def get_all_bookings_admin_logic(db: Session):
    # Minden foglalást lekérünk az adatbázisból
    bookings = db.query(Booking).all()

    result = []
    for b in bookings:
        # Kapcsolatok híján manuálisan keressük meg a kapcsolódó adatokat ID alapján
        u = db.query(User).filter(User.id == b.user_id).first()
        st = db.query(Showtime).filter(Showtime.id == b.showtime_id).first()

        # Csak akkor adjuk hozzá, ha találtunk vetítést és felhasználót
        if st and u:
            # A filmet a vetítés movie_id-ja alapján keressük meg
            movie = db.query(Movie).filter(Movie.id == st.movie_id).first()

            if movie:
                result.append(
                    {
                        "id": b.id,
                        "user": u.username,  # A kikeresett User objektumból
                        "movie": movie.title,  # A kikeresett Movie objektumból[cite: 4]
                        "time": st.start_time.strftime("%m-%d %H:%M")
                        if st.start_time
                        else "N/A",
                        "seat": b.seat_id,
                        "type": b.ticket_type,
                    }
                )
    return result


def update_booking_logic(booking_id: int, data: dict, db: Session):
    # Foglalás adatainak (pl. jegytípus vagy szék) módosítása admin által
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if "ticket_type" in data:
        booking.ticket_type = data["ticket_type"]
    if "seat_id" in data:
        booking.seat_id = str(data["seat_id"])

    db.commit()
    return {"message": "Booking updated successfully"}
