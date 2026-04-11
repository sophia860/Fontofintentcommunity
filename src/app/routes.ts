import { createBrowserRouter } from 'react-router';
import { GardenHome } from './components/GardenHome';
import { WriterDirectory } from './components/WriterDirectory';
import { WriterProfile } from './components/WriterProfile';
import { WritersPage } from './components/WritersPage';
import { JournalDirectory } from './components/JournalDirectory';
import { JournalProfile } from './components/JournalProfile';
import { ResidencyProgramme } from './components/ResidencyProgramme';
import { WriterDashboard } from './components/WriterDashboard';
import { JournalDashboard } from './components/JournalDashboard';
import { Apply } from './components/Apply';
import { About } from './components/About';
import { WritingSurface } from './components/WritingSurface';
import { PreviewScreen } from './components/PreviewScreen';
import { ReplayView } from './components/ReplayView';
import { AuthPage } from './components/AuthPage';
import { AdminDashboard } from './components/AdminDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: GardenHome,
  },
  {
    path: '/write',
    Component: WritingSurface,
  },
  {
    path: '/piece/:id',
    Component: WritingSurface,
  },
  {
    path: '/preview',
    Component: PreviewScreen,
  },
  {
    path: '/replay',
    Component: ReplayView,
  },
  {
    path: '/auth',
    Component: AuthPage,
  },
  {
    path: '/writer',
    Component: WritersPage,
  },
  {
    path: '/writers',
    Component: WriterDirectory,
  },
  {
    path: '/writers/:id',
    Component: WriterProfile,
  },
  {
    path: '/journals',
    Component: JournalDirectory,
  },
  {
    path: '/journals/:id',
    Component: JournalProfile,
  },
  {
    path: '/residency',
    Component: ResidencyProgramme,
  },
  {
    path: '/dashboard/writer',
    Component: WriterDashboard,
  },
  {
    path: '/dashboard/journal',
    Component: JournalDashboard,
  },
  {
    path: '/apply',
    Component: Apply,
  },
  {
    path: '/about',
    Component: About,
  },
  {
    path: '/admin',
    Component: AdminDashboard,
  },
]);
