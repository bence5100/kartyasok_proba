## How to run the  Docker file?
first start `DockedDesktop` .
Then type in cmd this command:

```cmd
docker compose up 
```


# Starting the server:
## Backend:
Start a console and copy run this:
```cmd
python -m uvicorn main:app --reload
```
## Frontend
Start a new console and copy run this:
```cmd
npm run dev
```
`npm install qrcode.react`

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