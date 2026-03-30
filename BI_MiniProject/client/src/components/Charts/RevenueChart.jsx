import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => {
  return (
    <div style={{ height: '260px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" opacity={0.6} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
            dy={10}
            minTickGap={40}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 600 }}
            tickFormatter={(val) => `$${val/1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--surface-solid)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow-lg)' 
            }}
            labelStyle={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '700' }}
            itemStyle={{ color: 'var(--success)', fontSize: '18px', fontWeight: '800' }}
            formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            strokeWidth={4} 
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            animationDuration={2500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
