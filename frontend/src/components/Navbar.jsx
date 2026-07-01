import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Navbar = () => {
    const { pathname } = useLocation();

    // Determine active parent states for dropdowns
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

            <nav className="navbar-nav-horizontal">
                <NavLink to="/" className="nav-link-item" end>
                    Home
                </NavLink>
                
                <NavLink to="/mission-control" className="nav-link-item">
                    Mission Control
                </NavLink>

                <div className="nav-dropdown">
                    <button className={`nav-dropdown-trigger ${isSatelliteIntelligenceActive ? 'active' : ''}`}>
                        Satellite Intelligence ▾
                    </button>
                    <div className="nav-dropdown-menu">
                        <NavLink to="/earth-observation">Live Earth Observation</NavLink>
                        <NavLink to="/environmental-intelligence">Environmental Intelligence</NavLink>
                        <NavLink to="/predictions">AI Predictions</NavLink>
                    </div>
                </div>

                <div className="nav-dropdown">
                    <button className={`nav-dropdown-trigger ${isDecisionEngineActive ? 'active' : ''}`}>
                        Decision Engine ▾
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
