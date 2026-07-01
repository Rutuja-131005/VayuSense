import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'AQI Map', path: '/earth-observation', icon: '🗺️' },
    { label: 'HCHO Hotspots', path: '/environmental-intelligence', icon: '🧪' },
    { label: 'AI Prediction', path: '/predictions', icon: '🧠' },
    { label: 'Validation', path: '/scientific-validation', icon: '🔬' }
];

const dataSources = [
    { name: 'INSAT-3D', status: 'Online' },
    { name: 'Sentinel-5P', status: 'Online' },
    { name: 'ERA5', status: 'Online' },
    { name: 'CPCB AQI', status: 'Online' },
    { name: 'MODIS/VIIRS', status: 'Online' }
];

const Sidebar = () => {
    return (
        <aside className="left-sidebar" style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            bottom: 0,
            width: '240px',
            background: '#080d1a',
            borderRight: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 12px',
            zIndex: 900,
            overflowY: 'auto'
        }}>
            {/* Top Navigation Menu */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map((item, idx) => {
                    const activeStyle = {
                        background: 'rgba(6, 182, 212, 0.12)',
                        borderLeft: '3px solid var(--accent-cyan)',
                        color: 'var(--text-primary)',
                        fontWeight: 600
                    };

                    const normalStyle = {
                        color: 'var(--text-secondary)',
                        borderLeft: '3px solid transparent'
                    };

                    if (item.mock) {
                        return (
                            <div 
                                key={idx}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    borderRadius: '0 4px 4px 0',
                                    cursor: 'not-allowed',
                                    ...normalStyle
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                                {item.badge && (
                                    <span style={{ fontSize: '9px', background: 'var(--accent-red)', color: 'white', padding: '1px 5px', borderRadius: '10px', fontWeight: 700 }}>
                                        {item.badge}
                                    </span>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink 
                            key={idx}
                            to={item.path}
                            end={item.path === '/'}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 12px',
                                fontSize: '13px',
                                borderRadius: '0 4px 4px 0',
                                textDecoration: 'none',
                                transition: 'all 0.15s ease',
                                ...(isActive ? activeStyle : normalStyle)
                            })}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        </NavLink>
                    );
                })}
            </div>

            {/* Bottom Data Status Widget */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1e293b' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    📡 DATA STATUS
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dataSources.map((ds, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{ds.name}</span>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        </div>
                    ))}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Last Updated: 10:30 AM IST
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
