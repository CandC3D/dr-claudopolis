import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TheopolisPage from './pages/TheopolisPage';
import BuddyPage from './pages/BuddyPage';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TheopolisPage />} />
        <Route path="/buddy" element={<BuddyPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
