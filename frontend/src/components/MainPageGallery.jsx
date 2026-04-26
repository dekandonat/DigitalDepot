import React from 'react';
import './MainPageGallery.css';

export default function MainPageGallery({ data }) {
  if (!Array.isArray(data) || data.length <= 0) {
    return null;
  }

  const tickerData = [...data, ...data];

  return (
    <div className="galleryTickerContainer">
      <div className="tickerTrack">
        {tickerData.map((item, index) => (
          <div key={index} className="tickerItem">
            <img src={item.img} alt={item.alt || "hirdetés"} className="tickerImage" />
          </div>
        ))}
      </div>
    </div>
  );
}