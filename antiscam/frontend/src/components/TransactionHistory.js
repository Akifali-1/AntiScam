import { useEffect, useState } from 'react';
import { getTransactionHistory } from '../services/api';

/** risk score -> the pill tone that carries its meaning. */
const tone = (score) => (score >= 70 ? 'red' : score >= 40 ? 'amber' : 'teal');

const TransactionHistory = ({ userId }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const response = await getTransactionHistory(userId);
        setTransactions(response.transactions || []);
        setError(null);
      } catch (err) {
        setError('Could not load transaction history');
        console.error('Error fetching transaction history:', err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div>
      <h2 className="t-section mb-4">Recent activity</h2>

      {loading && <p className="t-secondary py-8 text-center">Loading…</p>}

      {!loading && error && <div className="note note-red">{error}</div>}

      {!loading && !error && transactions.length === 0 && (
        <p className="t-secondary py-8 text-center">No transfers yet.</p>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="overflow-x-auto -mx-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Receiver</th>
                <th className="text-right">Amount</th>
                <th>Reason</th>
                <th className="text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="t-secondary tnum whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="t-technical">{tx.receiver}</td>
                  <td className="text-right tnum font-medium whitespace-nowrap">
                    ₹{Number(tx.amount || 0).toLocaleString()}
                  </td>
                  <td className="t-secondary max-w-[220px] truncate">{tx.reason || '—'}</td>
                  <td className="text-right">
                    <span className={`pill pill-${tone(tx.risk_score)} tnum`}>{tx.risk_score}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
