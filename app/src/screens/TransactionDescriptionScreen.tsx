import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import type { RootStackScreenProps } from "../types/navigation";

type TransactionDescriptionScreenProps = RootStackScreenProps<"TransactionDescription">;

// Common transaction descriptions
const commonDescriptions = [
  "Payment to friend",
  "KYC update",
  "Loan approval",
  "Bill payment",
  "Shopping payment",
  "Medical emergency",
  "Education fee",
  "Insurance payment",
  "Utility bill",
  "Rent payment",
];

const TransactionDescriptionScreen = ({ route, navigation }: TransactionDescriptionScreenProps) => {
  const { receiver, receiverName, amount } = route.params;
  const [description, setDescription] = useState("");
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [lastCharTime, setLastCharTime] = useState<number | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [hesitationCount, setHesitationCount] = useState(0);
  const inputRef = useRef<TextInput>(null);

  // Track typing metrics
  useEffect(() => {
    if (description.length > 0 && typingStartTime === null) {
      setTypingStartTime(Date.now());
    }
  }, [description, typingStartTime]);

  const handleDescriptionSelect = (desc: string) => {
    setSelectedDescription(desc);
    setDescription(desc);
    // Reset metrics when selecting predefined option
    setTypingStartTime(null);
    setLastCharTime(null);
    setCharCount(0);
    setHesitationCount(0);
    inputRef.current?.focus();
  };

  const handleTextChange = (text: string) => {
    const now = Date.now();
    
    // If text is being typed (not deleted)
    if (text.length > description.length) {
      const newCharCount = text.length;
      setCharCount(newCharCount);
      
      if (lastCharTime !== null) {
        const timeSinceLastChar = now - lastCharTime;
        // Hesitation = pause > 2000ms between characters
        if (timeSinceLastChar > 2000) {
          setHesitationCount((prev) => prev + 1);
          console.log(`[Biometric] Hesitation detected: ${timeSinceLastChar}ms pause`);
        }
      }
      
      setLastCharTime(now);
      
      if (typingStartTime === null) {
        setTypingStartTime(now);
      }
    } else {
      // Text was deleted, reset some metrics
      setCharCount(text.length);
    }
    
    setDescription(text);
  };

  const calculateTypingSpeed = (): number | undefined => {
    if (!typingStartTime || charCount === 0) {
      return undefined;
    }
    
    const totalTime = Date.now() - typingStartTime;
    const totalSeconds = totalTime / 1000;
    
    if (totalSeconds === 0) return undefined;
    
    // Characters per minute
    const cpm = (charCount / totalSeconds) * 60;
    console.log(`[Biometric] Typing speed calculated: ${cpm.toFixed(2)} CPM (${charCount} chars in ${totalSeconds.toFixed(2)}s)`);
    
    return Math.round(cpm);
  };

  const handleContinue = () => {
    if (!description.trim()) {
      Alert.alert("Required", "Please enter or select a transaction description");
      return;
    }

    const typingSpeed = calculateTypingSpeed();
    
    // Log metrics
    console.log("=".repeat(50));
    console.log("[Transaction Description] Collected metrics:");
    console.log(`  Description: "${description}"`);
    console.log(`  Typing Speed: ${typingSpeed || "N/A"} CPM`);
    console.log(`  Hesitation Count: ${hesitationCount}`);
    console.log(`  Character Count: ${charCount}`);
    console.log("=".repeat(50));

    // Navigate to analysis with description and biometric data
    navigation.navigate("AnalysisResult", {
      receiver: receiver,
      receiverName: receiverName,
      amount: amount,
      message: description.trim(),
      typingSpeed: typingSpeed,
      hesitationCount: hesitationCount,
    });
  };

  const handleSkip = () => {
    console.log("[Transaction Description] User skipped description");
    navigation.navigate("AnalysisResult", {
      receiver: receiver,
      receiverName: receiverName,
      amount: amount,
      message: "",
      typingSpeed: undefined,
      hesitationCount: 0,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction Details</Text>
        <Text style={styles.subtitle}>Help us analyze this payment</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>To:</Text>
          <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
            {receiverName || receiver}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Amount:</Text>
          <Text style={styles.infoValue}>₹{amount}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction Description</Text>
        <Text style={styles.sectionHint}>
          Describe the purpose of this payment. This helps our fraud detection system.
        </Text>

        {/* Common descriptions */}
        <View style={styles.chipsContainer}>
          {commonDescriptions.map((desc, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.chip,
                selectedDescription === desc && styles.chipSelected,
              ]}
              onPress={() => handleDescriptionSelect(desc)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedDescription === desc && styles.chipTextSelected,
                ]}
              >
                {desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom input */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Or type your own description..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={handleTextChange}
          multiline
          autoFocus={false}
        />

        {/* Metrics display (for debugging) */}
        {__DEV__ && typingStartTime && (
          <View style={styles.metricsContainer}>
            <Text style={styles.metricsTitle}>Typing Metrics (Debug):</Text>
            <Text style={styles.metricsText}>
              Speed: {calculateTypingSpeed() || "Calculating..."} CPM
            </Text>
            <Text style={styles.metricsText}>
              Hesitations: {hesitationCount}
            </Text>
            <Text style={styles.metricsText}>
              Characters: {charCount}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue to Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
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
  infoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  chipText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  chipTextSelected: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  metricsContainer: {
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  metricsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 4,
  },
  metricsText: {
    fontSize: 12,
    color: "#92400e",
  },
  buttonContainer: {
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#6b7280",
    fontSize: 14,
  },
});

export default TransactionDescriptionScreen;

