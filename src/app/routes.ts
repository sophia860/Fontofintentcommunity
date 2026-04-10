import { createBrowserRouter } from 'react-router';
import { GardenHome } from './components/GardenHome';
import { WriterProfile } from './components/WriterProfile';
import { JournalDirectory } from './components/JournalDirectory';
import { JournalProfile } from './components/JournalProfile';
import { ResidencyProgramme } from './components/ResidencyProgramme';
import { Editions } from './components/Editions';
import { EditionDetail } from './components/EditionDetail';
import { WriterDashboard } from './components/WriterDashboard';
import { JournalDashboard } from './components/JournalDashboard';
import { Apply } from './components/Apply';
import { About } from './components/About';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: GardenHome,
  },
  {
    path: '/writers',
    Component: WriterProfile,
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
    path: '/editions',
    Component: Editions,
  },
  {
    path: '/editions/:id',
    Component: EditionDetail,
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
]);
