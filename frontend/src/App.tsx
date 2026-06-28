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

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/aqi-map" element={<InteractiveMap />} />
            <Route path="/hcho" element={<HchoAnalysis />} />
            <Route path="/fire-analysis" element={<HchoAnalysis />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
