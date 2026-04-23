# DigitalDepot

A **DigitalDepot** egy webshop alkalmazás, amely új és használt műszaki cikkekkel kereskedik. A felhasználóknak lehetőségük van:

- eladni kívánt termékeiket eladásra kínálni
- probléma esetén **élő chat** felületen segítséget kérni az adminoktól

## Főbb funkciók

- Termékek rendelése
- Használt termékek eladása
- Élő chat az adminokkal
- Adminisztrátori felület (minden kezelése egy helyen)

## Követelmények

- Node.js (LTS)
- npm
- Internet elérés
- XAMPP (MySQL + phpMyAdmin)

## Telepítés / Indítás

1. Klónozd le a repositoryt.
2. Nyisd meg Visual Studio Code-ban.

### Backend beállítása

1. Hozz létre a `backend` mappában egy `.env` nevű fájlt, majd add meg a következő változókat:

   - `IP` = szerver IP-címe  
   - `PORT` = szerver portja  
   - `HOST` = adatbázis elérése (host)  
   - `USER` = adatbázis felhasználó  
   - `PASSWORD` = adatbázis jelszó (hagyd üresen, ha nincs)  
   - `DATABASE` = `digitaldepot`  
   - `SECRET` = egy random karakterlánc a tokenekhez  
   - `EMAIL_PASSWORD` = email cím app jelszó  
   - `EMAIL_USER` = email cím  

2. Lépj be a backend mappába:

   ```bash
   cd backend
   ```

3. Telepítsd a függőségeket:

   ```bash
   npm install
   ```

4. Indítsd el a backendet:

   ```bash
   npm start
   ```

### Frontend beállítása

1. Egy új terminálban lépj be a frontend mappába:

   ```bash
   cd frontend
   ```

2. Telepítsd a függőségeket:

   ```bash
   npm install
   ```

3. Indítsd el a frontendet:

   ```bash
   npm run dev
   ```

### Adatbázis importálása

1. Keresd meg a `digitaldepot.sql` fájlt.
2. Importáld be a **phpMyAdmin** felületén.

## Használat

- Kattints a terminálban megjelenő linkre, vagy nyisd meg a böngésződben:
  - `http://localhost:5173`