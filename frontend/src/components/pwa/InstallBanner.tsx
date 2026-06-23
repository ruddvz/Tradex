import { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { useIsIosSafari, useIsStandalone } from '../../hooks/useIsStandalone';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';

const DISMISS_KEY = 'tradex-install-dismissed';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Cross-platform install prompt:
 * - Android / desktop Chrome: native install via the captured `beforeinstallprompt`.
 * - iOS Safari: manual "Add to Home Screen" instructions (no native event exists).
 */
export function InstallBanner() {
  const standalone = useIsStandalone();
  const iosSafari = useIsIosSafari();
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(readDismissed);

  // Already installed, dismissed, or nothing to offer on this platform.
  if (standalone || dismissed) return null;
  if (!iosSafari && !canInstall) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const handleInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted' || outcome === 'dismissed') setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Install Tradex"
      className="no-print fixed z-[60] left-0 right-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:hidden px-3"
    >
      <div className="rounded-2xl border border-brand-500/30 bg-[rgba(8,14,28,0.96)] backdrop-blur-xl shadow-card p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-brand-500/15 shrink-0">
            {iosSafari ? (
              <Share className="w-5 h-5 text-brand-400" />
            ) : (
              <Download className="w-5 h-5 text-brand-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Install Tradex</p>
            {iosSafari ? (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tap <span className="text-white font-medium">Share</span> in Safari, then{' '}
                <span className="text-white font-medium">Add to Home Screen</span> for full-screen
                Tradex with safe-area layout.
              </p>
            ) : (
              <>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Add Tradex to your home screen for a faster, full-screen, offline-ready app.
                </p>
                <button
                  type="button"
                  onClick={handleInstall}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-400 active:scale-[0.98] min-h-[40px]"
                >
                  <Download className="w-4 h-4" />
                  Install app
                </button>
              </>
            )}
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
