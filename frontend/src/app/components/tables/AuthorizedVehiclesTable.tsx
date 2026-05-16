import { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuthVehicle {
  id: number;
  matricule: string;
}


const ROWS_PER_PAGE = 5;

const PlateIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ flexShrink: 0 }}>
    <rect x="0.5" y="0.5" width="13" height="9" rx="1.5" stroke="#1E3A6E" strokeWidth="1" />
    <line x1="2" y1="5" x2="3.5" y2="5" stroke="#1E3A6E" strokeWidth="0.8" />
    <line x1="5.5" y1="5" x2="11.5" y2="5" stroke="#1E3A6E" strokeWidth="0.8" />
  </svg>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{
          height: '24px', padding: '0 8px',
          backgroundColor: 'transparent',
          border: '1px solid #1E3A6E',
          borderRadius: '6px',
          color: currentPage === 1 ? '#334155' : '#475569',
          fontSize: '11px',
          cursor: currentPage === 1 ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <ChevronLeft size={12} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={{
            height: '24px', minWidth: '24px', padding: '0 6px',
            backgroundColor: p === currentPage ? '#3B82F6' : 'transparent',
            border: `1px solid ${p === currentPage ? '#3B82F6' : '#1E3A6E'}`,
            borderRadius: '6px',
            color: p === currentPage ? '#fff' : '#475569',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          height: '24px', padding: '0 8px',
          backgroundColor: 'transparent',
          border: '1px solid #1E3A6E',
          borderRadius: '6px',
          color: currentPage === totalPages ? '#334155' : '#475569',
          fontSize: '11px',
          cursor: currentPage === totalPages ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

export function AuthorizedVehiclesTable() {
  const [data, setData] = useState<AuthVehicle[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlate, setNewPlate] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchAuthorized = async () => {
    // console.log("[DEBUG] Frontend: Fetching authorized vehicles...");
    try {
      const response = await fetch('http://localhost:5000/api/authorized');
      const data = await response.json();
      if (Array.isArray(data)) {
        setData(data.map((v: any) => ({ 
          id: v.id, 
          matricule: v.plate_number || 'INCONNU' 
        })));
      }
    } catch (err) {
      console.error('[ERROR] Frontend authorized fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchAuthorized();
  }, []);

  const filtered = data.filter((v) =>
    (v.matricule || '').toLowerCase().includes((search || '').toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageData = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const handleAdd = async () => {
    if (!newPlate.trim()) return;
    try {
      const response = await fetch('http://localhost:5000/api/authorized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate_number: newPlate.trim() }),
      });
      if (response.ok) {
        setNewPlate('');
        setShowAdd(false);
        fetchAuthorized();
      }
    } catch (err) {
      console.error('Error adding vehicle:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/authorized/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchAuthorized();
      }
    } catch (err) {
      console.error('Error deleting vehicle:', err);
    }
  };

  const handleEditSave = () => {
    // Edit not supported in backend yet, just reset
    setEditId(null);
  };

  const th: React.CSSProperties = {
    padding: '0 12px',
    textAlign: 'left',
    fontSize: '11px',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: '#475569',
    fontFamily: 'IBM Plex Sans, sans-serif',
    fontWeight: 400,
  };

  return (
    <div
      className="rounded-2xl section-card"
    >
      {/* Card header */}
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-2">
          <div
            className="rounded-full"
            style={{ width: '8px', height: '8px', backgroundColor: '#10B981', animation: 'pulse-opacity 1.5s ease-in-out infinite' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8F0' }}>
            Véhicules autorisés
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher une plaque..."
            style={{
              width: '200px', height: '32px',
              backgroundColor: '#060D1A',
              border: '1px solid #1E3A6E',
              borderRadius: '9999px',
              padding: '0 15px',
              color: '#E2E8F0',
              fontSize: '12px',
              fontFamily: 'IBM Plex Mono, monospace',
              outline: 'none',
            }}
          />
          <button
            onClick={() => setShowAdd(!showAdd)}
            style={{
              height: '32px', padding: '0 18px',
              backgroundColor: '#1D4ED8',
              color: '#E0F2FE',
              fontSize: '12px', fontWeight: 600,
              border: 'none', borderRadius: '9999px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              boxShadow: '0 4px 10px rgba(29,78,216,0.3)'
            }}
          >
            <Plus size={12} />
            Ajouter
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <div
          className="flex items-center gap-2 mx-5 mb-4 p-3 rounded-lg"
          style={{ backgroundColor: '#060D1A', border: '1px solid #1E3A6E' }}
        >
          <input
            type="text"
            value={newPlate}
            onChange={(e) => setNewPlate(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setShowAdd(false); setNewPlate(''); } }}
            placeholder="EX: 9534 ي 38"
            autoFocus
            style={{
              flex: 1, height: '30px',
              backgroundColor: '#0F2044',
              border: '1px solid #1E3A6E',
              borderRadius: '6px',
              padding: '0 10px',
              color: '#7DD3FC',
              fontSize: '12px',
              fontFamily: 'IBM Plex Mono, monospace',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAdd}
            style={{ height: '30px', padding: '0 12px', backgroundColor: '#065F46', color: '#6EE7B7', fontSize: '11px', border: '1px solid #10B981', borderRadius: '6px', cursor: 'pointer' }}
          >
            Confirmer
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewPlate(''); }}
            style={{ height: '30px', padding: '0 12px', backgroundColor: 'transparent', color: '#475569', fontSize: '11px', border: '1px solid #1E3A6E', borderRadius: '6px', cursor: 'pointer' }}
          >
            Annuler
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#060D1A', height: '36px' }}>
              <th style={{ ...th, width: '60px' }}>ID</th>
              <th style={{ ...th }}>Matricule</th>
              <th style={{ ...th, width: '120px' }}>Statut</th>
              <th style={{ ...th, width: '100px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div
                    style={{ height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <svg width="24" height="18" viewBox="0 0 24 18" fill="none" stroke="#1E3A6E" strokeWidth="1.5" strokeLinecap="round">
                      <rect x="1" y="6" width="22" height="11" rx="2" />
                      <path d="M5 6L7.5 1H16.5L19 6" />
                      <circle cx="6.5" cy="15" r="1.5" />
                      <circle cx="17.5" cy="15" r="1.5" />
                    </svg>
                    <span style={{ fontSize: '13px', color: '#334155' }}>Aucun véhicule autorisé</span>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((vehicle, idx) => {
                const isHovered = hoveredRow === vehicle.id;
                const isEditing = editId === vehicle.id;
                return (
                  <tr
                    key={vehicle.id}
                    onMouseEnter={() => setHoveredRow(vehicle.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      height: '44px',
                      borderBottom: '1px solid #1E3A6E',
                      backgroundColor: isHovered
                        ? 'rgba(59,130,246,0.06)'
                        : idx % 2 === 1
                        ? 'rgba(255,255,255,0.02)'
                        : 'transparent',
                      boxShadow: isHovered ? 'inset 2px 0 0 #3B82F6' : 'none',
                      transition: 'background-color 0.12s ease, box-shadow 0.12s ease',
                    }}
                  >
                    {/* ID */}
                    <td style={{ width: '60px', padding: '0 12px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#334155' }}>
                      {vehicle.id}
                    </td>

                    {/* Matricule */}
                    <td style={{ padding: '0 12px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') setEditId(null); }}
                            autoFocus
                            style={{ width: '150px', height: '28px', backgroundColor: '#0A1628', border: '1px solid #3B82F6', borderRadius: '4px', padding: '0 8px', color: '#7DD3FC', fontSize: '12px', fontFamily: 'IBM Plex Mono, monospace', outline: 'none' }}
                          />
                          <button onClick={handleEditSave} style={{ height: '26px', padding: '0 8px', backgroundColor: '#065F46', color: '#6EE7B7', fontSize: '11px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓</button>
                          <button onClick={() => setEditId(null)} style={{ height: '26px', padding: '0 8px', backgroundColor: 'transparent', color: '#475569', fontSize: '11px', border: '1px solid #1E3A6E', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <PlateIcon />
                          <span dir="ltr" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', color: '#7DD3FC', display: 'inline-block' }}>
                            {vehicle.matricule}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Statut */}
                    <td style={{ width: '120px', padding: '0 12px' }}>
                      <div
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          backgroundColor: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.25)',
                          borderRadius: '20px', padding: '3px 10px',
                        }}
                      >
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34D399', flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', fontWeight: 500, color: '#34D399' }}>Autorisé</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ width: '100px', padding: '0 12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => { setEditId(vehicle.id); setEditValue(vehicle.matricule); }}
                          onMouseEnter={() => setHoveredAction(`edit-${vehicle.id}`)}
                          onMouseLeave={() => setHoveredAction(null)}
                          style={{
                            width: '28px', height: '28px',
                            backgroundColor: 'rgba(59,130,246,0.1)',
                            border: `1px solid ${hoveredAction === `edit-${vehicle.id}` ? '#60A5FA' : 'transparent'}`,
                            borderRadius: '6px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'border-color 0.12s',
                          }}
                        >
                          <Edit2 size={12} color="#60A5FA" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          onMouseEnter={() => setHoveredAction(`del-${vehicle.id}`)}
                          onMouseLeave={() => setHoveredAction(null)}
                          style={{
                            width: '28px', height: '28px',
                            backgroundColor: 'rgba(239,68,68,0.1)',
                            border: `1px solid ${hoveredAction === `del-${vehicle.id}` ? '#F87171' : 'transparent'}`,
                            borderRadius: '6px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'border-color 0.12s',
                          }}
                        >
                          <Trash2 size={12} color="#F87171" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: '1px solid #1E3A6E' }}
      >
        <span style={{ fontSize: '11px', color: '#475569' }}>
          {filtered.length} véhicule{filtered.length !== 1 ? 's' : ''} enregistré{filtered.length !== 1 ? 's' : ''}
        </span>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
