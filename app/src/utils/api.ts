import axios, { AxiosError } from "axios";
import type {
  AnalyzeTransactionPayload,
  CompleteTransactionPayload,
  FeedbackPayload,
  RiskResult,
  TransactionHistory,
  ApiResponse,
  AnalyzeResponse,
} from "../types/api";

const API_BASE = __DEV__
  ? "http://10.0.2.2:5000/api" // Android emulator -> host machine
  : "https://your-api-domain.com/api"; // Production API

const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
client.interceptors.request.use(
  (config) => {
    // Get token from AsyncStorage if available
    // Uncomment when you have token storage implemented
    // import AsyncStorage from '@react-native-async-storage/async-storage';
    // const token = await AsyncStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    // For testing without auth, you might need to temporarily disable @token_required in backend
    // Or add a dummy token for testing:
    // config.headers.Authorization = `Bearer test_token`;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error for debugging
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

// Error handler
const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    const errorMessage = axiosError.response?.data?.error || 
                        axiosError.response?.data?.message || 
                        axiosError.message || 
                        "Network error occurred";
    
    // Preserve the original error with response data
    const err = new Error(errorMessage);
    (err as any).response = axiosError.response;
    (err as any).status = axiosError.response?.status;
    throw err;
  }
  if (error instanceof Error) {
    throw error;
  }
  throw new Error("An unknown error occurred");
};

