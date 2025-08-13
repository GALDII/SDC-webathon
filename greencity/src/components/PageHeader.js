import React from 'react';

const PageHeader = ({ title, subtitle }) => (
  <div className="text-center my-8 md:my-12">
    <h1 className="text-4xl md:text-5xl font-bold text-gray-800">{title}</h1>
    <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
  </div>
);

export default PageHeader;