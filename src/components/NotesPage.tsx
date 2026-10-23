import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, StickyNote, Plus, Trash2, Bold, Italic, Underline, List, Calendar, X, ArrowRight, Music, Guitar, FileText, Grid3x3, Printer } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { mapEvents } from '@/data/mapEvents';

interface NotesPageProps {
  onBack: () => void;
  onViewEvent?: (eventId: number) => void;
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

type TemplateType = 'sheet-music' | 'guitar-chords' | 'lyrics-chords' | 'blank-grid';

interface Template {
  id: TemplateType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const templates: Template[] = [
  { id: 'sheet-music', title: 'Blank Sheet Music', subtitle: '5-line staves for notation', icon: <Music size={22} strokeWidth={1.5} /> },
  { id: 'guitar-chords', title: 'Guitar Chords', subtitle: 'Chord grids & fret diagrams', icon: <Guitar size={22} strokeWidth={1.5} /> },
  { id: 'lyrics-chords', title: 'Lyrics & Chords', subtitle: 'Text with inline chords', icon: <FileText size={22} strokeWidth={1.5} /> },
  { id: 'blank-grid', title: 'Blank Grid', subtitle: 'Square grid for sketches', icon: <Grid3x3 size={22} strokeWidth={1.5} /> },
];

export default function NotesPage({ onBack, onViewEvent }: NotesPageProps) {
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement>(null);
  const templateEditorRef = useRef<HTMLTextAreaElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<TemplateType | null>(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [templateSaving, setTemplateSaving] = useState(false);

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

  const openNewEditor = () => {
    setEditingNote(null);
    setTitle('');
    setEditorOpen(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
        editorRef.current.focus();
      }
    }, 50);
  };

  const openEditEditor = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setEditorOpen(true);
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content;
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
    const cleanTitle = title.trim() || 'Untitled';

    if (editingNote) {
      const { data } = await supabase
        .from('notes')
        .update({ title: cleanTitle, content, updated_at: new Date().toISOString() })
        .eq('id', editingNote.id)
        .select('id, title, content, created_at')
        .maybeSingle();

      if (data) {
        setNotes((prev) =>
          prev.map((n) => (n.id === editingNote.id ? (data as Note) : n))
        );
      }
    } else {
      const { data } = await supabase
        .from('notes')
        .insert({ user_id: user.id, title: cleanTitle, content })
        .select('id, title, content, created_at')
        .maybeSingle();

      if (data) {
        setNotes((prev) => [data as Note, ...prev]);
      }
    }
    setSaving(false);
    setEditorOpen(false);
    setEditingNote(null);
  };

  const openTemplate = (tpl: TemplateType) => {
    setActiveTemplate(tpl);
    const tplData = templates.find((t) => t.id === tpl);
    setTemplateTitle(tplData?.title ?? '');
    setTemplateText('');
    setTemplateOpen(true);
  };

  const saveTemplateAsNote = async () => {
    if (!user) return;
    const cleanTitle = templateTitle.trim() || 'Untitled Template';
    if (!templateText.trim()) return;

    setTemplateSaving(true);
    const escaped = templateText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
    const content = `<div data-template="${activeTemplate}">${escaped}</div>`;

    const { data } = await supabase
      .from('notes')
      .insert({ user_id: user.id, title: cleanTitle, content })
      .select('id, title, content, created_at')
      .maybeSingle();

    if (data) {
      setNotes((prev) => [data as Note, ...prev]);
    }
    setTemplateSaving(false);
    setTemplateOpen(false);
  };

