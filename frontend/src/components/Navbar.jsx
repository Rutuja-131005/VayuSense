import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { pathname } = useLocation();
    const [openMenu, setOpenMenu] = useState(null);
    const navRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown when route changes
    useEffect(() => {
        setOpenMenu(null);
    }, [pathname]);

    const toggleMenu = (menuName) => {
        setOpenMenu(prev => prev === menuName ? null : menuName);
    };

    const isSatelliteIntelligenceActive = ['/earth-observation', '/environmental-intelligence', '/predictions'].includes(pathname);
    const isDecisionEngineActive = ['/decision-support', '/scientific-validation', '/research-analytics'].includes(pathname);

    return (
        <header className="navbar">
            <div className="navbar-logo">
                <img src="/logo.png" alt="VayuSense Logo" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                <div className="logo-text">
                    <h1>VayuSense</h1>
                </div>
            </div>

            <nav className="navbar-nav-horizontal" ref={navRef}>
                <div className={`nav-dropdown ${openMenu === 'satellite' ? 'open' : ''}`}>
                    <button 
                        className={`nav-dropdown-trigger ${isSatelliteIntelligenceActive ? 'active' : ''}`}
                        onClick={() => toggleMenu('satellite')}
                        style={{
                            border: '1px solid rgba(6, 182, 212, 0.4)',
                            background: 'rgba(6, 182, 212, 0.05)',
                            boxShadow: '0 0 10px rgba(6, 182, 212, 0.1)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            padding: '8px 16px'
                        }}
                    >
                        🛰️ Satellite Intelligence ▾
                    </button>
                    <div className="nav-dropdown-menu" style={{ minWidth: '260px' }}>
                        <NavLink to="/earth-observation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                            <span>Live Earth Observation</span>
                            <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-green)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700, marginLeft: '8px', letterSpacing: '0.5px' }}>LIVE</span>
                        </NavLink>
                        <NavLink to="/environmental-intelligence" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                            <span>Environmental Intelligence</span>
                            <span style={{ fontSize: '9px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700, marginLeft: '8px', letterSpacing: '0.5px' }}>HOTSPOTS</span>
                        </NavLink>
                        <NavLink to="/predictions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                            <span>AI Prediction</span>
                            <span style={{ fontSize: '9px', background: 'rgba(255, 138, 55, 0.15)', color: 'var(--accent-orange)', padding: '2px 6px', borderRadius: '10px', fontWeight: 700, marginLeft: '8px', letterSpacing: '0.5px' }}>CNN-LSTM</span>
                        </NavLink>
                    </div>
                </div>

                <div className={`nav-dropdown ${openMenu === 'decision' ? 'open' : ''}`}>
                    <button 
                        className={`nav-dropdown-trigger ${isDecisionEngineActive ? 'active' : ''}`}
                        onClick={() => toggleMenu('decision')}
                        style={{
                            border: '1px solid rgba(255, 138, 55, 0.3)',
                            background: 'rgba(255, 138, 55, 0.03)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '8px 16px'
                        }}
                    >
                        ⚙️ Decision Engine ▾
                    </button>
                    <div className="nav-dropdown-menu">
                        <NavLink to="/decision-support">Decision Support</NavLink>
                        <NavLink to="/scientific-validation">Scientific Validation</NavLink>
                        <NavLink to="/research-analytics">Research Analytics</NavLink>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
