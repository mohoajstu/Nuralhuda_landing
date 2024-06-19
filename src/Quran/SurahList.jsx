// SurahList.js
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import useQuranData from './useQuranData';
import './Quran.css';

const SurahList = () => {
  const { juzId } = useParams();
  const { data, loading } = useQuranData();

  if (loading) {
    return <div>Loading...</div>;
  }

  const juz = data.juz[juzId];
  if (!juz) {
    return <div>Juz not found</div>;
  }

  const surahs = juz.surahs.map(surahId => data.surahs[surahId]);

  return (
    <div className="content">
      <h2>Surahs in Juz {juz.number}</h2>
      <ul className="surah-list">
        {surahs.map(s => (
          <li key={s.number}>
            <Link to={`/quran/juz/${juzId}/surah/${s.number}`}>
              {s.nameEnglish} | {s.nameArabic}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SurahList;
