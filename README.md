1) How to start the sever?

2) How do you Use it?

Basic information for developers

Starting the server:
--
```cmd
uv run uvicorn app.main:app --reload
python -m uvicorn main:app --reload
```
Example requests:

Here’s a set of simple curl examples you can use to interact with your FastAPI app once it’s running (default at http://localhost:8000):

1️⃣ Create a User

```cmd
curl -X POST "http://localhost:8000/api/v1/users"
-H "Content-Type: application/json"
-d '{"name": "Ada Lovelace"}'
```
2️⃣ Get All Users
```
curl -X GET "http://localhost:8000/api/v1/users"
```
3️⃣ Get a User by ID

(Replace 1 with the actual ID from the create response)
```
curl -X GET "http://localhost:8000/api/v1/users/1"
```
4️⃣ Update a User
```
curl -X PUT "http://localhost:8000/api/v1/users/1"
-H "Content-Type: application/json"
-d '{"name": "Grace Hopper"}'
```
⸻

5️⃣ Delete a User
```
curl -X DELETE "http://localhost:8000/api/v1/users/1"
```


# TODO:
## End pontok:
    - Get(Felhasználó lézetik-e)
    - Post(j felhasználó)
        - Ez el tárolja e egyből az uj embert?
        - Bejelentkezik e egyből
    - Get(Cim, poseter URL)-> Főoldal
    - Get(movie tábla egy sora)
    - Get ( Showtime tábla egész)
    - Get (jellenlegi szák állapotok)
    - Post ( székek le foglalása)
    - Get(qr kód, fizetve? )
    - Push(jegy tipus, hogyan fizet) 