import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';

const TransactionForm = ({ onAnalyze, isAnalyzing, initialData }) => {
  const [formData, setFormData] = useState({
    upiId: initialData?.upi_id || initialData?.upiId || '',
    amount: initialData?.amount || '',
    message: initialData?.message || ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        upiId: initialData.upi_id || initialData.upiId || '',
        amount: initialData.amount || '',
        message: initialData.message || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.upiId && formData.amount) {
      onAnalyze(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card card-pad"
      data-testid="transaction-form"
    >
      <h2 className="t-section mb-1">The transfer</h2>
      <p className="t-secondary mb-6">
        Enter it the way it reached you — the UPI ID and whatever they told you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="upi" className="t-label block mb-1.5">Receiver UPI ID</label>
          <Input
            id="upi"
            data-testid="upi-id-input"
            type="text"
            placeholder="example@okaxis"
            value={formData.upiId}
            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
            className="h-10 t-technical"
            required
            disabled={isAnalyzing}
          />
        </div>

        <div>
          <label htmlFor="amount" className="t-label block mb-1.5">Amount (₹)</label>
          <Input
            id="amount"
            data-testid="amount-input"
            type="number"
            placeholder="1000"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="h-10 tnum"
            required
            disabled={isAnalyzing}
          />
        </div>

        <div>
          <label htmlFor="message" className="t-label block mb-1.5">Message</label>
          <Textarea
            id="message"
            data-testid="message-input"
            placeholder="What did they say this was for?"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="min-h-[92px]"
            disabled={isAnalyzing}
          />
        </div>

        <button
          data-testid="analyze-btn"
          type="submit"
          disabled={isAnalyzing || !formData.upiId || !formData.amount}
          className="btn btn-primary w-full h-10"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 spin" />
              Reading it…
            </>
          ) : (
            'Analyse transaction'
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default TransactionForm;
