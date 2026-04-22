from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Boolean,
    Float,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# 1. adatbázis elérés (SQLite fálj)
SQLALCHEMY_DATABASE_URL = "sqlite:///./mozi.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
Sessionmaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- TÁBLÁK DEFINÍÁLÁSA---


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)  # Biztonság: sosem sima szöveg!
    is_admin = Column(
        Boolean, default=False
    )  # 0: normál felhasználó, 1: adminisztrátor


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    duration_minutes = Column(Integer)
    age_limit = Column(Integer, default=0)  # 0: nincs korhatár, 18: csak felnőtteknek
    genre = Column(String)  # pl. "Akció", "Vígjáték", "Dráma"
    language = Column(String, default="Magyar")  # Szinkron nyelv
    subtitles = Column(String, default="Nincs")  # Felirat
    rating = Column(Float, default=0.0)  # IMDB vagy saját értékelés
    poster_url = Column(String)
    trailer_url = Column(String)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    capacity = Column(Integer)
    row = Column(Integer)  # pl. sorok száma
    cols = Column(Integer)  # pl. oszlopok száma
    is_active = Column(Boolean, default=True)  # Használható-e a terem


class Showtime(Base):
    __tablename__ = "showtimes"

    id = Column(Integer, primary_key=True, index=True)
    movie_id = Column(Integer, ForeignKey("movies.id"))
    room_id = Column(Integer, ForeignKey("rooms.id"))
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    format = Column(String, default="2D")  # pl. "2D", "3D", "IMAX"
    base_price = Column(Float, default=2500.0)  # alapjegyár, pl. 2500 Ft


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    showtime_id = Column(Integer, ForeignKey("showtimes.id"))
    seat_id = Column(String)  # pl. "a12"
    total_paid = Column(Float)
    ticket_type = Column(String, default="full prices")
    is_paid = Column(Boolean, default=False)  # 0: foglalás, 1: fizetés megtörtént
    booking_date = Column(DateTime, default=datetime.datetime.utcnow)
    is_vip_seat = Column(Boolean, default=False)  # Drágább-e a hely
    qr_code_key = Column(String, unique=True)  # Egyedi kód a belépéshez




# --- LÉTREHOZÁS---
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Successfully created tables in the database.")
