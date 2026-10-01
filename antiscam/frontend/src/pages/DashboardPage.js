import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import DashboardCard from '../components/DashboardCard';
import TransactionHistory from '../components/TransactionHistory';
import { Shield, AlertTriangle, Users, TrendingUp, AlertOctagon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getUserAnalytics, getGlobalAnalytics } from '../services/analytics';
import { useSocketContext } from '@/context/SocketContext';

/*
 * Charts need concrete colours, so they read the live token values rather than
 * hardcoding. Because the page re-renders on theme change, `v()` re-reads and
 * the charts follow the theme instead of pinning to one palette.
 */
const v = (name) =>
  `rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()})`;

const RISK_TONE = (score) => (score >= 70 ? 'red' : score >= 40 ? 'amber' : 'teal');

const DashboardPage = ({ onLogout, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analytics, setAnalytics] = useState({
    total_transactions: 0,
    scams_prevented: 0,
    feedback_count: 0,
    accuracy: 94,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketContext = useSocketContext();
  const threatIntelAlerts = socketContext?.threatIntelAlerts || [];
  const dismissThreatIntelAlert = socketContext?.dismissThreatIntelAlert || (() => {});

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const userAnalytics = await getUserAnalytics();
        await getGlobalAnalytics();
        /* Coerce to numbers. A missing field from the API would otherwise reach
           `.toLocaleString()` in the stats below and take the whole page down. */
        setAnalytics({
          total_transactions: Number(userAnalytics?.total_transactions ?? 0),
          scams_prevented: Number(userAnalytics?.scams_prevented ?? 0),
          feedback_count: Number(userAnalytics?.feedback_count ?? 0),
          accuracy: 94,
        });
        setError(null);
      } catch (err) {
        setError('Could not load analytics');
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 300000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: <Shield className="w-4 h-4" />, label: 'Total analysed', value: analytics.total_transactions.toLocaleString() },
    { icon: <AlertTriangle className="w-4 h-4" />, label: 'Scams prevented', value: analytics.scams_prevented.toLocaleString() },
    { icon: <Users className="w-4 h-4" />, label: 'User reports', value: analytics.feedback_count.toLocaleString() },
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Accuracy', value: `${analytics.accuracy}%` },
  ];

  const agentPerformance = [
    { name: 'Pattern', accuracy: 96, predictions: 1245 },
    { name: 'Network', accuracy: 94, predictions: 1189 },
    { name: 'Behaviour', accuracy: 89, predictions: 1056 },
    { name: 'Pressure', accuracy: 92, predictions: 1134 },
  ];

  const riskDistribution = [
    { name: 'High', value: 342, tone: 'red' },
    { name: 'Medium', value: 567, tone: 'amber' },
    { name: 'Low', value: 891, tone: 'teal' },
  ];

  const currentTransactionRisk = 72;
  const tone = RISK_TONE(currentTransactionRisk);
  const toneLabel = { red: 'High risk', amber: 'Medium risk', teal: 'Low risk' }[tone];

  const chrome = (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        {chrome}
        <section className="pt-24 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="h-9 w-64 skeleton mb-3" />
            <div className="h-4 w-96 skeleton mb-10" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card card-pad">
                  <div className="h-4 w-20 skeleton mb-4" />
                  <div className="h-8 w-24 skeleton" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        {chrome}
        <section className="pt-24 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="note note-red" role="alert">{error}</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {chrome}

      <section className="pt-24 pb-20 px-6" data-testid="dashboard-section">
        <div className="max-w-6xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <h1 className="t-page mb-2">Analytics</h1>
            <p className="text-ink-muted">
              What the collective intelligence has seen across every analysed transfer.
            </p>
          </motion.header>

          {threatIntelAlerts.length > 0 && (
            <div className="mb-8 space-y-3">
              {threatIntelAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="note note-amber flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="w-4 h-4 mt-0.5 shrink-0 text-amber" />
                    <div>
                      <p className="font-medium text-ink">High-risk receivers detected</p>
                      <p className="t-secondary">
                        {alert?.threats?.map((t) => t.receiver).slice(0, 3).join(', ') || 'New activity across the network'}
                      </p>
                    </div>
                  </div>
                  {(alert?.threats || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {alert.threats.map((t) => (
                        <span key={t.receiver} className="pill pill-gray t-technical">{t.receiver}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button className="btn btn-ghost" onClick={() => dismissThreatIntelAlert(alert.id)}>
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
              >
                <DashboardCard {...stat} />
              </motion.div>
            ))}
          </div>

          {/* Current transaction risk */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-pad mb-6"
            data-testid="current-risk-section"
          >
            <h2 className="t-section mb-6">Cumulative risk — current transfer</h2>

            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="flex items-center gap-8">
                <div className="relative w-36 h-36 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r="56" fill="none" stroke={v('surface-3')} strokeWidth="10" />
                    <circle
                      cx="64" cy="64" r="56" fill="none"
                      stroke={v(tone)} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 * (1 - currentTransactionRisk / 100)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="t-metric" style={{ color: v(tone) }}>{currentTransactionRisk}</span>
                    <span className="text-xs text-ink-muted mt-0.5">of 100</span>
                  </div>
                </div>

                <div>
                  <span className={`pill pill-${tone} mb-2`}>{toneLabel}</span>
                  <p className="t-secondary">
                    Scored from four independent readings of the same transfer.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="t-label">Overall assessment</span>
                  <span className="text-ui font-semibold" style={{ color: v(tone) }}>{toneLabel}</span>
                </div>
                <div className="meter">
                  <div className="meter-fill" style={{ width: `${currentTransactionRisk}%`, background: v(tone) }} />
                </div>
                <div className="note">
                  {currentTransactionRisk >= 70
                    ? 'Strong indicators of fraud across the pattern and pressure agents. This one is worth walking away from.'
                    : currentTransactionRisk >= 40
                      ? 'Moderate risk factors present. Worth checking the recipient before you continue.'
                      : 'Minimal risk factors. Nothing here stands out against known scam shapes.'}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Agent performance */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-pad mb-6"
            data-testid="ai-agents-section"
          >
            <h2 className="t-section mb-6">Agent performance</h2>

            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <div className="t-label mb-4">Accuracy by agent</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={agentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke={v('border')} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: v('ink-muted'), fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: v('ink-muted'), fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: v('surface-3') }}
                      contentStyle={{
                        background: v('surface'),
                        border: `1px solid ${v('border')}`,
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="accuracy" fill={v('blue')} radius={[3, 3, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div className="t-label mb-4">Predictions made</div>
                <div className="card divide-y divide-border">
                  {agentPerformance.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between px-4 py-3">
                      <span className="text-ui font-medium text-ink">{agent.name} agent</span>
                      <div className="flex items-baseline gap-3">
                        <span className="tnum text-base font-semibold text-ink">
                          {agent.predictions.toLocaleString()}
                        </span>
                        <span className="tnum text-xs text-ink-muted w-10 text-right">{agent.accuracy}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Risk distribution */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-pad mb-6"
            data-testid="risk-distribution-section"
          >
            <h2 className="t-section mb-6">Risk distribution</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={104}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {riskDistribution.map((entry) => (
                    <Cell key={entry.name} fill={v(entry.tone)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: v('surface'),
                    border: `1px solid ${v('border')}`,
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {riskDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: v(entry.tone) }} />
                  <span className="t-secondary">{entry.name}</span>
                  <span className="tnum text-ui font-medium text-ink">{entry.value}</span>
                </div>
              ))}
            </div>
          </motion.section>

          {/* User activity */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-pad"
            data-testid="user-activity"
          >
            <TransactionHistory userId={localStorage.getItem('figment_user_id')} darkMode={darkMode} />
          </motion.section>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
