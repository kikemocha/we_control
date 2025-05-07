// src/components/ControlsDonutChart.jsx
import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';

const ControlsDonutChart = ({ counts }) => {
  const data = [
    { name: 'Transversal',   value: counts['Transversal']   || 0 },
    { name: 'Especifico',   value: counts['Especifico']   || 0 },
  ];
  const total = data.reduce((sum, e) => sum + e.value, 0);
  const COLORS = ['#000000', '#e5f301']; // black, yellow

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        {/* center label */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 24, fontWeight: 'bold' }}
        >
          {total}
        </text>

        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={2}
          isAnimationActive
          animationBegin={0}
          animationDuration={1200}
          animationEasing="ease-out"
        >
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={COLORS[i]} />
          ))}
        </Pie>

        <Tooltip
          formatter={(value, name) => [`${value}`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ControlsDonutChart;
