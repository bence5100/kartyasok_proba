from models import Sessionmaker,Base, engine, Movie, Room , Showtime, User
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
        movie1 = Movie(title="Eredet", description="A zaklatott tolvaj, aki titkokat bányász elő az emberek álmaiból, elvállal egy utolsó, veszélyes feladatot: egy elképzelést kell elültetnie a célszemély tudatalattijában.", duration_minutes=148, age_limit=16, genre="Sci-Fi", poster_url="https://port.hu/adatlap/film/tv/eredet-inception/movie-105025", trailer_url="https://www.youtube.com/watch?v=YoHD9XEInc0")
        movie2 = Movie(title="Mátrix", description="Mi az a Mátrix? Erre a kérdésre keresi a választ Neo, a számítógépes hacker, aki félelmetes utazásra vállalkozik, hogy megismerje az észbontó igazságot az általa ismert világról.", duration_minutes=136, age_limit=16, genre="Sci-Fi", poster_url="https://www.imdb.com/title/tt0133093/", trailer_url="https://www.youtube.com/watch?v=vKQi3bBA1y8")
        movie3 = Movie(title="Mosolyog 2", description="A világkörüli turnéra készülő globális popszenzáció, Skye Riley egyre félelmetesebb és megmagyarázhatatlanabb eseményeket kezd átélni. A fokozódó borzalmak és a hírnév nyomása miatt Skye kénytelen szembenézni múltjával.", duration_minutes=127, age_limit=18, genre="Horror", poster_url="https://m.media-amazon.com/images/M/MV5BYTg5OTMyMGMtYzMwNC00NDMyLWE0OGUtMTQ1ODcwM2FjOTM4XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", trailer_url="https://www.youtube.com/watch?v=A14zUSD86Do")
        movie4 = Movie(title="Pókember: Nincs hazaút", description="Peter Parker szembesül a legnagyobb kihívással, amikor a multiverzum kapui megnyílnak, és régi ellenségek érkeznek a múltból. Peternek új szövetségesekre van szüksége, hogy megmentse szeretteit és megállítsa a káoszt.", duration_minutes=148, age_limit=12, genre="Akció", poster_url="https://www.imdb.com/title/tt10872600/", trailer_url="https://www.youtube.com/watch?v=JfVOs4VSpmA")
        movie5 = Movie(title="Dűne", description="A távoli jövőben, egy sivatagos bolygón, ahol a legértékesebb erőforrás, a 'fűszer' található, egy fiatal nemesi család harcol a túlélésért és a hatalomért. A Dűne egy epikus sci-fi kaland, amelyben intrikák, háborúk és misztikus erők játszanak szerepet.", duration_minutes=155, age_limit=16, genre="Sci-Fi", poster_url="https://www.imdb.com/title/tt1160419/", trailer_url="https://www.youtube.com/watch?v=n9xhJrPXop4")
        movie6 = Movie(title="Tenet", description="Egy titokzatos ügynök egy globális kémjátszmába keveredik, ahol az idő manipulálása a kulcs a győzelemhez. A Tenet egy izgalmas és összetett sci-fi thriller, amelyben a múlt és a jövő összefonódik, és a sors kérdései kerülnek előtérbe.", duration_minutes=150, age_limit=16, genre="Sci-Fi", poster_url="https://www.imdb.com/title/tt6723592/", trailer_url="https://www.youtube.com/watch?v=L3pk_TBkihU")
        movie7 = Movie(title="Horrora akadva(2026)", description="Két barát ismét gyilkosokkal, szörnyekkel és természetfeletti lényekkel kapcsolatos káoszba keveredik.", duration_minutes=90, age_limit=18, genre="Vígjáték", poster_url="https://media.port.hu/images/001/806/386.webp", trailer_url="https://www.youtube.com/watch?v=J5E510mgkOg")
        movie8 = Movie(title="Evil Dead Égj", description="Egy nő vigaszt keres sógoránál a távoli házukban, amikor elveszíti férjét egy autóbalesetben. Egy ősi könyv felfedezése után azonban a családegyesítés pokoli rémálommá válik.", duration_minutes=129, age_limit=18, genre="Horror", poster_url="https://m.media-amazon.com/images/M/MV5BODdhNWM1ZjktNGMwNi00ZTNiLWEyZTYtZGRlMzQ4NmI1MWIyXkEyXkFqcGc@._V1_.jpg", trailer_url="https://www.youtube.com/watch?v=GCDmlFFv1NA")
        movie9 = Movie(title="A Hail Mary-küldetés", description="Egy gimnáziumi fizikatanár (Ryan Gosling) felébred a kómából. Egy űrhajón van. Egyedül. Fényévekre az otthonától – és nem emlékszik, ki ő, és hogy került erre a félelmetes, magányos helyre. Miközben lassacskán visszatérnek az emlékei, ő saját maga után nyomoz, és előbb-utóbb összeállnak a részletek: azért indították útnak, hogy megoldjon egy tudományos problémát: kiderítse, miért jelent meg az univerzumban egy anyag, amely hamarosan elpusztítja a Napot. Rajta múlik a Föld jövője. És egyedül kell választ találnia. Vagy esetleg társaságban: mert az űr mélyén csatlakozik hozzá valaki, akire egyáltalán nem számított…", duration_minutes=156, age_limit=12, genre="Sci-Fi", poster_url="https://m.media-amazon.com/images/M/MV5BNTkwNzJiYTctNzI3NC00NjE1LTlhYjktY2Q5MTdmMWFmNzcxXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", trailer_url="https://www.youtube.com/watch?v=rb3cFMAkNnA")
        movie10 = Movie(title="A Gyűrűk Ura: A Gyűrű Szövetsége", description="Egy fiatal hobbit, Frodo, egy hatalmas erővel bíró gyűrűt örököl, amelyet el kell pusztítania, hogy megakadályozza a gonosz Sauron hatalomra jutását. Egy csapat hős társával együtt indul útnak, hogy megsemmisítse a gyűrűt és megmentse Középföldét.", duration_minutes=178, age_limit=12, genre="Fantasy", poster_url="https://www.imdb.com/title/tt0120737/", trailer_url="https://www.youtube.com/watch?v=V75dMMIW2B4")
        movie11 = Movie(title="A Gyűrűk Ura: A Két Torony", description="Frodo és Sam tovább folytatják útjukat, hogy eljussanak Mordorba és megsemmisítsék a gyűrűt, miközben Aragorn, Legolas és Gimli harcolnak a gonosz erőkkel, amelyek fenyegetik Középföldét.", duration_minutes=179, age_limit=12, genre="Fantasy", poster_url="https://www.imdb.com/title/tt0167261/", trailer_url="https://www.youtube.com/watch?v=LbfMDwc4azU")
        movie12 = Movie(title="A Gyűrűk Ura: A Király Visszatér", description="Frodo és Sam végre elérik Mordortot, hogy megsemmisítsék a gyűrűt, miközben Aragorn vezeti a sereget a végső csatába Sauron erői ellen, hogy megmentse Középföldét.", duration_minutes=201, age_limit=12, genre="Fantasy", poster_url="https://www.imdb.com/title/tt0167260/", trailer_url="https://www.youtube.com/watch?v=r5X-hFf6Bwo")
        movie13 = Movie(title="Michael", description="A MICHAEL mozis portré a világ egyik legnagyobb hatású művészének életéről és hagyatékáról.A film Michael Jackson életét meséli el, túl a zenén, végigköveti páratlan tehetsége felfedezésének útját a Jackson Five-tól egészen odáig, amikor művészetének és kreatív ambícióinak lankadatlan tüzét annak rendelte alá, hogy a világ legnagyobb szórakoztatója legyen.A film eleddig páratlan betekintést nyújt a nézőknek a legenda kialakulásába. Tanúi lehetünk a popkirály színpadon kívüli életének csakúgy, mint szólókarrierje legikonikusabb előadásainak. Itt kezdődött az ő története.", duration_minutes=127, age_limit=12, genre="Életrajz", poster_url="https://m.media-amazon.com/images/M/MV5BNzllNmRlN2EtMDQyOC00ODJjLTg4OWQtZDNmNGU3YzlkNjc1XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", trailer_url="https://www.youtube.com/watch?v=hMybqLajEQk")
        movie14 = Movie(title="Bohemian Rhapsody", description="A Queen zenekar felemelkedésének és Freddie Mercury életének története, amely bemutatja a zene erejét és a művészet iránti szenvedélyt.", duration_minutes=134, age_limit=12, genre="Életrajz", poster_url="https://m.media-amazon.com/images/M/MV5BMTA2NDc3Njg5NDVeQTJeQWpwZ15BbWU4MDc1NDcxNTUz._V1_QL75_UX190_CR0,0,190,281_.jpg", trailer_url="https://www.youtube.com/watch?v=mP0VHJYFOAU")
        movie15 = Movie(title="istenek fegyverzete", description="A kalandor és kincsvadász Jackie veszélyt nem ismerve megszerzi az istenek fegyverzetének egy darabját a sivatag ősi városából. A fegyverek őrei azonban nem adják könnyen a misztikus kincset. A szekta követői elrabolják Jackie barátnőjét, Loreleit, hogy ezzel kényszerítsék a férfit a szent fegyverzetek összes darabjának átadására. A lány kiszabadítása nem tűnik könnyű feladatnak, ugyanis titkos csapdák, amazonok, és egy dühös varázsló keresztezik Jackie útját.", duration_minutes=88, age_limit=16, genre="Akció", poster_url="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnV4t8BnpjrD98XaoA_ueDNYWsyxxrB3Lhvg&s", trailer_url="https://www.youtube.com/watch?v=OfDVIGlnzAQ")
        db.add_all([movie1, movie2, movie3, movie4, movie5, movie6, movie7, movie8, movie9, movie10, movie11, movie12 , movie13, movie14, movie15])
        db.commit()
        
        # Termek
        room1 = Room(name="Room A", capacity=100, row=10, cols=10)
        room2 = Room(name="Room B", capacity=80, row=8, cols=10)
        room3 = Room(name="Room C", capacity=50, row=5, cols=10)
        room4 = Room(name="Room D", capacity=40, row=4, cols=10)
        room5 = Room(name="Room E", capacity=60, row=6, cols=10)
        db.add_all([room1, room2, room3, room4, room5])
        db.commit()

        
        # Showtimes
        showtime1 = Showtime(movie_id=1, room_id=1, start_time=datetime.datetime(2026, 7, 1, 19, 0))
        showtime2 = Showtime(movie_id=1, room_id=1, start_time=datetime.datetime(2026, 7, 1, 21, 0))
        showtime3 = Showtime(movie_id=1, room_id=3, start_time=datetime.datetime(2026, 7, 2, 19, 0))
        showtime4 = Showtime(movie_id=1, room_id=3, start_time=datetime.datetime(2026, 7, 2, 21, 0))
        showtime5 = Showtime(movie_id=1, room_id=5, start_time=datetime.datetime(2026, 7, 3, 19, 0))
        showtime6 = Showtime(movie_id=1, room_id=5, start_time=datetime.datetime(2026, 7, 3, 21, 0))
        showtime7 = Showtime(movie_id=2, room_id=2, start_time=datetime.datetime(2026, 7, 1, 15, 0))
        showtime8 = Showtime(movie_id=2, room_id=2, start_time=datetime.datetime(2026, 7, 1, 18, 0))
        showtime9 = Showtime(movie_id=2, room_id=1, start_time=datetime.datetime(2026, 7, 2, 15, 0))
        showtime10 = Showtime(movie_id=2, room_id=1, start_time=datetime.datetime(2026, 7, 2, 18, 0))
        showtime11 = Showtime(movie_id=2, room_id=4, start_time=datetime.datetime(2026, 7, 3, 15, 0))
        showtime12 = Showtime(movie_id=2, room_id=4, start_time=datetime.datetime(2026, 7, 3, 18, 0))
        showtime13 = Showtime(movie_id=3, room_id=1, start_time=datetime.datetime(2026, 7, 4, 19, 0))
        showtime14 = Showtime(movie_id=3, room_id=1, start_time=datetime.datetime(2026, 7, 4, 21, 0))
        showtime15 = Showtime(movie_id=3, room_id=5, start_time=datetime.datetime(2026, 7, 5, 19, 0))
        showtime16 = Showtime(movie_id=3, room_id=5, start_time=datetime.datetime(2026, 7, 5, 21, 0))
        showtime17 = Showtime(movie_id=3, room_id=4, start_time=datetime.datetime(2026, 7, 6, 19, 0))
        showtime18 = Showtime(movie_id=3, room_id=4, start_time=datetime.datetime(2026, 7, 6, 21, 0))
        showtime19 = Showtime(movie_id=4, room_id=5, start_time=datetime.datetime(2026, 7, 4, 15, 0))
        showtime20 = Showtime(movie_id=4, room_id=5, start_time=datetime.datetime(2026, 7, 4, 18, 0))
        showtime21 = Showtime(movie_id=4, room_id=2, start_time=datetime.datetime(2026, 7, 5, 15, 0))
        showtime22 = Showtime(movie_id=4, room_id=2, start_time=datetime.datetime(2026, 7, 5, 18, 0))
        showtime23 = Showtime(movie_id=4, room_id=3, start_time=datetime.datetime(2026, 7, 6, 15, 0))
        showtime24 = Showtime(movie_id=4, room_id=3, start_time=datetime.datetime(2026, 7, 6, 18, 0))
        showtime25 = Showtime(movie_id=5, room_id=1, start_time=datetime.datetime(2026, 7, 7, 19, 0))
        showtime26 = Showtime(movie_id=5, room_id=1, start_time=datetime.datetime(2026, 7, 7, 21, 0))
        showtime27 = Showtime(movie_id=5, room_id=3, start_time=datetime.datetime(2026, 7, 8, 19, 0))
        showtime28 = Showtime(movie_id=5, room_id=3, start_time=datetime.datetime(2026, 7, 8, 21, 0))
        showtime29 = Showtime(movie_id=5, room_id=5, start_time=datetime.datetime(2026, 7, 9, 19, 0))
        showtime30 = Showtime(movie_id=5, room_id=5, start_time=datetime.datetime(2026, 7, 9, 21, 0))
        showtime31 = Showtime(movie_id=6, room_id=1, start_time=datetime.datetime(2026, 7, 7, 15, 0))
        showtime32 = Showtime(movie_id=6, room_id=1, start_time=datetime.datetime(2026, 7, 7, 18, 0))
        showtime33 = Showtime(movie_id=6, room_id=3, start_time=datetime.datetime(2026, 7, 8, 15, 0))
        showtime34 = Showtime(movie_id=6, room_id=3, start_time=datetime.datetime(2026, 7, 8, 18, 0))
        showtime35 = Showtime(movie_id=6, room_id=5, start_time=datetime.datetime(2026, 7, 9, 15, 0))
        showtime36 = Showtime(movie_id=6, room_id=5, start_time=datetime.datetime(2026, 7, 9, 18, 0))
        showtime37 = Showtime(movie_id=7, room_id=1, start_time=datetime.datetime(2026, 7, 10, 19, 0))
        showtime38 = Showtime(movie_id=7, room_id=1, start_time=datetime.datetime(2026, 7, 10, 21, 0))
        showtime39 = Showtime(movie_id=7, room_id=3, start_time=datetime.datetime(2026, 7, 11, 19, 0))
        showtime40 = Showtime(movie_id=7, room_id=3, start_time=datetime.datetime(2026, 7, 11, 21, 0))
        showtime41 = Showtime(movie_id=7, room_id=5, start_time=datetime.datetime(2026, 7, 12, 19, 0))
        showtime42 = Showtime(movie_id=7, room_id=5, start_time=datetime.datetime(2026, 7, 12, 21, 0))
        showtime43 = Showtime(movie_id=8, room_id=5, start_time=datetime.datetime(2026, 7, 10, 15, 0))
        showtime44 = Showtime(movie_id=8, room_id=5, start_time=datetime.datetime(2026, 7, 10, 18, 0))
        showtime45 = Showtime(movie_id=8, room_id=2, start_time=datetime.datetime(2026, 7, 11, 15, 0))
        showtime46 = Showtime(movie_id=8, room_id=2, start_time=datetime.datetime(2026, 7, 11, 18, 0))
        showtime47 = Showtime(movie_id=8, room_id=4, start_time=datetime.datetime(2026, 7, 12, 15, 0))
        showtime48 = Showtime(movie_id=8, room_id=4, start_time=datetime.datetime(2026, 7, 12, 18, 0))
        showtime49 = Showtime(movie_id=9, room_id=2, start_time=datetime.datetime(2026, 7, 13, 19, 0))
        showtime50 = Showtime(movie_id=9, room_id=2, start_time=datetime.datetime(2026, 7, 13, 21, 0))
        showtime51 = Showtime(movie_id=9, room_id=5, start_time=datetime.datetime(2026, 7, 14, 19, 0))
        showtime52 = Showtime(movie_id=9, room_id=5, start_time=datetime.datetime(2026, 7, 14, 21, 0))
        showtime53 = Showtime(movie_id=9, room_id=2, start_time=datetime.datetime(2026, 7, 15, 19, 0))
        showtime54 = Showtime(movie_id=9, room_id=2, start_time=datetime.datetime(2026, 7, 15, 21, 0))
        showtime55 = Showtime(movie_id=10, room_id=4, start_time=datetime.datetime(2026, 7, 16, 19, 0))
        showtime56 = Showtime(movie_id=10, room_id=4, start_time=datetime.datetime(2026, 7, 16, 21, 0))
        showtime57 = Showtime(movie_id=10, room_id=5, start_time=datetime.datetime(2026, 7, 17, 19, 0))
        showtime58 = Showtime(movie_id=10, room_id=5, start_time=datetime.datetime(2026, 7, 17, 21, 0))
        showtime59 = Showtime(movie_id=10, room_id=2, start_time=datetime.datetime(2026, 7, 18, 19, 0))
        showtime60 = Showtime(movie_id=10, room_id=2, start_time=datetime.datetime(2026, 7, 18, 21, 0))
        showtime61 = Showtime(movie_id=11, room_id=1, start_time=datetime.datetime(2026, 7, 19, 19, 0))
        showtime62 = Showtime(movie_id=11, room_id=1, start_time=datetime.datetime(2026, 7, 19, 21, 0))
        showtime63 = Showtime(movie_id=11, room_id=4, start_time=datetime.datetime(2026, 7, 20, 19, 0))
        showtime64 = Showtime(movie_id=11, room_id=4, start_time=datetime.datetime(2026, 7, 20, 21, 0))
        showtime65 = Showtime(movie_id=11, room_id=3, start_time=datetime.datetime(2026, 7, 21, 19, 0))
        showtime66 = Showtime(movie_id=11, room_id=3, start_time=datetime.datetime(2026, 7, 21, 21, 0))
        showtime67 = Showtime(movie_id=12, room_id=1, start_time=datetime.datetime(2026, 7, 22, 19, 0))
        showtime68 = Showtime(movie_id=12, room_id=1, start_time=datetime.datetime(2026, 7, 22, 21, 0))
        showtime69 = Showtime(movie_id=12, room_id=3, start_time=datetime.datetime(2026, 7, 23, 19, 0))
        showtime70 = Showtime(movie_id=12, room_id=3, start_time=datetime.datetime(2026, 7, 23, 21, 0))
        showtime71 = Showtime(movie_id=12, room_id=5, start_time=datetime.datetime(2026, 7, 24, 19, 0))
        showtime72 = Showtime(movie_id=12, room_id=5, start_time=datetime.datetime(2026, 7, 24, 21, 0))
        showtime73 = Showtime(movie_id=13, room_id=1, start_time=datetime.datetime(2026, 7, 25, 15, 0))
        showtime74 = Showtime(movie_id=13, room_id=1, start_time=datetime.datetime(2026, 7, 25, 19, 0))
        showtime75 = Showtime(movie_id=13, room_id=3, start_time=datetime.datetime(2026, 7, 26, 15, 0))
        showtime76 = Showtime(movie_id=13, room_id=3, start_time=datetime.datetime(2026, 7, 26, 19, 0))
        showtime77 = Showtime(movie_id=13, room_id=5, start_time=datetime.datetime(2026, 7, 27, 15, 0))
        showtime78 = Showtime(movie_id=13, room_id=5, start_time=datetime.datetime(2026, 7, 27, 19, 0))
        showtime79 = Showtime(movie_id=14, room_id=3, start_time=datetime.datetime(2026, 7, 28, 19, 0))
        showtime80 = Showtime(movie_id=14, room_id=3, start_time=datetime.datetime(2026, 7, 28, 21, 0))
        showtime81 = Showtime(movie_id=14, room_id=2, start_time=datetime.datetime(2026, 7, 29, 19, 0))
        showtime82 = Showtime(movie_id=14, room_id=2, start_time=datetime.datetime(2026, 7, 29, 21, 0))
        showtime83 = Showtime(movie_id=14, room_id=1, start_time=datetime.datetime(2026, 7, 30, 19, 0))
        showtime84 = Showtime(movie_id=14, room_id=1, start_time=datetime.datetime(2026, 7, 30, 21, 0))
        showtime85 = Showtime(movie_id=15, room_id=5, start_time=datetime.datetime(2026, 7, 31, 19, 0))
        showtime86 = Showtime(movie_id=15, room_id=5, start_time=datetime.datetime(2026, 7, 31, 21, 0))
        showtime87 = Showtime(movie_id=15, room_id=4, start_time=datetime.datetime(2026, 8, 1, 19, 0))
        showtime88 = Showtime(movie_id=15, room_id=4, start_time=datetime.datetime(2026, 8, 1, 21, 0))
        showtime89 = Showtime(movie_id=15, room_id=2, start_time=datetime.datetime(2026, 8, 2, 19, 0))
        showtime90 = Showtime(movie_id=15, room_id=2, start_time=datetime.datetime(2026, 8, 2, 21, 0))
        
        db.add_all([showtime1, showtime2, showtime3, showtime4, showtime5, showtime6, showtime7, showtime8, showtime9, showtime10, showtime11, showtime12, showtime13, showtime14, showtime15, showtime16, showtime17, showtime18, showtime19, showtime20, showtime21, showtime22, showtime23, showtime24, showtime25, showtime26, showtime27, showtime28, showtime29, showtime30, showtime31, showtime32, showtime33, showtime34, showtime35, showtime36, showtime37, showtime38, showtime39, showtime40, showtime41, showtime42, showtime43, showtime44, showtime45, showtime46, showtime47, showtime48 ,showtime49 ,showtime50 ,showtime51 ,showtime52 ,showtime53 ,showtime54 ,showtime55 ,showtime56 ,showtime57 ,showtime58 ,showtime59 ,showtime60 ,showtime61 ,showtime62 ,showtime63 ,showtime64 ,showtime65 ,showtime66 ,showtime67 ,showtime68 ,showtime69 ,showtime70 ,showtime71 ,showtime72 ,showtime73 ,showtime74 ,showtime75 ,showtime76 ,showtime77 ,showtime78 ,showtime79 ,showtime80 ,showtime81 ,showtime82 ,showtime83 ,showtime84 ,showtime85 ,showtime86 ,showtime87 ,showtime88 ,showtime89 ,showtime90 ])
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
        hashed_password = pwd_context.hash("admin123") # Ez lesz a jelszava: admin123
        
        new_admin = User(
            username="admin",
            email="admin@mozi.hu",
            hashed_password=hashed_password,
            is_admin=True # EZ A LÉNYEG: ő lesz az admin!
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

