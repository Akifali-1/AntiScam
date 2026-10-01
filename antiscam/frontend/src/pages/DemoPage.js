import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TransactionForm from '../components/TransactionForm';
import ResultsModal from '../components/ResultsModal';
import PINEntry from '../components/PINEntry';
import FeedbackModal from '../components/FeedbackModal';
import RealTimeAnalysis from '../components/RealTimeAnalysis';
import { analyzeTransaction as analyzeTransactionAPI, completeTransaction, submitFeedback } from '../services/api';
import { getToken } from '../services/auth';
import { toast } from 'sonner';
import { useWebSocket } from '../hooks/useWebSocket';

const DemoPage = ({ onLogout, darkMode, toggleDarkMode }) => {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showProceedWarning, setShowProceedWarning] = useState(false);
  const [showPINEntry, setShowPINEntry] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [completedTxId, setCompletedTxId] = useState(null);

  // WebSocket hook for real-time features
  // DemoPage is a protected route, so user is always authenticated
  const {
    alerts,
    isConnected,
    dismissAlert,
    analysisResults,
    clearAnalysisResults,
    joinUserRoom,
    leaveUserRoom,
    requestRecentTransactions
  } = useWebSocket(true);

  const [userId] = useState(() => {
    // Generate persistent user ID
    let uid = localStorage.getItem('figment_user_id');
    if (!uid) {
      uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('figment_user_id', uid);
    }
    return uid;
  });

  // Join user room when component mounts
  useEffect(() => {
    if (userId) {
      joinUserRoom(userId);

      // Request recent transactions
      requestRecentTransactions(userId, 5);
    }

    return () => {
      if (userId) {
        leaveUserRoom(userId);
      }
    };
  }, [userId]);

  const handleAnalyze = async (formData) => {
    setIsAnalyzing(true);
    setShowResults(false);
    clearAnalysisResults(); // Clear previous analysis results

    // Check if user is authenticated
    const token = getToken();
    if (!token) {
      toast.error('Please log in to analyze transactions.');
      setIsAnalyzing(false);
      return;
    }

    // Add user_id to transaction data
    const transactionData = {
      ...formData,
      user_id: userId
    };
    setCurrentTransaction(transactionData);

    try {
      // Call backend API
      const analysisResults = await analyzeTransactionAPI(transactionData);
      setResults(analysisResults);
      setShowResults(true);
    } catch (error) {
      // Extract detailed error message
      let errorMessage = 'Failed to analyze transaction. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        errorMessage = errorData?.error || errorData?.message || `Server error: ${error.response.status}`;
        console.error('Analysis error response:', error.response.status, errorData);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
        console.error('Analysis error - no response:', error.request);
      } else {
        // Error setting up the request
        errorMessage = error.message || errorMessage;
        console.error('Analysis error:', error.message);
      }
      
      toast.error(errorMessage);
      console.error('Full error object:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCancel = () => {
    toast.success('Transaction cancelled successfully!');
    setShowResults(false);
    setResults(null);
    setCurrentTransaction(null);
    clearAnalysisResults(); // Clear real-time analysis results
  };

  const handleProceed = () => {
    // Close results modal first, then show warning
    setShowResults(false);
    clearAnalysisResults(); // Clear real-time analysis results
    // Small delay to allow modal close animation
    setTimeout(() => {
      setShowProceedWarning(true);
    }, 100);
  };

  const handleProceedConfirm = () => {
    // User confirmed - show PIN entry
    setShowProceedWarning(false);
    // Small delay to allow warning close animation
    setTimeout(() => {
      setShowPINEntry(true);
    }, 100);
  };

  const handlePINComplete = async (pin) => {
    // PIN entered - complete transaction
    setShowPINEntry(false);

    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const txData = {
        receiver: currentTransaction.upiId,
        amount: parseFloat(currentTransaction.amount),
        reason: currentTransaction.message || '',
        user_id: userId,
        time: timeStr,
        risk_score: results?.overallRisk || 0
      };

      const result = await completeTransaction(txData);
      setCompletedTxId(result.transaction_id);

      toast.success('Transaction completed successfully!');

      // Always show feedback after payment, regardless of risk score
      // This allows users to report scams even if agents didn't flag high risk
      setTimeout(() => {
        setShowFeedback(true);
      }, 1000);
    } catch (error) {
      toast.error('Failed to complete transaction. Please try again.');
      console.error('Transaction completion error:', error);
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      // Prepare feedback payload
      const feedbackPayload = {
        transaction_id: completedTxId,
        receiver: currentTransaction.upiId,
        user_id: userId,
        was_scam: feedbackData.was_scam,
        comment: feedbackData.comment
      };

      // If reporting as scam, ALWAYS include agent outputs and transaction data for threat intel
      // This ensures the data is available even if results state was cleared
      if (feedbackData.was_scam) {
        const transactionData = {
          receiver: currentTransaction.upiId,
          amount: parseFloat(currentTransaction.amount),
          reason: currentTransaction.message || '',
          user_id: userId,
          time: currentTransaction.time || new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          typing_speed: currentTransaction.typing_speed || null,
          hesitation_count: currentTransaction.hesitation_count || null
        };

        // Try to get agent outputs from results, or reconstruct from stored data
        let agentOutputs = [];
        if (results && results._agentOutputs) {
          agentOutputs = results._agentOutputs;
        } else if (results && results.agents) {
          // Fallback: reconstruct from agent results in response
          agentOutputs = results.agents.map(agent => ({
            risk_score: agent.riskScore || 0,
            message: agent.message || '',
            details: agent.details || ''
          }));
        } else {
          // Last resort: create basic agent outputs from overall risk
          // Backend will handle this better, but we provide something
          const overallRisk = results?.overallRisk || 50;
          agentOutputs = [
            { risk_score: overallRisk * 0.25 },
            { risk_score: overallRisk * 0.25 },
            { risk_score: overallRisk * 0.25 },
            { risk_score: overallRisk * 0.25 }
          ];
        }

        feedbackPayload.agent_outputs = agentOutputs;
        feedbackPayload.transaction = transactionData;
        
        console.log('📦 Feedback payload with threat intel data:', {
          has_agent_outputs: agentOutputs.length > 0,
          has_transaction: !!transactionData,
          receiver: transactionData.receiver
        });
      }

      await submitFeedback(feedbackPayload);

      if (feedbackData.was_scam) {
        toast.success('Thank you for reporting! This helps protect others.');
      } else {
        toast.success('Thank you for your feedback!');
      }

      setShowFeedback(false);

      // Reset everything
      setTimeout(() => {
        setResults(null);
        setCurrentTransaction(null);
        setCompletedTxId(null);
      }, 1000);
    } catch (error) {
      // Extract detailed error message
      let errorMessage = 'Failed to submit feedback. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const errorData = error.response.data;
        errorMessage = errorData?.error || errorData?.message || `Server error: ${error.response.status}`;
        console.error('Feedback error response:', error.response.status, errorData);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to server. Please check if the backend is running.';
        console.error('Feedback error - no response:', error.request);
      } else {
        // Error setting up the request
        errorMessage = error.message || errorMessage;
        console.error('Feedback error:', error.message);
      }
      
      toast.error(errorMessage);
      console.error('Full error object:', error);
    }
  };

  const handleReport = async () => {
    if (!currentTransaction || !results) return;

    try {
      // Call backend API to report scam with agent outputs and transaction data
      const { reportScam } = await import('../services/api');
      
      // Prepare transaction data for threat intel
      const transactionData = {
        receiver: currentTransaction.upiId,
        amount: parseFloat(currentTransaction.amount),
        reason: currentTransaction.message || '',
        user_id: userId,
        time: currentTransaction.time || new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        typing_speed: currentTransaction.typing_speed || null,
        hesitation_count: currentTransaction.hesitation_count || null
      };

      await reportScam({
        receiver: currentTransaction.upiId,
        reason: `High risk scam detected (Risk: ${results?.overallRisk || 'N/A'}%)`,
        agent_outputs: results._agentOutputs || [], // Raw agent outputs from analysis
        transaction: transactionData
      });

      toast.success('Scam reported! This will help improve our detection system.');
    } catch (error) {
      toast.error('Failed to report scam. Please try again.');
      console.error('Report error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} darkMode={darkMode} onDarkModeToggle={toggleDarkMode} />

      <section className="pt-24 pb-20 px-6" data-testid="demo-section">
        <div className="max-w-4xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-10"
          >
            <h1 className="t-page mb-2">Run a transfer through it</h1>
            <p className="text-ink-muted">
              Enter the details as you'd receive them, and watch the four agents read it.
            </p>
          </motion.header>

          <TransactionForm
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            initialData={{
              upi_id: searchParams.get('upi_id') || '',
              amount: searchParams.get('amount') || '',
              message: searchParams.get('message') || ''
            }}
          />

          {/* Real-time Analysis Results */}
          <RealTimeAnalysis analysisResults={analysisResults} darkMode={darkMode} />

          {/* Analyzing Animation */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="card card-pad mt-6 flex items-center gap-4"
                data-testid="analyzing-indicator"
              >
                <div className="w-7 h-7 rounded-full border-2 border-border-strong border-t-ink spin shrink-0" />
                <div>
                  <p className="text-ui font-medium text-ink">Reading the transfer…</p>
                  <p className="t-secondary">Four agents are scoring it now.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ResultsModal
            isOpen={showResults}
            results={results}
            onCancel={handleCancel}
            onProceed={handleProceed}
            onReport={handleReport}
            onClose={() => setShowResults(false)}
            darkMode={darkMode}
          />

          {/* Proceed Warning Dialog */}
          <AnimatePresence mode="wait">
            {showProceedWarning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50"
                onClick={() => setShowProceedWarning(false)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  onClick={(e) => e.stopPropagation()}
                  className="card p-6 max-w-md w-full mx-4"
                >
                  <h3 className="t-section mb-2">This one looks like a scam</h3>
                  <p className="t-secondary mb-5">
                    The agents scored this transfer {results?.overallRisk || 'high'} out of 100.
                    Sending it anyway is your call.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowProceedWarning(false)}
                      className="btn btn-secondary flex-1"
                    >
                      Go back
                    </button>
                    <button
                      onClick={handleProceedConfirm}
                      className="btn btn-danger flex-1"
                    >
                      Send anyway
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PIN Entry */}
          <AnimatePresence mode="wait">
            {showPINEntry && (
              <PINEntry
                isOpen={showPINEntry}
                onComplete={handlePINComplete}
                onCancel={() => {
                  setShowPINEntry(false);
                  // Return to results modal
                  setTimeout(() => {
                    setShowResults(true);
                  }, 100);
                }}
                receiver={currentTransaction?.upiId}
                amount={currentTransaction?.amount}
                darkMode={darkMode}
              />
            )}
          </AnimatePresence>

          {/* Feedback Modal */}
          <FeedbackModal
            isOpen={showFeedback}
            onClose={() => {
              setShowFeedback(false);
              setResults(null);
              setCurrentTransaction(null);
              setCompletedTxId(null);
            }}
            onSubmit={handleFeedbackSubmit}
            receiver={currentTransaction?.upiId}
            riskScore={results?.overallRisk}
            darkMode={darkMode}
          />

          {/* Demo Tips */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10"
          >
            <h3 className="t-card mb-3">Two to try</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="note note-red">
                <p className="text-ui font-medium mb-2">Reads as a scam</p>
                <p className="t-technical text-ink-muted">kycupdate@okaxis</p>
                <p className="t-technical text-ink-muted">"KYC verification fee"</p>
              </div>
              <div className="note note-teal">
                <p className="text-ui font-medium mb-2">Reads as ordinary</p>
                <p className="t-technical text-ink-muted">friend@paytm</p>
                <p className="t-technical text-ink-muted">"Lunch split"</p>
              </div>
            </div>
          </motion.section>
        </div>
      </section>
    </div>
  );
};

export default DemoPage;
