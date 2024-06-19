// Quran.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import JuzList from './JuzList';
import SurahList from './SurahList';
import AyahList from './AyahList';
import Sidebar from './Sidebar';
import Search from './Search';
import useQuranData from './useQuranData'; // Import the custom hook
import './Quran.css';

const Quran = () => {
  const { data, loading } = useQuranData(); // Use custom hook

  if (loading) {
    return <div>Loading...</div>; // Render loading screen while checking data loading
  }

  return (
    <div className="quran-page">
      <div className="main-layout">
        <Sidebar />
        <div className="content">
          <Search />
          <Routes>
            <Route path="/" element={<JuzList />} />
            <Route path="/juz/:juzId" element={<SurahList />} />
            <Route path="/juz/:juzId/surah/:surahId" element={<AyahList />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Quran;
