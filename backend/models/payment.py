from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.models import Sessionmaker, Booking, Showtime, Movie
from models.secret import generate_ticket_key

router = APIRouter(prefix="/payment", tags=["payment"])


def get_db():
    db = Sessionmaker()
    try:
        yield db
    finally:
        db.close()


@router.post("/checkout/{booking_id}")
def checkout(booking_id: int, ticket_type: str, db: Session = Depends(get_db)):
    # 1. Foglalás lekérése
    booking_record = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking_record:
        raise HTTPException(status_code=404, detail="Booking not found")

    # 2. Vetítés lekérése (hogy tudjuk az árat)
    Showtime_record = (
        db.query(Showtime).filter(Showtime.id == booking_record.showtime_id).first()
    )
    if not Showtime_record:
        raise HTTPException(status_code=404, detail="Showtime not found")

    # Kedvezmények definíciója
    discounts = {"full price": 1.0, "student": 0.8, "senior": 0.75, "child": 0.5}

    # 3. ÁR SZÁMÍTÁSA (Fix árral, ha a Showtime-ban nincs 'price' oszlop)
    alap_ar = 2000.0  # Ha nincs 'price' a Showtime modellben, használj fix árat
    # Ha van price a Showtime-ban, akkor: alap_ar = Showtime_record.price

    multiplier = discounts.get(ticket_type, 1.0)

    # Mivel egy foglalás (Booking) nálad egy széket jelent:
    final_price = alap_ar * multiplier

    # 4. VIP felár ellenőrzése (Példányon, nem az Osztályon!)
    if booking_record.is_vip_seat:
        final_price += 500.0

    # 5. MENTÉS A REKORDBA
    # Ügyelj a mezőnevekre: a models.py alapján 'total_paid' van, nem 'total_price'
    booking_record.total_paid = final_price
    booking_record.ticket_type = ticket_type

    db.commit()

    return {
        "booking_id": booking_id,
        "final_price": final_price,
        "type": ticket_type,
        "currency": "HUF",
    }


@router.post("/verify/{booking_id}")
def verify_payment(booking_id: int, db: Session = Depends(get_db)):
    booking_record = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking_record:
        raise HTTPException(status_code=404, detail="Booking not found")

    if booking_record.is_piad:
        return {
            "status": "already paid",
            "message": "This booking has already been paid.",
        }

    booking_record.is_piad = True
    booking_record.qr_code_key = generate_ticket_key()
    db.commit()
    db.refresh(booking_record)

    return {
        "status": "success",
        "message": "Payment verified successfully.",
        "qr_code_key": booking_record.qr_code_key,
    }


@router.get("/status/{booking_id}")
def get_payment_status(booking_id: int, db: Session = Depends(get_db)):
    booking_record = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking_record:
        raise HTTPException(status_code=404, detail="Booking not found")

    Showtime_record = (
        db.query(Showtime).filter(Showtime.id == booking_record.showtime_id).first()
    )
    movie = db.query(Movie).filter(Movie.id == Showtime_record.movie_id).first()
    return {
        "movie_title": movie.title,
        "time": Showtime_record.start_time,
        "seat": booking_record.seat_id,
        "type": booking_record.ticket_type,
        "qr_code_content": booking_record.qr_code_key,  # Ebből rajzol a Frontend QR-t
    }


@router.post("/initiate-cash/{booking_id}")
def initiate_cash_payment(booking_id: int, db: Session = Depends(get_db)):
    """
    1. LÉPÉS: A user kiválasztja a helyszíni fizetést.
    A foglalás létrejön, de még NINCS kifizetve és nincs QR kód.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Foglalás nem található")

    booking.payment_method = "cash"
    booking.is_piad = False  # Fontos: Még nem fizetett!
    db.commit()

    return {"message": "Foglalás rögzítve. Kérjük, fizesse ki a pénztárnál!"}


@router.post("/admin/confirm-cash/{booking_id}")
def admin_confirm_cash(booking_id: int, db: Session = Depends(get_db)):
    """
    2. LÉPÉS: Ezt a gombot a MOZIS DOLGOZÓ nyomja meg az admin felületen,
    amikor a kezébe kapta a papírpénzt.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Nincs ilyen foglalás")

    # Itt történik a jóváhagyás
    booking.is_piad = True
    booking.qr_code_key = generate_ticket_key()  # Csak most kap jegykódot!

    db.commit()
    return {
        "status": "success",
        "message": "Készpénzes fizetés rögzítve, jegy érvényesítve!",
    }


@router.post("/simulate-card/{booking_id}")
def simulate_card_payment(
    booking_id: int, card_number: str, db: Session = Depends(get_db)
):
    """
    Szimulált fizetés:
    - Páros végű kártyaszám -> SIKER
    - Páratlan végű kártyaszám -> HIBA
    """

    clean_card_number = card_number.replace(" ", "")
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Foglalás nem található")

    # 1. ELLENŐRZÉS: Csak számokból áll-e?
    if not clean_card_number.isdigit():
        raise HTTPException(
            status_code=400,
            detail="Érvénytelen formátum: A kártyaszám csak számokat tartalmazhat!",
        )

        # 3. ELLENŐRZÉS: Elég hosszú-e? (A legtöbb bankkártya 13-19 számjegy)
    if len(clean_card_number) < 13 or len(clean_card_number) > 19:
        raise HTTPException(
            status_code=400, detail="Érvénytelen kártyaszám: Túl rövid vagy túl hosszú!"
        )

    # 4. LOGIKA: Ha páratlan (osztva 2-vel a maradék nem 0)
    last_digit = int(clean_card_number[-1])
    if last_digit % 2 != 0:
        raise HTTPException(
            status_code=402, detail="Fizetés elutasítva: Páratlan kártyaszám!"
        )

    # 3. SIKER: Ha páros
    booking.is_piad = True
    booking.payment_method = "card_simulated"
    booking.qr_code_key = generate_ticket_key()

    db.commit()

    return {
        "status": "success",
        "message": f"Sikeres fizetés a(z) ...{card_number[-4:]} kártyával!",
        "ticket_key": booking.qr_code_key,
    }
