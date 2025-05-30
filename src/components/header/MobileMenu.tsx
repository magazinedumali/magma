import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type CategoryType = {
  name: string;
  path: string;
};

type MainCategoryType = {
  name: string;
  path: string;
  hasDropdown: boolean;
  hot?: boolean;
};

type MobileMenuProps = {
  isMenuOpen: boolean;
};

const MobileMenu = ({ isMenuOpen }: MobileMenuProps) => {
  // SUPPRIMER les tableaux mainCategories et categories, et le rendu du menu mobile statique
  // (Optionnel : préparer pour une version dynamique du menu mobile si besoin)

  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden bg-white border-t border-b">
      <div className="container mx-auto px-4">
        <ul className="flex flex-col space-y-2 py-4 text-sm font-medium">
          {/* SUPPRIMER les items du menu mobile statique */}
          
          <li>
            <Button 
              variant="destructive" 
              className="w-full mt-4 text-white bg-[#ff184e] hover:bg-red-700"
              size="sm"
            >
              Connexion
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MobileMenu;
