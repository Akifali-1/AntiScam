import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { RootStackScreenProps } from "../types/navigation";
import { completeTransaction, reportScam, analyzeTransaction } from "../utils/api";
import type { AnalyzeResponse } from "../types/api";

type AnalysisResultScreenProps = RootStackScreenProps<"AnalysisResult">;

const AnalysisResultScreen = ({ route, navigation }: AnalysisResultScreenProps) => {
  const { receiver, receiverName, amount, message, analysisData } = route.params;
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localAnalysisData, setLocalAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Always perform analysis when screen loads (from PaymentSummary)
  // Use receiver + amount + message as key to prevent duplicate calls
  useEffect(() => {
    if (!hasAnalyzed && !analysisData) {
      performAnalysis();
      setHasAnalyzed(true);
    } else if (analysisData) {
      // If analysisData is already provided, use it
      setLocalAnalysisData(analysisData);
      setLoading(false);
      setHasAnalyzed(true);
    }
  }, [receiver, amount, message]);

  const performAnalysis = async () => {
    if (hasAnalyzed) {
      console.log("[Analysis] Already analyzed, skipping duplicate call");
      return;
    }

    setLoading(true);
    try {
      const userId = "user_123"; // TODO: Get from auth context
      
      // Get current time for uniqueness
      const now = new Date();
      const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
      
      console.log("=".repeat(50));
      console.log("[Analysis] Starting transaction analysis (NEW REQUEST):");
      console.log(`  Timestamp: ${now.toISOString()}`);
      console.log(`  Receiver (UPI ID): ${receiver}`);
      console.log(`  Receiver Name: ${receiverName || receiver}`);
      console.log(`  Amount: ${amount}`);
      console.log(`  Description: "${message || "None"}"`);
      console.log(`  User ID: ${userId}`);
      console.log("=".repeat(50));

      const result = await analyzeTransaction({
        user_id: userId,
        receiver: receiver.trim(), // UPI ID - ensure trimmed
        amount: typeof amount === 'number' ? amount : parseFloat(amount),
        reason: (message || "").trim(), // Transaction description
        time: currentTime, // Add time to make request unique
      });

      console.log("[Analysis] Analysis complete:");
      console.log(`  Overall Risk Score: ${result.overallRisk.score}`);
      console.log(`  Overall Risk Label: ${result.overallRisk.label}`);
      console.log(`  Agent Count: ${result.agents.length}`);
      console.log("  Individual Agent Scores:");
      result.agents.forEach((agent, idx) => {
        console.log(`    ${idx + 1}. ${agent.name}: ${agent.riskScore}`);
      });
      console.log("=".repeat(50));

      setLocalAnalysisData(result);
      setLoading(false);
    } catch (err: any) {
      console.error("[Analysis] Error:", err);
      console.error("[Analysis] Error details:", JSON.stringify(err, null, 2));
      Alert.alert("Analysis Error", err?.message || "Could not analyze transaction");
      setLoading(false);
      navigation.goBack();
    }
  };

  // Show loading while analyzing
  if (loading || !localAnalysisData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#22c55e" />
        <Text style={{ marginTop: 16, color: "#6b7280", fontSize: 16 }}>
          Analyzing transaction...
        </Text>
        <Text style={{ marginTop: 8, color: "#9ca3af", fontSize: 14 }}>
          Checking for fraud and spam
        </Text>
      </View>
    );
  }

  const { overallRisk, agents } = localAnalysisData;
  
  // Ensure overallRisk has the correct format (backend may return number or object)
  const riskScore = typeof overallRisk === 'number' ? overallRisk : (overallRisk?.score || 0);
  const riskLabel = typeof overallRisk === 'object' && overallRisk?.label 
    ? overallRisk.label 
    : (riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low');
  
  const normalizedOverallRisk = {
    score: riskScore,
    label: riskLabel,
  };

  const getRiskColor = (label: string) => {
    const normalizedLabel = typeof label === 'string' ? label.toLowerCase() : String(label || '').toLowerCase();
    switch (normalizedLabel) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#fb923c";
      default:
        return "#22c55e";
    }
  };

  const getRiskText = (label: string) => {
    const normalizedLabel = typeof label === 'string' ? label.toLowerCase() : String(label || '').toLowerCase();
    switch (normalizedLabel) {
      case "high":
        return "Spam Detected";
      case "medium":
        return "Caution";
      default:
        return "Safe Transaction";
    }
  };

  const handleProceed = () => {
    // Navigate directly to PIN screen for payment
    navigation.navigate("Pin", {
      receiver: receiver,
      receiverName: receiverName,
      amount: amount,
      message: message,
      risk: {
        score: normalizedOverallRisk.score,
        label: normalizedOverallRisk.label,
      },
    });
  };

  const handleCancel = () => {
    // Navigate back to home screen
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs", params: { screen: "Home" } }],
    });
  };

  const handleReport = () => {
    Alert.alert(
      "Report Scam",
      `Report ${receiverName || receiver} as a scammer? This helps protect others from fraud.`,
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
              const userId = "user_123"; // TODO: Get from auth context
              await reportScam({
                receiver: receiver,
                user_id: userId,
                reason: `Reported from transaction analysis - Risk score: ${normalizedOverallRisk.score}`,
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction Analysis</Text>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Transaction Info */}
      <View style={styles.transactionInfo}>
        <Text style={styles.receiverName}>{receiverName}</Text>
        <Text style={styles.amount}>₹{amount}</Text>
        {message ? (
          <Text style={styles.message}>Note: {message}</Text>
        ) : null}
      </View>

      {/* Overall Risk */}
      <View style={[styles.riskCard, { backgroundColor: getRiskColor(normalizedOverallRisk.label) }]}>
        <Text style={styles.riskCardTitle}>Overall Risk Assessment</Text>
        <Text style={styles.riskCardScore}>{normalizedOverallRisk.score}</Text>
        <Text style={styles.riskCardLabel}>{getRiskText(normalizedOverallRisk.label)}</Text>
      </View>

      {/* Agent Results */}
      <View style={styles.agentsSection}>
        <Text style={styles.agentsTitle}>Analysis Details</Text>
        {agents.map((agent, index) => (
          <View key={index} style={styles.agentCard}>
            <View style={styles.agentHeader}>
              <Text style={styles.agentIcon}>{agent.icon}</Text>
              <View style={styles.agentInfo}>
                <Text style={styles.agentName}>{agent.name}</Text>
                <View style={styles.riskScoreContainer}>
                  <Text style={styles.riskScoreLabel}>Risk Score: </Text>
                  <Text style={[styles.riskScoreValue, { color: getRiskColor(agent.riskScore > 70 ? "high" : agent.riskScore > 40 ? "medium" : "low") }]}>
                    {agent.riskScore}
                  </Text>
                </View>
              </View>
            </View>
            {agent.message ? (
              <Text style={styles.agentMessage}>{agent.message}</Text>
            ) : null}
            {agent.details ? (
              <Text style={styles.agentDetails}>{agent.details}</Text>
            ) : null}
            {agent.evidence && agent.evidence.length > 0 ? (
              <View style={styles.evidenceContainer}>
                <Text style={styles.evidenceTitle}>Evidence:</Text>
                {agent.evidence.map((evidence, idx) => (
                  <Text key={idx} style={styles.evidenceText}>• {evidence}</Text>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelActionButton} onPress={handleCancel}>
          <Text style={styles.cancelActionText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.proceedButton, { backgroundColor: getRiskColor(normalizedOverallRisk.label) }]}
          onPress={handleProceed}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.proceedButtonText}>Proceed to Pay</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Report Button - Show only for high risk */}
      {normalizedOverallRisk.label === 'high' && (
        <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
          <Text style={styles.reportButtonText}>⚠️ Report as Scam</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  cancelButtonText: {
    fontSize: 24,
    color: "#6b7280",
    fontWeight: "300",
  },
  transactionInfo: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  receiverName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  riskCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  riskCardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    opacity: 0.9,
  },
  riskCardScore: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
  },
  riskCardLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  aiExplanationCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  aiExplanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369a1",
    marginBottom: 8,
  },
  aiExplanationText: {
    fontSize: 14,
    color: "#0c4a6e",
    lineHeight: 20,
  },
  agentsSection: {
    padding: 16,
  },
  agentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  agentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  agentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  agentIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  riskScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  riskScoreLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  riskScoreValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  agentMessage: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500",
  },
  agentDetails: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 8,
  },
  evidenceContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  evidenceTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  evidenceText: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
  },
  cancelActionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 6,
  },
  cancelActionText: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 16,
  },
  proceedButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 6,
  },
  proceedButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  reportButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
  },
  reportButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default AnalysisResultScreen;

