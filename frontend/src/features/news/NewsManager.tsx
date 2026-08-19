import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowIcon,
  EditIcon,
  NewsIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../../components/Icons';
import { createNews, deleteNews, listNews, updateNews } from '../../services/news-api';
import type { News, NewsInput, NewsPage } from '../../types/news';
import { NewsForm } from './NewsForm';

const PAGE_SIZE = 6;
const emptyPage: NewsPage = {
  data: [],
  meta: { total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 },
};

export function NewsManager() {
  const [pageData, setPageData] = useState<NewsPage>(emptyPage);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [deleting, setDeleting] = useState<News | null>(null);

  useEffect(() => {
    const request = new AbortController();

    async function loadNews() {
      setLoading(true);
      setError('');
      try {
        const result = await listNews(page, PAGE_SIZE, search, request.signal);
        if (!request.signal.aborted) setPageData(result);
      } catch {
        if (!request.signal.aborted) {
          setError('Não foi possível carregar as notícias. Verifique se a API está disponível.');
        }
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    }

    void loadNews();
    return () => request.abort();
  }, [page, refreshVersion, search]);

  function refreshNews() {
    setRefreshVersion((version) => version + 1);
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const nextSearch = searchInput.trim();
    const queryChanged = page !== 1 || search !== nextSearch;
    setPage(1);
    setSearch(nextSearch);
    if (!queryChanged) refreshNews();
  }

  async function handleSave(input: NewsInput) {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateNews(editing.id, input);
        setNotice('Notícia atualizada com sucesso.');
        refreshNews();
      } else {
        await createNews(input);
        setNotice('Notícia publicada com sucesso.');
        const queryChanged = page !== 1 || search !== '';
        setSearchInput('');
        setSearch('');
        setPage(1);
        if (!queryChanged) refreshNews();
      }
      setFormOpen(false);
      setEditing(null);
    } catch {
      setError('Não foi possível salvar a notícia. Revise os campos e tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteNews(deleting.id);
      setDeleting(null);
      setNotice('Notícia excluída com sucesso.');
      if (pageData.data.length === 1 && page > 1) setPage((current) => current - 1);
      else refreshNews();
    } catch {
      setError('Não foi possível excluir a notícia. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="feature-section news-section" aria-labelledby="news-title">
      <div className="section-heading news-heading">
        <div>
          <span className="eyebrow">
            <NewsIcon /> Comunicação institucional
          </span>
          <h2 id="news-title">Gestão de notícias</h2>
          <p>Cadastre, consulte e mantenha as notícias institucionais.</p>
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <PlusIcon /> Nova notícia
        </button>
      </div>

      <form className="news-toolbar" onSubmit={handleSearch}>
        <div className="search-field">
          <SearchIcon />
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Buscar por título ou descrição"
            aria-label="Buscar notícias"
          />
        </div>
        <button className="secondary-button" type="submit">
          Buscar
        </button>
        <span className="result-count">
          {pageData.meta.total} {pageData.meta.total === 1 ? 'notícia' : 'notícias'}
        </span>
      </form>

      {notice && (
        <div className="alert success-alert" role="status">
          {notice}
          <button type="button" onClick={() => setNotice('')} aria-label="Fechar aviso">
            ×
          </button>
        </div>
      )}
      {error && (
        <div className="alert error-alert" role="alert">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Fechar aviso">
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="news-grid" aria-label="Carregando notícias">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="news-card skeleton-card" key={index}>
              <div className="skeleton skeleton-badge" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          ))}
        </div>
      ) : pageData.data.length ? (
        <div className="news-grid">
          {pageData.data.map((item) => (
            <article className="news-card" key={item.id}>
              <div className="card-topline">
                <span>Notícia #{String(item.id).padStart(2, '0')}</span>
                <div className="card-actions">
                  <button
                    className="icon-button"
                    type="button"
                    onClick={() => {
                      setEditing(item);
                      setFormOpen(true);
                    }}
                    aria-label={`Editar ${item.titulo}`}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() => setDeleting(item)}
                    aria-label={`Excluir ${item.titulo}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
              <h3>{item.titulo}</h3>
              <p>{item.descricao}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <NewsIcon />
          <h3>{search ? 'Nenhum resultado encontrado' : 'Nenhuma notícia cadastrada'}</h3>
          <p>
            {search
              ? 'Revise os termos informados e realize uma nova consulta.'
              : 'Cadastre uma notícia para iniciar a publicação de conteúdo.'}
          </p>
          {!search && (
            <button className="secondary-button" type="button" onClick={() => setFormOpen(true)}>
              <PlusIcon /> Criar notícia
            </button>
          )}
        </div>
      )}

      {pageData.meta.totalPages > 1 && (
        <nav className="pagination" aria-label="Paginação de notícias">
          <button
            type="button"
            onClick={() => setPage((value) => value - 1)}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            <ArrowIcon className="arrow-back" />
          </button>
          <span>
            Página <strong>{page}</strong> de <strong>{pageData.meta.totalPages}</strong>
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => value + 1)}
            disabled={page >= pageData.meta.totalPages}
            aria-label="Próxima página"
          >
            <ArrowIcon />
          </button>
        </nav>
      )}

      {formOpen && (
        <NewsForm
          editing={editing}
          loading={saving}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
      {deleting && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="confirm-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <div className="danger-mark">
              <TrashIcon />
            </div>
            <h3 id="delete-title">Excluir esta notícia?</h3>
            <p>“{deleting.titulo}” será removida permanentemente.</p>
            <div className="modal-actions">
              <button className="secondary-button" type="button" onClick={() => setDeleting(null)}>
                Cancelar
              </button>
              <button
                className="danger-button"
                type="button"
                onClick={() => void handleDelete()}
                disabled={saving}
              >
                {saving ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
