import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import type { RootStackScreenProps } from "../types/navigation";

type ReceiverScreenProps = RootStackScreenProps<"Receiver">;

const ReceiverScreen = ({ navigation }: ReceiverScreenProps) => {
  const [receiver, setReceiver] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Receiver UPI ID or Mobile</Text>

      <TextInput
        value={receiver}
        onChangeText={setReceiver}
        placeholder="alice@bank or 9876543210"
        style={styles.input}
        placeholderTextColor="#9ca3af"
      />

      <TouchableOpacity
        disabled={!receiver}
        onPress={() => navigation.navigate("TransactionDetail", { receiver })}
        style={[
          styles.nextButton,
          { backgroundColor: receiver ? "#22c55e" : "#d1d5db" },
        ]}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  nextButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ReceiverScreen;
