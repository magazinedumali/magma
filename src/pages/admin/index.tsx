import DashboardWidgets from '../../components/admin-dashboard/DashboardWidgets';

export default function AdminHome() {
  return (
    <>
      <DashboardWidgets />
    </>
  );
}

export { default as PollsPage } from './PollsPage';
export { default as MainMenuPage } from './MainMenuPage';