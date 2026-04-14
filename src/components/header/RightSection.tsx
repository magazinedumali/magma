import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RightSection = () => {
  return (
    <div className="flex items-center space-x-4">
      <div className="hidden md:flex items-center mr-2 group relative cursor-pointer">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center text-sm">
              <img 
                src="https://flagcdn.com/w20/us.png" 
                alt="English"
                className="h-4 mr-1"
              /> 
              English
              <ChevronDown size={16} className="ml-1" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white">
            <DropdownMenuItem className="flex items-center">
              <img 
                src="https://flagcdn.com/w20/us.png" 
                alt="English"
                className="h-4 mr-2"
              /> 
              English
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center">
              <img 
                src="https://flagcdn.com/w20/fr.png" 
                alt="Français"
                className="h-4 mr-2"
              /> 
              Français
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Button 
        variant="destructive" 
        className="hidden md:flex text-white bg-[#ff184e] hover:bg-red-700"
        size="sm"
      >
        Connexion
      </Button>
      
      <Button variant="ghost" size="icon" className="relative hidden" aria-hidden tabIndex={-1}>
        <Bell size={20} />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff184e] text-xs text-white">
          2
        </span>
      </Button>
    </div>
  );
};

export default RightSection;
