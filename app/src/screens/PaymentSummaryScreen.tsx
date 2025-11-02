import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import type { RootStackScreenProps } from "../types/navigation";

type PaymentSummaryScreenProps = RootStackScreenProps<"PaymentSummary">;

const PaymentSummaryScreen = ({ route, navigation }: PaymentSummaryScreenProps) => {
  const { receiver, receiverName, receiverId, amount, description } = route.params;
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    // Navigate to analysis screen - it will perform the analysis
    navigation.navigate("AnalysisResult", {
      receiver: receiverId || receiver,
      receiverName: receiverName || receiver,
      amount: amount,
      message: description || "",
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Summary</Text>
        <Text style={styles.subtitle}>Review transaction details before proceeding</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Receiver Name</Text>
          <Text style={styles.sectionValue} numberOfLines={1} ellipsizeMode="middle">
            {receiverName || receiver}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>UPI ID</Text>
          <Text style={styles.sectionValue} numberOfLines={1} ellipsizeMode="middle">
            {receiverId || receiver}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <Text style={styles.amountValue}>₹{amount}</Text>
        </View>

        {description && (
          <>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.sectionValue} numberOfLines={3}>
                {description}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.analyzeButtonText}>Analyze Transaction</Text>
              <Text style={styles.analyzeButtonHint}>Check for fraud/spam</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={analyzing}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  section: {
    paddingVertical: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 28,
    color: "#22c55e",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
  analyzeButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#22c55e",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  analyzeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  analyzeButtonHint: {
    color: "#dcfce7",
    fontSize: 12,
    fontWeight: "500",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default PaymentSummaryScreen;

