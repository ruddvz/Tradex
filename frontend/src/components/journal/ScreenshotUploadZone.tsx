import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { getToken } from '../../lib/auth';
import { uploadTradeScreenshot } from '../../lib/api/trades';
import { useToast } from '../ui/Toast';
import { TxButton } from '../ui/TxButton';
import type { Trade } from '../../types';

export function ScreenshotUploadZone({
  tradeId,
  slot,
  label,
  url,
  onUploaded,
}: {
  tradeId: string;
  slot: 'before' | 'after';
  label: string;
  url?: string;
  onUploaded: (payload: Partial<Trade>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!getToken()) {
      showToast('Sign in to attach screenshots (Journal uses live API when authenticated).');
      return;
    }
    setBusy(true);
    try {
      const row = await uploadTradeScreenshot(tradeId, slot, file);
      const patch: Partial<Trade> = {};
      if (row.screenshotBeforeUrl) patch.screenshotBeforeUrl = row.screenshotBeforeUrl;
      if (row.screenshotAfterUrl) patch.screenshotAfterUrl = row.screenshotAfterUrl;
      if (Object.keys(patch).length > 0) onUploaded(patch);
      showToast('Screenshot saved');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed — is the API running?', 'warning');
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  return (
    <div className="rounded-[var(--tx-r-20)] border border-dashed border-[var(--tx-line-2)] bg-[var(--tx-surface-inset)] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--tx-text-4)]">
        <ImagePlus className="h-4 w-4 text-[var(--tx-info)]" aria-hidden />
        {label}
      </div>
      {url ? (
        <img src={url} alt={label} className="mb-3 max-h-44 w-full rounded-[var(--tx-r-16)] object-contain" />
      ) : (
        <p className="mb-3 text-xs text-[var(--tx-text-4)]">No image yet</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={onFile}
      />
      <TxButton
        variant="secondary"
        size="md"
        fullWidth
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? 'Uploading…' : url ? 'Replace' : 'Upload'}
      </TxButton>
    </div>
  );
}
