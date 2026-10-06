import { FileText, Files, LoaderCircle, RefreshCw } from 'lucide-react';
import DownloadButton from './DownloadButton.jsx';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} KB`;
  return `${(size / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}

export default function DocumentList({ documents, isLoading, error, onRefresh, refreshDisabled }) {
  return (
    <section className="documents-section" aria-labelledby="documents-title" aria-busy={isLoading}>
      <div className="section-heading">
        <div className="heading-with-count">
          <h2 id="documents-title">Meus documentos</h2>
          <span className="document-count">{documents.length}</span>
        </div>
        <button type="button" className="icon-button" onClick={onRefresh} disabled={refreshDisabled} title="Atualizar documentos" aria-label="Atualizar documentos">
          <RefreshCw size={18} className={isLoading ? 'spin' : ''} aria-hidden="true" />
        </button>
      </div>
      {error && <p className="feedback error" role="alert">{error}</p>}
      {isLoading && <p className="loading-state" role="status"><LoaderCircle size={18} className="spin" aria-hidden="true" /> Carregando documentos...</p>}
      {documents.length === 0 && !isLoading && !error && (
        <div className="empty-state"><Files size={36} aria-hidden="true" /><p>Nenhum documento enviado.</p></div>
      )}
      {documents.length > 0 && (
        <ul className="document-list">
          {documents.map((document) => (
            <li className="document-row" key={document.id}>
              <span className="document-symbol"><FileText size={22} aria-hidden="true" /></span>
              <div className="document-info">
                <h3>{document.originalName}</h3>
                <div className="document-meta">
                  <span>{formatSize(document.size)}</span>
                  <time dateTime={document.uploadedAt}>{dateFormatter.format(new Date(document.uploadedAt))}</time>
                  <span>{document.owner}</span>
                </div>
              </div>
              <DownloadButton document={document} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}