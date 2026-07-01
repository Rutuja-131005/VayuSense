import React from 'react';

const Header = ({ onToggleSidebar }) => {
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
            padding: '0 20px',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
            gap: '12px'
        }}>
            {/* Hamburger Button for Mobile */}
            <button 
                onClick={onToggleSidebar}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                className="hamburger-btn"
            >
                ☰
            </button>

            {/* Left Brand Slot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logo.png" alt="VayuSense Logo" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: '#f8fafc', letterSpacing: '1px', margin: 0, textTransform: 'uppercase' }}>VAYUSENSE</h1>
                    <span style={{ fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Environmental Decision Support System</span>
                </div>
            </div>

            {/* Add responsive media style to hide hamburger on desktop */}
            <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 1025px) {
                    .hamburger-btn {
                        display: none !important;
                    }
                }
            `}} />
        </header>
    );
};

export default Header;
