import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * App Root Component
 * ====================
 * Sets up routing and the main layout structure.
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import InteractiveMap from './pages/InteractiveMap';
import HchoAnalysis from './pages/HchoAnalysis';
import Predictions from './pages/Predictions';
import ScientificValidation from './pages/ScientificValidation';

const App = () => {
    return (
        _jsx(BrowserRouter, {
            children: _jsxs("div", {
                className: "app-layout",
                style: { minHeight: '100vh', background: '#0b132b', display: 'flex', flexDirection: 'column' },
                children: [
                    _jsx(Header, {}),
                    _jsxs("div", {
                        style: { display: 'flex', flex: 1, position: 'relative' },
                        children: [
                            _jsx(Sidebar, {}),
                            _jsxs("main", {
                                className: "main-content",
                                style: {
                                    flex: 1,
                                    marginLeft: '240px',
                                    paddingTop: '64px',
                                    minHeight: 'calc(100vh - 64px)',
                                    background: '#0b132b',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between'
                                },
                                children: [
                                    _jsxs("div", {
                                        style: { flex: 1 },
                                        children: [
                                            _jsxs(Routes, {
                                                children: [
                                                    _jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }),
                                                    _jsx(Route, { path: "/earth-observation", element: _jsx(InteractiveMap, {}) }),
                                                    _jsx(Route, { path: "/environmental-intelligence", element: _jsx(HchoAnalysis, {}) }),
                                                    _jsx(Route, { path: "/predictions", element: _jsx(Predictions, {}) }),
                                                    _jsx(Route, { path: "/scientific-validation", element: _jsx(ScientificValidation, {}) })
                                                ]
                                            })
                                        ]
                                    }),
                                    /* Footer */
                                    _jsx("footer", {
                                        style: {
                                            textAlign: 'center',
                                            padding: '12px',
                                            fontSize: '11px',
                                            color: 'var(--text-muted)',
                                            borderTop: '1px solid #1e293b',
                                            background: '#080d1a'
                                        },
                                        children: "© 2025 VayuSense EDSS | All Rights Reserved"
                                    })
                                ]
                            })
                        ]
                    })
                ]
            })
        })
    );
};

export default App;
