import { useState, type FormEvent } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SignInPageProps {
  onBack: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInPage({ onBack, onSwitchToSignUp }: SignInPageProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) setError(signInError);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#0A0A0A] px-6 py-8 sm:px-10">
      <button
        onClick={onBack}
        className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
      >
        <ArrowLeft size={18} strokeWidth={1.5} />
        Back
      </button>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <h1 className="font-anton text-4xl uppercase leading-tight text-white sm:text-5xl">
          Welcome
          <br />
          Back
        </h1>
        <p className="mt-3 text-sm text-[#888888]">
          Sign in to continue to ODI LABS.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-7">
          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            required
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
          />

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#888888]">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="font-medium text-[#3B82F6] transition-colors hover:text-[#60A5FA]"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}

function Field({ label, type, value, onChange, placeholder, required }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-[#888888]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        className={`w-full border-0 border-b bg-transparent pb-3 text-base text-white placeholder:text-[#444444] outline-none transition-colors ${
          focused ? 'border-b-[#3B82F6]' : 'border-b-[#333333]'
        }`}
      />
    </div>
  );
}
