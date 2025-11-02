import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import type { CompleteTransactionPayload } from "../types/api";
import { completeTransaction } from "../utils/api";
import type { RootStackScreenProps } from "../types/navigation";
import type { RiskResult } from "../types/api";

type PinScreenProps = RootStackScreenProps<"Pin">;

const PinScreen = ({ route, navigation }: PinScreenProps) => {
  const { receiver, receiverName, amount, message, risk } = route.params || {};
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | number | undefined>(undefined);
  
  // Use receiverName for display, fallback to receiver
  const displayName = receiverName || receiver;

  const handlePay = async () => {
    // Validate PIN length (UPI PINs are typically 4-6 digits)
    if (pin.length < 4 || pin.length > 6) {
      Alert.alert("Invalid PIN", "Please enter a valid 4-6 digit UPI PIN");
      return;
    }

    // Validate PIN contains only numbers
    if (!/^\d+$/.test(pin)) {
      Alert.alert("Invalid PIN", "PIN should contain only numbers");
      return;
    }

    setLoading(true);
    try {
      // Extract user_id - you might want to get this from context or props
      const userId = "user_123"; // TODO: Get from auth context
      
      const res = await completeTransaction({
        user_id: userId,
        receiver,
        amount,
        reason: message || "",
        risk_score: risk?.score,
        pin, // PIN is not sent to backend but kept for UI flow
      });

      // Store transaction ID from response for feedback
      const transactionIdValue = res?.transaction_id;
      if (transactionIdValue) {
        setTransactionId(transactionIdValue);
      }

      // Show success state
      setShowSuccess(true);
    } catch (err: any) {
      Alert.alert("Payment Failed", err?.message ?? "Could not complete transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackLater = () => {
    // Navigate to home without feedback
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs", params: { screen: "Home" } }],
    });
  };

  const handleGiveFeedback = () => {
    // Navigate to feedback screen
    navigation.navigate("Feedback", {
      transaction_id: transactionId,
      receiver: receiver,
      amount: amount,
      message: message,
      risk: risk,
    });
  };

  // Success screen
  if (showSuccess) {
    return (
      <ScrollView style={styles.successContainer} contentContainerStyle={styles.successScrollContent}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <View style={styles.successDetails}>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>Amount:</Text>
              <Text style={styles.successDetailValue}>₹{amount}</Text>
            </View>
            <View style={styles.successDetailRow}>
              <Text style={styles.successDetailLabel}>To:</Text>
              <Text style={styles.successDetailValue} numberOfLines={1} ellipsizeMode="middle">
                {displayName}
              </Text>
            </View>
            {message ? (
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Message:</Text>
                <Text style={styles.successDetailValue} numberOfLines={3}>
                  {message}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.successMessage}>Your transaction has been completed successfully.</Text>
          
          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackTitle}>Help us improve</Text>
            <Text style={styles.feedbackSubtitle}>Was this transaction actually a scam?</Text>
            
            <TouchableOpacity 
              style={styles.feedbackButton} 
              onPress={handleGiveFeedback}
            >
              <Text style={styles.feedbackButtonText}>Provide Feedback</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleFeedbackLater}
            >
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Enter UPI PIN</Text>
        <Text style={styles.subtitle}>Confirm your payment</Text>
      </View>

      <View style={styles.paymentInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount</Text>
          <Text style={styles.infoValue}>₹{amount}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>To</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {displayName}
          </Text>
        </View>
        {message && message.trim() ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Message</Text>
            <Text style={styles.infoValue} numberOfLines={3}>
              {message}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.pinSection}>
        <Text style={styles.pinLabel}>Enter UPI PIN</Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="numeric"
          placeholder="Enter 4-6 digit PIN"
          placeholderTextColor="#9ca3af"
          maxLength={6}
          style={styles.input}
          autoFocus
        />
        <Text style={styles.pinHint}>Enter your secure UPI PIN to authorize this payment</Text>
      </View>

      <TouchableOpacity 
        onPress={handlePay} 
        style={[styles.payButton, (loading || pin.length < 4) && styles.payButtonDisabled]} 
        disabled={loading || pin.length < 4}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>Pay ₹{amount}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.goBack()} 
        style={styles.cancelButton}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  paymentInfo: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  pinSection: {
    marginBottom: 24,
  },
  pinLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 8,
    textAlign: "center",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 8,
  },
  pinHint: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  payButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#22c55e",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  payButtonDisabled: {
    backgroundColor: "#d1d5db",
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "500",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  successScrollContent: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  successContent: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 48,
    color: "#fff",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 32,
  },
  successDetails: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  successDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  successDetailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  successDetailValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  successMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  feedbackSection: {
    width: "100%",
    marginTop: 24,
    padding: 20,
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    alignItems: "center",
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  feedbackSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  feedbackButton: {
    width: "100%",
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  feedbackButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 14,
  },
});

export default PinScreen;
