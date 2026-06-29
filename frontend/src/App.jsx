import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * App Root Component
 * ====================
 * Sets up routing and the main layout structure.
 */
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import InteractiveMap from './pages/InteractiveMap';
import HchoAnalysis from './pages/HchoAnalysis';
import Predictions from './pages/Predictions';
import About from './pages/About';
const App = () => {
    return (_jsx(BrowserRouter, { children: _jsxs("div", { className: "app-layout", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "main-content", children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/aqi-map", element: _jsx(InteractiveMap, {}) }), _jsx(Route, { path: "/hcho", element: _jsx(HchoAnalysis, {}) }), _jsx(Route, { path: "/fire-analysis", element: _jsx(HchoAnalysis, {}) }), _jsx(Route, { path: "/predictions", element: _jsx(Predictions, {}) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) })] })] })] }) }));
};
export default App;
