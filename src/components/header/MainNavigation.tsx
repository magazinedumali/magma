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
    const cls = cn(
      "flex items-center gap-1 px-1 py-1.5 text-[13px] font-semibold tracking-wide text-gray-300 hover:text-white",
      "relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#ff184e] after:transition-all after:duration-300 hover:after:w-full",
      "transition-colors duration-200 rounded-md"
    );
    if (item.link_type === 'external') {
      return (
        <a href={item.path} target={item.target_blank ? '_blank' : undefined} rel={item.target_blank ? 'noopener noreferrer' : undefined} className={cls}>
          {item.name}{children}
        </a>
      );
    }
    return (
      <Link to={item.path} className={cls}>{item.name}{children}</Link>
    );
  }

  if (loading) return null;

  return (
    <div className="hidden md:block">
      <NavigationMenu>
        <NavigationMenuList className="gap-0.5">
          {menuTree.map((item) => (
            <NavigationMenuItem key={item.id}>
              {item.has_dropdown && item.children && item.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger
                    className="relative h-auto bg-transparent hover:bg-white/5 data-[state=open]:bg-white/5 text-gray-300 hover:text-white data-[state=open]:text-white text-[13px] font-semibold tracking-wide px-3 py-2 rounded-md transition-colors focus:outline-none"
                  >
                    {item.name}
                    {item.hot && (
                      <span className="ml-2 bg-[#ff184e] text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        HOT
                      </span>
                    )}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="glass-panel border-white/10 p-3 min-w-[200px] rounded-xl shadow-2xl">
                      <ul className="space-y-0.5">
                        {item.children.map((subitem) => (
                          <li key={subitem.id}>
                            <Link
                              to={subitem.path}
                              className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 group"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ff184e]/60 group-hover:bg-[#ff184e] transition-colors flex-shrink-0"></span>
                              {subitem.name}
                            </Link>
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
