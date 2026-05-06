import { useState } from 'react';
import { NotebookPen, Plus, Search, Pin, Tag, BookOpen, Target, GraduationCap, CheckSquare, Star } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useStore } from '../store/useStore';
import { Badge } from '../components/ui/Badge';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import type { NotebookEntry } from '../types';

const typeConfig = {
  note:      { label: 'Note',      icon: BookOpen,     color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20'   },
  rule:      { label: 'Rule',      icon: Target,       color: 'text-brand-400',  bg: 'bg-brand-500/10',  border: 'border-brand-500/20'  },
  setup:     { label: 'Setup',     icon: Star,         color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  lesson:    { label: 'Lesson',    icon: GraduationCap,color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  checklist: { label: 'Checklist', icon: CheckSquare,  color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20'  },
};

function NoteCard({ note, onClick }: { note: NotebookEntry; onClick: () => void }) {
  const cfg = typeConfig[note.type];
  const Icon = cfg.icon;

  return (
    <div
      className={clsx('card-hover p-5 cursor-pointer border', note.pinned && 'border-brand-500/30')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className={clsx('p-1.5 rounded-lg', cfg.bg)}>
            <Icon className={clsx('w-3.5 h-3.5', cfg.color)} />
          </div>
          <Badge variant="neutral" size="xs">{cfg.label}</Badge>
          {note.pinned && <Pin className="w-3 h-3 text-brand-400" />}
        </div>
        <span className="text-[10px] text-slate-600 flex-shrink-0">{format(new Date(note.updatedAt), 'MMM d')}</span>
      </div>

      <h3 className="font-semibold text-white text-sm mb-2 line-clamp-1">{note.title}</h3>
      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{note.content.replace(/[#*`]/g, '').trim()}</p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {note.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-surface-light rounded text-[10px] text-slate-500 border border-surface-border">
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && <span className="text-[10px] text-slate-600">+{note.tags.length - 3}</span>}
        </div>
      )}
    </div>
  );
}

function NoteViewer({ note, onClose }: { note: NotebookEntry; onClose: () => void }) {
  const cfg = typeConfig[note.type];
  const Icon = cfg.icon;

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-white mt-4 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-semibold text-white mt-3 mb-1.5">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-base font-semibold text-slate-200 mt-2 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith('- ') || line.startsWith('* ')) return (
        <li key={i} className="flex items-start gap-2 ml-2 mb-1">
          <span className="text-brand-400 mt-1">•</span>
          <span className="text-sm text-slate-300">{line.slice(2)}</span>
        </li>
      );
      if (/^\d+\./.test(line)) return (
        <div key={i} className="flex items-start gap-2 ml-2 mb-1">
          <span className="text-brand-400 text-sm font-semibold flex-shrink-0">{line.match(/^\d+/)![0]}.</span>
          <span className="text-sm text-slate-300">{line.replace(/^\d+\.\s*/, '')}</span>
        </div>
      );
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-white text-sm mb-1">{line.slice(2, -2)}</p>;
      if (line === '') return <div key={i} className="h-2" />;
      return <p key={i} className="text-sm text-slate-300 mb-1 leading-relaxed">{line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-surface border border-surface-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-card-hover animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className={clsx('flex items-center justify-between p-5 border-b border-surface-border', cfg.border)}>
          <div className="flex items-center gap-3">
            <div className={clsx('p-2 rounded-xl', cfg.bg)}>
              <Icon className={clsx('w-5 h-5', cfg.color)} />
            </div>
            <div>
              <h2 className="font-bold text-white">{note.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="neutral" size="xs">{cfg.label}</Badge>
                <span className="text-xs text-slate-500">{format(new Date(note.updatedAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {note.pinned && <Pin className="w-4 h-4 text-brand-400" />}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white">✕</button>
          </div>
        </div>
        <div className="p-5">
          <div className="prose-sm">{renderContent(note.content)}</div>
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-surface-border">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              {note.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-surface-light rounded-lg text-xs text-slate-400 border border-surface-border">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Notebook() {
  const { notebook } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selected, setSelected] = useState<NotebookEntry | null>(null);

  const filtered = notebook.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  return (
    <div className="min-h-screen">
      <Header title="Trading Notebook" subtitle="Your personal knowledge base" />

      <div className="pt-16 p-6 space-y-5">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="input pl-10"
              placeholder="Search notes, rules, setups..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'note', 'rule', 'setup', 'lesson', 'checklist'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all border',
                  typeFilter === type
                    ? 'bg-brand-500/20 text-brand-400 border-brand-500/30'
                    : 'text-slate-400 border-surface-border hover:bg-surface-light hover:text-white'
                )}
              >
                {type}
              </button>
            ))}
          </div>
          <button className="btn-primary text-sm flex-shrink-0">
            <Plus className="w-4 h-4" /> New Note
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 px-4 py-3 bg-surface rounded-xl border border-surface-border text-sm">
          <span className="text-slate-400">{notebook.length} notes</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">{notebook.filter(n => n.pinned).length} pinned</span>
          <span className="text-slate-600">·</span>
          {Object.entries(typeConfig).map(([type, cfg]) => {
            const count = notebook.filter(n => n.type === type).length;
            const Icon = cfg.icon;
            return count > 0 ? (
              <div key={type} className="flex items-center gap-1.5">
                <Icon className={clsx('w-3.5 h-3.5', cfg.color)} />
                <span className="text-slate-400">{count} {cfg.label.toLowerCase()}s</span>
              </div>
            ) : null;
          })}
        </div>

        {/* Pinned Section */}
        {pinned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pin className="w-4 h-4 text-brand-400" />
              <h2 className="text-sm font-semibold text-slate-300">Pinned</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinned.map(note => (
                <NoteCard key={note.id} note={note} onClick={() => setSelected(note)} />
              ))}
            </div>
          </div>
        )}

        {/* All Notes */}
        {unpinned.length > 0 && (
          <div>
            {pinned.length > 0 && (
              <h2 className="text-sm font-semibold text-slate-400 mb-3">All Notes</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unpinned.map(note => (
                <NoteCard key={note.id} note={note} onClick={() => setSelected(note)} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <NotebookPen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No notes found</p>
            <p className="text-slate-600 text-sm mt-1">Create your first note to build your knowledge base</p>
            <button className="btn-primary mt-4 mx-auto">
              <Plus className="w-4 h-4" /> Create Note
            </button>
          </div>
        )}
      </div>

      {selected && <NoteViewer note={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
