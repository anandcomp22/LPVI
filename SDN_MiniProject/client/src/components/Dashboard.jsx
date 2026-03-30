import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Network, 
  Activity, 
  Settings, 
  Server,
  Zap,
  Globe,
  Radio,
  Cpu,
  RefreshCw,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Monitor');

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/sdn-metrics');
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds for live data
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return (
    <div className="loader-container">
      <RefreshCw className="spinner" size={36} />
      <p style={{ fontWeight: 600 }}>Initializing Controller Handshake...</p>
    </div>
  );

  const { topology, status, charts, logs } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Network size={28} />
          <span className="sidebar-title">Nexus NOC Center</span>
        </div>
        <nav className="sidebar-nav">
          <NavItem icon={<Activity size={20} />} label="Live Monitor" active={activeTab === 'Monitor'} onClick={() => setActiveTab('Monitor')} />
          <NavItem icon={<Globe size={20} />} label="Topology Map" active={activeTab === 'Topology'} onClick={() => setActiveTab('Topology')} />
          <NavItem icon={<Server size={20} />} label="Flow Tables" active={activeTab === 'Flows'} onClick={() => setActiveTab('Flows')} />
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', fontWeight: 700, margin: '16px 0 8px 16px' }}>Diagnostics</div>
          <NavItem icon={<Settings size={20} />} label="System Config" active={activeTab === 'Config'} onClick={() => setActiveTab('Config')} />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-area">
        <header className="top-header">
          <div className="live-status">
            <div className="live-dot"></div>
            LIVE TRAFFIC
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <Bell size={20} />
            </button>
            <button className="btn-primary" onClick={fetchData}>
               <RefreshCw size={16} /> Force Sync
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-header">
            <h2 className="page-title">{activeTab === 'Monitor' ? 'Real-Time Telemetry' : activeTab}</h2>
            <p className="page-subtitle">SDN Controller OpenFlow Metrics</p>
          </div>
          
          <AnimatePresence mode="wait">
            {activeTab === 'Monitor' && (
              <motion.div key="monitor" variants={containerVariants} initial="hidden" animate="show" exit="exit">
                <div className="kpi-grid">
                  <motion.div variants={itemVariants}>
                    <KPICard title="Switches Connected" value={topology.switches} icon={<Cpu size={24} />} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <KPICard title="Active Target Path" value={status.activePath} icon={<Radio size={24} />} isText />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <KPICard title="Core Network Load" value={status.overallLoad} icon={<Zap size={24} />} />
                  </motion.div>
                </div>

                <div className="dashboard-grid">
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <motion.section className="card" variants={itemVariants}>
                         <h3 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Bandwidth Load (Mbps)</h3>
                         <div style={{ height: '300px', width: '100%' }}>
                           <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={charts.timeSeries}>
                               <defs>
                                 <linearGradient id="colorBw" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                                 </linearGradient>
                               </defs>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                               <XAxis dataKey="time" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                               <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} />
                               <Tooltip 
                                 contentStyle={{ backgroundColor: 'var(--surface-solid)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                 itemStyle={{ color: 'var(--accent)', fontWeight: 700 }}
                               />
                               <Area type="monotone" dataKey="bandwidth" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorBw)" isAnimationActive={false} />
                             </AreaChart>
                           </ResponsiveContainer>
                         </div>
                      </motion.section>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <motion.section className="card" variants={itemVariants}>
                         <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Network Latency (ms)</h3>
                         <div style={{ height: '200px', width: '100%' }}>
                           <ResponsiveContainer width="100%" height="100%">
                             <LineChart data={charts.timeSeries}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                               <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }} axisLine={false} tickLine={false} />
                               <Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '4px' }} itemStyle={{ color: 'var(--warning)' }} />
                               <Line type="stepAfter" dataKey="latency" stroke="var(--warning)" strokeWidth={2} dot={false} isAnimationActive={false} />
                             </LineChart>
                           </ResponsiveContainer>
                         </div>
                      </motion.section>

                      <motion.section className="card" variants={itemVariants} style={{ flex: 1 }}>
                         <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Controller Action Log</h3>
                         <div className="terminal-window">
                           {logs.map((log, i) => {
                             const isWarn = log.includes('WARNING');
                             const isAction = log.includes('ACTION');
                             return (
                               <div key={i} className="terminal-line">
                                 <span className="term-timestamp">{log.split('] ')[0] + ']'}</span>
                                 <span className={isWarn ? 'term-warning' : isAction ? 'term-action' : 'term-info'}>
                                    {log.split('] ')[1]}
                                 </span>
                               </div>
                             );
                           })}
                         </div>
                      </motion.section>
                   </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'Topology' && (
              <motion.div key="topology" variants={containerVariants} initial="hidden" animate="show" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <motion.div variants={itemVariants} className="kpi-grid">
                    <KPICard title="Total Switches" value={topology.switches} icon={<Cpu size={24} />} />
                    <KPICard title="Total Hosts" value={topology.hosts} icon={<Server size={24} />} />
                    <KPICard title="Active Links" value={topology.activeLinks} icon={<Network size={24} />} />
                 </motion.div>
                 
                 <motion.section className="card" variants={itemVariants} style={{ position: 'relative', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(34, 197, 94, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                    
                    <h3 style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>SDN Active Path Visualization</h3>
                    
                    <div className="topology-canvas" style={{ position: 'relative', width: '700px', height: '300px', marginTop: '40px' }}>
                        
                        {/* SVG Connections */}
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
                            {/* Path A Lines */}
                            <g style={{ opacity: status.activePath.includes('A') ? 1 : 0.2, transition: 'opacity 0.5s', strokeDasharray: '4 4' }}>
                                <line x1="50" y1="150" x2="180" y2="80" stroke="var(--accent)" strokeWidth="3" />
                                <line x1="180" y1="80" x2="350" y2="80" stroke="var(--accent)" strokeWidth="3" />
                                <line x1="350" y1="80" x2="520" y2="80" stroke="var(--accent)" strokeWidth="3" />
                                <line x1="520" y1="80" x2="650" y2="150" stroke="var(--accent)" strokeWidth="3" />
                            </g>

                            {/* Path B Lines */}
                            <g style={{ opacity: status.activePath.includes('B') ? 1 : 0.2, transition: 'opacity 0.5s', strokeDasharray: '4 4' }}>
                                <line x1="50" y1="150" x2="350" y2="220" stroke="var(--warning)" strokeWidth="3" />
                                <line x1="350" y1="220" x2="650" y2="150" stroke="var(--warning)" strokeWidth="3" />
                            </g>
                        </svg>

                        {/* Nodes */}
                        <div style={{ position: 'absolute', left: '10px', top: '120px', zIndex: 5 }}>
                            <HostNode label="h1" ip="10.0.0.1" />
                        </div>
                        
                        <div style={{ position: 'absolute', left: '150px', top: '50px', zIndex: 5 }}>
                            <SwitchNode label="s1" active={status.activePath.includes('A')} color="var(--accent)" />
                        </div>
                        <div style={{ position: 'absolute', left: '320px', top: '50px', zIndex: 5 }}>
                            <SwitchNode label="s5" active={status.activePath.includes('A')} color="var(--accent)" />
                        </div>
                        <div style={{ position: 'absolute', left: '490px', top: '50px', zIndex: 5 }}>
                            <SwitchNode label="s8" active={status.activePath.includes('A')} color="var(--accent)" />
                        </div>

                        <div style={{ position: 'absolute', left: '320px', top: '190px', zIndex: 5 }}>
                            <SwitchNode label="s4" active={status.activePath.includes('B')} color="var(--warning)" />
                        </div>

                        <div style={{ position: 'absolute', left: '610px', top: '120px', zIndex: 5 }}>
                            <HostNode label="h16" ip="10.0.0.16" />
                        </div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '24px', fontSize: '0.85rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)' }}></div> Path A (Primary)
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--warning)' }}></div> Path B (Failover)
                         </div>
                    </div>
                 </motion.section>
              </motion.div>
            )}

            {activeTab === 'Flows' && (
              <motion.div key="flows" variants={containerVariants} initial="hidden" animate="show" exit="exit">
                 <motion.section className="card" variants={itemVariants}>
                    <h3 style={{ paddingBottom: '24px' }}>OpenFlow Rules (Controller Pushed)</h3>
                    <div style={{ overflowX: 'auto' }}>
                       <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                          <thead>
                             <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Switch</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Table ID</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Priority</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Match Criteria (L2/L3)</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Action</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)' }}>Traffic (PKTS)</th>
                             </tr>
                          </thead>
                          <tbody>
                             {data.flowTables?.map((flow, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                   <td style={{ padding: '16px' }}>
                                      <span style={{ backgroundColor: 'var(--surface-solid)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', color: '#fff' }}>
                                         {flow.switch}
                                      </span>
                                   </td>
                                   <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{flow.tableId}</td>
                                   <td style={{ padding: '16px' }}>{flow.priority}</td>
                                   <td style={{ padding: '16px', fontFamily: 'monospace', color: 'var(--accent)' }}>{flow.match}</td>
                                   <td style={{ padding: '16px', color: flow.action === 'FLOOD' ? 'var(--warning)' : 'var(--success)' }}>{flow.action}</td>
                                   <td style={{ padding: '16px' }}>{flow.packets.toLocaleString()}</td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </motion.section>
              </motion.div>
            )}

            {activeTab === 'Config' && (
              <motion.div key="config" variants={containerVariants} initial="hidden" animate="show" exit="exit" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                 <motion.section className="card" variants={itemVariants}>
                    <h3 style={{ paddingBottom: '24px' }}>Nexus Controller Configuration</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                       <div className="config-group">
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Controller IP Address</label>
                          <input type="text" defaultValue="192.168.1.100" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-solid)', color: '#fff', fontSize: '1rem' }} disabled/>
                       </div>
                       <div className="config-group">
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>OpenFlow Port</label>
                          <input type="text" defaultValue="6633 / 6653" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-solid)', color: '#fff', fontSize: '1rem' }} disabled/>
                       </div>
                       <div className="config-group">
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Routing Algorithm</label>
                          <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-solid)', color: '#fff', fontSize: '1rem' }}>
                             <option>Dijkstra Shortest Path</option>
                             <option>Learning Switch</option>
                             <option>Load Balancer Mode</option>
                          </select>
                       </div>
                       <div className="config-group">
                          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Polling Interval (ms)</label>
                          <input type="number" defaultValue="3000" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-solid)', color: '#fff', fontSize: '1rem' }} />
                       </div>
                    </div>
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--surface-solid)', display: 'flex', gap: '16px' }}>
                       <button className="btn-primary" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', cursor: 'pointer', borderRadius: '8px' }} onClick={() => alert('Controller Restart Initiated...')}>
                           <RefreshCw size={18} /> Restart Controller
                       </button>
                       <button style={{ padding: '12px 24px', background: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => alert('Flow tables flushed successfully.')}>
                           <Zap size={18} /> Flush Flow Tables
                       </button>
                    </div>
                 </motion.section>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const SwitchNode = ({ label, active, color }) => (
  <div style={{
     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
     width: '60px', height: '60px', borderRadius: '50%',
     background: 'var(--surface-solid)',
     border: `2px solid ${active ? color : 'var(--border)'}`,
     boxShadow: active ? `0 0 20px ${color}40` : 'none',
     transition: 'all 0.3s ease',
     zIndex: 10, position: 'relative'
  }}>
     <Cpu size={20} color={active ? color : 'var(--text-secondary)'} />
     <span style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '4px', color: active ? '#fff' : 'var(--text-secondary)' }}>{label}</span>
     {active && (
        <motion.div
           animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
           transition={{ repeat: Infinity, duration: 2 }}
           style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: `2px solid ${color}`, opacity: 0.5 }}
        />
     )}
  </div>
);

const HostNode = ({ label, ip }) => (
  <div style={{
     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
     padding: '12px', borderRadius: '8px',
     background: 'var(--surface-solid)', border: '1px solid var(--border)',
     zIndex: 10, position: 'relative'
  }}>
     <Server size={24} color={'#fff'} />
     <span style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '8px' }}>{label}</span>
     <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{ip}</span>
  </div>
);

const NavItem = ({ icon, label, active = false, onClick }) => (
  <a className={`nav-item ${active ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); if(onClick) onClick(); }}>
    {icon}
    <span>{label}</span>
  </a>
);

const KPICard = ({ title, value, icon, isText }) => (
  <div className="card kpi-card">
    <div style={{ color: 'var(--accent)', marginBottom: '16px' }}>{icon}</div>
    <div className="kpi-title">{title}</div>
    <div className="kpi-value" style={{ fontSize: isText ? '1.4rem' : '2.25rem', color: isText ? 'var(--success)' : '#fff' }}>{value}</div>
  </div>
);

export default Dashboard;
