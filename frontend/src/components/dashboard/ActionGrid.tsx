import { Plus, RefreshCw, BookOpen, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TxButton } from '../ui/TxButton';

import { useStore } from '../../store/useStore';

interface ActionGridProps {
  onAddTrade?: () => void;
}

export function ActionGrid({ onAddTrade }: ActionGridProps) {
  const navigate = useNavigate();
  const openMt5SyncModal = useStore((s) => s.openMt5SyncModal);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <TxButton variant="primary" onClick={onAddTrade ?? (() => navigate('/journal'))}>
        <Plus className="h-4 w-4" aria-hidden />
        Add trade
      </TxButton>
      <TxButton variant="secondary" onClick={() => navigate('/journal')}>
        <BookOpen className="h-4 w-4" aria-hidden />
        Journal
      </TxButton>
      <TxButton variant="secondary" onClick={() => navigate('/paper-trading')}>
        <Activity className="h-4 w-4" aria-hidden />
        Paper bot
      </TxButton>
      <TxButton variant="secondary" onClick={() => openMt5SyncModal()}>
        <RefreshCw className="h-4 w-4" aria-hidden />
        Sync MT5
      </TxButton>
    </div>
  );
}
