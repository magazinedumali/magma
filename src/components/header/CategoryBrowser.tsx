import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SlidingArticleTitles from './SlidingArticleTitles';

type CategoryBrowserProps = {
  toggleSearch: () => void;
};

const CategoryBrowser = ({ toggleSearch }: CategoryBrowserProps) => {
  return (
    <div className="border-t border-gray-200 py-3">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center cursor-pointer">
                <Menu size={18} className="mr-2" />
                <span className="font-medium mr-2">Parcourir les catégories</span>
                <ChevronDown size={16} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white p-4 shadow-lg rounded-md w-60">
              <div className="grid gap-4">
                <Link to="/category/business" className="flex items-center hover:text-[#ff184e]">
                  <div className="w-6 h-6 mr-3 text-gray-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z"></path>
                    </svg>
                  </div>
                  <span>Économie</span>
                </Link>
                
                <Link to="/category/fashion" className="flex items-center hover:text-[#ff184e]">
                  <div className="w-6 h-6 mr-3 text-gray-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1z"></path>
                      <path d="M4 5V3h16v2"></path>
                      <path d="M12 17V9"></path>
                      <path d="M8 13h8"></path>
                    </svg>
                  </div>
                  <span>Mode</span>
                </Link>
                
                <Link to="/category/food" className="flex items-center hover:text-[#ff184e]">
                  <div className="w-6 h-6 mr-3 text-gray-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                      <path d="M6 1v3"></path>
                      <path d="M10 1v3"></path>
                      <path d="M14 1v3"></path>
                    </svg>
                  </div>
                  <span>Alimentation</span>
                </Link>
                
                <Link to="/category/lifestyle" className="flex items-center hover:text-[#ff184e]">
                  <div className="w-6 h-6 mr-3 text-gray-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </div>
                  <span>Art de vivre</span>
                </Link>
                
                <Link to="/category/politics" className="flex items-center hover:text-[#ff184e]">
                  <div className="w-6 h-6 mr-3 text-gray-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 20h.01"></path>
                      <path d="M7 20v-4"></path>
                      <path d="M12 20v-8"></path>
                      <path d="M17 20V8"></path>
                      <path d="M22 4v16"></path>
                    </svg>
                  </div>
                  <span>Politique</span>
                </Link>
                
                <Link to="/category/sports" className="flex items-center hover:text-[#ff184e]">
                  <div className="w-6 h-6 mr-3 text-gray-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 8v8"></path>
                      <path d="M8 12h8"></path>
                    </svg>
                  </div>
                  <span>Sport</span>
                </Link>
                
                <Link to="/category/tech" className="flex items-center hover:text-[#ff184e]">
                  <div className="w-6 h-6 mr-3 text-gray-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                      <rect x="9" y="9" width="6" height="6"></rect>
                      <line x1="9" y1="2" x2="9" y2="4"></line>
                      <line x1="15" y1="2" x2="15" y2="4"></line>
                      <line x1="9" y1="20" x2="9" y2="22"></line>
                      <line x1="15" y1="20" x2="15" y2="22"></line>
                      <line x1="20" y1="9" x2="22" y2="9"></line>
                      <line x1="20" y1="14" x2="22" y2="14"></line>
                      <line x1="2" y1="9" x2="4" y2="9"></line>
                      <line x1="2" y1="14" x2="4" y2="14"></line>
                    </svg>
                  </div>
                  <span>Actualité Tech</span>
                </Link>
                
                <Link to="/category/travel" className="flex items-center hover:text-[#ff184e]">
                  <div className="w-6 h-6 mr-3 text-gray-500">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="11" r="3"></circle>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    </svg>
                  </div>
                  <span>Voyage</span>
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Sliding Article Titles */}
        <SlidingArticleTitles />
        
        {/* Right section with tags and search */}
        <div className="flex items-center">
          <div className="hidden md:flex items-center mr-4">
            <span className="bg-[#ff184e] text-white px-2 py-1 rounded-sm text-xs font-bold mr-2">
              # Mots-clés
            </span>
            <div className="flex space-x-2 text-sm">
              <Link to="/tag/brave" className="hover:text-[#ff184e]">Courageux</Link> • 
              <Link to="/tag/business" className="hover:text-[#ff184e] ml-1">Économie</Link>
            </div>
          </div>
          
          <button 
            className="text-news-dark"
            onClick={toggleSearch}
          >
            <Search size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryBrowser;
