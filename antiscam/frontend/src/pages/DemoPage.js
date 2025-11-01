import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import TransactionForm from '../components/TransactionForm';
import ResultsModal from '../components/ResultsModal';
import { analyzeTransaction } from '../utils/mockData';
import { toast } from 'sonner';

const DemoPage = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleAnalyze = async (formData) => {
    setIsAnalyzing(true);
    setShowResults(false);
    
    setTimeout(() => {
      const analysisResults = analyzeTransaction(formData);
      setResults(analysisResults);
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  const handleCancel = () => {
    toast.success('Transaction cancelled successfully!');
    setShowResults(false);
    setResults(null);
  };

  const handleProceed = () => {
    toast.warning('Transaction processed (Demo mode - no actual payment made)');
    setShowResults(false);
    setResults(null);
  };

  const handleReport = () => {
    toast.success('Scam reported! Thank you for helping protect the community.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={onLogout} />
      <TopNav onMenuClick={() => setSidebarOpen(true)} />
      
      <section className="pt-32 pb-20 px-6" data-testid="demo-section">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">Try FIGMENT Live Demo</h1>
            <p className="text-gray-600 text-lg">Enter transaction details to see AI analysis in action</p>
          </motion.div>

          <TransactionForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

          {/* Analyzing Animation */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-8 glass p-8 rounded-2xl text-center"
                data-testid="analyzing-indicator"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-[#E0F7F4] border-t-[#00C896] rounded-full animate-spin"></div>
                  <div>
                    <p className="text-xl font-semibold text-[#00C896] mb-2">Analyzing Transaction...</p>
                    <p className="text-sm text-gray-600">AI agents are scanning for risks</p>
                  </div>
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
          />

          {/* Demo Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 glass p-6 rounded-2xl"
          >
            <h3 className="text-lg font-semibold text-blue-600 mb-3">💡 Try These Examples</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-gray-700 font-semibold mb-2">High Risk Example:</p>
                <p className="text-gray-600 font-mono text-xs">UPI: kycupdate@okaxis</p>
                <p className="text-gray-600 font-mono text-xs">Message: "KYC verification fee"</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-gray-700 font-semibold mb-2">Safe Transaction:</p>
                <p className="text-gray-600 font-mono text-xs">UPI: friend@paytm</p>
                <p className="text-gray-600 font-mono text-xs">Message: "Lunch split"</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default DemoPage;
