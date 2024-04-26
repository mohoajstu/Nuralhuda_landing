// src/index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import ChatScreen from './components/chatScreen'; // Correct the import path if needed

const rootElement = document.getElementById('root');

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat/:chatbotType" element={<ChatScreen />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  rootElement
);
