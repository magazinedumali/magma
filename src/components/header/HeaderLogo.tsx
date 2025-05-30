import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLogo = () => {
  return (
    <Link to="/" className="flex items-center">
      <div className="bg-[#ff184e] h-10 w-10 flex items-center justify-center rounded-md mr-2">
        <span className="text-white font-bold text-2xl">M</span>
      </div>
      <h1 className="text-2xl font-jost font-bold">
        <span className="text-black">Mag</span>
        <span className="text-[#ff184e]">e</span>
        <span className="text-black">zix</span>
      </h1>
    </Link>
  );
};

export default HeaderLogo;
