// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import useQuranData from './useQuranData';
import './Quran.css';

const Sidebar = () => {
  const { data, loading } = useQuranData();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="sidebar">
      <h2>Navigate</h2>
      <h3>Surahs</h3>
      <ul>
        {Object.values(data.surahs).map(s => (
          <li key={s.number}>
            <Link to={`/quran/juz/${s.juz}/surah/${s.number}`}>
              {s.number}. {s.nameEnglish} | {s.nameArabic}
            </Link>
          </li>
        ))}
      </ul>
      <h3>Juz</h3>
      <ul>
        {data.juz.map(j => (
          <li key={j.number}>
            <Link to={`/quran/juz/${j.number}`}>Juz {j.number}: {j.nameEnglish} | {j.nameArabic}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
