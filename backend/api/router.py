# here we the operators --> no bisnis logic

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from models.dependencies import get_db
from models.schemas import RegisterRequest, LoginRequest, BookingRequest
from models.logic import (
    register_user,
    login_user,
    get_movies_logic,
    get_movie_logic,
    get_taken_seats_logic,
    create_booking_logic,
    get_user_bookings_logic,
    get_all_bookings_admin_logic,
    update_booking_logic,
    get_booking_layout_logic,
)
router = APIRouter()


@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return register_user(data, db)


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    return login_user(data, db)


@router.get("/movies")
def get_movies(db: Session = Depends(get_db)):
    return get_movies_logic(db)


@router.get("/movies/{movie_id}")
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    return get_movie_logic(movie_id, db)


@router.get("/seats/{movie_id}/{time}")
def get_taken_seats(movie_id: int, time: str, db: Session = Depends(get_db)):
    return get_taken_seats_logic(movie_id, time, db)


@router.post("/booking")                    ## TODO
def create_booking(data: BookingRequest, db: Session = Depends(get_db)):
    return create_booking_logic(data, db)

@router.get("/bookings/user/{user_id}")
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    # Profil oldalra: felhasználó saját jegyei
    return get_user_bookings_logic(user_id, db)



@router.get("/admin/bookings")
def get_all_bookings(db: Session = Depends(get_db)):
    # Admin oldalra: minden foglalás listázása
    return get_all_bookings_admin_logic(db)

@router.post("/admin/bookings/{booking_id}/update")
def update_booking(booking_id: int, data: dict, db: Session = Depends(get_db)):
    # Admin oldalra: adatok módosítása
    return update_booking_logic(booking_id, data, db)


@router.get("/booking-layout/{movie_id}/{time}")
def get_booking_layout(movie_id: int, time: str, db: Session = Depends(get_db)):
    return get_booking_layout_logic(movie_id, time, db)

### TODO -router.get("/rooms/{room_id}") - get room details, including seating arrangement
### TODO - minden táblára get-er és tábla/id -get-ter
### TODO --registrácio müködik e

## TODO - bookiing post - admin oldalon adatok változtatása
## TODO - booking get - admin oldalra azt ami kell
## TODO booking get - a profil oldalra - minden lefoglalt jegyet megjeleniteni a usernek 
## TODO:  FRONTEN:
##TODO:    - müködö bejelentkezés
##TODO:    - müködö regisztácio
##TODO:    - müködö payment + oldal
##TODO:    - müködö profil oldal
##TODO:    - müködő admin oldal
