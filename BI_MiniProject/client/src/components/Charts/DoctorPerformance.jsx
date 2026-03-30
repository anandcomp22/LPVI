import React from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const DoctorPerformance = ({ data, variants, minimize = true }) => {
  return (
    <motion.section 
       className="card" 
       variants={variants} 
       style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: minimize ? 'auto' : '500px' }}
    >
       <div className="card-header" style={{ marginBottom: minimize ? '0' : '24px' }}>
          <div>
            <h3 className="card-title">Top Performing Doctors</h3>
            {!minimize && <p className="card-subtitle">Comprehensive directory with revenue statistics.</p>}
          </div>
          {minimize && (
            <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Directory <ChevronRight size={16} />
            </button>
          )}
       </div>
       <div className="table-container" style={{ marginTop: '24px', flex: 1 }}>
          <table className="premium-table">
            <thead>
              <tr>
                <th>Doctor Name</th>
                <th>Department</th>
                <th>Patients Treated</th>
                {!minimize && <th>Total Revenue Generated</th>}
                <th>Satisfaction Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((doc, idx) => {
                 // Convert pseudo-random data into a realistic score 85-99%
                 const satisfaction = 100 - (idx * 1.5) - (doc.patients % 5);
                 return (
                 <tr key={idx}>
                   <td style={{ fontWeight: 600 }}>{doc.name}</td>
                   <td><span className="badge-tag">{doc.dept}</span></td>
                   <td style={{ color: 'var(--text-secondary)' }}>{doc.patients}</td>
                   {!minimize && (
                     <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                       ${doc.revenue.toLocaleString()}
                     </td>
                   )}
                   <td>
                      <div className="progress-bar-container">
                        <div className="progress-track" style={{ width: minimize ? 'auto' : '120px' }}>
                           <div className="progress-fill" style={{ width: `${satisfaction}%`, background: satisfaction > 90 ? 'var(--success)' : 'var(--warning)' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{satisfaction.toFixed(1)}%</span>
                      </div>
                   </td>
                   <td>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <div style={{ 
                         width: '8px', 
                         height: '8px', 
                         borderRadius: '50%', 
                         background: idx < 6 ? 'var(--success)' : 'var(--text-secondary)' 
                       }}></div>
                       <span style={{ 
                         fontSize: '0.85rem', 
                         fontWeight: 600, 
                         color: idx < 6 ? 'var(--success)' : 'var(--text-secondary)' 
                       }}>
                         {idx < 6 ? 'Available' : 'At Capacity'}
                       </span>
                     </div>
                   </td>
                 </tr>
                 );
              })}
            </tbody>
          </table>
       </div>
    </motion.section>
  );
};

export default DoctorPerformance;
