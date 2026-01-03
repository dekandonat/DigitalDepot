import React, { useState, useEffect } from "react";
import "./MainPageGallery.css";

export default function MainPageGallery({data}) {
    const [current, setCurrent] = useState(0);
    const length = data.length;

    useEffect(() => {
        const autoSlide = setInterval(() => {
            setCurrent((current) => (current + 1) % length);
        }, 5000);

        return () => clearInterval(autoSlide);
    }, [current, length]);

    const nextSlide = () => setCurrent((current + 1) % length);
    const prevSlide = () => setCurrent((current - 1 + length) % length);

    if (!Array.isArray(data) || data.length <= 0) {
        return null;
    }

    return (
        <div className="mainPageGallery">
            <button onClick={prevSlide} className="arrow left">‹</button>
            <img src={data[current].src} alt={data[current].alt} className="slide" />
            <button onClick={nextSlide} className="arrow right">›</button>
        </div>
    );
}