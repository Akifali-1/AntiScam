import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';

/**
 * A payment request arrived while the user was elsewhere in the app. The card
 * is deliberately quiet until read — an amber rule and a plain heading, not a
 * throbbing red panel, because the user hasn't asked for anything yet.
 */
const AlertNotification = ({ alert, onDismiss, onProceed }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
    }, 250);
  };

  const handleProceed = () => {
    /* A socket alert is untrusted shape: one without an amount would otherwise
       throw here and blank the whole app, since this renders at the root. */
    const params = new URLSearchParams({
      upi_id: alert.upi_id ?? '',
      amount: String(alert.amount ?? ''),
      message: alert.message || ''
    });
    handleDismiss();
    setTimeout(() => {
      if (onProceed) {
        onProceed(`/demo?${params.toString()}`);
      } else {
        window.location.href = `/demo?${params.toString()}`;
      }
    }, 100);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-sm w-full"
    >
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber mt-0.5 shrink-0" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="t-card">Incoming request</h3>
              <button
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="text-ink-faint hover:text-ink transition-colors -mt-0.5 -mr-1 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <dl className="space-y-1 mb-3">
              <div className="flex items-baseline gap-2">
                <dt className="t-label">UPI</dt>
                <dd className="t-technical text-ink truncate">{alert.upi_id}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="t-label">Amount</dt>
                <dd className="tnum text-ui font-medium text-ink">
                  ₹{Number(alert.amount || 0).toLocaleString('en-IN')}
                </dd>
              </div>
              {alert.message && (
                <p className="t-secondary line-clamp-2 pt-1">{alert.message}</p>
              )}
            </dl>

            <button onClick={handleProceed} className="btn btn-primary w-full">
              Check it
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AlertNotification;
