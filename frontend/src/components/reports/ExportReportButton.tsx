import { Download } from 'lucide-react';
import { TxButton } from '../ui/TxButton';

export function ExportReportButton() {
  return (
    <TxButton variant="secondary" size="md" onClick={() => window.print()} className="no-print">
      <Download className="h-4 w-4" />
      Export PDF
    </TxButton>
  );
}
