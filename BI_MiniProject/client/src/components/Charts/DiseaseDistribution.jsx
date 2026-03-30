import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DiseaseDistribution = ({ data }) => {
  const COLORS = ['#4338ca', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#cbd5e1'];

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
            animationDuration={2000}
            cornerRadius={4}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                style={{ outline: 'none' }}
              />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ 
                backgroundColor: 'var(--surface-color)', 
                border: '1px solid var(--border)', 
                borderRadius: '12px', 
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{ fontWeight: 700, color: 'var(--text-primary)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            formatter={(value) => <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '4px' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DiseaseDistribution;
