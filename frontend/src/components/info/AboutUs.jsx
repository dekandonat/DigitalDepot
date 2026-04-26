import React, { useEffect } from 'react';
import './PrivacyPolicy.css';

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pageWrapper">
      <div className="policyContainer">
        <div className="policyCard">
          <h1>Rólunk</h1>
          <p className="lastUpdated">Ismerje meg a DigitalDepot csapatát!</p>

          <section>
            <h2>Küldetésünk</h2>
            <p>
              A DigitalDepot azért jött létre, hogy egyszerűbbé és fenntarthatóbbá tegye az elektronikai eszközök kereskedelmét. Nem csak új alkatrészeket és konzolokat kínálunk, hanem segítünk abban is, hogy régi, használt eszközei új életre keljenek vagy biztonságos forrásból találjanak gazdára.
            </p>
          </section>

          <section>
            <h2>Miért minket válasszon?</h2>
            <p>
              Webáruházunkban kiemelt figyelmet fordítunk a biztonságra: minden jelszót titkosítva tárolunk, a rendeléseket pedig gyorsan és pontosan dolgozzuk fel. Ügyfélszolgálati chatünk segítségével azonnali támogatást nyújtunk vásárlóinknak minden felmerülő kérdésben.
            </p>
          </section>

          <section>
            <h2>Csapatunk</h2>
            <p>
              Szakértőink több éves tapasztalattal rendelkeznek az informatikai hardverek és szórakoztató elektronika területén. Minden beküldött használt terméket precíz bevizsgálásnak vetünk alá, hogy a legjobb árat biztosíthassuk ügyfeleinknek.
            </p>
          </section>

          <section>
            <h2>Elérhetőségünk</h2>
            <p>
              Központunk Budapesten található, ahonnan az ország egész területére biztosítjuk a kiszállítást. Kérdés esetén forduljon hozzánk bizalommal a chat felületen keresztül!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}