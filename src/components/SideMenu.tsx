import {
  X, Settings, LifeBuoy, LogOut,
  Info, Mic, ShoppingBag, Mail,
} from 'lucide-react';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
  onSettings: () => void;
  onSupport: () => void;
  onSignOut: () => void;
  onAbout: () => void;
  onAudition: () => void;
  onStore: () => void;
  onContacts: () => void;
}

export default function SideMenu({
  open,
  onClose,
  signedIn,
  onSettings,
  onSupport,
  onSignOut,
  onAbout,
  onAudition,
  onStore,
  onContacts,
}: SideMenuProps) {
  const menuItem = (
    icon: typeof Info,
    label: string,
    onClick: () => void,
  ) => (
    <button
      onClick={() => {
        onClose();
        onClick();
      }}
      className="flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-[#1a1a1a]"
    >
      {(() => {
        const Icon = icon;
        return <Icon size={20} className="text-[#888888]" strokeWidth={1.5} />;
      })()}
      <span className="text-sm font-medium text-white">{label}</span>
    </button>
  );

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[min(80vw,320px)] flex-col border-l border-[#222222] bg-[#111111] transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <span className="font-anton text-xl uppercase text-white">Menu</span>
          <button
            onClick={onClose}
            className="text-[#888888] transition-colors hover:text-white"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="mt-4 flex flex-col gap-1 overflow-y-auto px-3">
          {menuItem(Settings, 'Settings', onSettings)}
          {menuItem(LifeBuoy, 'Support', onSupport)}
          {menuItem(Info, 'About Us', onAbout)}
          {menuItem(Mic, 'Audition', onAudition)}
          {menuItem(ShoppingBag, 'Store', onStore)}
          {menuItem(Mail, 'Contacts', onContacts)}
        </nav>

        {signedIn && (
          <div className="mt-auto p-3">
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-[#1a1a1a]"
            >
              <LogOut size={20} className="text-[#888888]" strokeWidth={1.5} />
              <span className="text-sm font-medium text-white">Sign Out</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
