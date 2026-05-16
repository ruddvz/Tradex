import { useState } from 'react';
import { X, Pin } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import type { NotebookEntry } from '../../types';

interface Props {
  mode: 'create' | 'edit';
  initial?: NotebookEntry | null;
  onClose: () => void;
}

const types: NotebookEntry['type'][] = ['note', 'rule', 'setup', 'lesson', 'checklist'];

export function NoteEditor({ mode, initial, onClose }: Props) {
  const { addNotebookEntry, updateNotebookEntry } = useStore();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<NotebookEntry['type']>(initial?.type ?? 'note');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [pinned, setPinned] = useState(initial?.pinned ?? false);

  const addTag = () => {
    if (tagInput.trim()) {
      setTags(prev => [...prev, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleSave = async () => {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
    if (mode === 'create') {
      await addNotebookEntry({
        id: `note-${Date.now()}`,
        title: title.trim() || 'Untitled',
        content,
        type,
        tags,
        pinned,
        createdAt: now,
        updatedAt: now,
      });
    } else if (initial) {
      await updateNotebookEntry(initial.id, {
        title: title.trim() || 'Untitled',
        content,
        type,
        tags,
        pinned,
        updatedAt: now,
      });
    }
    onClose();
  };

  return (
    <div className="modal-backdrop z-[60]" onClick={onClose} role="presentation">
      <div
        className="bg-surface border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-card-hover animate-slide-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface z-10">
          <h2 className="font-bold text-white text-lg">
            {mode === 'create' ? 'New Entry' : 'Edit Entry'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-surface-light text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="select" value={type} onChange={e => setType(e.target.value as NotebookEntry['type'])}>
              {types.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Content</label>
            <p className="text-[10px] text-slate-600 mb-1">Supports lines starting with #, ##, - for lists</p>
            <textarea
              className="input min-h-[120px] resize-y font-mono text-sm"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your note..."
            />
          </div>
          <div>
            <label className="label">Tags</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="tag + Enter"
              />
              <button type="button" className="btn-secondary px-3" onClick={addTag}>
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="chip text-slate-400 border border-surface-border px-2 py-1 rounded-lg text-xs flex items-center gap-1"
                >
                  #{tag}
                  <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-400">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPinned(!pinned)}
            className={clsx(
              'flex items-center gap-2 w-full py-2 px-3 rounded-lg border text-sm transition-colors',
              pinned ? 'border-brand-500/40 bg-brand-500/10 text-brand-400' : 'border-surface-border text-slate-400'
            )}
          >
            <Pin className="w-4 h-4" />
            {pinned ? 'Pinned to top' : 'Pin to top'}
          </button>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary flex-1" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
