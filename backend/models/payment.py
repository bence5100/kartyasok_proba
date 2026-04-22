from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Sessionmaker, Booking, Showtime, Movie
from secret import generate_ticket_key

router = APIRouter(prefix="/payment", tags=["payment"])
def get_db():
    db = Sessionmaker()
    try:
        yield db
    finally:
        db.close()
        
@router.post("/checkout/{booking_id}")
def checkout(booking_id: int, ticket_type: str, db: Session = Depends(get_db)):
    # Implementation for checkout
    booking_record = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking_record:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    Showtime_record = db.query(Showtime).filter(Showtime.id == booking_record.showtime_id).first()
    
    
    
    discounts = {
        "full price": 1.0,
        "student": 0.8,
        "senior": 0.75,
        "child": 0.5
    }
    
    multiplier = discounts.get(booking_record.ticket_type, 1.0)
    final_price = Showtime_record.price * booking_record.seats_booked
    
    if Booking.is_vip_seat:
        final_price += 500.0 # VIP helyek 50%-kal drágábbak
        
    
        
    Booking.total_price = final_price
    Booking.ticket_type = ticket_type
    db.commit()
    
    return{
        "booking_id": booking_id,
        "final_price": final_price,
        "type": ticket_type,
        "currency": "HUF",
    }
    
        
@router.post("/verfiy/{booking_id}")
def verify_payment(booking_id: int, db: Session = Depends(get_db)):
    booking_record = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking_record:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking_record.is_paid:
        return {"status": "already paid","message": "This booking has already been paid."}
    
    
    booking_record.is_paid = True
    booking_record.qr_code_key = generate_ticket_key()
    db.commit()
    db.refresh(booking_record)
    
    return {
        "status": "success",
        "message": "Payment verified successfully.",
        "qr_code_key": booking_record.qr_code_key
    }
    
@router.get("/status/{booking_id}")
def get_payment_status(booking_id: int, db: Session = Depends(get_db)):
    booking_record = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking_record:
        raise HTTPException(status_code=404, detail="Booking not found")

    Showtime_record = db.query(Showtime).filter(Showtime.id == booking_record.showtime_id).first()
    movie = db.query(Movie).filter(Movie.id == Showtime_record.movie_id).first()
    return {
        "movie_title": movie.title,
        "time": Showtime_record.start_time,
        "seat": booking_record.seat_id,
        "type": booking_record.ticket_type,
        "qr_code_content": booking_record.qr_code_key # Ebből rajzol a Frontend QR-t
    }
