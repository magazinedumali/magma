import DashboardWidgets from '../../components/admin-dashboard/DashboardWidgets';
import { Link } from 'react-router-dom';

export default function AdminHome() {
  return (
    <>
      <div className="flex justify-end mb-4 gap-4">
        <Link to="/admin/categories" className="bg-[#4f8cff] text-white px-4 py-2 rounded font-bold">Gérer les catégories</Link>
        <Link to="/admin/menu" className="bg-[#ff184e] text-white px-4 py-2 rounded font-bold">Gérer le menu principal</Link>
      </div>
      <DashboardWidgets />
    </>
  );
}

export { default as PollsPage } from './PollsPage';
export { default as MainMenuPage } from './MainMenuPage'; 