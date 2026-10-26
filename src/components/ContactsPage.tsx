import { ArrowLeft, Mail, MessageCircle, Send, Instagram, Youtube } from 'lucide-react';

interface ContactsPageProps {
  onBack: () => void;
}

const contacts = [
  { icon: Mail, label: 'Email', value: 'odimusic.office@gmail.com', color: '#3B82F6' },
  { icon: MessageCircle, label: 'Telegram', value: '@odilabs', color: '#3B82F6' },
  { icon: Send, label: 'Discord', value: 'odi-labs', color: '#3B82F6' },
  { icon: Instagram, label: 'Instagram', value: '@odi.labs', color: '#3B82F6' },
  { icon: Youtube, label: 'YouTube', value: 'ODI LABS', color: '#3B82F6' },
];

export default function ContactsPage({ onBack }: ContactsPageProps) {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] px-6 pb-28 pt-8 sm:px-10">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </button>

        <h1 className="font-anton text-5xl uppercase leading-none text-white sm:text-6xl">
          Contacts
        </h1>
        <p className="mt-3 text-sm text-[#888888]">Get in touch with the ODI LABS team.</p>

        <div className="mt-10 space-y-3">
          {contacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <div
                key={contact.label}
                className="flex items-center gap-4 rounded-2xl border border-[#222222] bg-[#141414] px-5 py-4 transition-colors hover:border-[#333333]"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${contact.color}10`, border: `1px solid ${contact.color}30` }}
                >
                  <Icon size={20} style={{ color: contact.color }} strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-[#555555]">{contact.label}</p>
                  <p className="mt-0.5 truncate text-sm font-medium text-white">{contact.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
