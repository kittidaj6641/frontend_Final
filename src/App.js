import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './login';
import Register from './register';
import WaterQuality from './water-quality';
import Home from './Home';
import ShrimpInfo from './ShrimpInfo';
import Status from './Status';
import Realtime from './Realtime';
import AddDevice from './AddDevice';


const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/Realtime" element={<Realtime />} />
                <Route path="/add-device" element={<AddDevice />} />
                <Route path="/water-quality" element={<WaterQuality />} />
                <Route path="/shrimp-info" element={<ShrimpInfo />} />
                <Route path="/status" element={<Status />} /> 
               
                
                
            </Routes>
        </AnimatePresence>
    );
};

const App = () => {
    return (
        <Router>
            <AnimatedRoutes />
        </Router>
    );
};

export default App;
