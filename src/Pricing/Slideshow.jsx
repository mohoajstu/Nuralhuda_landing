// /mnt/data/Slideshow.jsx
import React, { useState, useEffect } from 'react';


const slides = [
    {
        title: "Free Plan",
        description: "What is available now for free.",
        image: "/path/to/free-plan-logo.png",
    },
    {
        title: "Basic Plan",
        description: "Just Nur Al Huda for $15 USD per month.",
        image: "./img/about-nbg.png",
    },
    {
        title: "Premium Plan",
        description: "All Assistants for $20 USD per month.",
        image: "./img/Advanced-NAHK.png",
    },
    {
        title: "Enterprise Plan",
        description: "Contact us for more information on our enterprise plan.",
        image: "./img/enterprise.png",
    },
];

const Slideshow = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handlePrev = () => {
        setCurrentSlide((prevSlide) => (prevSlide === 0 ? slides.length - 1 : prevSlide - 1));
    };

    const handleNext = () => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    };

    return (
        <div className="slideshow">
            <button className="arrow left" onClick={handlePrev}>&#9664;</button>
            <div className="slide">
                <img src={slides[currentSlide].image} alt={slides[currentSlide].title} className="slide-image"/>
                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].description}</p>
            </div>
            <button className="arrow right" onClick={handleNext}>&#9654;</button>
        </div>
    );
};

export default Slideshow;
