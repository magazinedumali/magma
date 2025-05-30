import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { supabase } from '@/lib/supabaseClient';

type MainMenuItem = {
  id: string;
  name: string;
  path: string;
  has_dropdown: boolean;
  hot?: boolean;
  order: number;
  parent_id?: string | null;
  link_type?: 'internal' | 'external';
  target_blank?: boolean;
  children?: MainMenuItem[];
};

function buildMenuTree(items: MainMenuItem[]): MainMenuItem[] {
  const map = new Map<string, MainMenuItem & { children?: MainMenuItem[] }>();
  items.forEach(item => map.set(item.id, { ...item, children: [] }));
  const tree: (MainMenuItem & { children?: MainMenuItem[] })[] = [];
  map.forEach(item => {
    if (item.parent_id) {
      const parent = map.get(item.parent_id);
      if (parent) parent.children?.push(item);
    } else {
      tree.push(item);
    }
  });
  // Tri par ordre
  const sortFn = (a: MainMenuItem, b: MainMenuItem) => (a.order || 0) - (b.order || 0);
  const sortTree = (nodes: (MainMenuItem & { children?: MainMenuItem[] })[]) => {
    nodes.sort(sortFn);
    nodes.forEach(n => n.children && sortTree(n.children));
  };
  sortTree(tree);
  return tree;
}

const MainNavigation = () => {
  const [mainCategories, setMainCategories] = useState<MainMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuTree, setMenuTree] = useState<MainMenuItem[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('main_menu')
        .select('*')
        .order('order', { ascending: true });
      if (!error && data) {
        setMainCategories(data);
        setMenuTree(buildMenuTree(data));
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  // Fonction pour rendre un lien selon le type
  function renderMenuLink(item: MainMenuItem, children?: React.ReactNode) {
    if (item.link_type === 'external') {
      return (
        <a href={item.path} target={item.target_blank ? '_blank' : undefined} rel={item.target_blank ? 'noopener noreferrer' : undefined} className={cn("flex items-center p-2 hover:text-[#ff184e] transition-colors")}>{item.name}{children}</a>
      );
    }
    return (
      <Link to={item.path} className={cn("flex items-center p-2 hover:text-[#ff184e] transition-colors")}>{item.name}{children}</Link>
    );
  }

  if (loading) return null;

  return (
    <div className="hidden md:block">
      <NavigationMenu>
        <NavigationMenuList>
          {menuTree.map((item) => (
            <NavigationMenuItem key={item.id}>
              {item.has_dropdown && item.children && item.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger className="relative">
                    {item.name}
                    {item.hot && (
                      <span className="absolute -top-1 -right-8 bg-[#ff184e] text-white text-xs px-1 rounded">
                        Hot
                      </span>
                    )}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                      <div className="p-4 min-w-[200px]">
                        <ul className="space-y-2">
                        {item.children.map((subitem) => (
                          <li key={subitem.id}>
                            {renderMenuLink(subitem)}
                            </li>
                          ))}
                        </ul>
                      </div>
                  </NavigationMenuContent>
                </>
              ) : (
                renderMenuLink(item)
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default MainNavigation;
