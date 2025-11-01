// Mock data for AI analysis and dashboard

export const analyzeTransaction = (formData) => {
    const { upiId, amount, message } = formData;
    
    // Scam patterns detection
    const scamKeywords = ['kyc', 'verification', 'fee', 'suspend', 'urgent', 'update', 'prize', 'won', 'lottery'];
    const hasScamKeyword = scamKeywords.some(keyword => 
      upiId.toLowerCase().includes(keyword) || message.toLowerCase().includes(keyword)
    );
    
    const isSuspiciousUPI = [
      'kycupdate@okaxis',
      'verification@paytm',
      'prize@bank',
      'urgent@upi'
    ].includes(upiId.toLowerCase());
  
    const isHighAmount = parseFloat(amount) > 5000;
    const isLateNight = new Date().getHours() >= 22 || new Date().getHours() <= 6;
  
    // Calculate risk scores
    let patternRisk = hasScamKeyword ? 95 : 15;
    let networkRisk = isSuspiciousUPI ? 99 : 20;
    let behaviorRisk = (isHighAmount ? 30 : 10) + (isLateNight ? 40 : 0);
    let biometricRisk = hasScamKeyword || isSuspiciousUPI ? 85 : 25;
  
    const overallRisk = Math.round((patternRisk + networkRisk + behaviorRisk + biometricRisk) / 4);
  
    return {
      overallRisk,
      agents: [
        {
          icon: '🕵️',
          name: 'Pattern Agent',
          message: hasScamKeyword ? 'Matches known scam pattern' : 'No suspicious patterns detected',
          riskScore: patternRisk,
          color: patternRisk >= 70 ? '#FF6B6B' : patternRisk >= 40 ? '#FFB946' : '#00FFB2',
          details: hasScamKeyword 
            ? 'This transaction contains keywords commonly used in UPI scams. Banks and legitimate services never ask for fees via UPI transfers.' 
            : 'Transaction message and receiver details do not match known scam patterns in our database.',
          evidence: hasScamKeyword ? [
            'Contains scam-related keywords',
            'Similar pattern to 234 reported scams',
            'Urgency language detected'
          ] : ['Clean transaction pattern', 'No red flags detected']
        },
        {
          icon: '🕸️',
          name: 'Network Agent',
          message: isSuspiciousUPI ? 'Receiver flagged multiple times' : 'Receiver has clean record',
          riskScore: networkRisk,
          color: networkRisk >= 70 ? '#FF6B6B' : networkRisk >= 40 ? '#FFB946' : '#00FFB2',
          details: isSuspiciousUPI 
            ? 'This UPI ID has been reported 12 times by other users in the network. Multiple complaints of fraudulent behavior.' 
            : 'This receiver has no reported incidents in our community database.',
          evidence: isSuspiciousUPI ? [
            '12 scam reports from users',
            'Active in last 48 hours',
            'Multiple similar complaints'
          ] : ['No reports found', 'Clean transaction history']
        },
        {
          icon: '🔍',
          name: 'Behavior Agent',
          message: isLateNight ? 'Unusual transaction time' : 'Normal transaction behavior',
          riskScore: behaviorRisk,
          color: behaviorRisk >= 70 ? '#FF6B6B' : behaviorRisk >= 40 ? '#FFB946' : '#00FFB2',
          details: isLateNight 
            ? 'Scammers often pressure victims to make late-night transfers. Take time to verify before proceeding.' 
            : 'Transaction timing and amount fall within your normal spending patterns.',
          evidence: isLateNight ? [
            'Late night transaction (high risk period)',
            isHighAmount ? 'Above typical transaction amount' : 'Amount within range'
          ] : ['Normal transaction hours', 'Amount consistent with history']
        },
        {
          icon: '🎭',
          name: 'Biometric Agent',
          message: hasScamKeyword || isSuspiciousUPI ? 'Signs of rushed decision' : 'Normal decision pattern',
          riskScore: biometricRisk,
          color: biometricRisk >= 70 ? '#FF6B6B' : biometricRisk >= 40 ? '#FFB946' : '#00FFB2',
          details: hasScamKeyword || isSuspiciousUPI 
            ? 'Multiple pressure indicators detected. Scammers use urgency and fear to bypass rational thinking. Take a moment to verify.' 
            : 'No signs of pressure or rushed decision making detected.',
          evidence: hasScamKeyword || isSuspiciousUPI ? [
            'Urgency keywords present',
            'Pressure tactic detected',
            'Quick decision prompted'
          ] : ['Calm decision environment', 'No rush detected']
        }
      ]
    };
  };
  
  export const mockDashboardData = {
    totalAnalyzed: 1800,
    scamsPrevented: 342,
    userReports: 567,
    accuracy: 94
  };
  
  export const mockRecentReports = [
    {
      upiId: 'kycupdate@okaxis',
      riskScore: 99,
      riskColor: '#FF6B6B',
      type: 'KYC Scam',
      reports: 12,
      lastSeen: '2 hrs ago'
    },
    {
      upiId: 'verification@paytm',
      riskScore: 97,
      riskColor: '#FF6B6B',
      type: 'Verification Scam',
      reports: 8,
      lastSeen: '5 hrs ago'
    },
    {
      upiId: 'prize9876@bank',
      riskScore: 95,
      riskColor: '#FF6B6B',
      type: 'Prize/Lottery Scam',
      reports: 15,
      lastSeen: '1 day ago'
    },
    {
      upiId: 'refund@okicici',
      riskScore: 89,
      riskColor: '#FF6B6B',
      type: 'Refund Scam',
      reports: 6,
      lastSeen: '2 days ago'
    },
    {
      upiId: 'support123@hdfc',
      riskScore: 85,
      riskColor: '#FFB946',
      type: 'Fake Support',
      reports: 4,
      lastSeen: '3 days ago'
    }
  ];
  
  export const mockUserActivity = [
    {
      upiId: 'kycupdate@okaxis',
      amount: 500,
      status: 'Blocked',
      statusColor: '#FF6B6B',
      message: 'KYC verification fee',
      time: '2 hrs ago'
    },
    {
      upiId: 'friend@paytm',
      amount: 200,
      status: 'Safe',
      statusColor: '#00FFB2',
      message: 'Lunch split',
      time: '1 day ago'
    },
    {
      upiId: 'merchant@shop',
      amount: 1500,
      status: 'Safe',
      statusColor: '#00FFB2',
      message: 'Shopping',
      time: '2 days ago'
    }
  ];
  