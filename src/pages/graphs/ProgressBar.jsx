// src/components/ProgressBar.jsx
import React, { useState, useEffect } from 'react';

const ProgressBar = ({ percent, height = 8 }) => {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    // trigger animation on mount / percent change
    const id = setTimeout(() => setFill(percent), 50);
    return () => clearTimeout(id);
  }, [percent]);

  return (
    <div
      className="w-full bg-black rounded overflow-hidden"
      style={{ height: `${height}px` }}
    >
      <div
        className="bg-yellow-400 h-full rounded transition-all duration-1000 ease-out"
        style={{ width: `${fill}%` }}
      />
    </div>
  );
};

export default ProgressBar;
