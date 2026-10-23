import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, StickyNote, Plus, Trash2, Bold, Italic, Underline, List, Calendar, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { mapEvents } from '@/data/mapEvents';

interface NotesPageProps {
  onBack: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function NotesPage({ onBack }: NotesPageProps) {
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const loadNotes = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from('notes')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotes(data as Note[] ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const openEditor = () => {
    setTitle('');
    setEditorOpen(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        editorRef.current.focus();
      }
    }, 50);
  };

  const exec = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const saveNote = async () => {
    if (!user || !editorRef.current) return;
    const content = editorRef.current.innerHTML.trim();
    if (!title.trim() && !stripHtml(content)) return;

    setSaving(true);
    const { data } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title: title.trim() || 'Untitled', content })
      .select('id, title, content, created_at')
      .maybeSingle();

    if (data) {
      setNotes((prev) => [data as Note, ...prev]);
    }
    setSaving(false);
    setEditorOpen(false);
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await supabase.from('notes').delete().eq('id', id);
  };

  const upcomingEvents = mapEvents
    .filter((e) => {
      const days = daysUntil(e.date);
      return days >= 0 && days <= 90;
    })
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
    .slice(0, 4);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] px-6 pb-28 pt-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-[#888888] transition-colors hover:text-white"
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </button>

        <div className="flex items-end justify-between">
          <h1 className="font-anton text-5xl uppercase leading-none text-white sm:text-6xl">
            Notes
          </h1>
          <button
            onClick={openEditor}
            className="mb-1 flex items-center gap-2 rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30"
          >
            <Plus size={16} strokeWidth={2} />
            New Note
          </button>
        </div>

        {/* Upcoming / Deadlines */}
        <div className="mt-8 rounded-2xl border border-[#222222] bg-[#141414] p-6">
          <div className="mb-4 flex items-center gap-3">
            <Calendar size={18} className="text-[#3B82F6]" strokeWidth={1.75} />
            <h2 className="font-anton text-lg uppercase text-white">Upcoming / Deadlines</h2>
            <span className="ml-auto text-xs text-[#555555]">{todayStr}</span>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {upcomingEvents.map((event) => {
                const days = daysUntil(event.date);
                const urgent = days <= 14;
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-xl border border-[#1E1E1E] bg-[#0F0F0F] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">
                        Prep for {event.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#666666]">
                        {event.date} — {event.city}
                      </p>
                    </div>
                    <span
                      className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        urgent
                          ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                          : 'bg-[#222222] text-[#888888]'
                      }`}
                    >
                      {days === 0 ? 'Today' : `${days}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#555555]">No upcoming events.</p>
          )}
        </div>

        {/* Notes list */}
        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#222222] border-t-[#3B82F6]" />
            </div>
          ) : notes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group rounded-2xl border border-[#1E1E1E] bg-[#141414] p-5 transition-all hover:border-[#333333]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-anton text-base uppercase leading-tight text-white">
                      {note.title}
                    </h3>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="shrink-0 text-[#444444] transition-colors hover:text-red-500"
                      aria-label="Delete note"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#888888]">
                    {stripHtml(note.content) || 'No content'}
                  </p>
                  <p className="mt-4 text-xs text-[#444444]">{formatDate(note.created_at)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#222222] bg-[#141414]">
                <StickyNote size={32} className="text-[#555555]" strokeWidth={1.5} />
              </div>
              <p className="mt-6 font-anton text-xl uppercase text-white">Write down your ideas</p>
              <p className="mt-2 text-sm text-[#888888]">Capture lyrics, concepts, and sketches.</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditorOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#222222] bg-[#1A1A1A] p-6 animate-fade-up">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-anton text-xl uppercase text-white">New Note</h2>
              <button
                onClick={() => setEditorOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="mb-4 w-full rounded-xl border border-[#222222] bg-[#0F0F0F] px-4 py-3 font-anton text-lg uppercase text-white placeholder:text-[#444444] focus:border-[#3B82F6] focus:outline-none"
            />

            {/* Toolbar */}
            <div className="mb-2 flex items-center gap-1 rounded-t-xl border border-b-0 border-[#222222] bg-[#0F0F0F] px-2 py-2">
              <ToolbarButton onClick={() => exec('bold')} label="Bold">
                <Bold size={15} strokeWidth={2} />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec('italic')} label="Italic">
                <Italic size={15} strokeWidth={2} />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec('underline')} label="Underline">
                <Underline size={15} strokeWidth={2} />
              </ToolbarButton>
              <ToolbarButton onClick={() => exec('insertUnorderedList')} label="Bullet list">
                <List size={15} strokeWidth={2} />
              </ToolbarButton>
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Start writing..."
              className="min-h-[180px] rounded-b-xl border border-[#222222] bg-[#0F0F0F] px-4 py-3 text-sm leading-relaxed text-white focus:outline-none [&_ul]:ml-5 [&_ul]:list-disc [&_b]:font-bold [&_i]:italic [&_u]:underline"
            />

            {/* Save */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={saveNote}
                disabled={saving}
                className="flex items-center gap-2 rounded-full bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder style for contentEditable */}
      <style>{`
        [contenteditable][data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: #444444;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#888888] transition-colors hover:bg-[#1E1E1E] hover:text-white"
      aria-label={label}
    >
      {children}
    </button>
  );
}
