import axios from 'axios';
import type { Address } from '../types/address';

const viaCepApi = axios.create({
  baseURL: 'https://viacep.com.br/ws',
  timeout: 8000,
});

export async function fetchAddressByCep(cep: string, signal?: AbortSignal): Promise<Address> {
  const normalizedCep = cep.replace(/\D/g, '');
  const { data } = await viaCepApi.get<Address>(`/${normalizedCep}/json/`, { signal });

  if (data.erro) throw new Error('CEP_NOT_FOUND');
  return data;
}
