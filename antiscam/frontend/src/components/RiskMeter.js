import { motion } from 'framer-motion';

const toneFor = (score) => (score >= 70 ? 'red' : score >= 40 ? 'amber' : 'teal');

const LABEL = { red: 'High risk', amber: 'Medium risk', teal: 'Low risk' };

const v = (name) =>
  `rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()})`;

/**
 * The headline score for a single transfer. A ring with no glow — the arc is
 * the reading, and the label spells out what the number means.
 */
const RiskMeter = ({ score }) => {
  const tone = toneFor(score);
  const label = LABEL[tone];
  const C = 2 * Math.PI * 52;

  return (
    <div className="card card-pad" data-testid="risk-meter">
      <div className="flex items-center justify-between mb-6">
        <h3 className="t-card">Overall risk</h3>
        <span className={`pill pill-${tone}`} data-testid="risk-level-badge">{label}</span>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke={v('surface-3')} strokeWidth="10" />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke={v(tone)}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - score / 100) }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="t-metric text-3xl"
              style={{ color: v(tone) }}
              data-testid="risk-score-value"
            >
              {score}
            </motion.span>
            <span className="text-xs text-ink-muted mt-0.5">of 100</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="meter">
          <div
            className="meter-fill"
            style={{ width: `${Math.min(score, 100)}%`, background: v(tone) }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-ink-faint">
          <span>Safe</span>
          <span>Risky</span>
        </div>
      </div>
    </div>
  );
};

export default RiskMeter;
