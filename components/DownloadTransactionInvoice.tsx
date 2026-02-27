import { useState } from 'react';

export default function DownloadTransactionInvoice({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/${transactionId}/invoice/pdf`);
      if (!res.ok) throw new Error('Gagal mengambil invoice PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal download invoice PDF');
    }
    setLoading(false);
  };

  return (
    <button onClick={handleDownload} disabled={loading} className="btn btn-primary">
      {loading ? 'Downloading...' : 'Download Invoice PDF'}
    </button>
  );
}
