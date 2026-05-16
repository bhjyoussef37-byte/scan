import { useState, useMemo, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

type Status = 'authorized' | 'denied';

interface HistoryRecord {
  id: number;
  timestamp: string;
  matricule: string;
  numbers: string;
  letters: string;
  status: Status;
  confidence: number;
}


const ROWS_PER_PAGE = 10;

const getConfidenceColor = (v: number) =>
  v >= 85 ? '#10B981' : v >= 60 ? '#F59E0B' : '#EF4444';

function ConfidenceBar({ value }: { value: number }) {
  const color = getConfidenceColor(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
      <div style={{ width: '60px', height: '5px', borderRadius: '3px', backgroundColor: '#1E3A6E', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${value}%`, height: '100%', backgroundColor: color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: 500, color, fontFamily: 'IBM Plex Sans, sans-serif' }}>
        {value}%
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const isAuth = status === 'authorized';
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        backgroundColor: isAuth ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
        border: `1px solid ${isAuth ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
        borderRadius: '20px', padding: '3px 10px',
      }}
    >
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isAuth ? '#34D399' : '#F87171', flexShrink: 0 }} />
      <span style={{ fontSize: '10px', fontWeight: 500, color: isAuth ? '#34D399' : '#F87171' }}>
        {isAuth ? 'Autorisé' : 'Refusé'}
      </span>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const maxVisible = 5;
  let pages: (number | '...')[] = [];

  if (totalPages <= maxVisible + 2) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{ height: '24px', padding: '0 8px', backgroundColor: 'transparent', border: '1px solid #1E3A6E', borderRadius: '6px', color: currentPage === 1 ? '#334155' : '#475569', fontSize: '11px', cursor: currentPage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <ChevronLeft size={12} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ fontSize: '11px', color: '#475569', padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            style={{ height: '24px', minWidth: '24px', padding: '0 6px', backgroundColor: p === currentPage ? '#3B82F6' : 'transparent', border: `1px solid ${p === currentPage ? '#3B82F6' : '#1E3A6E'}`, borderRadius: '6px', color: p === currentPage ? '#fff' : '#475569', fontSize: '11px', cursor: 'pointer' }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{ height: '24px', padding: '0 8px', backgroundColor: 'transparent', border: '1px solid #1E3A6E', borderRadius: '6px', color: currentPage === totalPages ? '#334155' : '#475569', fontSize: '11px', cursor: currentPage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}
      >
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

export function DetectionHistoryTable() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const fetchHistory = async () => {
    // console.log("[DEBUG] Frontend: Fetching detection history...");
    try {
      const response = await fetch('http://localhost:5000/api/history');
      const data = await response.json();
      if (Array.isArray(data)) {
        // Map backend fields to frontend format
        const formattedData = data.map((item: any) => ({
          id: item.id,
          timestamp: item.timestamp,
          matricule: item.plate_number,
          status: item.status || 'authorized', 
          confidence: Math.round((item.confidence || 0) * 100),
        }));
        setHistoryData(formattedData);
      }
    } catch (err) {
      console.error('[ERROR] Frontend history fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    return historyData.filter((r) => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchDate = !dateFilter || r.timestamp.startsWith(dateFilter);
      return matchStatus && matchDate;
    });
  }, [historyData, statusFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageData = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const startRow = filtered.length === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1;
  const endRow = Math.min(page * ROWS_PER_PAGE, filtered.length);

  const exportCSV = () => {
    const headers = ['ID', 'Horodatage', 'Matricule', 'Numéros', 'Lettres', 'Statut', 'Confiance'];
    const rows = filtered.map((r) => [
      r.id, r.timestamp, r.matricule, r.numbers, r.letters,
      r.status === 'authorized' ? 'Autorisé' : 'Refusé',
      `${r.confidence}%`,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historique_detections.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle: React.CSSProperties = {
    height: '32px',
    backgroundColor: '#060D1A',
    border: '1px solid #1E3A6E',
    borderRadius: '9999px',
    padding: '0 15px',
    color: '#E2E8F0',
    fontSize: '12px',
    fontFamily: 'IBM Plex Mono, monospace',
    outline: 'none',
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
    whiteSpace: 'nowrap',
  };

  return (
    <div
      className="rounded-2xl section-card"
    >
      {/* Card header */}
      <div className="flex items-center justify-between p-5 pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full" style={{ width: '8px', height: '8px', backgroundColor: '#3B82F6' }} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: '#E2E8F0' }}>
            Historique des détections
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as 'all' | Status); setPage(1); }}
              style={{ ...inputStyle, width: '155px', paddingRight: '28px', appearance: 'none', cursor: 'pointer' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="authorized">Autorisé</option>
              <option value="denied">Refusé</option>
            </select>
            <ChevronDown size={12} color="#475569" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            placeholder="Date..."
            style={{ ...inputStyle, width: '155px', colorScheme: 'dark' }}
          />

          {/* Export button */}
          <button
            onClick={exportCSV}
            style={{
              height: '32px', padding: '0 18px',
              backgroundColor: 'rgba(16,185,129,0.1)',
              color: '#34D399',
              fontSize: '12px',
              fontWeight: 600,
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '9999px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 10px rgba(16,185,129,0.1)'
            }}
          >
            ↓ Exporter CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#060D1A', height: '36px' }}>
              <th style={{ ...th, width: '55px' }}>ID</th>
              <th style={{ ...th, width: '165px' }}>Horodatage</th>
              <th style={{ ...th }}>Matricule</th>
              <th style={{ ...th, width: '90px' }}>Numéros</th>
              <th style={{ ...th, width: '80px' }}>Lettres</th>
              <th style={{ ...th, width: '120px' }}>Statut</th>
              <th style={{ ...th, width: '115px' }}>Confiance</th>
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div style={{ height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Clock size={24} color="#1E3A6E" />
                    <span style={{ fontSize: '13px', color: '#334155' }}>Aucune détection enregistrée</span>
                  </div>
                </td>
              </tr>
            ) : (
              pageData.map((record, idx) => {
                const isHovered = hoveredRow === record.id;
                return (
                  <tr
                    key={record.id}
                    onMouseEnter={() => setHoveredRow(record.id)}
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
                    <td style={{ width: '55px', padding: '0 12px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#334155' }}>
                      {record.id}
                    </td>

                    {/* Horodatage */}
                    <td style={{ width: '165px', padding: '0 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} color="#334155" style={{ flexShrink: 0 }} />
                        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {record.timestamp}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '0 12px' }}>
                      <span dir="ltr" style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '13px', color: '#7DD3FC', display: 'inline-block' }}>
                        {record.matricule}
                      </span>
                    </td>

                    {/* Numéros */}
                    <td style={{ width: '90px', padding: '0 12px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#94A3B8' }}>
                      {record.numbers}
                    </td>

                    {/* Lettres */}
                    <td style={{ width: '80px', padding: '0 12px', fontFamily: 'IBM Plex Mono, monospace', fontSize: '12px', color: '#94A3B8' }}>
                      {record.letters}
                    </td>

                    {/* Statut */}
                    <td style={{ width: '120px', padding: '0 12px' }}>
                      <StatusBadge status={record.status} />
                    </td>

                    {/* Confiance */}
                    <td style={{ width: '115px', padding: '0 12px' }}>
                      <ConfidenceBar value={record.confidence} />
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
        className="flex items-center justify-between px-5 py-3 flex-wrap gap-3"
        style={{ borderTop: '1px solid #1E3A6E' }}
      >
        <span style={{ fontSize: '11px', color: '#475569' }}>
          {filtered.length === 0
            ? 'Aucun résultat'
            : `Affichage ${startRow}–${endRow} sur ${filtered.length} résultat${filtered.length !== 1 ? 's' : ''}`}
        </span>
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
