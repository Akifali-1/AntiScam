import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import AgentCard from './AgentCard';
import RiskMeter from './RiskMeter';
import { AlertTriangle, Brain } from 'lucide-react';

const toneFor = (score) => (score >= 70 ? 'red' : score >= 40 ? 'amber' : 'teal');
const HEADLINE = {
  red: 'This reads as a scam',
  amber: 'Worth a second look',
  teal: 'Nothing stands out',
};

const ResultsModal = ({ isOpen, results, onCancel, onProceed, onReport, onClose }) => {
  if (!results) return null;

  const tone = toneFor(results.overallRisk);

  const handleProceedClick = () => {
    onClose();
    setTimeout(() => {
      onProceed();
    }, 100);
  };

  const cluster = results.threatIntel?.clusterMember || results.threatIntel?.clusterMatch;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0 scroll-thin"
        data-testid="results-modal"
      >
        <DialogTitle className="sr-only">Transaction risk analysis</DialogTitle>
        <DialogDescription className="sr-only">
          The analysis of this transfer across four agents.
        </DialogDescription>

        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-5 h-5 text-${tone}`} />
            <div>
              <h2 className="t-section" data-testid="risk-title">
                {HEADLINE[tone]}
              </h2>
              <p className="t-secondary">Scored {results.overallRisk} of 100 by four agents.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <RiskMeter score={results.overallRisk} />
          </motion.div>

          {results.threatIntel?.trendingThreat && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="note note-red"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red" />
                <h3 className="text-ui font-medium text-ink">Trending threat</h3>
              </div>
              <dl className="t-secondary space-y-0.5">
                <div><dt className="inline text-ink-muted">Receiver </dt><dd className="inline t-technical">{results.threatIntel.trendingThreat.receiver}</dd></div>
                <div><dt className="inline text-ink-muted">Reports </dt><dd className="inline tnum">{results.threatIntel.trendingThreat.totalReports}</dd></div>
                <div><dt className="inline text-ink-muted">Threat score </dt><dd className="inline tnum">{results.threatIntel.trendingThreat.threatScore?.toFixed(1) || 'N/A'}</dd></div>
                {results.threatIntel.trendingThreat.patternFlags?.length > 0 && (
                  <div><dt className="inline text-ink-muted">Flags </dt><dd className="inline">{results.threatIntel.trendingThreat.patternFlags.join(', ')}</dd></div>
                )}
              </dl>
            </motion.div>
          )}

          {cluster && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="note note-amber"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber" />
                <h3 className="text-ui font-medium text-ink">
                  {results.threatIntel?.clusterMember ? 'Known scam cluster member' : 'Matches a known pattern'}
                </h3>
              </div>
              <dl className="t-secondary space-y-0.5">
                <div><dt className="inline text-ink-muted">Cluster </dt><dd className="inline">{cluster.name}</dd></div>
                <div><dt className="inline text-ink-muted">Reported </dt><dd className="inline tnum">{cluster.count} times</dd></div>
                <div><dt className="inline text-ink-muted">Average threat score </dt><dd className="inline tnum">{cluster.avgScore?.toFixed(1) || 'N/A'}</dd></div>
                {cluster.similarity != null && (
                  <div><dt className="inline text-ink-muted">Similarity </dt><dd className="inline tnum">{(cluster.similarity * 100).toFixed(1)}%</dd></div>
                )}
                {cluster.topKeywords?.length > 0 && (
                  <div><dt className="inline text-ink-muted">Keywords </dt><dd className="inline">{cluster.topKeywords.join(', ')}</dd></div>
                )}
              </dl>
            </motion.div>
          )}

          {results.aiExplanation &&
            results.aiExplanation.length > 0 &&
            results.aiExplanation !== 'Sorry, unable to generate explanation at this time.' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="note note-blue"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue" />
                  <h3 className="text-ui font-medium text-ink">What the agents saw</h3>
                </div>
                <p className="t-secondary">{results.aiExplanation}</p>
              </motion.div>
            )}

          <div>
            <h3 className="t-card mb-3">Agent by agent</h3>
            <div className="space-y-2.5">
              {results.agents.map((agent, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <AgentCard agent={agent} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
            <button
              data-testid="cancel-transaction-btn"
              onClick={onCancel}
              className="btn btn-primary flex-1 h-11"
            >
              Cancel the transfer
            </button>
            <button
              data-testid="proceed-anyway-btn"
              onClick={handleProceedClick}
              className="btn btn-secondary flex-1 h-11"
            >
              Send anyway
            </button>
          </div>

          {results.overallRisk >= 40 && (
            <button
              data-testid="report-scam-btn"
              onClick={onReport}
              className="btn btn-danger w-full h-10"
            >
              Report this as a scam
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal;
