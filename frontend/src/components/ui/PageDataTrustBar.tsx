import { ModeHeaderStrip } from '../layout/ModeHeaderStrip';

/** @deprecated Use ModeHeaderStrip — kept for gradual migration */
export function PageDataTrustBar(props: { className?: string }) {
  return <ModeHeaderStrip {...props} />;
}
