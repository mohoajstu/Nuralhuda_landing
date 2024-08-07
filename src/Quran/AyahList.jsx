// AyahList.js
import React from 'react';
import { useParams } from 'react-router-dom';
import useQuranData from './useQuranData';
import './Quran.css';

const AyahList = () => {
  const { surahId } = useParams();
  const { data, loading } = useQuranData();

  if (loading) {
    return <div>Loading...</div>;
  }

  const surah = data.surahs[surahId];
  const ayahs = surah.ayahs;

  return (
    <div className="content">
      <h3>{surah.nameEnglish} | {surah.nameArabic}</h3>
      <ul>
        {ayahs.map(a => (
          <li className="ayah" key={a.number}>
            <p className="ayah-number">{`${surahId}:${a.number}`}</p>
            <p className="arabic-text">{a.originalArabicText}</p>
            <p className="translation">{a.englishTranslation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AyahList;
