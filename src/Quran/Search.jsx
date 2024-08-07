// Search.js
import React, { useState } from 'react';
import useQuranData from './useQuranData';
import './Quran.css';

const Search = () => {
  const { data, loading } = useQuranData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    if (loading) return;

    const filteredAyahs = [];
    Object.values(data.ayahs).forEach(ayahList => {
      ayahList.forEach(ayah => {
        if (ayah.englishTranslation.toLowerCase().includes(query.toLowerCase())) {
          filteredAyahs.push(ayah);
        }
      });
    });

    setResults(filteredAyahs);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search for Surahs, Ayahs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {results.map(r => (
          <li key={r.number}>
            {r.surahId}:{r.number} - {r.englishTranslation}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
