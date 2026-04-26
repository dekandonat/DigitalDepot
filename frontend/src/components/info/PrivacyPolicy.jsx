import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pageWrapper">
      <div className="policyContainer">
        <div className="policyCard">
          <button className="backBtn" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          
          <h1>Adatvédelmi Tájékoztató</h1>
          <p className="lastUpdated">Utoljára frissítve: {new Date().toLocaleDateString('hu-HU')}</p>

          <section>
            <h2>1. Az adatkezelés célja</h2>
            <p>
              A DigitalDepot webáruház üzemeltetése során a felhasználók személyes adatait kizárólag a szolgáltatások biztosítása, a rendelések teljesítése és a kapcsolattartás érdekében kezeljük.
            </p>
          </section>

          <section>
            <h2>2. Biztonság és technikai védelem</h2>
            <p>
              Rendszerünk kiemelt figyelmet fordít az adatok biztonságára. A jelszavakat erős, egyirányú titkosítással tároljuk az adatbázisban, így azokhoz harmadik fél nem férhet hozzá. A bejelentkezések biztonságát JWT (JSON Web Token) alapú azonosítás garantálja.
            </p>
          </section>

          <section>
            <h2>3. Rendelés és szállítás</h2>
            <p>
              A vásárlás során megadott szállítási címeket (irányítószám, város, utca, házszám) kizárólag a csomagok pontos kézbesítése érdekében továbbítjuk logisztikai partnereinknek.
            </p>
          </section>

          <section>
            <h2>4. Használt termékek és pénzügyi adatok</h2>
            <p>
              Amennyiben Ön használt terméket ad el a DigitalDepot számára, a kifizetés teljesítése érdekében bekérjük bankszámlaszámát. Ezt az adatot kizárólag az utaláshoz használjuk fel. Rendszerünk bankkártyaadatokat nem kér be és nem tárol, a fizetés jelenleg utánvétellel történik.
            </p>
          </section>

          <section>
            <h2>5. Kommunikáció és Chat</h2>
            <p>
              Az ügyfélszolgálati chat funkció használata során küldött üzeneteket biztonságosan rögzítjük az adatbázisban a későbbi visszakövethetőség és minőségbiztosítás érdekében.
            </p>
          </section>

          <section>
            <h2>6. Felhasználói jogok</h2>
            <p>
              Önnek joga van tájékoztatást kérni adatainak kezeléséről, kérheti azok módosítását vagy törlését. A mentett bankszámlaszám és szállítási címek a Profil menüpontban bármikor önállóan is kezelhetők.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}