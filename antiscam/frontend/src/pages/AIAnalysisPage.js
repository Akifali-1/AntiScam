import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import {
  LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Activity, Brain, Shield } from 'lucide-react';

/* Charts read the live token values, so they follow the theme rather than
   pinning to one palette. */
const v = (name) =>
  `rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()})`;

const axisTick = () => ({ fill: v('ink-muted'), fontSize: 12 });
const chartTooltip = () => ({
  contentStyle: {
    background: v('surface'),
    border: `1px solid ${v('border')}`,
    borderRadius: 6,
    fontSize: 12,
    color: v('ink'),
  },
});

const AIAnalysisPage = ({ onLogout, darkMode, toggleDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const trendData = [
    { month: 'Jan', scams: 45, detected: 43, accuracy: 95.5 },
    { month: 'Feb', scams: 52, detected: 49, accuracy: 94.2 },
    { month: 'Mar', scams: 48, detected: 46, accuracy: 95.8 },
    { month: 'Apr', scams: 61, detected: 58, accuracy: 95.1 },
    { month: 'May', scams: 55, detected: 52, accuracy: 94.5 },
    { month: 'Jun', scams: 67, detected: 64, accuracy: 95.5 },
  ];

  const agentRadarData = [
    { metric: 'Pattern', patternAgent: 96, networkAgent: 88, behaviorAgent: 85, biometricAgent: 90 },
    { metric: 'Speed', patternAgent: 92, networkAgent: 95, behaviorAgent: 78, biometricAgent: 88 },
    { metric: 'Reliability', patternAgent: 94, networkAgent: 96, behaviorAgent: 89, biometricAgent: 91 },
    { metric: 'Learning', patternAgent: 88, networkAgent: 85, behaviorAgent: 95, biometricAgent: 82 },
    { metric: 'Low false pos.', patternAgent: 96, networkAgent: 94, behaviorAgent: 89, biometricAgent: 92 },
  ];

  const confidenceOverTime = [
    { week: 'W1', confidence: 78 },
    { week: 'W2', confidence: 82 },
    { week: 'W3', confidence: 85 },
    { week: 'W4', confidence: 88 },
    { week: 'W5', confidence: 91 },
    { week: 'W6', confidence: 94 },
  ];

  const metrics = [
    { icon: <Brain className="w-4 h-4" />, label: 'Models active', value: '4' },
    { icon: <Activity className="w-4 h-4" />, label: 'Predictions / day', value: '2.3K' },
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Learning rate', value: '94.2%' },
    { icon: <Shield className="w-4 h-4" />, label: 'Confidence', value: '96%' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />

      <section className="pt-24 pb-20 px-6" data-testid="ai-analysis-section">
        <div className="max-w-6xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <h1 className="t-page mb-2">Model behaviour</h1>
            <p className="text-ink-muted">How the four agents have actually performed over time.</p>
          </motion.header>

          {/* Key figures */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="card card-pad"
              >
                <span className="text-ink-faint">{m.icon}</span>
                <div className="stat-value mt-3">{m.value}</div>
                <div className="stat-label mt-1">{m.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Detection trend */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-pad mb-6"
            data-testid="detection-trend-chart"
          >
            <h2 className="t-section mb-1">Detection over time</h2>
            <p className="t-secondary mb-6">Scams encountered, scams caught, and the resulting accuracy.</p>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={v('border')} vertical={false} />
                <XAxis dataKey="month" tick={axisTick()} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={axisTick()} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[80, 100]} tick={axisTick()} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip()} />
                <Legend wrapperStyle={{ fontSize: 12, color: v('ink-muted') }} />
                <Line yAxisId="left" type="monotone" dataKey="scams" stroke={v('ink-faint')} strokeWidth={2} name="Encountered" dot={false} />
                <Line yAxisId="left" type="monotone" dataKey="detected" stroke={v('red')} strokeWidth={2} name="Detected" dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" stroke={v('blue')} strokeWidth={2} name="Accuracy %" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.section>

          {/* Agent comparison */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-pad mb-6"
            data-testid="agent-radar-chart"
          >
            <h2 className="t-section mb-1">Agent comparison</h2>
            <p className="t-secondary mb-6">Each agent against the same five measures.</p>
            <ResponsiveContainer width="100%" height={440}>
              <RadarChart data={agentRadarData}>
                <PolarGrid stroke={v('border')} />
                <PolarAngleAxis dataKey="metric" tick={{ fill: v('ink-muted'), fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: v('ink-faint'), fontSize: 11 }} />
                <Radar name="Pattern" dataKey="patternAgent" stroke={v('blue')} fill={v('blue')} fillOpacity={0.12} />
                <Radar name="Network" dataKey="networkAgent" stroke={v('teal')} fill={v('teal')} fillOpacity={0.12} />
                <Radar name="Behaviour" dataKey="behaviorAgent" stroke={v('amber')} fill={v('amber')} fillOpacity={0.12} />
                <Radar name="Pressure" dataKey="biometricAgent" stroke={v('red')} fill={v('red')} fillOpacity={0.12} />
                <Legend wrapperStyle={{ fontSize: 12, color: v('ink-muted') }} />
                <Tooltip {...chartTooltip()} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.section>

          {/* Confidence growth */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card card-pad"
            data-testid="confidence-chart"
          >
            <h2 className="t-section mb-1">Confidence growth</h2>
            <p className="t-secondary mb-6">Feedback from users, folded back into the models.</p>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={confidenceOverTime}>
                <defs>
                  <linearGradient id="confFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={v('teal')} stopOpacity={0.18} />
                    <stop offset="95%" stopColor={v('teal')} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={v('border')} vertical={false} />
                <XAxis dataKey="week" tick={axisTick()} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={axisTick()} axisLine={false} tickLine={false} />
                <Tooltip {...chartTooltip()} />
                <Area type="monotone" dataKey="confidence" stroke={v('teal')} strokeWidth={2} fillOpacity={1} fill="url(#confFill)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="note note-teal mt-6">
              Confidence has risen from 78 to 94 over six weeks, driven mostly by user reports
              of scams the agents initially scored low.
            </div>
          </motion.section>
        </div>
      </section>
    </div>
  );
};

export default AIAnalysisPage;
