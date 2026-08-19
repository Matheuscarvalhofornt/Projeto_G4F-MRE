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
    return 'Não encontramos esse CEP. Confira os números e tente novamente.';
  }
  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return 'A consulta demorou mais que o esperado. Tente novamente.';
  }
  return 'Não foi possível consultar o CEP agora. Verifique sua conexão.';
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
      setError('Digite um CEP com 8 números.');
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
            <PinIcon /> Localização inteligente
          </span>
          <h2 id="cep-title">Encontre qualquer endereço</h2>
          <p>Consulte dados oficiais de CEP em poucos segundos.</p>
        </div>
        <span className="service-status">
          <i /> ViaCEP online
        </span>
      </div>

      <div className="cep-layout">
        <form className="cep-form glass-card" onSubmit={handleSubmit} noValidate>
          <label htmlFor="cep">Qual CEP você procura?</label>
          <p className="field-hint" id="cep-hint">
            Digite somente os 8 números ou use o formato 00000-000.
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
              <strong>Seu resultado aparece aqui</strong>
              <span>Faça uma busca para ver rua, bairro, cidade e outros detalhes.</span>
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
