import React from 'react';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${className}`}>
        {children}
    </div>
);

export default Card;