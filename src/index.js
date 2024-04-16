import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import ChatScreen from './components/chatScreen'; // Correct the import path if needed

const Root = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat/:chatbotType" element={<ChatScreen />} />
      </Routes>
    </BrowserRouter>
  );
};

// Render the Root component, which includes the BrowserRouter and Routes
ReactDOM.render(<Root />, document.getElementById('root'));