import { useRef, useState } from 'react';
import { uploadDocument } from '../services/api.js';

export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || isUploading) return;

    setError('');
    setSuccess('');
    setIsUploading(true);
    try {
      await uploadDocument(file);
      setSuccess(`${file.name} foi enviado.`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      await onUploaded();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(event) {
    setFile(event.target.files?.[0] || null);
    setError('');
    setSuccess('');
  }

  function handleDrop(event) {
    event.preventDefault();
    setFile(event.dataTransfer.files?.[0] || null);
    setError('');
    setSuccess('');
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label
        className={`file-picker${file ? ' has-file' : ''}`}
        htmlFor="document-file"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <span className="upload-symbol" aria-hidden="true">+</span>
        <span className="picker-title">{file ? 'Arquivo selecionado' : 'Escolha um arquivo'}</span>
        <span className="picker-detail">{file ? file.name : 'ou arraste até aqui'}</span>
        <input
          ref={inputRef}
          id="document-file"
          name="file"
          type="file"
          onChange={handleFileChange}
        />
      </label>

      <button className="primary-button" type="submit" disabled={!file || isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
      </button>
      {error && <p className="form-message error-message" role="alert">{error}</p>}
      {success && <p className="form-message success-message" role="status">{success}</p>}
    </form>
  );
}