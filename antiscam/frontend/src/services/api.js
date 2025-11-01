import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Analyze transaction through all agents
export const analyzeTransaction = async (transactionData) => {
  try {
    // Get current time
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    // Prepare payload matching backend expectations
    const payload = {
      receiver: transactionData.upiId || transactionData.receiver,
      amount: parseFloat(transactionData.amount),
      reason: transactionData.message || transactionData.reason || '',
      time: transactionData.time || timeStr,
      user_id: transactionData.user_id || `user_${Date.now()}`, // Generate user ID if not provided
      typing_speed: transactionData.typing_speed || null,
      hesitation_count: transactionData.hesitation_count || null
    };

    const response = await api.post('/api/analyze', payload);
    return response.data;
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    throw error;
  }
};

// Report a scam
export const reportScam = async (reportData) => {
  try {
    const payload = {
      receiver: reportData.receiver || reportData.upiId,
      user_id: reportData.user_id || `user_${Date.now()}`,
      reason: reportData.reason || 'Reported scam'
    };

    const response = await api.post('/api/report', payload);
    return response.data;
  } catch (error) {
    console.error('Error reporting scam:', error);
    throw error;
  }
};

// Get transaction history
export const getTransactionHistory = async (userId) => {
  try {
    const response = await api.get(`/api/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

// Complete transaction (after PIN confirmation)
export const completeTransaction = async (transactionData) => {
  try {
    const response = await api.post('/api/complete-transaction', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error completing transaction:', error);
    throw error;
  }
};

// Submit feedback after transaction
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/api/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export default api;

