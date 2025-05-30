import React from 'react';
import Banner from './Banner';

const TopBar = () => {
  return (
    <div className="bg-white">
      <Banner
        position="accueil"
        width={1920} // largeur fixe, adapte si besoin
        height={128} // adapte la hauteur si besoin
      />
    </div>
  );
};

export default TopBar;
