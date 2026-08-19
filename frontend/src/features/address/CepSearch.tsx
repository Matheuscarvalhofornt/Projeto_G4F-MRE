import axios from 'axios';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { CheckIcon, PinIcon, SearchIcon } from '../../components/Icons';
import { fetchAddressByCep } from '../../services/viacep';
import type { Address } from '../../types/address';

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function friendlyError(error: unknown) {
  if (error instanceof Error && error.message === 'CEP_NOT_FOUND') {
    return 'CEP não localizado. Verifique os dados informados e tente novamente.';
  }
  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return 'O tempo limite da consulta foi excedido. Tente novamente.';
  }
  return 'Não foi possível realizar a consulta. Verifique sua conexão e tente novamente.';
}

export function CepSearch() {
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState<Address | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      activeRequest.current?.abort();
    },
    [],
  );

  function handleCepChange(event: ChangeEvent<HTMLInputElement>) {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setLoading(false);
    setCep(formatCep(event.target.value));
    setAddress(null);
    setError('');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (cep.replace(/\D/g, '').length !== 8) {
      setError('Informe um CEP válido com 8 dígitos.');
      setAddress(null);
      return;
    }

    activeRequest.current?.abort();
    const request = new AbortController();
    activeRequest.current = request;
    setLoading(true);
    setError('');
    setAddress(null);
    try {
      const result = await fetchAddressByCep(cep, request.signal);
      if (!request.signal.aborted) setAddress(result);
    } catch (requestError) {
      if (!request.signal.aborted && !axios.isCancel(requestError)) {
        setError(friendlyError(requestError));
      }
    } finally {
      if (activeRequest.current === request) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <section className="feature-section cep-section" aria-labelledby="cep-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            <PinIcon /> Serviço de localização
          </span>
          <h2 id="cep-title">Consulta de endereços</h2>
          <p>Consulte informações de endereço a partir de um CEP válido.</p>
        </div>
        <span className="service-status">
          <i /> ViaCEP online
        </span>
      </div>

      <div className="cep-layout">
        <form className="cep-form glass-card" onSubmit={handleSubmit} noValidate>
          <label htmlFor="cep">Informe o CEP</label>
          <p className="field-hint" id="cep-hint">
            Utilize 8 dígitos, com ou sem hífen.
          </p>
          <div className="input-action">
            <SearchIcon />
            <input
              id="cep"
              name="cep"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="01001-000"
              value={cep}
              onChange={handleCepChange}
              aria-describedby="cep-hint"
              aria-invalid={Boolean(error)}
            />
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" /> Buscando
                </>
              ) : (
                'Buscar endereço'
              )}
            </button>
          </div>
          {error && (
            <div className="alert error-alert" role="alert">
              {error}
            </div>
          )}
        </form>

        <div className="result-panel" aria-live="polite" aria-busy={loading}>
          {loading && (
            <div className="address-card loading-card">
              <div className="skeleton skeleton-badge" />
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          )}
          {!loading && !address && (
            <div className="address-placeholder">
              <div className="map-orbit">
                <PinIcon />
              </div>
              <strong>Resultado da consulta</strong>
              <span>Informe um CEP para visualizar logradouro, bairro, município e UF.</span>
            </div>
          )}
          {!loading && address && (
            <article className="address-card">
              <span className="success-label">
                <CheckIcon /> Endereço encontrado
              </span>
              <h3>{address.logradouro || 'Logradouro não informado'}</h3>
              <p>{[address.bairro, address.localidade, address.uf].filter(Boolean).join(' · ')}</p>
              <dl className="address-details">
                <div>
                  <dt>CEP</dt>
                  <dd>{address.cep}</dd>
                </div>
                <div>
                  <dt>DDD</dt>
                  <dd>{address.ddd || '—'}</dd>
                </div>
                <div>
                  <dt>IBGE</dt>
                  <dd>{address.ibge || '—'}</dd>
                </div>
                <div>
                  <dt>Região</dt>
                  <dd>{address.regiao || '—'}</dd>
                </div>
              </dl>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
