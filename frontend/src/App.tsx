import { useState } from 'react';
import { GlobeIcon, NewsIcon, PinIcon } from './components/Icons';
import { CepSearch } from './features/address/CepSearch';
import { NewsManager } from './features/news/NewsManager';

type Section = 'cep' | 'noticias';

export default function App() {
  const [section, setSection] = useState<Section>('cep');

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Projeto G4F - MRE, início">
          <span className="brand-mark">
            <GlobeIcon />
          </span>
          <span>
            <strong>PROJETO G4F</strong>
            <small>MRE</small>
          </span>
        </a>
        <nav aria-label="Navegação principal">
          <button
            className={section === 'cep' ? 'active' : ''}
            onClick={() => setSection('cep')}
            type="button"
          >
            <PinIcon /> Buscar CEP
          </button>
          <button
            className={section === 'noticias' ? 'active' : ''}
            onClick={() => setSection('noticias')}
            type="button"
          >
            <NewsIcon /> Notícias
          </button>
        </nav>
        <span className="environment">
          <i /> Sistema operacional
        </span>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">Informação que aproxima</span>
            <h1>
              Conexões mais simples.
              <br />
              <em>Decisões mais rápidas.</em>
            </h1>
            <p>
              Uma experiência digital segura para consultar endereços e administrar informações.
            </p>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <span className="orb orb-one" />
            <span className="orb orb-two" />
            <div className="globe-grid">
              <GlobeIcon />
            </div>
            <div className="floating-tag tag-one">
              <i /> API conectada
            </div>
            <div className="floating-tag tag-two">Dados em tempo real</div>
          </div>
        </section>

        <div className="mobile-tabs" role="tablist" aria-label="Selecionar ferramenta">
          <button
            role="tab"
            aria-selected={section === 'cep'}
            className={section === 'cep' ? 'active' : ''}
            onClick={() => setSection('cep')}
          >
            <PinIcon /> CEP
          </button>
          <button
            role="tab"
            aria-selected={section === 'noticias'}
            className={section === 'noticias' ? 'active' : ''}
            onClick={() => setSection('noticias')}
          >
            <NewsIcon /> Notícias
          </button>
        </div>

        {section === 'cep' ? <CepSearch /> : <NewsManager />}
      </main>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark">
            <GlobeIcon />
          </span>
          <span>
            <strong>PROJETO G4F</strong>
            <small>MRE</small>
          </span>
        </div>
        <p>Construído com tecnologia, clareza e propósito.</p>
        <span>© 2026 · Projeto G4F - MRE</span>
      </footer>
    </div>
  );
}
