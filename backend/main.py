import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  ##TODO nem biztos hogy kell ez
##from pydantic import BaseModel
##from typing import List  ##TODO ez se biztos hogy kell

from models.payment import router as payment_router
from models.models import Base, engine
from api.router import router



app = FastAPI(title="Absolute Cinema API")


# Create Database Connection
Base.metadata.create_all(bind=engine)

origin = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(payment_router)
app.include_router(router)      ##TODO lehet h ez nem kell


@app.get("/")
def root():
    return {"message": "Absolute Cinema API is RUnnInG ----> SuXes"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
