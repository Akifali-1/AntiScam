import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

/**
 * Asked after every completed transfer, whatever the score — a transfer the
 * agents read as safe can still turn out to be a scam, and that is the most
 * valuable signal we can collect. So the question stays neutral.
 */
const FeedbackModal = ({ isOpen, onClose, onSubmit, receiver, riskScore }) => {
  const [wasScam, setWasScam] = useState(null);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (wasScam !== null) {
      onSubmit({ was_scam: wasScam, comment: comment.trim() || undefined });
      setWasScam(null);
      setComment('');
    }
  };

  const handleClose = () => {
    setWasScam(null);
    setComment('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="feedback-modal">
        <DialogTitle className="sr-only">Was this transfer a scam?</DialogTitle>
        <DialogDescription className="sr-only">
          Tell us whether this transfer turned out to be a scam.
        </DialogDescription>

        <div className="mb-6">
          <h2 className="t-section mb-2">Did you send it, or stop?</h2>
          <p className="t-secondary">
            This transfer to <span className="t-technical text-ink">{receiver || 'recipient'}</span> scored{' '}
            <span className="tnum text-ink">{riskScore ?? '—'}</span> out of 100.
          </p>
        </div>

        <div className="mb-6">
          <p className="t-label mb-3">Was it actually a scam?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWasScam(true)}
              data-testid="feedback-yes"
              className={`btn flex-1 ${wasScam === true ? 'btn-primary' : 'btn-secondary'}`}
            >
              <XCircle className="w-4 h-4" />
              Yes, a scam
            </button>
            <button
              type="button"
              onClick={() => setWasScam(false)}
              data-testid="feedback-no"
              className={`btn flex-1 ${wasScam === false ? 'btn-primary' : 'btn-secondary'}`}
            >
              <CheckCircle className="w-4 h-4" />
              No, legitimate
            </button>
          </div>
        </div>

        {wasScam !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden mb-6"
          >
            <label htmlFor="feedback-comment" className="t-label block mb-2">
              Anything worth adding?
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What happened?"
              className="field resize-none"
              rows={3}
              data-testid="feedback-comment"
            />
          </motion.div>
        )}

        <div className="flex gap-2">
          <button type="button" onClick={handleClose} className="btn btn-secondary flex-1">
            Skip
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={wasScam === null}
            className="btn btn-primary flex-1"
          >
            Submit
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
