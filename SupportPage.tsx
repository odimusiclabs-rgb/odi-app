import { X, Settings, LifeBuoy, LogOut } from 'lucide-react';

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  signedIn: boolean;
  onSettings: () => void;
  onSupport: () => void;
  onSignOut: () => void;
}

export default function SideMenu({
  open,
  onClose,
  signedIn,
  onSettings,
  onSupport,
  onSignOut,
}: SideMenuProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
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

        <nav className="mt-4 flex flex-col gap-1 px-3">
          <button
            onClick={() => {
              onClose();
              onSettings();
            }}
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-[#1a1a1a]"
          >
            <Settings size={20} className="text-[#888888]" strokeWidth={1.5} />
            <span className="text-sm font-medium text-white">Settings</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onSupport();
            }}
            className="flex items-center gap-4 rounded-2xl px-4 py-4 text-left transition-colors hover:bg-[#1a1a1a]"
          >
            <LifeBuoy size={20} className="text-[#888888]" strokeWidth={1.5} />
            <span className="text-sm font-medium text-white">Support</span>
          </button>
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
