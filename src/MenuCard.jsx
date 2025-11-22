// src/Home/MenuCard.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // 👈 IMPORT LINK
import './Home/App.css';

// Ensure the props match the keys in your App.jsx menuData
const MenuCard = ({ id, title, linkUrl, imageSrc, imageAlt, items, animationClass, animationDelay }) => {
    return (
        // The entire card is wrapped in the Link component
        <Link
            to={linkUrl} // 👈 Use the linkUrl prop for navigation
            className={`menu-link-card ${id} ${animationClass}`}
            style={{ animationDelay: animationDelay }}
        >
            <img src={imageSrc} alt={imageAlt} className="menu-image" />
            <h3>{title}</h3>
            <ul>
                {items.map((item, index) => (
                    <li key={index}>
                        <strong>{item.name}</strong>
                        <br />
                        {item.description}
                        {item.price && <span className="price">{item.price.replace('$', 'Ksh. ')}</span>}
                    </li>
                ))}
            </ul>
            <span className="learn-more">Explore Menu →</span>
        </Link>
    );
};

export default MenuCard;