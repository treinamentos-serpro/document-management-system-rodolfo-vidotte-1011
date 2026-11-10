import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/api.js';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  async function refreshDocuments() {
    setLoadError('');
    try {
      setDocuments(await listDocuments());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isCurrent = true;

    listDocuments()
      .then((result) => {
        if (isCurrent) {
          setDocuments(result);
          setLoadError('');
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Arquivo, início">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>arquivo<span className="brand-period">.</span></span>
        </a>
        <span className="topbar-label">ESPAÇO DE DOCUMENTOS</span>
        <span className="user-mark" aria-label="Usuário atual">U</span>
      </header>

      <main className="workspace">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">BIBLIOTECA PESSOAL</p>
            <h1 id="page-title">Seus documentos</h1>
            <p className="page-description">Envie, organize e acesse seus arquivos em um só lugar.</p>
          </div>
          <div className="document-total" aria-live="polite">
            <span className="total-number">{documents.length.toString().padStart(2, '0')}</span>
            <span className="total-label">ARQUIVOS</span>
          </div>
        </section>

        <div className="workspace-grid">
          <aside className="upload-panel" aria-labelledby="upload-title">
            <div className="panel-heading">
              <span className="section-index">01</span>
              <h2 id="upload-title">Adicionar arquivo</h2>
            </div>
            <UploadComponent onUploaded={refreshDocuments} />
          </aside>

          <section className="documents-panel" aria-labelledby="documents-title">
            <div className="panel-heading list-heading">
              <div className="heading-title">
                <span className="section-index">02</span>
                <h2 id="documents-title">Todos os arquivos</h2>
              </div>
              <button className="refresh-button" type="button" onClick={refreshDocuments} disabled={isLoading}>
                Atualizar
              </button>
            </div>
            <DocumentList documents={documents} isLoading={isLoading} error={loadError} />
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <span>ARQUIVO <span className="brand-period">.</span></span>
        <span>SEUS ARQUIVOS, NO SEU ESPAÇO</span>
      </footer>
    </div>
  );
}