// API functions
export const analyzeTransaction = async (
  payload: AnalyzeTransactionPayload
): Promise<AnalyzeResponse> => {
  try {
    // Ensure amount is a number, not string
    const requestPayload: any = {
      receiver: payload.receiver,
      amount: typeof payload.amount === 'string' ? parseFloat(payload.amount) : payload.amount,
      user_id: payload.user_id,
    };

    // Add optional fields
    if (payload.reason) {
      requestPayload.reason = payload.reason;
    } else if (payload.message) {
      requestPayload.reason = payload.message; // Backend accepts 'message' as 'reason'
    }
    
    if (payload.time) {
      requestPayload.time = payload.time;
    }
    
    if (payload.typing_speed !== undefined) {
      requestPayload.typing_speed = payload.typing_speed;
    }
    
    if (payload.hesitation_count !== undefined) {
      requestPayload.hesitation_count = payload.hesitation_count;
    }

    // Validate required fields before sending
    if (!requestPayload.receiver || requestPayload.receiver.trim() === '') {
      throw new Error('Receiver ID is required');
    }
    if (!requestPayload.user_id || requestPayload.user_id.trim() === '') {
      throw new Error('User ID is required');
    }
    if (!requestPayload.amount || isNaN(requestPayload.amount) || requestPayload.amount <= 0) {
      throw new Error('Valid amount is required');
    }

    // Ensure no caching - add timestamp if not present
    if (!requestPayload.time) {
      const now = new Date();
      requestPayload.time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    }

    console.log("=".repeat(50));
    console.log("[API] Sending analyze request to backend:");
    console.log("  Timestamp:", new Date().toISOString());
    console.log("  Payload:", JSON.stringify(requestPayload, null, 2));
    console.log("  Receiver:", requestPayload.receiver);
    console.log("  Amount:", requestPayload.amount);
    console.log("  Reason:", requestPayload.reason || "(none)");
    console.log("=".repeat(50));
    
    // Make request with cache-busting
    const res = await client.post<any>("/analyze", requestPayload, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
    console.log("[API] Backend response received:");
    console.log("  Response timestamp:", new Date().toISOString());
    console.log("  Overall Risk (raw):", res.data.overallRisk);
    console.log("  Agents count:", res.data.agents?.length || 0);
    
    // Log each agent's response with full details
    if (res.data.agents && res.data.agents.length > 0) {
      console.log("[API] Agent Results (RAW FROM BACKEND):");
      res.data.agents.forEach((agent: any, index: number) => {
        console.log(`  [${index + 1}] ${agent.name}:`);
        console.log(`      Risk Score: ${agent.riskScore}`);
        console.log(`      Message: "${agent.message}"`);
        console.log(`      Details: "${agent.details}"`);
        if (agent.evidence && agent.evidence.length > 0) {
          console.log(`      Evidence: [${agent.evidence.join(", ")}]`);
        }
        console.log(`      Color: ${agent.color}`);
        console.log(`      Icon: ${agent.icon}`);
      });
    } else {
      console.warn("[API] WARNING: No agents in response!");
    }
    console.log("=".repeat(50));
    
    // Get agents from response
    const agents = res.data.agents || [];
    
    // Calculate overallRisk from agents if backend returns invalid value or calculate from agent scores
    let overallRisk = res.data.overallRisk;
    
    // Log raw agent scores before any calculation
    console.log("[API] Raw agent scores from backend:");
    agents.forEach((agent: any) => {
      const score = typeof agent.riskScore === 'number' ? agent.riskScore : parseFloat(agent.riskScore) || 0;
      console.log(`  ${agent.name}: ${score} (type: ${typeof agent.riskScore})`);
    });

    // If overallRisk is invalid or suspicious (e.g., always 42), recalculate from agents
    if (agents.length > 0) {
      const agentScores = agents.map((agent: any) => {
        const score = typeof agent.riskScore === 'number' ? agent.riskScore : parseFloat(agent.riskScore) || 0;
        return score;
      }).filter((score: number) => !isNaN(score) && isFinite(score));
      
      console.log(`[API] Valid agent scores: [${agentScores.join(", ")}]`);
      
      if (agentScores.length > 0) {
        // Calculate weighted average similar to backend
        const weights: { [key: string]: number } = {
          'Pattern Agent': 0.30,
          'Network Agent': 0.35,
          'Behavior Agent': 0.25,
          'Biometric Agent': 0.10,
        };
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        agents.forEach((agent: any) => {
          const weight = weights[agent.name] || (1 / agents.length); // Default equal weight
          const score = typeof agent.riskScore === 'number' ? agent.riskScore : parseFloat(agent.riskScore) || 0;
          if (!isNaN(score) && isFinite(score)) {
            weightedSum += score * weight;
            totalWeight += weight;
            console.log(`[API] Weighted calculation: ${agent.name} = ${score} * ${weight} = ${(score * weight).toFixed(2)}`);
          }
        });
        
        let calculatedScore = totalWeight > 0 ? weightedSum / totalWeight : 
                             agentScores.reduce((a: number, b: number) => a + b, 0) / agentScores.length;
        
        console.log(`[API] Initial calculated score: ${calculatedScore.toFixed(2)}`);
        
        // Boost score if multiple agents flag high risk (like backend)
        const highRiskCount = agentScores.filter((s: number) => s >= 70).length;
        console.log(`[API] High risk agents (>=70): ${highRiskCount}`);
        
        if (highRiskCount >= 2) {
          calculatedScore = Math.min(calculatedScore * 1.15, 100);
          console.log(`[API] Applied 15% boost: ${calculatedScore.toFixed(2)}`);
        } else if (highRiskCount === 1 && calculatedScore >= 50) {
          calculatedScore = Math.min(calculatedScore * 1.10, 100);
          console.log(`[API] Applied 10% boost: ${calculatedScore.toFixed(2)}`);
        }
        
        calculatedScore = Math.round(calculatedScore * 10) / 10;
        
        // Always use calculated score if backend returns suspicious value OR if scores are the same
        const backendScore = typeof overallRisk === 'number' ? overallRisk : (overallRisk?.score || 0);
        const allScoresSame = agentScores.length > 1 && agentScores.every((score: number) => Math.abs(score - agentScores[0]) < 0.01);
        
        // Always prefer calculated score over backend if they differ or if backend looks suspicious
        if (typeof overallRisk === 'number' && (overallRisk === 42 || isNaN(overallRisk) || allScoresSame || Math.abs(overallRisk - calculatedScore) > 5)) {
          console.log(`[API] Using calculated score: backend=${backendScore}, calculated=${calculatedScore.toFixed(2)}, allSame=${allScoresSame}`);
          overallRisk = calculatedScore;
        } else if (typeof overallRisk === 'number') {
          // Use backend score but verify it's reasonable
          const scoreDiff = Math.abs(overallRisk - calculatedScore);
          console.log(`[API] Score comparison: backend=${overallRisk}, calculated=${calculatedScore.toFixed(2)}, diff=${scoreDiff.toFixed(2)}`);
          if (scoreDiff > 20) {
            console.warn('[API] OverallRisk mismatch - using calculated:', { backend: overallRisk, calculated: calculatedScore });
            overallRisk = calculatedScore;
          }
        } else {
          overallRisk = calculatedScore;
        }
      } else {
        console.warn('[API] No valid agent scores found, using backend overallRisk as-is');
      }
    }
    
    // Convert overallRisk to object with score and label
    if (typeof overallRisk === 'number') {
      let label = 'low';
      if (overallRisk >= 70) {
        label = 'high';
      } else if (overallRisk >= 40) {
        label = 'medium';
      }
      
      overallRisk = {
        score: overallRisk,
        label: label,
      };
    } else if (!overallRisk || typeof overallRisk !== 'object') {
      // Fallback if overallRisk is still invalid
      overallRisk = {
        score: 0,
        label: 'low',
      };
    }
    
    console.log("[API] Final calculated risk:");
    console.log("  Score:", overallRisk.score);
    console.log("  Label:", overallRisk.label);
    console.log("  Agent Count:", agents.length);
    console.log("=".repeat(50));
    
    return {
      overallRisk: overallRisk,
      agents: agents,
    };
  } catch (error) {
    console.error('Analyze transaction error:', error);
    return handleError(error); // handleError throws, but TypeScript needs this for type checking
  }
};

export const completeTransaction = async (
  payload: CompleteTransactionPayload
): Promise<ApiResponse> => {
  try {
    const requestPayload: any = {
      receiver: payload.receiver,
      amount: typeof payload.amount === 'string' ? parseFloat(payload.amount) : payload.amount,
      user_id: payload.user_id,
    };

    // Add optional fields
    if (payload.reason) {
      requestPayload.reason = payload.reason;
    } else if (payload.message) {
      requestPayload.reason = payload.message;
    }
    
    if (payload.time) {
      requestPayload.time = payload.time;
    }
    
    if (payload.risk_score !== undefined) {
      requestPayload.risk_score = payload.risk_score;
    } else if (payload.riskResult?.score !== undefined) {
      requestPayload.risk_score = payload.riskResult.score;
    }

    // Validate required fields
    if (!requestPayload.receiver || requestPayload.receiver.trim() === '') {
      throw new Error('Receiver ID is required');
    }
    if (!requestPayload.user_id || requestPayload.user_id.trim() === '') {
      throw new Error('User ID is required');
    }
    if (!requestPayload.amount || isNaN(requestPayload.amount) || requestPayload.amount <= 0) {
      throw new Error('Valid amount is required');
    }

    console.log('Sending complete transaction request:', requestPayload);
    const res = await client.post<ApiResponse>("/complete-transaction", requestPayload);
    
    // Return response with transaction_id if available
    return {
      success: res.data.success ?? true,
      message: res.data.message || 'Transaction completed successfully',
      transaction_id: res.data.transaction_id,
      ...res.data,
    };
  } catch (error) {
    console.error('Complete transaction error:', error);
    handleError(error);
    throw error; // Re-throw to let caller handle
  }
};

export const sendFeedback = async (payload: FeedbackPayload): Promise<ApiResponse> => {
  try {
    const requestPayload: any = {
      was_scam: payload.was_scam,
    };

    if (payload.receiver) {
      requestPayload.receiver = payload.receiver;
    }
    
    if (payload.user_id) {
      requestPayload.user_id = payload.user_id;
    }
    
    if (payload.transaction_id) {
      requestPayload.transaction_id = payload.transaction_id;
    }
    
    if (payload.comment) {
      requestPayload.comment = payload.comment;
    }

    // Validate required fields
    if (!requestPayload.receiver) {
      throw new Error('Receiver is required');
    }
    if (requestPayload.was_scam === undefined || requestPayload.was_scam === null) {
      throw new Error('was_scam field is required');
    }

    console.log('Sending feedback request:', requestPayload);
    const res = await client.post<ApiResponse>("/feedback", requestPayload);
  return res.data;
  } catch (error) {
    console.error('Send feedback error:', error);
    handleError(error);
    throw error; // Re-throw to let caller handle
  }
};

// Report scam endpoint (separate from feedback)
export const reportScam = async (payload: {
  receiver: string;
  user_id?: string;
  reason?: string;
}): Promise<ApiResponse> => {
  try {
    const requestPayload: any = {
      receiver: payload.receiver,
    };

    if (payload.user_id) {
      requestPayload.user_id = payload.user_id;
    }
    
    if (payload.reason) {
      requestPayload.reason = payload.reason;
    }

    // Validate required fields
    if (!requestPayload.receiver || requestPayload.receiver.trim() === '') {
      throw new Error('Receiver ID is required');
    }

    console.log('Sending report scam request:', requestPayload);
    const res = await client.post<ApiResponse>("/report", requestPayload);
  return res.data;
  } catch (error) {
    console.error('Report scam error:', error);
    handleError(error);
    throw error; // Re-throw to let caller handle
  }
};

export const fetchHistory = async (user_id: string): Promise<TransactionHistory> => {
  try {
    console.log(`[API] Fetching transaction history for user: ${user_id}`);
    const res = await client.get<{ transactions: any[] }>(`/history/${user_id}`);
    
    // Backend returns {transactions: [...]} directly
    const transactions = res.data.transactions || [];
    
    console.log(`[API] Received ${transactions.length} transactions from backend`);
    
    // Calculate totals from transactions
    let totalAmount = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let monthAmount = 0;
    
    transactions.forEach((tx: any) => {
      const amount = typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0;
      totalAmount += amount;
      
      // Check if transaction is in current month
      if (tx.created_at) {
        try {
          const txDate = new Date(tx.created_at);
          if (txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
            monthAmount += amount;
          }
        } catch (e) {
          // Ignore date parsing errors
        }
      }
    });
    
    // Format amounts with Indian number formatting
    const formatCurrency = (amount: number) => {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    // Convert to expected format with risk score mapping
    const mappedTransactions = transactions.map((tx: any, index: number) => {
      const riskScore = tx.risk_score || 0;
      let riskLabel: "low" | "medium" | "high" = "low";
      if (riskScore >= 70) {
        riskLabel = "high";
      } else if (riskScore >= 40) {
        riskLabel = "medium";
      }
      
      // Format time
      let timeDisplay = "Unknown";
      if (tx.created_at) {
        try {
          const txDate = new Date(tx.created_at);
          const now = new Date();
          const diffMs = now.getTime() - txDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          if (diffMins < 1) {
            timeDisplay = "Just now";
          } else if (diffMins < 60) {
            timeDisplay = `${diffMins}m ago`;
          } else if (diffHours < 24) {
            timeDisplay = `${diffHours}h ago`;
          } else if (diffDays === 1) {
            timeDisplay = "Yesterday";
          } else if (diffDays < 7) {
            timeDisplay = `${diffDays}d ago`;
          } else {
            timeDisplay = txDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          }
        } catch (e) {
          timeDisplay = "Unknown";
        }
      }
      
      return {
        id: tx.id || `tx_${index}_${Date.now()}`,
        name: tx.receiver || "Unknown",
        time: timeDisplay,
        amount: formatCurrency(typeof tx.amount === 'number' ? tx.amount : parseFloat(tx.amount) || 0),
        risk: riskLabel,
      };
    });
    
    const result = {
      totalBalance: formatCurrency(totalAmount),
      currentMonthAmount: formatCurrency(monthAmount),
      transactions: mappedTransactions,
    };
    
    console.log(`[API] History processed: ${mappedTransactions.length} transactions, Total: ${result.totalBalance}, Month: ${result.currentMonthAmount}`);
    
    return result;
  } catch (error) {
    console.error('[API] Fetch history error:', error);
    handleError(error);
    throw error; // Re-throw to let caller handle fallback
  }
};

export default client;
