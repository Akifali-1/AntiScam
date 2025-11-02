export interface Transaction {
  id: number | string;
  name: string;
  time: string;
  amount: string;
  risk: "low" | "medium" | "high";
  receiver?: string; // UPI ID
  reason?: string; // Transaction description
  risk_score?: number; // Original risk score from backend
}

export interface TransactionHistory {
  totalBalance: string;
  currentMonthAmount: string;
  transactions: Transaction[];
}

export interface IncomingPaymentRequest {
  id: number;
  userId: string; // UPI ID
  name: string; // Receiver name
  amount: string;
  description?: string; // Transaction description
  date: string;
  time: string;
}

export interface RiskResult {
  score: number;
  label: "low" | "medium" | "high";
}

export interface AgentResult {
  name: string;
  icon: string;
  color: string;
  riskScore: number;
  message: string;
  details: string;
  evidence: string[];
}

export interface AnalyzeResponse {
  overallRisk: {
    score: number;
    label: string;
  };
  agents: AgentResult[];
}

export interface AnalyzeTransactionPayload {
  user_id: string;
  receiver: string;
  amount: number;
  reason?: string;
  message?: string;
  time?: string;
  typing_speed?: number;
  hesitation_count?: number;
}

export interface CompleteTransactionPayload {
  user_id: string;
  receiver: string;
  amount: number;
  reason?: string;
  message?: string;
  time?: string;
  risk_score?: number;
  pin?: string;
  riskResult?: RiskResult;
}

export interface FeedbackPayload {
  user_id?: string;
  receiver?: string;
  transaction_id?: string | number;
  was_scam: boolean;
  comment?: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  transaction_id?: string | number;
  error?: string; // Error message from backend
}
