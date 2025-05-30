
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import HeaderLogo from './HeaderLogo';
import MainNavigation from './MainNavigation';
import RightSection from './RightSection';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';
import CategoryBrowser from './CategoryBrowser';
import ToggleButtons from './ToggleButtons';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <header className="bg-white shadow-sm">
      {/* Logo and Main Nav section */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <ToggleButtons isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
          <HeaderLogo />
        </div>
        
        {/* Main Navigation - Desktop */}
        <MainNavigation />
        
        {/* Right section with language, login and notifications */}
        <RightSection />
      </div>

      {/* Mobile menu */}
      <MobileMenu isMenuOpen={isMenuOpen} />

      {/* Search bar */}
      <SearchBar isSearchOpen={isSearchOpen} />
      
      {/* Category Browse Section */}
      <CategoryBrowser toggleSearch={toggleSearch} />
    </header>
  );
};

export default Header;
