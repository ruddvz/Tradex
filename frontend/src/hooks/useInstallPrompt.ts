import { useCallback, useEffect, useState } from 'react';

/**
 * The `beforeinstallprompt` event is not yet in the TS DOM lib.
 * https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

/**
 * Captures the Chromium `beforeinstallprompt` event so we can surface a native
 * "Install app" affordance on Android / desktop Chrome. iOS Safari never fires
 * this event — that flow is handled separately with manual instructions.
 */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      // Prevent the mini-infobar so we can present our own CTA on our terms.
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | null> => {
    if (!promptEvent) return null;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // A prompt can only be used once; drop it regardless of the choice.
    setPromptEvent(null);
    return outcome;
  }, [promptEvent]);

  return { canInstall: promptEvent !== null, promptInstall, installed };
}
