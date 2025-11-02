import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { Transaction } from "../types/api";

interface TransactionCardProps {
  transaction: Transaction;
  onReport?: (transaction: Transaction) => void;
}

const getRiskColor = (risk: Transaction["risk"]): string => {
  switch (risk) {
    case "low":
      return "#22c55e"; // green-500
    case "medium":
      return "#fb923c"; // orange-400
    case "high":
      return "#ef4444"; // red-500
    default:
      return "#d1d5db"; // gray-300
  }
};

const TransactionCard = ({ transaction, onReport }: TransactionCardProps) => {
  const riskColorValue = getRiskColor(transaction.risk);

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <Text style={styles.name}>{transaction.name}</Text>
        <Text style={styles.time}>{transaction.time}</Text>
        {onReport && (
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => onReport(transaction)}
          >
            <Text style={styles.reportText}>Report</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.amount}>{transaction.amount}</Text>
        <View style={[styles.riskIndicator, { backgroundColor: riskColorValue }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  leftSection: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    color: "#1f2937",
    fontSize: 16,
    marginBottom: 4,
  },
  time: {
    color: "#6b7280",
    fontSize: 12,
    marginBottom: 8,
  },
  reportButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  reportText: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "500",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  amount: {
    fontWeight: "600",
    marginRight: 8,
    fontSize: 16,
    color: "#1f2937",
  },
  riskIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default TransactionCard;
