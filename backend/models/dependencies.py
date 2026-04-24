# Az adatbázis használata csak akkorr legyen amikor tényleg ekll használni

from models.models import Sessionmaker

def get_db():
    db = Sessionmaker()
    try:
        yield db
    finally:
        db.close()