// src/CakeCard.jsx
import React from 'react';

const CakeCard = ({ id, title, description, imageSrc, imageAlt, animationDelay = '0s' }) => {
    return (
        <div 
            className={`cake-card ${id} animated-element slide-in-up`}
            style={{ animationDelay: animationDelay }}
        >
            <img src={imageSrc} alt={imageAlt} width="200" height="auto" />
            <h2>{title}</h2>
            <p>{description}</p>
            <button className="add-to-cart-btn">Add to Cart</button>
        </div>
    );
};

export default CakeCard;