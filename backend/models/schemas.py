from pydantic import BaseModel, EmailStr  # TODO EmailStr??? kell-e?
from typing import List


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class BookingRequest(BaseModel):
    movieId: int
    time: str
    seats: List[int]
    userId: int
