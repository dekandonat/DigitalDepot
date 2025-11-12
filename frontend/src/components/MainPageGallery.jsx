import React from "react";
import { useState } from "react";
import "./MainPageGallery.css";

export default function MainPageGallery({data}) {
    const [current, setCurrent] = useState(0);
    const length = data.length;

    const nextSlide = () => setCurrent((current + 1) % length);
    const prevSlide = () => setCurrent((current - 1 + length) % length);

    return (
        <div className="mainPageGallery">
            <button onClick={prevSlide} className="arrow left">‹</button>
            <img src={data[current].src} alt={data[current].alt} className="slide" />
            <button onClick={nextSlide} className="arrow right">›</button>
        </div>
    );
}