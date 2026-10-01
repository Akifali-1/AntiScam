import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import ThreatReceiverCard from '@/components/threat-intel/ThreatReceiverCard';
import ClusterCard from '@/components/threat-intel/ClusterCard';
import ThreatTimeline from '@/components/threat-intel/ThreatTimeline';
import { getThreatIntelGlobal, getThreatIntelClusters, getReceiverThreatIntel } from '@/services/api';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { RefreshCcw } from 'lucide-react';

const ThreatIntelDashboard = ({ onLogout, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trending, setTrending] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [timelineState, setTimelineState] = useState({ loading: false, history: [], error: null });

  const fetchThreatIntel = async () => {
    try {
      setLoading(true);
      setError(null);
      const [globalResponse, clustersResponse] = await Promise.all([
        getThreatIntelGlobal(),
        getThreatIntelClusters(),
      ]);

      const sortedTrending = (globalResponse?.trending || [])
        .sort((a, b) => (b.threat_score ?? b.threatScore ?? 0) - (a.threat_score ?? a.threatScore ?? 0))
        .slice(0, 10);

      const clusterList = (clustersResponse?.clusters || globalResponse?.clusters || []).map((cluster) => {
        const memberCount = cluster.count ?? cluster.size ?? cluster.members?.length ?? cluster.receivers?.length ?? 0;
        return {
          ...cluster,
          avgScore: cluster.avgScore ?? cluster.avg_score ?? 0,
          count: memberCount,
          topKeywords: cluster.topKeywords || cluster.top_keywords || [],
          updatedAt: cluster.updatedAt || cluster.updated_at,
          active: cluster.active !== false,
        };
      });

      setTrending(sortedTrending);
      setClusters(clusterList);
    } catch (err) {
      console.error('Threat intel fetch failed', err);
      setError('Could not load threat intelligence. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreatIntel();
  }, []);

  const { emergingClusters, activeClusters, inactiveClusters } = useMemo(() => {
    const now = Date.now();
    const emergingThreshold = 1000 * 60 * 60 * 24 * 7;
    const emerging = [];
    const active = [];
    const inactive = [];

    clusters.forEach((cluster) => {
      const updatedMs = cluster.updatedAt ? new Date(cluster.updatedAt).getTime() : 0;
      const isEmerging = Boolean(updatedMs && now - updatedMs <= emergingThreshold);
      const enrichedCluster = { ...cluster, isEmerging };

      if (!cluster.active) {
        inactive.push(enrichedCluster);
      } else if (isEmerging) {
        emerging.push(enrichedCluster);
      } else {
        active.push(enrichedCluster);
      }
    });

    return { emergingClusters: emerging, activeClusters: active, inactiveClusters: inactive };
  }, [clusters]);

  const receiverClusterMap = useMemo(() => {
    const map = {};
    clusters.forEach((cluster) => {
      (cluster.members || cluster.receivers || []).forEach((receiver) => {
        map[receiver] = cluster.name;
      });
    });
    return map;
  }, [clusters]);

  const handleReceiverSelect = async (receiver) => {
    setSelectedReceiver(receiver);
    setSheetOpen(true);
    setTimelineState({ loading: true, history: [], error: null });

    try {
      const data = await getReceiverThreatIntel(receiver);
      setTimelineState({ loading: false, history: data?.history || [], error: null });
    } catch (err) {
      console.error('Receiver intel fetch failed', err);
      setTimelineState({ loading: false, history: [], error: 'Could not load this receiver’s timeline.' });
    }
  };

  const renderClusterGrid = (items, emptyMessage, columnClasses = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4') => {
    if (!items.length) {
      return <p className="t-secondary">{emptyMessage}</p>;
    }
    return (
      <div className={columnClasses}>
        {items.map((cluster, index) => (
          <ClusterCard
            key={cluster.clusterId || `${cluster.name}-${index}`}
            cluster={cluster}
            delay={index * 0.05}
          />
        ))}
      </div>
    );
  };

  const SectionHeading = ({ title, note }) => (
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4 pb-3 border-b border-border">
      <h2 className="t-section">{title}</h2>
      <p className="t-secondary">{note}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />

      <section className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="t-page mb-2">Threat intelligence</h1>
                <p className="text-ink-muted max-w-xl">
                  Receiver reputation and scam clusters, fused from all four agents and
                  what people report back.
                </p>
              </div>
              <button onClick={fetchThreatIntel} className="btn btn-secondary">
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="pill pill-teal">
                <span className="w-1.5 h-1.5 rounded-full bg-teal pulse" />
                Live
              </span>
              <span className="t-secondary">Updated continuously</span>
            </div>
          </motion.header>

          {error && <div className="note note-red" role="alert">{error}</div>}

          {/* Trending receivers */}
          <section>
            <SectionHeading title="Trending receivers" note="By threat score" />
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-36 skeleton" />
                ))}
              </div>
            ) : trending.length === 0 ? (
              <p className="t-secondary">No flagged receivers right now.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trending.map((item, index) => (
                  <ThreatReceiverCard
                    key={item.receiver}
                    receiver={item.receiver}
                    score={item.threat_score ?? item.threatScore ?? 0}
                    patternFlags={item.pattern_flags ?? item.patternFlags ?? []}
                    cluster={receiverClusterMap[item.receiver]}
                    lastSeen={item.last_seen}
                    delay={index * 0.05}
                    onSelect={handleReceiverSelect}
                  />
                ))}
              </div>
            )}
          </section>

          {!loading && emergingClusters.length > 0 && (
            <section>
              <SectionHeading title="Emerging clusters" note="New in the last 7 days" />
              {renderClusterGrid(emergingClusters, 'Nothing emerging this week.')}
            </section>
          )}

          <section>
            <SectionHeading title="Scam clusters" note="Grouped by pattern similarity" />
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-44 skeleton" />
                ))}
              </div>
            ) : (
              renderClusterGrid(activeClusters, 'No active clusters yet.', 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4')
            )}
          </section>

          {!loading && inactiveClusters.length > 0 && (
            <section>
              <SectionHeading title="Archived" note="Went quiet or fell below threshold" />
              {renderClusterGrid(inactiveClusters, 'Nothing archived.', 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4')}
            </section>
          )}
        </div>
      </section>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto scroll-thin">
          <SheetHeader>
            <SheetTitle className="t-section">Receiver timeline</SheetTitle>
            <SheetDescription className="t-secondary">
              Everything reported against{' '}
              <span className="t-technical text-ink">{selectedReceiver}</span>
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ThreatTimeline
              receiver={selectedReceiver}
              history={timelineState.history}
              loading={timelineState.loading}
              error={timelineState.error}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ThreatIntelDashboard;
