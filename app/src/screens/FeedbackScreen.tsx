import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  StyleSheet,
  ScrollView,
} from "react-native";
import { sendFeedback } from "../utils/api";
import type { RootStackScreenProps } from "../types/navigation";

type FeedbackScreenProps = RootStackScreenProps<"Feedback">;

const FeedbackScreen = ({ route, navigation }: FeedbackScreenProps) => {
  const { transaction_id, receiver, amount, message } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<boolean | null>(null);

  const submit = async (was_scam: boolean) => {
    setLoading(true);
    try {
      const userId = "user_123"; // TODO: Get from auth context
      
      await sendFeedback({ 
        receiver: receiver || "",
        user_id: userId,
        transaction_id, 
        was_scam,
        comment: was_scam ? "User confirmed this was a scam" : "User confirmed this was not a scam",
      });
      
      Alert.alert(
        "Thank You!", 
        "Your feedback helps us improve fraud detection accuracy.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs", params: { screen: "Home" } }],
              });
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Could not send feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Help Us Improve</Text>
        <Text style={styles.subtitle}>Your feedback helps us detect fraud better</Text>
      </View>

      {/* Transaction Details */}
      {(receiver || amount) && (
        <View style={styles.transactionCard}>
          <Text style={styles.transactionTitle}>Transaction Details</Text>
          {amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>₹{amount}</Text>
            </View>
          )}
          {receiver && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>To:</Text>
              <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
                {receiver}
              </Text>
            </View>
          )}
          {message && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Message:</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {message}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.questionSection}>
        <Text style={styles.questionText}>Was this transaction actually a scam?</Text>
        <Text style={styles.questionHint}>
          Please confirm whether our fraud detection was accurate
        </Text>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => {
            setSelectedFeedback(true);
            submit(true);
          }}
          style={[
            styles.feedbackButton,
            styles.scamButton,
            selectedFeedback === true && styles.selectedButton,
          ]}
          disabled={loading}
        >
          {loading && selectedFeedback === true ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonEmoji}>⚠️</Text>
              <Text style={styles.buttonText}>Yes, it was a scam</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedFeedback(false);
            submit(false);
          }}
          style={[
            styles.feedbackButton,
            styles.safeButton,
            selectedFeedback === false && styles.selectedButton,
          ]}
          disabled={loading}
        >
          {loading && selectedFeedback === false ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonEmoji}>✓</Text>
              <Text style={styles.buttonText}>No, it was safe</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

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
    alignItems: "center",
    marginBottom: 32,
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
    textAlign: "center",
  },
  transactionCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  questionSection: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  questionHint: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  scamButton: {
    backgroundColor: "#ef4444",
  },
  safeButton: {
    backgroundColor: "#22c55e",
  },
  selectedButton: {
    opacity: 0.8,
  },
  buttonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
});

export default FeedbackScreen;
