import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center">
      <img src="/HeaderLogo.png" alt="Logo" className="h-12 w-auto mr-2" />
    </Link>
  );
};

export default HeaderLogo;
