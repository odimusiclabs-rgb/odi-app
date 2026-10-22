import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Carousel from '@/components/Carousel';
import BottomNav, { type NavId } from '@/components/BottomNav';
import SignUpModal from '@/components/SignUpModal';
import SignUpPage from '@/components/SignUpPage';
import SignInPage from '@/components/SignInPage';
import ProfilePage from '@/components/ProfilePage';
import AdminPanel from '@/components/AdminPanel';
import CloudPage from '@/components/CloudPage';
import NotesPage from '@/components/NotesPage';
import MapPage from '@/components/MapPage';
import ArtistsPage from '@/components/ArtistsPage';
import SettingsPage from '@/components/SettingsPage';
import SupportPage from '@/components/SupportPage';
import SideMenu from '@/components/SideMenu';
import RosterSection from '@/components/RosterSection';
import { AuthProvider, useAuth } from '@/context/AuthContext';

type View =
  | 'home'
  | 'signup'
  | 'signin'
  | 'profile'
  | 'admin'
  | 'cloud'
  | 'notes'
  | 'map'
  | 'artists'
  | 'settings'
  | 'support'
  | 'edit-profile';

function AppContent() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [view, setView] = useState<View>('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const goToSignUp = () => {
    setModalOpen(false);
    setView('signup');
  };
  const goToSignIn = () => {
    setModalOpen(false);
    setView('signin');
  };
  const goHome = () => setView('home');
  const goToProfile = () => setView('profile');
  const goToAdmin = () => setView('admin');
  const setNav = (id: NavId) => setView(id);

  const handleProfileClick = () => {
    if (user) {
      setView('profile');
    } else {
      openModal();
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0A0A0A]">
        <div className="font-anton text-2xl uppercase text-white">ODI LABS</div>
      </div>
    );
  }

  if (!user && view === 'signup') {
    return <SignUpPage onBack={goHome} onSwitchToSignIn={goToSignIn} />;
  }
  if (!user && view === 'signin') {
    return <SignInPage onBack={goHome} onSwitchToSignUp={goToSignUp} />;
  }

  if (user && isAdmin && view === 'admin') {
    return <AdminPanel onBack={goToProfile} />;
  }

  if (user && view === 'profile') {
    return (
      <>
        <ProfilePage
          onBack={goHome}
          onAdminPanel={goToAdmin}
          onNavigate={(v) => setView(v as View)}
          onSignOut={async () => {
            await signOut();
            setView('home');
          }}
        />
        <BottomNav
          active="home"
          onNavigate={setNav}
          onProfileClick={handleProfileClick}
          profileActive
        />
      </>
    );
  }

  if (user && view === 'edit-profile') {
    return (
      <>
        <div className="min-h-screen bg-[#0A0A0A] px-6 py-8 sm:px-10">
          <div className="mx-auto max-w-md">
            <button
              onClick={goToProfile}
              className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
              Back to Profile
            </button>
            <div className="flex flex-col items-center text-center">
              <h1 className="font-anton text-2xl uppercase text-white">Edit Profile</h1>
              <p className="mt-3 text-sm text-[#555555]">Profile editing is coming soon.</p>
            </div>
          </div>
        </div>
        <BottomNav
          active="home"
          onNavigate={setNav}
          onProfileClick={handleProfileClick}
          profileActive
        />
      </>
    );
  }

  if (user && view === 'settings') {
    return (
      <>
        <SettingsPage onBack={goHome} />
        <BottomNav active="home" onNavigate={setNav} onProfileClick={handleProfileClick} />
      </>
    );
  }

  if (view === 'support') {
    return (
      <>
        <SupportPage onBack={goHome} />
        <BottomNav active="home" onNavigate={setNav} onProfileClick={handleProfileClick} />
      </>
    );
  }

  if (view === 'cloud') {
    return (
      <>
        <CloudPage onBack={goHome} />
        <BottomNav active="cloud" onNavigate={setNav} onProfileClick={handleProfileClick} />
      </>
    );
  }

  if (view === 'notes') {
    return (
      <>
        <NotesPage onBack={goHome} />
        <BottomNav active="notes" onNavigate={setNav} onProfileClick={handleProfileClick} />
      </>
    );
  }

  if (view === 'map') {
    return (
      <>
        <MapPage onBack={goHome} />
        <BottomNav active="map" onNavigate={setNav} onProfileClick={handleProfileClick} />
      </>
    );
  }

  if (view === 'artists') {
    return (
      <>
        <ArtistsPage onBack={goHome} />
        <BottomNav active="home" onNavigate={setNav} onProfileClick={handleProfileClick} />
      </>
    );
  }

  const navActive: NavId = 'home';
  return (
    <div className="relative flex min-h-screen flex-col overflow-y-auto overflow-x-hidden bg-[#0A0A0A]">
      <Header
        onSignIn={goToSignIn}
        onProfile={goToProfile}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <Hero />
      <div style={{ marginTop: '40px' }}>
        <Carousel onLockedAction={user ? goToProfile : goToSignUp} />
      </div>
      <RosterSection />
      <BottomNav
        active={navActive}
        onNavigate={setNav}
        onProfileClick={handleProfileClick}
      />
      <SignUpModal
        open={modalOpen}
        onClose={closeModal}
        onSignUp={goToSignUp}
        onSignIn={goToSignIn}
      />
      <SideMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        signedIn={!!user}
        onSettings={() => setView('settings')}
        onSupport={() => setView('support')}
        onSignOut={async () => {
          await signOut();
          setView('home');
        }}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
