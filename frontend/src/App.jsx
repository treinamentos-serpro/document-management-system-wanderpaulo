import { useEffect, useState } from 'react';
import { Files } from 'lucide-react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { listDocuments, uploadDocument } from './services/documentApi.js';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [listError, setListError] = useState('');

  async function loadDocuments(signal) {
    setIsLoading(true);
    setListError('');
    try {
      const result = await listDocuments(signal);
      if (!signal?.aborted) setDocuments(result);
    } catch (error) {
      if (!signal?.aborted) setListError(error.message);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    loadDocuments(controller.signal);
    return () => controller.abort();
  }, []);

  async function handleUpload(file) {
    setIsUploading(true);
    try {
      const document = await uploadDocument(file);
      setDocuments((current) => [document, ...current]);
      return document;
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="header-content">
          <span className="brand-icon"><Files size={25} aria-hidden="true" /></span>
          <h1>Document Management System</h1>
        </div>
      </header>
      <main className="workspace">
        <UploadComponent onUpload={handleUpload} isUploading={isUploading} disabled={isLoading} />
        <DocumentList
          documents={documents}
          isLoading={isLoading}
          error={listError}
          onRefresh={() => loadDocuments()}
          refreshDisabled={isLoading || isUploading}
        />
      </main>
    </>
  );
}
