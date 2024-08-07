import { useState, useEffect } from 'react';
import juzData from '../data/quran_juz.json';
import surahData from '../data/quran_surah.json';
import ayahData from '../data/quran_ayah.json';

const useQuranData = () => {
  const [data, setData] = useState({ juz: {}, surahs: {}, ayahs: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Load data from JSON files
      const juz = Object.values(juzData);
      const surahs = surahData;
      const ayahs = ayahData;

      const allData = { juz, surahs, ayahs };
      setData(allData);
      setLoading(false);
    };

    fetchData();
  }, []);

  return { data, loading };
};

export default useQuranData;
