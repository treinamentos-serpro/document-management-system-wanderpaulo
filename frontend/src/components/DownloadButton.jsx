import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { downloadDocument } from '../services/documentApi.js';

export default function DownloadButton({ document }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    if (isDownloading) return;
    setIsDownloading(true);
    setError('');
    try {
      await downloadDocument(document);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="download-action">
      <button
        type="button"
        className="icon-button"
        title={isDownloading ? 'Baixando documento' : `Baixar ${document.originalName}`}
        aria-label={isDownloading ? `Baixando ${document.originalName}` : `Baixar ${document.originalName}`}
        disabled={isDownloading}
        onClick={handleDownload}
      >
        {isDownloading ? <LoaderCircle size={20} className="spin" aria-hidden="true" /> : <Download size={20} aria-hidden="true" />}
      </button>
      {error && <span className="download-error" role="alert">{error}</span>}
    </div>
  );
}