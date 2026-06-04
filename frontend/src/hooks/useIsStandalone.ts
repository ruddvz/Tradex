import { useEffect, useState } from 'react';

/** True when running as installed PWA (iOS Add to Home Screen or Android install). */
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  });

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => {
      setStandalone(
        mq.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
      );
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return standalone;
}

function detectIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari && !(navigator as Navigator & { standalone?: boolean }).standalone;
}

/** Safari on iOS (not standalone). */
export function useIsIosSafari(): boolean {
  return useState(detectIosSafari)[0];
}
