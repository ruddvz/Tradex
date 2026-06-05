import { useState } from 'react';
import { Share, X } from 'lucide-react';
import { useIsIosSafari, useIsStandalone } from '../../hooks/useIsStandalone';

const DISMISS_KEY = 'tradex-ios-install-dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Shown on iPhone Safari when not yet installed — guides Add to Home Screen.
 */
export function IosInstallBanner() {
  const standalone = useIsStandalone();
  const iosSafari = useIsIosSafari();
  const [dismissed, setDismissed] = useState(readDismissed);

  if (standalone || !iosSafari || dismissed) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Install Tradex on iPhone"
      className="no-print fixed z-[60] left-0 right-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:hidden px-3"
    >
      <div className="rounded-2xl border border-brand-500/30 bg-[rgba(8,14,28,0.96)] backdrop-blur-xl shadow-card p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-brand-500/15 shrink-0">
            <Share className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Install on iPhone</p>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Tap <span className="text-white font-medium">Share</span> in Safari, then{' '}
              <span className="text-white font-medium">Add to Home Screen</span> for full-screen
              Tradex with safe-area layout.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="p-2 rounded-lg text-slate-500 hover:text-white shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Dismiss install hint"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
