import React from 'react';

const Header = () => {
    return (
        <header className="top-header" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: '#080d1a',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
            {/* Left Brand Slot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logo.png" alt="VayuSense Logo" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px', margin: 0, textTransform: 'uppercase' }}>VAYUSENSE</h1>
                    <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Environmental Decision Support System</span>
                </div>
            </div>

            {/* Center Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifyContent: 'center', maxWidth: '800px' }}>
                {/* Search Bar */}
                <div style={{ position: 'relative', width: '320px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#64748b' }}>🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search city / state / location..." 
                        style={{
                            width: '100%',
                            padding: '8px 12px 8px 36px',
                            background: '#0b132b',
                            border: '1px solid #1e293b',
                            borderRadius: '6px',
                            color: '#f8fafc',
                            fontSize: '13px',
                            outline: 'none'
                        }}
                    />
                </div>

                {/* Date Picker */}
                <div style={{ position: 'relative' }}>
                    <select style={{
                        padding: '8px 12px',
                        background: '#0b132b',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        color: '#cbd5e1',
                        fontSize: '12px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}>
                        <option>25 May 2025</option>
                        <option>26 May 2025</option>
                        <option>27 May 2025</option>
                    </select>
                </div>

                {/* Layer Select */}
                <div>
                    <select style={{
                        padding: '8px 12px',
                        background: '#0b132b',
                        border: '1px solid #1e293b',
                        borderRadius: '6px',
                        color: '#cbd5e1',
                        fontSize: '12px',
                        outline: 'none',
                        cursor: 'pointer'
                    }}>
                        <option>All Layers</option>
                        <option>AQI Layer Only</option>
                        <option>HCHO Layer Only</option>
                        <option>Fires Layer Only</option>
                    </select>
                </div>
            </div>

            {/* Right Profile Slot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Notification Bell */}
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <span style={{ fontSize: '18px' }}>🔔</span>
                    <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: 'var(--accent-red)', color: 'white',
                        fontSize: '9px', fontWeight: 700, padding: '1px 5px',
                        borderRadius: '50%'
                    }}>5</span>
                </div>

                {/* User Info & Avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '11px' }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>ISRO User</span>
                        <span style={{ color: 'var(--text-muted)' }}>Administrator</span>
                    </div>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: '#1e293b', border: '1px solid var(--accent-cyan)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', cursor: 'pointer'
                    }}>
                        👨‍🚀
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
