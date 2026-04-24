from models import Sessionmaker, Base, engine, Movie, Room, Showtime, User
from passlib.context import CryptContext
import datetime


def upload_and_update():
    # 1.törüljük a táblákat (ha kéteznek)
    print("Deleting existing data...")
    Base.metadata.drop_all(bind=engine)

    # 2. újra létrehozzuk a táblákat
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    # 3. feltöltjük a táblákat
    db = Sessionmaker()
    try:
        # Filmek
        movie1 = Movie(
            title="Eredet",
            description="A zaklatott tolvaj, aki titkokat bányász elő az emberek álmaiból, elvállal egy utolsó, veszélyes feladatot: egy elképzelést kell elültetnie a célszemély tudatalattijában.",
            duration_minutes=148,
            age_limit=16,
            genre="Sci-Fi",
            poster_url="https://port.hu/adatlap/film/tv/eredet-inception/movie-105025",
        )
        movie2 = Movie(
            title="Mátrix",
            description="Mi az a Mátrix? Erre a kérdésre keresi a választ Neo, a számítógépes hacker, aki félelmetes utazásra vállalkozik, hogy megismerje az észbontó igazságot az általa ismert világról.",
            duration_minutes=136,
            age_limit=16,
            genre="Sci-Fi",
            poster_url="https://www.imdb.com/title/tt0133093/",
        )
        db.add_all([movie1, movie2])
        db.commit()

        # Termek
        room1 = Room(name="Room A", capacity=100, row=10, cols=10)
        room2 = Room(name="Room B", capacity=80, row=8, cols=10)
        db.add_all([room1, room2])
        db.commit()

        # Showtimes
        showtime1 = Showtime(
            movie_id=1, room_id=1, start_time=datetime.datetime(2026, 7, 1, 19, 0)
        )
        showtime2 = Showtime(
            movie_id=2, room_id=2, start_time=datetime.datetime(2026, 7, 1, 21, 0)
        )
        db.add_all([showtime1, showtime2])
        db.commit()

        print("Data successfully uploaded and updated in the database.")

    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_admin():
    db = Sessionmaker()

    # Ellenőrizzük, létezik-e már az admin, hogy ne dobjon hibát többszöri futtatásnál
    admin_exists = db.query(User).filter(User.username == "admin").first()

    if not admin_exists:
        print("Admin létrehozása...")
        hashed_password = pwd_context.hash("admin123")  # Ez lesz a jelszava: admin123

        new_admin = User(
            username="admin",
            email="admin@mozi.hu",
            hashed_password=hashed_password,
            is_admin=True,  # EZ A LÉNYEG: ő lesz az admin!
        )

        db.add(new_admin)
        db.commit()
        print("Admin sikeresen létrehozva!")
    else:
        print("Az admin már létezik az adatbázisban.")

    db.close()


print("database successfully seeded with movies, rooms, and showtimes.")

if __name__ == "__main__":
    upload_and_update()
    seed_admin()
