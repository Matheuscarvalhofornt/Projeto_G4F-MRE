import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAddressByCep } from '../../services/viacep';
import type { Address } from '../../types/address';
import { CepSearch } from './CepSearch';

vi.mock('../../services/viacep', () => ({ fetchAddressByCep: vi.fn() }));
const fetchAddressMock = vi.mocked(fetchAddressByCep);
const addressFixture: Address = {
  cep: '01001-000',
  logradouro: 'Praça da Sé',
  complemento: 'lado ímpar',
  unidade: '',
  bairro: 'Sé',
  localidade: 'São Paulo',
  uf: 'SP',
  estado: 'São Paulo',
  regiao: 'Sudeste',
  ibge: '3550308',
  gia: '1004',
  ddd: '11',
  siafi: '7107',
};

describe('Feature: busca de endereço por CEP', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Dado um CEP válido, quando buscar, então exibe o endereço encontrado', async () => {
    fetchAddressMock.mockResolvedValue(addressFixture);
    const user = userEvent.setup();
    render(<CepSearch />);

    await user.type(screen.getByLabelText('Informe o CEP'), '01001000');
    await user.click(screen.getByRole('button', { name: 'Buscar endereço' }));

    expect(await screen.findByText('Praça da Sé')).toBeInTheDocument();
    expect(screen.getByText('Sé · São Paulo · SP')).toBeInTheDocument();
    expect(fetchAddressMock).toHaveBeenCalledWith('01001-000', expect.any(AbortSignal));
  });

  it('Dado um CEP inexistente, quando buscar, então apresenta uma mensagem compreensível', async () => {
    fetchAddressMock.mockRejectedValue(new Error('CEP_NOT_FOUND'));
    const user = userEvent.setup();
    render(<CepSearch />);

    await user.type(screen.getByLabelText('Informe o CEP'), '99999999');
    await user.click(screen.getByRole('button', { name: 'Buscar endereço' }));

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('CEP não localizado'));
  });

  it('Dado um CEP incompleto, quando buscar, então valida sem chamar a API', async () => {
    const user = userEvent.setup();
    render(<CepSearch />);

    await user.type(screen.getByLabelText('Informe o CEP'), '01001');
    await user.click(screen.getByRole('button', { name: 'Buscar endereço' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Informe um CEP válido com 8 dígitos.');
    expect(fetchAddressMock).not.toHaveBeenCalled();
  });

  it('Dada uma consulta em andamento, quando alterar o CEP, então ignora a resposta antiga', async () => {
    let resolveRequest: (address: Address) => void = () => undefined;
    fetchAddressMock.mockReturnValue(
      new Promise<Address>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<CepSearch />);

    const input = screen.getByLabelText('Informe o CEP');
    await user.type(input, '01001000');
    await user.click(screen.getByRole('button', { name: 'Buscar endereço' }));
    const requestSignal = fetchAddressMock.mock.calls[0]?.[1];

    await user.clear(input);
    await user.type(input, '20040002');
    resolveRequest(addressFixture);

    await waitFor(() => expect(requestSignal?.aborted).toBe(true));
    expect(screen.queryByText('Praça da Sé')).not.toBeInTheDocument();
    expect(screen.getByText('Resultado da consulta')).toBeInTheDocument();
  });
});
