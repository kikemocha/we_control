// src/components/PersonsCount.jsx
import React from 'react';
import CountUp from 'react-countup';

const PersonsCount = ({ counts }) => {
  return (
    <div className="flex flex-col space-y-8 h-full justify-around">
      {Object.entries(counts).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className=" w-full mb-6 text-md uppercase text-gray-600 text-center mx-auto">{label}</span>
          <CountUp
            start={0}
            end={value}
            duration={1.5}
            separator=","
            className="text-4xl font-bold"
          />
        </div>
      ))}
    </div>
  );
};

export default PersonsCount;
