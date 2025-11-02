import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import GradientCard from "../components/GradientCard";
import TransactionCard from "../components/TransactionCard";
import IncomingPaymentCard from "../components/IncomingPaymentCard";
import { fetchHistory, analyzeTransaction, sendFeedback, reportScam } from "../utils/api";
import type { BottomTabScreenProps } from "../types/navigation";
import type { Transaction, IncomingPaymentRequest } from "../types/api";

type HomeScreenProps = BottomTabScreenProps<"Home">;

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [incomingPayments, setIncomingPayments] = useState<IncomingPaymentRequest[]>([]);
  const [totalBalance, setTotalBalance] = useState("₹0.00");
  const [currentMonthAmount, setCurrentMonthAmount] = useState("₹0.00");
  const [activeAlerts, setActiveAlerts] = useState(3);
  const [analyzing, setAnalyzing] = useState(false);

  // Replace with real user id
  const userId = "user_123";

  // Load transaction history from backend
  const loadHistory = async () => {
    setLoading(true);
    try {
      console.log("[HomeScreen] Loading transaction history...");
      const data = await fetchHistory(userId);
      console.log("[HomeScreen] History loaded:", {
        transactionCount: data?.transactions?.length || 0,
        totalBalance: data?.totalBalance,
        monthAmount: data?.currentMonthAmount,
      });
      setTotalBalance(data?.totalBalance ?? "₹0.00");
      setCurrentMonthAmount(data?.currentMonthAmount ?? "₹0.00");
      setTransactions(data?.transactions ?? []);
    } catch (err: any) {
      console.error("[HomeScreen] Error loading history:", err);
      // Fallback dummy data only if backend fails
      setTotalBalance("₹1,24,560.75");
      setCurrentMonthAmount("₹23,450.00");
      setTransactions([
        { id: 1, name: "Amit Sharma", time: "10:45 AM", amount: "₹500.00", risk: "low" },
        { id: 2, name: "UPI Merchant", time: "9:10 AM", amount: "₹250.00", risk: "high" },
        { id: 3, name: "Rajesh Kumar", time: "Yesterday", amount: "₹1000.00", risk: "medium" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  // Reload history when screen comes into focus (after returning from payment)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("[HomeScreen] Screen focused, reloading history...");
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Load dummy incoming payment requests with UPI IDs and descriptions
    setIncomingPayments([
      {
        id: 1,
        userId: "priya.patel@upi",
        name: "Priya Patel",
        amount: "₹1,500.00",
        description: "KYC update payment",
        date: "Today",
        time: "2:30 PM",
      },
      {
        id: 2,
        userId: "rahul.singh@upi",
        name: "Rahul Singh",
        amount: "₹750.00",
        description: "Loan approval fee",
        date: "Today",
        time: "1:15 PM",
      },
      {
        id: 3,
        userId: "anjali.kumar@upi",
        name: "Anjali Kumar",
        amount: "₹2,000.00",
        description: "Payment to friend",
        date: "Yesterday",
        time: "6:45 PM",
      },
      {
        id: 4,
        userId: "merchant123@paytm",
        name: "Online Store",
        amount: "₹3,500.00",
        description: "Shopping payment",
        date: "Yesterday",
        time: "11:20 AM",
      },
      {
        id: 5,
        userId: "billpay@bharatpay",
        name: "Electricity Bill",
        amount: "₹1,200.00",
        description: "Utility bill payment",
        date: "2 days ago",
        time: "9:00 AM",
      },
    ]);
  }, [userId]);

  const handlePayNow = async (request: IncomingPaymentRequest) => {
    // Parse amount - remove currency symbols and commas
    const cleanAmount = request.amount.replace(/[₹,]/g, "");
    const amount = parseFloat(cleanAmount);

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Invalid amount. Please check the payment request.");
      return;
    }

    // Ensure receiver is a valid string
    if (!request.userId || request.userId.trim() === "") {
      Alert.alert("Error", "Invalid receiver ID.");
      return;
    }

    // Navigate to payment summary screen
    navigation.navigate("PaymentSummary", {
      receiver: request.name,
      receiverName: request.name,
      receiverId: request.userId, // UPI ID
      amount: amount,
      description: request.description || "",
    });
  };

  const handleReport = async (transaction: Transaction) => {
    Alert.alert(
      "Report Scam",
      `Report ${transaction.name} as a scammer? This helps protect others.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Report",
          style: "destructive",
          onPress: async () => {
            try {
              // Use report endpoint for scam reporting
              await reportScam({
                receiver: transaction.name,
                user_id: userId,
                reason: `Reported scam from transaction history`,
              });
              Alert.alert("Success", "Scam reported successfully. Thank you for helping protect the community!");
            } catch (err: any) {
              Alert.alert("Error", err?.message ?? "Could not report scam");
            }
          },
        },
      ]
    );
  };


  return (
    <ScrollView style={styles.scrollView}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profilePicture}>
          <Text style={styles.profileText}>JD</Text>
        </View>
      </View>

      {/* Balance Section */}
      <GradientCard title="This Month" amount={currentMonthAmount} subtitle="Total incoming this month">
        <View style={styles.balanceRow}>
          <View>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{totalBalance}</Text>
          </View>
          <View style={styles.alertsBadge}>
            <Text style={styles.alertsText}>{activeAlerts} Alerts</Text>
          </View>
        </View>
      </GradientCard>

      {/* Incoming Payments Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Incoming Payments</Text>
      </View>
      {analyzing ? (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.analyzingText}>Analyzing transaction...</Text>
        </View>
      ) : incomingPayments.length > 0 ? (
        incomingPayments.map((request) => (
          <IncomingPaymentCard
            key={request.id}
            request={request}
            onPayNow={handlePayNow}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No incoming payment requests</Text>
        </View>
      )}

      {/* Recent Transactions Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" style={styles.loader} />
      ) : (
        transactions.map((tx) => (
          <TouchableOpacity
            key={tx.id}
            onPress={() =>
              navigation.navigate("TransactionDetail", { 
                id: typeof tx.id === 'number' ? tx.id : undefined, 
                receiver: tx.receiver || tx.name 
              })
            }
          >
            <TransactionCard transaction={tx} onReport={handleReport} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  profileText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  balanceRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    color: "#fff",
    fontSize: 14,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  alertsBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  alertsText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  emptyStateText: {
    color: "#6b7280",
    fontSize: 14,
  },
  loader: {
    marginVertical: 20,
  },
  analyzingContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginVertical: 16,
  },
  analyzingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
});

export default HomeScreen;
