import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Activity, 
  Calendar,
  ChevronRight,
  RefreshCw,
  Search,
  LayoutDashboard,
  UserRound,
  Settings,
  Bell,
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TrendChart from './Charts/TrendChart';
import DoctorPerformance from './Charts/DoctorPerformance';
import RevenueChart from './Charts/RevenueChart';
import DiseaseDistribution from './Charts/DiseaseDistribution';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeFilter, setTimeFilter] = useState('All Time');

  const getFilteredInflow = () => {
    if (!data?.charts?.inflow) return [];
    if (timeFilter === 'Week') return data.charts.inflow.slice(-7);
    if (timeFilter === 'Month') return data.charts.inflow.slice(-30);
    return data.charts.inflow;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/analytics');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Could not connect to the BI server.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="loader-container">
      <RefreshCw className="spinner" size={36} />
      <p style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Synchronizing Analytics...</p>
    </div>
  );
  
  if (error) return (
    <div className="loader-container">
       <p style={{ color: 'var(--error)' }}>{error}</p>
       <button onClick={fetchData} className="btn-primary">Retry Connection</button>
    </div>
  );

  const { summary, charts } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <motion.div 
            key="overview"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="kpi-grid">
              <motion.div variants={itemVariants}>
                <KPICard 
                  title="Total Patients" 
                  value={summary.totalPatients.toLocaleString()} 
                  icon={<Users size={24} color="var(--primary)" />} 
                  trend="12% increase" 
                  positive={true}
                  bgColor="var(--primary-light)"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <KPICard 
                  title="Revenue" 
                  value={`$${summary.totalRevenue.toLocaleString()}`} 
                  icon={<DollarSign size={24} color="var(--success)" />} 
                  trend="8.4% growth" 
                  positive={true}
                  bgColor="var(--success-bg)"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <KPICard 
                  title="Avg. Waiting Time" 
                  value={`${summary.avgWaitingTime}m`} 
                  icon={<Clock size={24} color="var(--warning)" />} 
                  trend="2m decrease" 
                  positive={true}
                  bgColor="#fef3c7"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <KPICard 
                  title="Operational Peak" 
                  value={summary.peakHour} 
                  icon={<TrendingUp size={24} color="#8b5cf6" />} 
                  trend="Normal load" 
                  positive={true}
                  bgColor="#ede9fe"
                />
              </motion.div>
            </div>

            <div className="dashboard-grid">
               <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <motion.section className="card" variants={itemVariants}>
                     <div className="card-header">
                        <div>
                          <h3 className="card-title">Patient Inflow</h3>
                          <p className="card-subtitle">Frequency of admissions.</p>
                        </div>
                     </div>
                     <div className="chart-wrapper">
                        <TrendChart data={getFilteredInflow()} />
                     </div>
                  </motion.section>

                  <DoctorPerformance data={charts.doctors} variants={itemVariants} minimize={true} />
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <motion.section className="card" variants={itemVariants}>
                     <h3 className="card-title" style={{ marginBottom: '24px' }}>Disease Distribution</h3>
                     <div className="chart-wrapper" style={{ minHeight: '280px' }}>
                        <DiseaseDistribution data={charts.diseases} />
                     </div>
                  </motion.section>

                  <motion.section className="card" variants={itemVariants}>
                     <h3 className="card-title" style={{ marginBottom: '24px' }}>Financial Trend</h3>
                     <div className="chart-wrapper" style={{ minHeight: '260px' }}>
                        <RevenueChart data={charts.revenue} />
                     </div>
                  </motion.section>

                  <motion.section className="card ai-card" variants={itemVariants}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div className="ai-icon-box">
                          <Sparkles size={24} color="white" />
                        </div>
                        <div>
                          <h4 className="card-title" style={{ fontSize: '1.1rem' }}>AI Deployment Insight</h4>
                          <p className="card-subtitle">Resource allocation suggestion</p>
                        </div>
                     </div>
                     <p className="ai-text">
                       Predicted <strong>surge</strong> of approximately {charts.predictions[0]?.predictedCount || 10} patients matching future 48h load. Recommend deploying 2 additional standby nurses to maintain current average {summary.avgWaitingTime}m waiting time SLA.
                     </p>
                     <button className="btn-ai">
                       Approve Allocation
                     </button>
                  </motion.section>
               </div>
            </div>
          </motion.div>
        );
      case 'Analytics':
        return (
          <motion.div key="analytics" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="dashboard-grid">
            <motion.section className="card" variants={itemVariants}>
               <h3 className="card-title" style={{ marginBottom: '24px' }}>Patient Inflow Analysis</h3>
               <div className="chart-wrapper" style={{ minHeight: '400px' }}><TrendChart data={getFilteredInflow()} /></div>
            </motion.section>
            <motion.section className="card" variants={itemVariants}>
               <h3 className="card-title" style={{ marginBottom: '24px' }}>Disease Distribution</h3>
               <div className="chart-wrapper" style={{ minHeight: '400px' }}><DiseaseDistribution data={charts.diseases} /></div>
            </motion.section>
          </motion.div>
        );
      case 'Doctors':
        return (
          <motion.div key="doctors" variants={containerVariants} initial="hidden" animate="show" exit="exit">
             <DoctorPerformance data={charts.doctors} variants={itemVariants} minimize={false} />
          </motion.div>
        );
      case 'Financials':
        return (
          <motion.div key="financials" variants={containerVariants} initial="hidden" animate="show" exit="exit" className="dashboard-grid">
            <motion.section className="card" variants={itemVariants} style={{ gridColumn: '1 / -1' }}>
               <h3 className="card-title" style={{ marginBottom: '24px' }}>Comprehensive Revenue Trend</h3>
               <div className="chart-wrapper" style={{ minHeight: '450px' }}><RevenueChart data={charts.revenue} /></div>
            </motion.section>
          </motion.div>
        );
      default:
        return (
          <motion.div key="default" variants={containerVariants} initial="hidden" animate="show" exit="exit">
             <div className="card"><h3 className="card-title">Module "{activeTab}" is currently under construction.</h3></div>
          </motion.div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Stethoscope size={28} />
          <span className="sidebar-title">MedIQ BI</span>
        </div>
        <nav className="sidebar-nav">
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <NavItem icon={<Activity size={20} />} label="Analytics" active={activeTab === 'Analytics'} onClick={() => setActiveTab('Analytics')} />
          <NavItem icon={<UserRound size={20} />} label="Doctors" active={activeTab === 'Doctors'} onClick={() => setActiveTab('Doctors')} />
          <NavItem icon={<DollarSign size={20} />} label="Financials" active={activeTab === 'Financials'} onClick={() => setActiveTab('Financials')} />
          <div className="nav-category">System</div>
          <NavItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} />
        </nav>
        <div className="sidebar-footer">
          <div className="user-avatar">AD</div>
          <div className="user-info">
             <span className="user-name">Admin User</span>
             <span className="user-role">Super Admin</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-area">
        <header className="top-header">
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search patients, invoices, or records..." 
              className="search-input"
            />
          </div>
          <div className="header-actions">
             <button className="action-btn">
               <Bell size={20} />
               <span className="badge"></span>
             </button>
             <button onClick={fetchData} className="btn-primary">
               <RefreshCw size={18} /> Sync Data
             </button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-header">
            <div>
              <h2 className="page-title">{activeTab} Dashboard</h2>
              <p className="page-subtitle">Real-time data visualization and operational insights.</p>
            </div>
            <div className="time-filters">
               <button className={`time-btn ${timeFilter === 'All Time' ? 'active' : ''}`} onClick={() => setTimeFilter('All Time')}>All Time</button>
               <button className={`time-btn ${timeFilter === 'Month' ? 'active' : ''}`} onClick={() => setTimeFilter('Month')}>Month</button>
               <button className={`time-btn ${timeFilter === 'Week' ? 'active' : ''}`} onClick={() => setTimeFilter('Week')}>Week</button>
            </div>
          </div>
          
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
  <a className={`nav-item ${active ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); onClick(); }}>
    {icon}
    <span>{label}</span>
  </a>
);

const KPICard = ({ title, value, icon, trend, positive, bgColor }) => (
  <div className="card kpi-card">
    <div className="kpi-header">
       <span className="kpi-title">{title}</span>
       <div className="kpi-icon-wrap" style={{ background: bgColor }}>
         {icon}
       </div>
    </div>
    <div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-trend ${positive ? 'trend-positive' : 'trend-negative'}`}>
        <span>{positive ? '↑' : '↓'}</span>
        {trend}
      </div>
    </div>
  </div>
);

export default Dashboard;
