import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { WILAYAS } from '../services/wilayas';

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('fr-DZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function wilayaName(code) {
  if (!code) return '—';
  const w = WILAYAS.find((x) => x.code === code);
  return w ? `${w.code} — ${w.name}` : code;
}

export default function History() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [page, setPage]     = useState(1);
  const [filters, setFilters] = useState({ label: '', wilaya: '', alert: '' });
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page, limit: 10 };
      if (filters.label)  params.label  = filters.label;
      if (filters.wilaya) params.wilaya = filters.wilaya;
      if (filters.alert !== '') params.alert = filters.alert;
      const res = await api.history(params);
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Supprimer l'analyse #${id} ?`)) return;
    try {
      await api.deletePrediction(id);
      setDetail(null);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const applyFilter = (key, val) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: val }));
  };

  return (
    <div>
      <div className="page-header">
        <h2>Historique des analyses</h2>
        <p>{data ? `${data.count} analyse${data.count !== 1 ? 's' : ''} au total` : ''}</p>
      </div>

      {error && <div className="error-box">⚠ {error}</div>}

      {/* Filters */}
      <div className="filter-bar">
        <select value={filters.label} onChange={(e) => applyFilter('label', e.target.value)}>
          <option value="">Toutes les classes</option>
          <option value="fire">🔥 Feu</option>
          <option value="nofire">✅ Aucun feu</option>
        </select>

        <select value={filters.alert} onChange={(e) => applyFilter('alert', e.target.value)}>
          <option value="">Toutes alertes</option>
          <option value="true">Alertes uniquement</option>
          <option value="false">Sans alerte</option>
        </select>

        <select value={filters.wilaya} onChange={(e) => applyFilter('wilaya', e.target.value)}>
          <option value="">Toutes les wilayas</option>
          {WILAYAS.map((w) => (
            <option key={w.code} value={w.code}>{w.code} — {w.name}</option>
          ))}
        </select>

        <button className="btn btn-ghost" onClick={() => { setFilters({ label: '', wilaya: '', alert: '' }); setPage(1); }}>
          Réinitialiser
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading && <div className="spinner" />}

        {!loading && data?.results?.length === 0 && (
          <div className="empty">
            <div className="icon">🔍</div>
            <p>Aucune analyse trouvée</p>
          </div>
        )}

        {!loading && data?.results?.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Résultat</th>
                  <th>Confiance</th>
                  <th>Wilaya</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>#{item.id}</td>
                    <td>
                      {item.image_url
                        ? <img className="thumb" src={item.image_url} alt="" />
                        : <div className="thumb" style={{ background: 'var(--bg3)', display:'flex',alignItems:'center',justifyContent:'center', fontSize:18 }}>🖼️</div>
                      }
                    </td>
                    <td>
                      <span className={`badge ${item.alert ? 'fire' : 'safe'}`}>
                        {item.alert ? '🔥 Incendie' : '✅ Calme'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{(item.confidence * 100).toFixed(1)}%</td>
                    <td className="text-muted" style={{ fontSize: 13 }}>
                      {wilayaName(item.wilaya)}
                    </td>
                    <td className="text-muted" style={{ fontSize: 13 }}>
                      {formatDate(item.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => setDetail(item)}>
                          Détail
                        </button>
                        <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => handleDelete(item.id)}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
          {Array.from({ length: data.pages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === data.pages || Math.abs(p - page) <= 1)
            .reduce((acc, p, i, arr) => {
              if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === '...'
                ? <span key={`e${i}`} style={{ padding: '6px 4px', color: 'var(--text2)' }}>…</span>
                : <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
            )}
          <button className="page-btn" disabled={page === data.pages} onClick={() => setPage(p => p + 1)}>›</button>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <DetailModal item={detail} onClose={() => setDetail(null)} onDelete={handleDelete} />
      )}
    </div>
  );
}

function DetailModal({ item, onClose, onDelete }) {
  const isFire = item.alert;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="drawer-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside className="drawer-panel">
        <div className="drawer-header">
          <div>
            <span className="text-muted" style={{ fontSize: 12 }}>Analyse</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600 }}>#{item.id}</h3>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Fermer">
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="drawer-body">
          {item.image_url && (
            <img src={item.image_url} alt="" className="drawer-image" />
          )}

          <div className={`result-card ${isFire ? 'fire' : 'safe'}`} style={{ marginBottom: 16 }}>
            {isFire && (
              <div className="alert-pulse mb-16">
                <span className="dot" />
                ALERTE INCENDIE
              </div>
            )}
            <div className="result-title">{isFire ? 'Incendie détecté' : 'Aucun incendie'}</div>
            <div className="confidence-bar-wrap" style={{ marginTop: 10 }}>
              <div className="confidence-bar-label">
                <span>Confiance</span>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{(item.confidence * 100).toFixed(1)}%</span>
              </div>
              <div className="confidence-bar">
                <div className="confidence-bar-fill" style={{ width: `${(item.confidence * 100).toFixed(1)}%` }} />
              </div>
            </div>
            <div className="prob-grid">
              <div className="prob-box fire">
                <div className="plabel">Prob. feu</div>
                <div className="pval">{(item.prob_fire * 100).toFixed(1)}%</div>
              </div>
              <div className="prob-box safe">
                <div className="plabel">Prob. calme</div>
                <div className="pval">{(item.prob_nofire * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="drawer-meta">
            {item.wilaya_name && (
              <div className="drawer-meta-row">
                <i className="ti ti-map-pin" aria-hidden="true" />
                <span><strong style={{ color: 'var(--text)' }}>{item.wilaya_name}</strong></span>
              </div>
            )}
            {item.location_note && (
              <div className="drawer-meta-row">
                <i className="ti ti-map-2" aria-hidden="true" />
                <span>{item.location_note}</span>
              </div>
            )}
            {item.notes && (
              <div className="drawer-meta-row">
                <i className="ti ti-note" aria-hidden="true" />
                <span>{item.notes}</span>
              </div>
            )}
            <div className="drawer-meta-row">
              <i className="ti ti-clock" aria-hidden="true" />
              <span>{new Date(item.created_at).toLocaleString('fr-DZ')}</span>
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={onClose}>Fermer</button>
          <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onDelete(item.id)}>Supprimer</button>
        </div>
      </aside>
    </div>
  );
}
