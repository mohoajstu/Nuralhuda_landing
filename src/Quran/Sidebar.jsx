import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useQuranData from './useQuranData';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import './Quran.css';

const Sidebar = () => {
  const { data, loading } = useQuranData();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>{isOpen ? 'Navigate' : 'Nav'}</h2>
        </div>
        <div className="sidebar-content">
          {isOpen && (
            <>
              <h3>Surahs</h3>
              <ul>
                {Object.values(data.surahs).map(s => (
                  <li key={s.number}>
                    <Link to={`/quran/juz/${s.juz}/surah/${s.number}`} onClick={() => window.innerWidth <= 768 && setIsOpen(false)}>
                      {s.number}. {s.nameEnglish} | {s.nameArabic}
                    </Link>
                  </li>
                ))}
              </ul>
              <h3>Juz</h3>
              <ul>
                {data.juz.map(j => (
                  <li key={j.number}>
                    <Link to={`/quran/juz/${j.number}`} onClick={() => window.innerWidth <= 768 && setIsOpen(false)}>
                      Juz {j.number}: {j.nameEnglish} | {j.nameArabic}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
      </button>
    </>
  );
};

export default Sidebar;