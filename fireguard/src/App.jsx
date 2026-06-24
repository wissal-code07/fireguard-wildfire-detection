import { useState, useEffect } from 'react';
import './index.css';
import ForestBackground from './components/ForestBackground';
import Analyze   from './pages/Analyze';
import History   from './pages/History';
import Dashboard from './pages/Dashboard';
import Health    from './pages/Health';
import { api }   from './services/api';

const PAGES = [
  { id: 'analyze',   label: 'Analyser',    icon: 'ti-flame' },
  { id: 'history',   label: 'Historique',  icon: 'ti-trees' },
  { id: 'dashboard', label: 'Dashboard',   icon: 'ti-chart-histogram' },
  { id: 'health',    label: 'Santé API',   icon: 'ti-shield-check' },
];

export default function App() {
  const [page, setPage]       = useState('analyze');
  const [apiStatus, setStatus] = useState('unknown');

  // Poll health status every 30s
  useEffect(() => {
    const check = async () => {
      try {
        const h = await api.health();
        setStatus(h.status);
      } catch {
        setStatus('degraded');
      }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  const render = () => {
    switch (page) {
      case 'analyze':   return <Analyze />;
      case 'history':   return <History />;
      case 'dashboard': return <Dashboard />;
      case 'health':    return <Health />;
      default:          return <Analyze />;
    }
  };

  const statusLabel = apiStatus === 'ok' ? 'Forêt sous surveillance' : apiStatus === 'degraded' ? 'Vigilance réduite' : 'Connexion en cours';

  return (
    <>
      <ForestBackground />

      <div className="app">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <svg className="flame-mark" viewBox="0 0 36 36" fill="none">
              <path
                d="M18 2C18 2 9 11 9 19.5C9 25.3 12.8 30 18 30C23.2 30 27 25.3 27 19.5C27 16 25.5 13 23.5 10.5C23.5 14 21.5 16 19.5 17C20 13.5 18.5 9.5 15.5 7C16.5 10 16 13 14 15C12.5 16.5 12 18.5 12 20.5C12 24.6 14.7 27 18 27C21.3 27 24 24.6 24 20.5C24 18 22.8 16.5 21.5 15.2"
                fill="#FF6B35" opacity="0.9"
              />
              <path
                d="M18 14C18 14 15 18 15 21.5C15 24 16.5 26 18 26C19.5 26 21 24 21 21.5C21 19.8 20.2 18.5 19.3 17.3C19.3 18.8 18.6 19.6 18 20C18.2 18.5 17.6 16.8 16.5 15.5C17 16.8 16.7 18 15.9 18.8"
                fill="#FFB07C"
              />
            </svg>
            <div>
              <h1>FireGuard</h1>
              <span>Veille forestière</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {PAGES.map((p) => (
              <button
                key={p.id}
                className={`nav-item ${page === p.id ? 'active' : ''}`}
                onClick={() => setPage(p.id)}
              >
                <span className="nav-trunk" aria-hidden="true" />
                <i className={`ti ${p.icon} icon`} aria-hidden="true" />
                <span>{p.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-status">
            <div className="vigil-gauge">
              <div className="vigil-gauge-track">
                <div className={`vigil-gauge-fill ${apiStatus}`} />
              </div>
              <span className={`status-dot ${apiStatus}`} />
            </div>
            <span className="vigil-label">{statusLabel}</span>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <main className="main">
          {render()}
        </main>
      </div>
    </>
  );
}
