
import React from 'react';
import { Menu, X } from 'lucide-react';

type ToggleButtonsProps = {
  isMenuOpen: boolean;
  toggleMenu: () => void;
};

const ToggleButtons = ({ isMenuOpen, toggleMenu }: ToggleButtonsProps) => {
  return (
    <button 
      className="md:hidden text-news-dark mr-3"
      onClick={toggleMenu}
    >
      {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
};

export default ToggleButtons;
