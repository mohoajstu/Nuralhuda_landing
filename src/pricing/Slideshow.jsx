import React, { useState, useEffect } from 'react';

const slides = [
    {
            title: "Basic Plan",
            description: "Nur Al Huda for $9.99 per month.",
            image: "./img/about-nbg.png",
    },
    {
            title: "Hybrid Plan",
            description: "Nur Al Huda And Nur Al Huda for Kids for $16.99 per month.",
            image: "./img/NAHandK.png",
    },
    {
            title: "Pro Plan",
            description: "All Assistants for $19.99 per month.",
            image: "./img/enterprise.png",
    },
    {
            title: "Premium Plan",
            description: "All Assistants and Tools for $35 per month.",
            image: "./img/assistantsTools.png",
    },
    {
            title: "Enterprise Plan",
            description: "Contact us for more information on our enterprise plan (Best For Schools)",
            image: "./img/assistantsTools.png",
    },    
];

const Slideshow = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 7000);

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
            <div className="slideshowSlide">
                <img src={slides[currentSlide].image} alt={slides[currentSlide].title} className="slide-image"/>
                <h2>{slides[currentSlide].title}</h2>
                <h4>{slides[currentSlide].description}</h4>
            </div>
            <button className="arrow right" onClick={handleNext}>&#9654;</button>
        </div>
    );
};

export default Slideshow;