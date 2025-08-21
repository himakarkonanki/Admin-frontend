import React from 'react';
import './Watermark.css';

const Watermark = ({ svgSrc, style = {} }) => {
  return (
    <div className="watermark-container" style={style}>
      <img src={svgSrc} alt="Watermark" className="watermark-svg" />
    </div>
  );
};

export default Watermark;
