
import React, { useState, useEffect } from 'react';

const SlidingArticleTitles = () => {
  const [currentArticleTitle, setCurrentArticleTitle] = useState("");
  const [showTitle, setShowTitle] = useState(true);
  
  const titles = [
    "Police Supports Peaceful Protestors...",
    "It Possible to Re-Open...",
    "COVID19 Restrictions in Large...",
    "A Possible Moratorium..."
  ];

  useEffect(() => {
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      setShowTitle(false);
      
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % titles.length;
        setCurrentArticleTitle(titles[currentIndex]);
        setShowTitle(true);
      }, 500); // Wait for fade-out animation to complete
      
    }, 4000); // Change title every 4 seconds
    
    // Set initial title
    setCurrentArticleTitle(titles[0]);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex flex-1 mx-4 overflow-hidden">
      <div className={`transition-all duration-500 ${showTitle ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        {currentArticleTitle}
      </div>
    </div>
  );
};

export default SlidingArticleTitles;
