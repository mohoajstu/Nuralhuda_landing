import React from 'react';
import { Link } from 'react-router-dom';
import useQuranData from './useQuranData';
import './Quran.css';

const JuzList = () => {
  const { data, loading } = useQuranData();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content">
      <h1>Quran</h1>
      <ul className="juz-list">
        {Object.values(data.juz).map(j => (
          <li key={j.number}>
            <Link to={`/quran/juz/${j.number}`}>
              Juz {j.number}: {j.nameEnglish} | {j.nameArabic}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JuzList;
