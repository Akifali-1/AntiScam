import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import type { IncomingPaymentRequest } from "../types/api";

interface IncomingPaymentCardProps {
  request: IncomingPaymentRequest;
  onPayNow: (request: IncomingPaymentRequest) => void;
}

const IncomingPaymentCard = ({ request, onPayNow }: IncomingPaymentCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{request.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{request.name}</Text>
          <Text style={styles.amount}>{request.amount}</Text>
          <Text style={styles.datetime}>
            {request.date} • {request.time}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={() => onPayNow(request)}>
        <Text style={styles.payButtonText}>Pay Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
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
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 2,
  },
  upiId: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#374151",
    fontStyle: "italic",
    marginBottom: 4,
  },
  datetime: {
    fontSize: 12,
    color: "#6b7280",
  },
  payButton: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  payButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default IncomingPaymentCard;

