import { useState } from 'react';
import { ArrowLeft, Send, Check } from 'lucide-react';

interface SupportPageProps {
  onBack: () => void;
}

export default function SupportPage({ onBack }: SupportPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-md">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </button>

        <h1 className="font-anton text-4xl uppercase text-white sm:text-5xl">Support</h1>
        <p className="mt-3 text-sm text-[#888888]">
          Have a question or need help? Send us a message.
        </p>

        {sent && (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-5 py-4 text-sm text-[#3B82F6]">
            <Check size={18} strokeWidth={2} />
            Message sent. We'll get back to you soon.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-[#555555]">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#222222] bg-[#141414] px-5 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#3B82F6]"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-[#555555]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-[#222222] bg-[#141414] px-5 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#3B82F6]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-wider text-[#555555]">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="w-full resize-none rounded-2xl border border-[#222222] bg-[#141414] px-5 py-3.5 text-sm text-white placeholder-[#555555] outline-none transition-colors focus:border-[#3B82F6]"
              placeholder="How can we help?"
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B82F6] py-4 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
          >
            <Send size={16} strokeWidth={2} />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
