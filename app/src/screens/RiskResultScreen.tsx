import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { RootStackScreenProps } from "../types/navigation";

type RiskResultScreenProps = RootStackScreenProps<"RiskResult">;

const labelForRisk = (riskObj: any) => {
  // Example backend structure: { score: 78, label: 'high' }
  const label =
    riskObj?.label ??
    (riskObj?.score >= 70
      ? "high"
      : riskObj?.score >= 40
      ? "medium"
      : "low");
  const score = riskObj?.score ?? 0;
  return { label, score };
};

const RiskResultScreen = ({ route, navigation }: RiskResultScreenProps) => {
  const { receiver, amount, message, risk } = route.params || {};
  const { label, score } = labelForRisk(risk);

  const bgColor =
    label === "high"
      ? "#ef4444" // red-500
      : label === "medium"
      ? "#fb923c" // orange-400
      : "#22c55e"; // green-500

  return (
    <View style={styles.container}>
      <View style={[styles.scoreCard, { backgroundColor: bgColor }]}>
        <Text style={styles.scoreTitle}>Risk Score</Text>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreLabel}>{label.toUpperCase()}</Text>
      </View>

      {label === "high" || label === "medium" ? (
        <>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Feedback", { receiver, amount, message, risk })
            }
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Pin", { receiver, amount, message, risk })
            }
            style={styles.proceedButton}
          >
            <Text style={styles.proceedText}>Proceed Anyway</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Pin", { receiver, amount, message, risk })
          }
          style={[styles.proceedButton, { backgroundColor: "#16a34a" }]}
        >
          <Text style={styles.proceedText}>Proceed to PIN</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    justifyContent: "center",
  },
  scoreCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  scoreTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  scoreValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
    marginTop: 8,
  },
  scoreLabel: {
    color: "#fff",
    marginTop: 6,
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  cancelText: {
    color: "#1f2937",
    fontWeight: "600",
    fontSize: 16,
  },
  proceedButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  proceedText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default RiskResultScreen;
