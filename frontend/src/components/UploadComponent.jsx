import { useRef, useState } from 'react';
import { FilePlus2, LoaderCircle, Upload } from 'lucide-react';

export default function UploadComponent({ onUpload, isUploading, disabled }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || disabled || isUploading) return;
    setError('');
    setSuccess('');
    try {
      await onUpload(file);
      setSuccess(`Documento enviado: ${file.name}`);
      setFile(null);
      inputRef.current.value = '';
    } catch (uploadError) {
      setError(uploadError.message);
    }
  }

  return (
    <section className="upload-section" aria-labelledby="upload-title">
      <div className="section-heading">
        <h2 id="upload-title">Novo documento</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="upload-controls">
          <label className={`file-picker${disabled || isUploading ? ' is-disabled' : ''}`}>
            <FilePlus2 size={24} aria-hidden="true" />
            <span className="file-selection">
              <span className="file-name">{file ? file.name : 'Selecionar arquivo'}</span>
              <span className="file-detail">{file ? `${file.size.toLocaleString('pt-BR')} bytes` : 'Nenhum arquivo selecionado'}</span>
            </span>
            <input
              ref={inputRef}
              type="file"
              aria-label="Selecionar documento"
              disabled={disabled || isUploading}
              onChange={(event) => {
                setFile(event.target.files[0] || null);
                setError('');
                setSuccess('');
              }}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!file || disabled || isUploading}>
            {isUploading ? <LoaderCircle size={18} className="spin" aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}
            {isUploading ? 'Enviando...' : 'Enviar documento'}
          </button>
        </div>
        {error && <p className="feedback error" role="alert">{error}</p>}
        {success && <p className="feedback success" role="status">{success}</p>}
      </form>
    </section>
  );
}