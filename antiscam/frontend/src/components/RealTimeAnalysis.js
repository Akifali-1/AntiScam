import { motion } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, Clock, Radar } from 'lucide-react';

const getClusterLabel = (threatIntel) => {
  if (!threatIntel) return 'Unclassified';
  const cluster = threatIntel.cluster || threatIntel.clusterLabel;
  if (cluster) return cluster;

  const flags = threatIntel.patternFlags || threatIntel.flags || [];
  const joined = flags.join(' ').toLowerCase();
  if (joined.includes('loan')) return 'Loan scam';
  if (joined.includes('otp') || joined.includes('kyc')) return 'OTP scam';
  if (joined.includes('job')) return 'Fake job scam';
  if (joined.includes('invest') || joined.includes('crypto')) return 'Investment scam';
  return 'Behavioural alert';
};

const toneFor = (score) => (score >= 70 ? 'red' : score >= 40 ? 'amber' : 'teal');
const LABEL = { red: 'High risk', amber: 'Medium risk', teal: 'Low risk' };

/**
 * The stream of transfers judged while the page is open. Same card shape each
 * time so a new one arriving reads as an addition, not a new kind of thing.
 */
const RealTimeAnalysis = ({ analysisResults }) => {
  if (!analysisResults || analysisResults.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="t-section mb-4">Live results</h2>

      <div className="space-y-3">
        {analysisResults.map((result, index) => {
          const tone = toneFor(result.overallRisk);
          const transaction = result.transaction || {};
          const Icon = tone === 'teal' ? CheckCircle : tone === 'amber' ? AlertTriangle : AlertTriangle;
          const threatScore = Math.round(result.threatIntel?.threatScore ?? result.threatIntel?.score ?? 0);

          return (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
              className="card card-pad"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${tone}`} />
                  <span className={`pill pill-${tone}`}>{LABEL[tone]}</span>
                </div>
                <span className="t-technical text-ink-faint">{transaction.time || 'Just now'}</span>
              </div>

              <div className="mb-3">
                <p className="t-technical text-ink">{transaction.receiver || 'Unknown recipient'}</p>
                <p className="t-secondary mt-0.5">
                  ₹{transaction.amount?.toLocaleString() || '0'} · {transaction.reason || 'No message'}
                </p>
              </div>

              {result.aiExplanation &&
                result.aiExplanation.length > 0 &&
                result.aiExplanation !== 'Sorry, unable to generate explanation at this time.' && (
                  <div className="note note-blue mt-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Brain className="w-3.5 h-3.5 text-blue" />
                      <span className="text-xs font-medium text-ink">Why</span>
                    </div>
                    <p className="t-secondary">{result.aiExplanation}</p>
                  </div>
                )}

              {result.threatIntel && (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`pill pill-${toneFor(threatScore)}`}>CTIH {threatScore}%</span>
                    <span className="flex items-center gap-1.5 t-secondary">
                      <Radar className="w-3.5 h-3.5 text-ink-faint" />
                      {getClusterLabel(result.threatIntel)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(result.threatIntel.patternFlags || result.threatIntel.flags || []).slice(0, 3).map((flag, idx) => (
                      <span key={`${flag}-${idx}`} className="pill pill-gray">{flag}</span>
                    ))}
                    {!(result.threatIntel.patternFlags || result.threatIntel.flags || []).length && (
                      <span className="t-secondary">No network evidence supplied.</span>
                    )}
                  </div>

                  <p className="t-technical text-ink-faint">
                    Velocity {Math.round(result.threatIntel.velocityScore ?? result.threatIntel.velocity ?? 0)} ·
                    Geo anomalies {Math.round(result.threatIntel.geoAnomalies ?? 0)}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="t-secondary">Overall risk</span>
                <div className="flex items-center gap-3">
                  <div className="w-28 meter">
                    <div
                      className="meter-fill"
                      style={{
                        width: `${Math.min(Number(result.overallRisk) || 0, 100)}%`,
                        background: `rgb(var(--${tone}))`,
                      }}
                    />
                  </div>
                  <span className="tnum text-ui font-medium text-ink w-9 text-right">
                    {result.overallRisk}%
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
};

export default RealTimeAnalysis;
