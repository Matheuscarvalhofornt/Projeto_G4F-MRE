import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNews, deleteNews, listNews } from '../../services/news-api';
import type { NewsPage } from '../../types/news';
import { NewsManager } from './NewsManager';

vi.mock('../../services/news-api', () => ({
  createNews: vi.fn(),
  deleteNews: vi.fn(),
  listNews: vi.fn(),
  updateNews: vi.fn(),
}));

const listNewsMock = vi.mocked(listNews);
const createNewsMock = vi.mocked(createNews);
const deleteNewsMock = vi.mocked(deleteNews);

const firstPage: NewsPage = {
  data: [{ id: 7, titulo: 'Página um', descricao: 'Notícia disponível na primeira página.' }],
  meta: { total: 7, page: 1, limit: 6, totalPages: 2 },
};
const secondPage: NewsPage = {
  data: [{ id: 1, titulo: 'Página dois', descricao: 'Última notícia disponível na página dois.' }],
  meta: { total: 7, page: 2, limit: 6, totalPages: 2 },
};

describe('Feature: consistência da paginação de notícias', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listNewsMock.mockImplementation(async (page) => (page === 1 ? firstPage : secondPage));
    createNewsMock.mockResolvedValue({
      id: 8,
      titulo: 'Nova notícia',
      descricao: 'Descrição completa da nova notícia publicada.',
    });
    deleteNewsMock.mockResolvedValue();
  });

  it('Dada a segunda página, quando criar uma notícia, então retorna à primeira página', async () => {
    const user = userEvent.setup();
    render(<NewsManager />);

    await screen.findByText('Página um');
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    await screen.findByText('Página dois');
    await user.click(screen.getByRole('button', { name: 'Nova notícia' }));
    await user.type(screen.getByLabelText('Título'), 'Nova notícia');
    await user.type(
      screen.getByLabelText('Descrição'),
      'Descrição completa da nova notícia publicada.',
    );
    await user.click(screen.getByRole('button', { name: 'Cadastrar notícia' }));

    expect(await screen.findByText('Notícia publicada com sucesso.')).toBeInTheDocument();
    await waitFor(() => {
      const lastCall = listNewsMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(1);
      expect(lastCall?.[2]).toBe('');
    });
  });

  it('Dado o último item da segunda página, quando excluir, então retorna à primeira página', async () => {
    const user = userEvent.setup();
    render(<NewsManager />);

    await screen.findByText('Página um');
    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    await screen.findByText('Página dois');
    await user.click(screen.getByRole('button', { name: 'Excluir Página dois' }));
    await user.click(screen.getByRole('button', { name: 'Sim, excluir' }));

    expect(await screen.findByText('Notícia excluída com sucesso.')).toBeInTheDocument();
    await waitFor(() => expect(listNewsMock.mock.calls.at(-1)?.[0]).toBe(1));
  });

  it('Dado um formulário aberto, quando pressionar Escape, então fecha o modal', async () => {
    const user = userEvent.setup();
    render(<NewsManager />);

    await screen.findByText('Página um');
    await user.click(screen.getByRole('button', { name: 'Nova notícia' }));
    expect(screen.getByRole('dialog', { name: 'Cadastrar notícia' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog', { name: 'Cadastrar notícia' })).not.toBeInTheDocument();
  });

  it('Dada uma confirmação de exclusão aberta, quando pressionar Escape, então cancela a ação', async () => {
    const user = userEvent.setup();
    render(<NewsManager />);

    await screen.findByText('Página um');
    await user.click(screen.getByRole('button', { name: 'Excluir Página um' }));
    expect(screen.getByRole('alertdialog', { name: 'Excluir esta notícia?' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(
      screen.queryByRole('alertdialog', { name: 'Excluir esta notícia?' }),
    ).not.toBeInTheDocument();
    expect(deleteNewsMock).not.toHaveBeenCalled();
  });
});
