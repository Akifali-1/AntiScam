/**
 * Test connection to backend API
 * Run this from browser console or add to a test page
 */

export const testBackendConnection = async () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  console.log('🔍 Testing backend connection...');
  console.log(`API URL: ${API_BASE_URL}`);
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok) {
      console.log('✅ Backend is running!', healthData);
    } else {
      console.error('❌ Backend health check failed');
      return false;
    }
    
    // Test analyze endpoint with sample data
    const testData = {
      receiver: 'test@upi',
      amount: 1000,
      reason: 'test transaction',
      user_id: 'test_user',
      time: '12:00 PM'
    };
    
    console.log('🔍 Testing /api/analyze endpoint...');
    const analyzeResponse = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    if (analyzeResponse.ok) {
      const analyzeData = await analyzeResponse.json();
      console.log('✅ Analyze endpoint works!', analyzeData);
      return true;
    } else {
      const errorData = await analyzeResponse.json();
      console.error('❌ Analyze endpoint failed:', errorData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.error('Make sure backend is running on http://localhost:5000');
    return false;
  }
};

// Auto-run in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to auto-test on load
  // testBackendConnection();
}

