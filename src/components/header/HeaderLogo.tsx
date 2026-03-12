import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <img
        src="/logo.png"
        alt="Le Magazine du Mali"
        className="h-10 w-auto object-contain flex-shrink-0"
      />
      <div className="whitespace-nowrap flex items-center pl-1">
        <span
          className="text-white font-extrabold text-[17px] sm:text-[19px] tracking-tight group-hover:text-white/90 transition-colors"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}
        >
          Le Magazine <span className="text-[#ff184e] font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>du Mali</span>
        </span>
      </div>
    </Link>
  );
};

export default HeaderLogo;
