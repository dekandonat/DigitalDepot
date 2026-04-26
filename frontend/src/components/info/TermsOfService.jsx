import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPolicy.css';

export default function TermsOfService() {
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

          <h1>Általános Szerződési Feltételek</h1>
          <p className="lastUpdated">Utoljára frissítve: {new Date().toLocaleDateString('hu-HU')}</p>

          <section>
            <h2>1. Bevezetés</h2>
            <p>
              Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a DigitalDepot webáruház (továbbiakban: Szolgáltató) és a szolgáltatást igénybe vevő vásárló (továbbiakban: Vevő) jogait és kötelezettségeit tartalmazza.
            </p>
          </section>

          <section>
            <h2>2. Megrendelés és fizetés</h2>
            <p>
              A megrendelés leadása elektronikus úton történik. A fizetés jelenleg kizárólag utánvéttel, a futárnál lehetséges készpénzben vagy bankkártyával. A vételár minden esetben tartalmazza a törvényben előírt áfát.
            </p>
          </section>

          <section>
            <h2>3. Szállítási feltételek</h2>
            <p>
              A termékeket a megadott szállítási címre logisztikai partnerünk szállítja ki. A várható szállítási időről a rendszer automatikus visszaigazoló e-mailt küld.
            </p>
          </section>

          <section>
            <h2>4. Használt termékek felvásárlása</h2>
            <p>
              A DigitalDepot lehetőséget biztosít használt elektronikai eszközök leadására. A beküldött adatok alapján a Szolgáltató árajánlatot tesz, melynek elfogadása esetén a vételárat a Vevő által megadott bankszámlaszámra utalja át.
            </p>
          </section>

          <section>
            <h2>5. Garancia és panaszkezelés</h2>
            <p>
              Termékhiba esetén a Vevő az ügyfélszolgálati chat felületen vagy a megadott elérhetőségeken jelezheti panaszát. A termékekre a törvényi előírásoknak megfelelő jótállást vállalunk.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}