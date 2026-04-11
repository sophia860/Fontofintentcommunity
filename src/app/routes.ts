import { createBrowserRouter } from 'react-router';
import { PageGalleryHome } from './components/PageGalleryHome';
import { GardenHome } from './components/GardenHome';
import { GardenLanding } from './components/GardenLanding';
import { Pricing } from './components/Pricing';
import { BrandArchitecture } from './components/BrandArchitecture';
import { Programs } from './components/Programs';
import { WriterShop } from './components/WriterShop';
import { ArtistCommission } from './components/ArtistCommission';
import { ArtistRegister } from './components/ArtistRegister';
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
import { AuthCallbackPage } from './components/AuthCallbackPage';
import { AdminDashboard } from './components/AdminDashboard';
import { Editions } from './components/Editions';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PageGalleryHome,
  },
  {
    path: '/garden',
    Component: GardenHome,
  },
  {
    path: '/garden-landing',
    Component: GardenLanding,
  },
  {
    path: '/pricing',
    Component: Pricing,
  },
  {
    path: '/brand',
    Component: BrandArchitecture,
  },
  {
    path: '/programs',
    Component: Programs,
  },
  {
    path: '/shop',
    Component: WriterShop,
  },
  {
    path: '/editions',
    Component: Editions,
  },
  {
    path: '/commissions',
    Component: ArtistCommission,
  },
  {
    path: '/artist-register',
    Component: ArtistRegister,
  },
  {
    path: '/garden-home',
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
    path: '/auth/callback',
    Component: AuthCallbackPage,
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
