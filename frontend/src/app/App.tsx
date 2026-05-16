import { useState, useEffect, useRef } from 'react';
import { Camera, Unlock, Car, BarChart2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { BarrierAnimation } from './components/BarrierAnimation';
import { AnalyticsSection } from './components/analytics/AnalyticsSection';
import { HistorySection } from './components/HistorySection';
import { TablesSection } from './components/tables/TablesSection';
import { AuthorizedVehiclesTable } from './components/tables/AuthorizedVehiclesTable';

type BarrierState = 'closed' | 'opening' | 'open' | 'closing';

type ActiveTab = 'dashboard' | 'analytics' | 'history' | 'management';

export default function App() {
  const [totalSpaces, setTotalSpaces] = useState(50);
  const [reservedSpaces, setReservedSpaces] = useState(5);
  const [occupiedSpaces, setOccupiedSpaces] = useState(0);
  const [cameraActive, setCameraActive] = useState(true);
  const [barrierState, setBarrierState] = useState<BarrierState>('closed');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [recentDetections, setRecentDetections] = useState<{ id: number; plate: string; status: 'authorized' | 'denied'; time: string }[]>([]);
  
  const prevOccupied = useRef(-1);
  const lastSeenId = useRef<number | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (prevOccupied.current !== -1) {
      if (occupiedSpaces > prevOccupied.current) {
        toast.success('Nouveau véhicule détecté : Entrée', {
          description: 'Une nouvelle plaque a été identifiée.',
          icon: <Car className="w-4 h-4 text-emerald-400" />,
        });
      } else if (occupiedSpaces < prevOccupied.current) {
        toast.info('Véhicule détecté : Sortie', {
          description: 'Un véhicule a quitté le parking.',
          icon: <Clock className="w-4 h-4 text-blue-400" />,
        });
      }
    }
    prevOccupied.current = occupiedSpaces;
  }, [occupiedSpaces]);


  // Fetch parking status from Backend
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/status');
        const data = await response.json();
        if (data && !data.error) {
          setTotalSpaces(data.total_spaces);
          setReservedSpaces(data.reserved_spaces);
          setOccupiedSpaces(data.occupied_spaces);
          setLastUpdate(new Date());
        }
      } catch (err) {
        console.error('[ERROR] Frontend status fetch failed:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  const barrierStateRef = useRef<BarrierState>(barrierState);
  useEffect(() => {
    barrierStateRef.current = barrierState;
  }, [barrierState]);

  // Fetch recent detections from Backend
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/history');
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
           // Check for new authorized detections to trigger animation
           const latest = data[0];
           
           if (lastSeenId.current !== null && latest.id > lastSeenId.current) {
             // Trigger animation if it's an authorized entry OR a manual barrier open
             // AND the barrier is currently closed
             if ((latest.status === 'authorized' || latest.action === 'OPEN_BARRIER') && barrierStateRef.current === 'closed') {
               runBarrierAnimation();
             }
           }
           lastSeenId.current = latest.id;

           const formatted = data.slice(0, 3).map((item: any) => ({
             id: item.id,
             plate: item.plate_number,
             status: item.status || 'authorized',
             time: item.timestamp && item.timestamp.includes(' ') ? item.timestamp.split(' ')[1] : item.timestamp || '--:--:--'
           }));
          setRecentDetections(formatted);
        }
      } catch (err) {
        console.error('Error fetching recent detections:', err);
      }
    };

    fetchRecent();
    const interval = setInterval(fetchRecent, 3000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array for stable interval

  const runBarrierAnimation = () => {
    // Check ref instead of state to ensure we have the latest value without dependency issues
    if (barrierStateRef.current !== 'closed') return;

    // Clear any existing timeouts to avoid collisions
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);

    setBarrierState('opening');
    
    setTimeout(() => setBarrierState('open'), 1500);
    
    const closingTimeout = setTimeout(() => {
      setBarrierState('closing');
      setTimeout(() => {
        setBarrierState('closed');
        animationTimeoutRef.current = null;
      }, 1500);
    }, 5000);

    animationTimeoutRef.current = closingTimeout;
  };

  const openBarrierManually = async () => {
    if (barrierState === 'closed') {
      try {
        await fetch('http://localhost:5000/api/barrier/open', { method: 'POST' });
        runBarrierAnimation();
      } catch (err) {
        console.error('Error opening barrier:', err);
      }
    }
  };

  const freeSpaces = totalSpaces - occupiedSpaces - reservedSpaces;

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: '#050B18',
        fontFamily: 'IBM Plex Sans, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      {/* Premium Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px] animate-mesh" 
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 75%)' }} 
        />
        <div 
          className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-10 blur-[120px] animate-mesh" 
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 75%)', animationDelay: '-5s' }} 
        />
        <div 
          className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full opacity-10 blur-[100px] animate-mesh" 
          style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)', animationDelay: '-10s' }} 
        />
        <div 
          className="absolute bottom-[20%] left-[10%] w-[35%] h-[35%] rounded-full opacity-15 blur-[100px] animate-mesh" 
          style={{ background: 'radial-gradient(circle, #EF4444 0%, transparent 70%)', animationDelay: '-15s' }} 
        />
      </div>

      <style>{`
        @keyframes pulse-opacity {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .live-dot {
          animation: pulse-opacity 1.5s ease-in-out infinite;
        }
        .section-card {
          background: rgba(15, 32, 68, 0.4);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .section-card:hover {
          background: rgba(15, 32, 68, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 48px 0 rgba(0, 0, 0, 0.45);
          transform: translateY(-2px);
        }
        .glass-frame {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 40px;
          padding: 40px;
          box-shadow: inset 0 0 80px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1360px;
        }
        .app-title-glow {
          text-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
        }
      `}</style>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right" 
        expand={false} 
        richColors 
        theme="dark"
        toastOptions={{
          style: {
            background: 'rgba(15, 32, 68, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            color: '#F1F5F9'
          }
        }}
      />

      {/* Main Glass Frame */}
      <div className="glass-frame">
        <div className="max-w-7xl mx-auto">
          {/* Header + Tab Navigation */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                <Car className="text-white w-6 h-6" />
              </div>
              <h1
                className="app-title-glow"
                style={{
                  color: '#F1F5F9',
                  fontSize: '22px',
                  fontWeight: 600,
                  letterSpacing: '-0.02em'
                }}
              >
                Vision Parking <span className="text-blue-400 font-light ml-1">Pro</span>
              </h1>
            </div>

            {/* Tabs */}
            <div
              className="flex p-1 gap-1"
              style={{ 
                borderRadius: '9999px', 
                backgroundColor: 'rgba(15, 32, 68, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
              }}
            >
              {[
                { id: 'dashboard', icon: Camera, label: 'Dashboard' },
                { id: 'analytics', icon: BarChart2, label: 'Analytiques' },
                { id: 'history', icon: Clock, label: 'Historique' },
                { id: 'management', icon: Unlock, label: 'Gestion' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className="relative flex items-center gap-2 px-6 py-2.5 transition-all"
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: activeTab === tab.id ? '#FFFFFF' : '#94A3B8',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    zIndex: 1
                  }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        borderRadius: '9999px',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.3), inset 0 0 10px rgba(59, 130, 246, 0.2)',
                        zIndex: -1
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <tab.icon style={{ width: '14px', height: '14px' }} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content with transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {activeTab === 'analytics' && <AnalyticsSection />}
              {activeTab === 'history' && <HistorySection />}
              {activeTab === 'management' && (
                <div className="section-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl p-6">
                  <AuthorizedVehiclesTable />
                </div>
              )}
              {activeTab === 'dashboard' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Colonne Gauche - Caméra */}
                    <div className="lg:col-span-2 space-y-8">
                      {/* Caméra */}
                      <div className="rounded-3xl p-8 section-card">
                        <div className="flex items-center justify-between mb-6">
                          <h2
                            className="flex items-center gap-3"
                            style={{
                              color: '#F1F5F9',
                              fontSize: '14px',
                              fontWeight: 600,
                              letterSpacing: '0.02em'
                            }}
                          >
                            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                              <Camera className="w-5 h-5 text-blue-400" />
                            </div>
                            SURVEILLANCE TEMPS RÉEL
                          </h2>
                          {cameraActive && (
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
                              <div className="w-2 h-2 rounded-full live-dot" style={{ backgroundColor: '#10B981' }}></div>
                              <span style={{ color: '#34D399', fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>LIVE</span>
                            </div>
                          )}
                        </div>

                        <div className="relative rounded-2xl overflow-hidden aspect-video mb-6 ring-1 ring-white/10 shadow-2xl group" style={{ backgroundColor: '#020617' }}>
                          <motion.img
                            src="http://localhost:5001/video_feed"
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            alt="Camera Stream"
                            onError={() => setCameraActive(false)}
                            onLoad={() => setCameraActive(true)}
                          />
                          {cameraActive && (
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                              <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </span>
                              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">LIVE FEED</span>
                            </div>
                          )}
                          {!cameraActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
                              <div className="text-center">
                                <motion.div 
                                  animate={{ opacity: [0.5, 1, 0.5] }} 
                                  transition={{ repeat: Infinity, duration: 2 }}
                                >
                                  <Camera className="w-16 h-16 mx-auto mb-4 text-red-500/80" />
                                </motion.div>
                                <p style={{ fontSize: '15px', color: '#F87171', fontWeight: 600, letterSpacing: '0.05em' }}>SIGNAL CAMÉRA PERDU</p>
                                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>En attente de connexion sur le port 5001...</p>
                                
                                {/* Loading Skeleton */}
                                <div className="mt-8 flex gap-2 justify-center">
                                  <motion.div animate={{ height: [10, 20, 10] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 bg-red-500/40 rounded-full"></motion.div>
                                  <motion.div animate={{ height: [10, 30, 10] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-red-500/40 rounded-full"></motion.div>
                                  <motion.div animate={{ height: [10, 20, 10] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 bg-red-500/40 rounded-full"></motion.div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Boutons de contrôle */}
                        <div className="grid grid-cols-2 gap-4">
                          <div
                            className="py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3"
                            style={{ backgroundColor: 'rgba(30, 58, 110, 0.4)', color: '#94A3B8', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.05)' }}
                          >
                            <Clock className="w-4 h-4" />
                            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
                          </div>
                          <button
                            onClick={openBarrierManually}
                            className="py-3.5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-emerald-900/20"
                            style={{ backgroundColor: '#065F46', color: '#A7F3D0', fontSize: '13px', fontWeight: 600, border: '1px solid #10B981', cursor: 'pointer' }}
                          >
                            <Unlock className="w-4 h-4" />
                            OUVRIR LA BARRIÈRE
                          </button>
                        </div>

                        {/* Table de Gestion des Véhicules - Dashboard */}
                        <div className="section-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl p-6">
                          <AuthorizedVehiclesTable />
                        </div>
                      </div>
                    </div>

                    {/* Colonne Droite - Statistiques */}
                    <div className="space-y-8">
                      {/* Barrier Animation */}
                      <div className="section-card rounded-3xl overflow-hidden shadow-2xl">
                        <BarrierAnimation state={barrierState} />
                      </div>

                      {/* Moniteur Live - NEW MINI TABLE */}
                      <div className="rounded-3xl p-5 mb-6 section-card">
                        <h2
                          className="mb-4 flex items-center gap-3"
                          style={{ color: '#94A3B8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                        >
                          <div className="p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse" />
                          </div>
                          MONITEUR LIVE
                        </h2>
                        
                        <div className="overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="text-[10px] text-slate-500 uppercase text-left border-b border-white/5">
                                <th className="pb-2 font-semibold">Plaque</th>
                                <th className="pb-2 font-semibold">Statut</th>
                                <th className="pb-2 font-semibold text-right">Heure</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {recentDetections.length === 0 ? (
                                <tr><td colSpan={3} className="py-4 text-[11px] text-slate-600 text-center italic">En attente de données...</td></tr>
                              ) : (
                                recentDetections.map((det) => (
                                  <motion.tr 
                                    key={det.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-[12px]"
                                  >
                                    <td dir="ltr" className="py-2.5 font-mono font-bold text-blue-100">{det.plate}</td>
                                    <td className="py-2.5">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${det.status === 'authorized' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {det.status === 'authorized' ? 'OK' : 'NO'}
                                      </span>
                                    </td>
                                    <td className="py-2.5 text-right text-slate-400 font-mono text-[11px]">{det.time}</td>
                                  </motion.tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Places Disponibles */}
                      <div className="rounded-3xl p-5 section-card">
                        <h2
                          className="mb-5 flex items-center gap-3"
                          style={{ color: '#94A3B8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                        >
                          <div className="p-1 rounded-md bg-slate-500/10 border border-slate-500/20">
                            <Car className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          ÉTAT DES DISPONIBILITÉS
                        </h2>
                        <div className="space-y-3">
                          <div className="rounded-2xl p-4 flex justify-between items-center" style={{ backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                            <div>
                              <div style={{ color: '#10B981', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Libres</div>
                              <motion.div 
                                key={freeSpaces}
                                initial={{ scale: 1.2, color: '#FFFFFF' }}
                                animate={{ scale: 1, color: '#34D399' }}
                                style={{ fontSize: '24px', fontWeight: 600 }}
                              >
                                {freeSpaces}
                              </motion.div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                              <Unlock className="w-5 h-5 text-emerald-400" />
                            </div>
                          </div>

                          <div className="rounded-2xl p-4 flex justify-between items-center" style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <div>
                              <div style={{ color: '#EF4444', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '2px' }}>Occupées</div>
                              <motion.div 
                                key={occupiedSpaces}
                                initial={{ scale: 1.2, color: '#FFFFFF' }}
                                animate={{ scale: 1, color: '#F87171' }}
                                style={{ fontSize: '24px', fontWeight: 600 }}
                              >
                                {occupiedSpaces}
                              </motion.div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                              <Car className="w-5 h-5 text-red-400" />
                            </div>
                          </div>

                          <div className="mt-6">
                            <div className="flex justify-between mb-2" style={{ color: '#94A3B8', fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                              <span>Saturation du Parking</span>
                              <span className={occupiedSpaces / totalSpaces > 0.8 ? 'text-red-400' : 'text-blue-400'}>
                                {totalSpaces > 0 ? Math.round((occupiedSpaces / totalSpaces) * 100) : 0}%
                              </span>
                            </div>
                            <div className="w-full rounded-full h-2.5 overflow-hidden p-0.5" style={{ backgroundColor: 'rgba(30, 58, 110, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
                                style={{
                                  width: `${totalSpaces > 0 ? (occupiedSpaces / totalSpaces) * 100 : 0}%`,
                                  backgroundColor: occupiedSpaces / totalSpaces > 0.8 ? '#EF4444' : '#3B82F6',
                                  boxShadow: occupiedSpaces / totalSpaces > 0.8 ? '0 0 10px rgba(239,68,68,0.4)' : '0 0 10px rgba(59,130,246,0.4)'
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}