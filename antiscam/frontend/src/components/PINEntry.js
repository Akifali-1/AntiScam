import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';

const PINEntry = ({ isOpen, onComplete, onCancel, receiver, amount }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;

    const newPin = [...pin];
    newPin[index] = value.replace(/\D/g, '');
    setPin(newPin);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newPin = [...pin];
    for (let i = 0; i < 6; i++) {
      newPin[i] = pastedData[i] || '';
    }
    setPin(newPin);
    if (pastedData.length >= 6) {
      inputRefs.current[5]?.focus();
    } else if (pastedData.length > 0) {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const pinString = pin.join('');
    if (pinString.length === 6) {
      onComplete(pinString);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 px-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        onClick={(e) => e.stopPropagation()}
        className="card p-8 w-full max-w-sm"
        data-testid="pin-entry-modal"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 rounded-md bg-surface-3 flex items-center justify-center">
            <Lock className="w-4 h-4 text-ink-muted" />
          </div>
          <div>
            <h2 className="t-card">Confirm transfer</h2>
            <p className="t-secondary">
              To <span className="t-technical">{receiver || 'recipient'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-7">
          <span className="stat-value">₹{amount || '0'}</span>
          <span className="t-secondary">leaving your account</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                aria-label={`PIN digit ${index + 1}`}
                className="w-full h-14 text-center text-lg tnum font-medium rounded-md border border-border-strong bg-surface text-ink focus:outline-none focus:border-focus focus:ring-[3px] focus:ring-blue-tint transition-colors"
                data-testid={`pin-input-${index}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="btn btn-secondary flex-1 h-10">
              Cancel
            </button>
            <button
              type="submit"
              disabled={pin.join('').length !== 6}
              className="btn btn-primary flex-1 h-10"
            >
              Confirm
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="t-secondary text-center">Demo — any six digits will do.</p>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default PINEntry;
