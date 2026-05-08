import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../../store/useStore';
import type { Playbook } from '../../types';

interface Props {
  onClose: () => void;
}

const types: Playbook['type'][] = ['strategy', 'symbol', 'session', 'timeframe', 'pattern'];

export function CreatePlaybookModal({ onClose }: Props) {
  const { addPlaybook } = useStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<Playbook['type']>('strategy');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<string[]>(['']);

  const addRuleLine = () => setRules(prev => [...prev, '']);

  const setRuleAt = (index: number, value: string) => {
    setRules(prev => prev.map((r, i) => (i === index ? value : r)));
  };

  const removeRuleAt = (index: number) => {
    setRules(prev => (prev.length <= 1 ? [''] : prev.filter((_, i) => i !== index)));
  };

  const handleSave = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const filteredRules = rules.map(r => r.trim()).filter(Boolean);
    const pb: Playbook = {
      id: `pb-${Date.now()}`,
      name: name.trim() || 'Untitled Playbook',
      type,
      winRate: 0,
      trades: 0,
      profit: 0,
      profitFactor: 0,
      avgRR: 0,
      description: description.trim() || 'No description yet.',
      rules: filteredRules.length ? filteredRules : ['Define your first rule'],
      tags: [],
      performance: [],
      createdAt: today,
      updatedAt: today,
    };
    addPlaybook(pb);
    onClose();
  };

  return (
    <div className="modal-backdrop z-[60]" onClick={onClose} role="presentation">
      <div
        className="bg-surface border border-surface-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-card-hover animate-slide-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface z-10">
          <h2 className="font-bold text-white text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-400" />
            New Playbook
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-light text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="My playbook" />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="select" value={type} onChange={e => setType(e.target.value as Playbook['type'])}>
              {types.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[72px] resize-y"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="When and why to use this playbook..."
            />
          </div>
          <div>
            <label className="label">Rules</label>
            <div className="space-y-2">
              {rules.map((rule, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input flex-1"
                    value={rule}
                    onChange={e => setRuleAt(i, e.target.value)}
                    placeholder={`Rule ${i + 1}`}
                  />
                  <button type="button" className="btn-secondary px-3 shrink-0" onClick={() => removeRuleAt(i)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-secondary text-xs mt-2 w-full justify-center" onClick={addRuleLine}>
              + Add rule line
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary flex-1" onClick={handleSave}>
              Save Playbook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
