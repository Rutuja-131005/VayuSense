import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <header className="navbar">
            <div className="navbar-logo">
                <img src="/logo.png" alt="VayuSense Logo" style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                <div className="logo-text">
                    <h1>VayuSense</h1>
                </div>
            </div>

            <nav className="navbar-nav-horizontal">
                <NavLink 
                    to="/earth-observation" 
                    className="nav-link-item"
                    style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: isActive ? '1px solid rgba(6, 182, 212, 0.6)' : '1px solid transparent',
                        background: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                        boxShadow: isActive ? '0 0 10px rgba(6, 182, 212, 0.15)' : 'none',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? '600' : '500',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)'
                    })}
                >
                    🛰️ Live Earth Observation
                </NavLink>

                <NavLink 
                    to="/environmental-intelligence" 
                    className="nav-link-item"
                    style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: isActive ? '1px solid rgba(139, 92, 246, 0.6)' : '1px solid transparent',
                        background: isActive ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                        boxShadow: isActive ? '0 0 10px rgba(139, 92, 246, 0.15)' : 'none',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? '600' : '500',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)'
                    })}
                >
                    🧪 Environmental Intelligence
                </NavLink>

                <NavLink 
                    to="/predictions" 
                    className="nav-link-item"
                    style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: isActive ? '1px solid rgba(255, 138, 55, 0.6)' : '1px solid transparent',
                        background: isActive ? 'rgba(255, 138, 55, 0.12)' : 'transparent',
                        boxShadow: isActive ? '0 0 10px rgba(255, 138, 55, 0.15)' : 'none',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? '600' : '500',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)'
                    })}
                >
                    🧠 AI Prediction
                </NavLink>

                <NavLink 
                    to="/scientific-validation" 
                    className="nav-link-item"
                    style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid transparent',
                        background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                        boxShadow: isActive ? '0 0 10px rgba(16, 185, 129, 0.15)' : 'none',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? '600' : '500',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)'
                    })}
                >
                    📊 Scientific Validation
                </NavLink>
            </nav>
        </header>
    );
};

export default Navbar;
