import { X, Music2 } from 'lucide-react';

interface SignUpModalProps {
  open: boolean;
  onClose: () => void;
  onSignUp: () => void;
  onSignIn: () => void;
}

export default function SignUpModal({ open, onClose, onSignUp, onSignIn }: SignUpModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade"
      onClick={onClose}
    >
      <div
        className="relative w-[min(92vw,440px)] rounded-[32px] bg-[#141414] border border-[#222222] p-8 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#888888] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={22} strokeWidth={1.5} />
        </button>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#3B82F6]/15 text-[#3B82F6]">
          <Music2 size={26} strokeWidth={1.5} />
        </div>

        <h2 className="font-anton text-3xl uppercase leading-tight text-white">
          Join ODI LABS
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#888888]">
          You're browsing as a guest. Create an account to stream full tracks,
          save releases, and follow artists.
        </p>

        <div className="mt-6 space-y-3">
          <button
            onClick={onSignUp}
            className="w-full rounded-2xl bg-[#3B82F6] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
          >
            Create account
          </button>
          <button
            onClick={onSignIn}
            className="w-full rounded-2xl border border-[#222222] py-3.5 text-sm font-medium text-[#888888] transition-colors hover:border-[#444444] hover:text-white"
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}
