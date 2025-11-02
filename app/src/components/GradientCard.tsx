import React from "react";
import { Text, StyleSheet, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";

interface GradientCardProps {
  title?: string;
  subtitle?: string;
  amount?: string;
  children?: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
}

const GradientCard: React.FC<GradientCardProps> = ({
  title,
  subtitle,
  amount,
  children,
  colors = ["#10b981", "#059669"],
  style,
}) => {
  return (
    <LinearGradient colors={colors} style={[styles.container, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {amount ? <Text style={styles.amount}>{amount}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  amount: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  subtitle: {
    color: "#fff",
    fontSize: 12,
    marginTop: 8,
    opacity: 0.9,
  },
});

export default GradientCard;
