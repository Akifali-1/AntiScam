import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { analyzeTransaction } from "../utils/api";
import type { RootStackScreenProps } from "../types/navigation";

type TransactionDetailScreenProps = RootStackScreenProps<"TransactionDetail">;

const TransactionDetailScreen = ({ route, navigation }: TransactionDetailScreenProps) => {
  const receiver = route.params?.receiver ?? "";
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount) {
      Alert.alert("Enter amount");
      return;
    }
    setLoading(true);
    try {
      const userId = "user_123"; // TODO: Get from auth context
      
      const res = await analyzeTransaction({
        user_id: userId,
        receiver: receiver,
        amount: Number(amount),
        reason: message || "",
      });
      
      // Navigate to AnalysisResultScreen with full analysis data
      navigation.navigate("AnalysisResult", {
        receiver: receiver,
        receiverName: receiver,
        amount: Number(amount),
        message: message,
        analysisData: res,
      });
    } catch (err: any) {
      Alert.alert("Error analyzing", err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.receiverText}>To: {receiver}</Text>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        style={styles.input}
        placeholderTextColor="#9ca3af"
      />

      <Text style={styles.label}>Reason / Message</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="For groceries..."
        style={[styles.input, { marginBottom: 24 }]}
        placeholderTextColor="#9ca3af"
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.submitButton, loading && { opacity: 0.7 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  receiverText: {
    fontSize: 14,
    color: "#6b7280", // gray-500
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    color: "#111827", // gray-900
  },
  input: {
    backgroundColor: "#f3f4f6", // gray-100
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  submitButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default TransactionDetailScreen;