  const printTemplate = () => {
    if (!activeTemplate) return;
    const tpl = templates.find((t) => t.id === activeTemplate);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const gridStyle = getTemplatePrintGrid(activeTemplate);
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${tpl?.title ?? 'Template'}</title>
      <style>
        body { margin: 0; padding: 40px; background: white; color: #1a1a1a; font-family: 'Inter', sans-serif; }
        h1 { font-size: 20px; margin-bottom: 20px; }
        .paper { position: relative; min-height: 800px; }
        .grid-bg { position: absolute; inset: 0; pointer-events: none; }
        .text-layer { position: relative; z-index: 1; white-space: pre-wrap; font-size: 14px; line-height: ${activeTemplate === 'sheet-music' ? '40px' : activeTemplate === 'guitar-chords' ? '60px' : '28px'}; min-height: 800px; }
        ${gridStyle}
      </style></head><body>
      <h1>${templateTitle || tpl?.title || 'Template'}</h1>
      <div class="paper"><div class="grid-bg"></div><div class="text-layer">${(templateText || '').replace(/</g, '&lt;')}</div></div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
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
            onClick={openNewEditor}
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
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                          urgent
                            ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                            : 'bg-[#222222] text-[#888888]'
                        }`}
                      >
                        {days === 0 ? 'Today' : `${days}d`}
                      </span>
                      {onViewEvent && (
                        <button
                          onClick={() => onViewEvent(event.id)}
                          className="flex items-center gap-1 rounded-full bg-[#3B82F6] px-3 py-1.5 text-[10px] font-bold uppercase text-white transition-all hover:bg-[#2563EB]"
                        >
                          View
                          <ArrowRight size={10} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#555555]">No upcoming events.</p>
          )}
        </div>

        {/* Templates */}
        <div className="mt-8">
          <h2 className="font-anton text-lg uppercase text-white">Templates</h2>
          <p className="mt-1 text-sm text-[#888888]">Write music directly in the app or print</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => openTemplate(tpl.id)}
                className="group flex flex-col items-center rounded-2xl border border-[#1E1E1E] bg-[#141414] p-6 text-center transition-all hover:border-[#3B82F6]/50 hover:bg-[#161616]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#222222] bg-[#0F0F0F] text-[#888888] transition-colors group-hover:border-[#3B82F6]/40 group-hover:text-[#3B82F6]">
                  {tpl.icon}
                </div>
                <h3 className="mt-4 font-anton text-sm uppercase text-white">{tpl.title}</h3>
                <p className="mt-1 text-xs text-[#555555]">{tpl.subtitle}</p>
              </button>
            ))}
          </div>
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
                  onClick={() => openEditEditor(note)}
                  className="group cursor-pointer rounded-2xl border border-[#1E1E1E] bg-[#141414] p-5 transition-all hover:border-[#333333]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-anton text-base uppercase leading-tight text-white">
                      {note.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
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
              <h2 className="font-anton text-xl uppercase text-white">
                {editingNote ? 'Edit Note' : 'New Note'}
              </h2>
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

      {/* Template editor modal */}
      {templateOpen && activeTemplate && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setTemplateOpen(false)}
          />
          <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#222222] bg-[#1A1A1A] animate-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222222] px-6 py-4">
              <input
                type="text"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="Title"
                className="font-anton text-lg uppercase text-white placeholder:text-[#444444] focus:outline-none"
              />
              <button
                onClick={() => setTemplateOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Paper area */}
            <div className="flex-1 overflow-auto bg-[#0F0F0F] p-6">
              <div className="relative mx-auto max-w-3xl">
                {/* Grid background */}
                <TemplateGrid type={activeTemplate} />

                {/* Text layer */}
                <textarea
                  ref={templateEditorRef}
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  placeholder="Start writing..."
                  className="absolute inset-0 w-full resize-none bg-transparent font-mono text-sm leading-[40px] text-[#1a1a1a] placeholder:text-[#999] focus:outline-none"
                  style={{
                    lineHeight: activeTemplate === 'sheet-music' ? '40px' : activeTemplate === 'guitar-chords' ? '60px' : '28px',
                  }}
                />
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between border-t border-[#222222] px-6 py-4">
              <button
                onClick={printTemplate}
                className="flex items-center gap-2 rounded-full border border-[#222222] bg-[#111111] px-5 py-3 text-sm font-semibold text-[#888888] transition-all hover:text-white hover:border-[#333333]"
              >
                <Printer size={15} strokeWidth={1.75} />
                Print / Download PDF
              </button>
              <button
                onClick={saveTemplateAsNote}
                disabled={templateSaving}
                className="flex items-center gap-2 rounded-full bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#2563EB] hover:shadow-lg hover:shadow-[#3B82F6]/30 disabled:opacity-50"
              >
                {templateSaving ? 'Saving...' : 'Save as Note'}
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

function TemplateGrid({ type }: { type: TemplateType }) {
  if (type === 'sheet-music') {
    const staves = Array.from({ length: 10 });
    return (
      <div className="absolute inset-0 rounded-lg bg-white">
        {staves.map((_, i) => (
          <div
            key={i}
            className="flex flex-col"
            style={{ height: '40px', borderBottom: '1px solid #ccc', marginTop: i === 0 ? '0' : '0' }}
          >
            {[0, 1, 2, 3, 4].map((j) => (
              <div key={j} style={{ height: '8px', borderBottom: '1px solid #333' }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'guitar-chords') {
    const rows = Array.from({ length: 10 });
    return (
      <div
        className="absolute inset-0 rounded-lg bg-white"
        style={{
          backgroundImage:
            'linear-gradient(to right, #bbb 1px, transparent 1px), linear-gradient(to bottom, #bbb 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      >
        {rows.map((_, i) => (
          <div
            key={i}
            style={{ height: '60px', borderBottom: '2px solid #555' }}
          />
        ))}
      </div>
    );
  }

  if (type === 'lyrics-chords') {
    const rows = Array.from({ length: 24 });
    return (
      <div className="absolute inset-0 rounded-lg bg-white">
        {rows.map((_, i) => (
          <div
            key={i}
            style={{ height: '28px', borderBottom: '1px dashed #ddd' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 rounded-lg bg-white"
      style={{
        backgroundImage:
          'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />
  );
}

function getTemplatePrintGrid(type: TemplateType): string {
  if (type === 'sheet-music') {
    const lines = Array.from({ length: 5 }, (_, i) =>
      `border-bottom: 1px solid #333; height: 8px;`
    ).join('');
    return `
      .grid-bg {
        background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 32px, #333 32px, #333 33px, #333 33px, #333 34px, #333 34px, #333 35px, #333 35px, #333 36px, #333 36px, #333 37px, #333 37px, #333 38px, #333 38px, #333 39px, #333 39px, #333 40px);
      }
    `;
  }
  if (type === 'guitar-chords') {
    return `.grid-bg { background-image: linear-gradient(to right, #bbb 1px, transparent 1px), linear-gradient(to bottom, #bbb 1px, transparent 1px); background-size: 60px 60px; }`;
  }
  if (type === 'lyrics-chords') {
    return `.grid-bg { background-image: repeating-linear-gradient(to bottom, transparent 0, transparent 27px, #ddd 27px, #ddd 28px); }`;
  }
  return `.grid-bg { background-image: linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px); background-size: 28px 28px; }`;
}
