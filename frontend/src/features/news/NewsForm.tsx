import { useEffect, useState, type FormEvent } from 'react';
import { CloseIcon } from '../../components/Icons';
import { keepFocusInsideDialog } from '../../components/modal-accessibility';
import type { News, NewsInput } from '../../types/news';

interface NewsFormProps {
  editing: News | null;
  loading: boolean;
  onCancel: () => void;
  onSave: (input: NewsInput) => Promise<void>;
}

export function NewsForm({ editing, loading, onCancel, onSave }: NewsFormProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setTitulo(editing?.titulo ?? '');
    setDescricao(editing?.descricao ?? '');
    setErrors({});
  }, [editing]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors: Record<string, string> = {};
    if (titulo.trim().length < 3) validationErrors.titulo = 'Use pelo menos 3 caracteres.';
    if (descricao.trim().length < 10) validationErrors.descricao = 'Use pelo menos 10 caracteres.';
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    await onSave({ titulo: titulo.trim(), descricao: descricao.trim() });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className="news-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="news-form-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
            return;
          }
          keepFocusInsideDialog(event);
        }}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">{editing ? 'Edição de notícia' : 'Cadastro de notícia'}</span>
            <h3 id="news-form-title">{editing ? 'Atualizar notícia' : 'Cadastrar notícia'}</h3>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onCancel}
            aria-label="Fechar formulário"
          >
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              maxLength={160}
              autoFocus
              aria-invalid={Boolean(errors.titulo)}
            />
            <div className="field-meta">
              <span>{errors.titulo}</span>
              <span>{titulo.length}/160</span>
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              maxLength={5000}
              rows={7}
              aria-invalid={Boolean(errors.descricao)}
            />
            <div className="field-meta">
              <span>{errors.descricao}</span>
              <span>{descricao.length}/5000</span>
            </div>
          </div>
          <div className="modal-actions">
            <button className="secondary-button" type="button" onClick={onCancel}>
              Cancelar
            </button>
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Salvando
                </>
              ) : editing ? (
                'Salvar alterações'
              ) : (
                'Cadastrar notícia'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
