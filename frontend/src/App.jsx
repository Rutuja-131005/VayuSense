import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * App Root Component
 * ====================
 * Sets up routing and the main layout structure.
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import InteractiveMap from './pages/InteractiveMap';
import HchoAnalysis from './pages/HchoAnalysis';
import Predictions from './pages/Predictions';
import ScientificValidation from './pages/ScientificValidation';

const App = () => {
    return (_jsx(BrowserRouter, { children: _jsx("div", { className: "app-layout", children: _jsxs("div", { className: "main-content", children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [
        _jsx(Route, { path: "/", element: _jsx(InteractiveMap, {}) }), 
        _jsx(Route, { path: "/mission-control", element: _jsx(Dashboard, {}) }), 
        _jsx(Route, { path: "/earth-observation", element: _jsx(InteractiveMap, {}) }), 
        _jsx(Route, { path: "/environmental-intelligence", element: _jsx(HchoAnalysis, {}) }), 
        _jsx(Route, { path: "/predictions", element: _jsx(Predictions, {}) }), 
        _jsx(Route, { path: "/scientific-validation", element: _jsx(ScientificValidation, {}) })
    ] })] }) }) }));
};
export default App;
