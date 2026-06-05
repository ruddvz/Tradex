/** Spacer for fixed chrome safe areas. */
export function SafeAreaSpacer({ edge = 'bottom' }: { edge?: 'top' | 'bottom' }) {
  if (edge === 'top') {
    return <div aria-hidden className="h-[env(safe-area-inset-top)]" />;
  }
  return <div aria-hidden className="h-[env(safe-area-inset-bottom)]" />;
}
