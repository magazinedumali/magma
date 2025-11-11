import DashboardWidgets from '../../components/admin-dashboard/DashboardWidgets';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  return (
    <>
      <div className="flex justify-end mb-6 gap-3">
        <Link 
          to="/admin/categories" 
          className="bg-[#4f8cff] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-[#2563eb] transition-colors shadow-sm font-poppins"
        >
          Gérer les catégories
        </Link>
        <Link 
          to="/admin/menu" 
          className="bg-[#ff184e] text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-red-600 transition-colors shadow-sm font-poppins"
        >
          Gérer le menu principal
        </Link>
      </div>
      <DashboardWidgets />
    </>
  );
}

export { default as PollsPage } from './PollsPage';
export { default as MainMenuPage } from './MainMenuPage'; 