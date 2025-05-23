import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  Cell,
  XAxis,
  YAxis
} from 'recharts';

const RiskBarChart = ({ counts }) => {
  const categories = [
    { label: 'Muy Bajo',          color:  '#16a34a'  },
    { label: 'Bajo',              color:  '#3b82f6'  },
    { label: 'Medio',             color:  '#ca8a04'  },
    { label: 'Alto',              color:  '#ef4444'  },
    { label: 'Muy Alto',          color:  '#000000'   }
  ];

  const data = categories.map(cat => ({
    category: cat.label,
    count:    counts[cat.label] || 0,
    color:    cat.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        barSize={40}                      // make bars thinner
        barCategoryGap="10%"              // spacing between bars
      >
        {/* hide axes & labels */}
        <XAxis dataKey="category" hide />
        <YAxis hide allowDecimals={false} />

        <Tooltip 
          formatter={(value) => [value, '']} 
        />

        <Bar
          dataKey="count"
          isAnimationActive
          animationBegin={0}                // start immediately
          animationDuration={1200}          // 1.2s rise
          animationEasing="ease-out"
        >
          {data.map(entry => (
            <Cell key={entry.category} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RiskBarChart;
