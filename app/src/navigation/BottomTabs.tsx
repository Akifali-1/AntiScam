import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import { View, Text, StyleSheet } from "react-native";
import type { BottomTabParamList } from "../types/navigation";

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          height: 65,
          borderTopWidth: 0.5,
          borderTopColor: "#d1d5db",
          elevation: 3,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      {/* 🏠 Home Tab */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
                🏠
              </Text>
            </View>
          ),
        }}
      />

      {/* ⏰ History Tab */}
      <Tab.Screen
        name="History"
        component={PlaceholderScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
                ⏰
              </Text>
            </View>
          ),
        }}
      />

      {/* 💸 Pay Tab */}
      <Tab.Screen
        name="Pay"
        component={PlaceholderScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.iconTextLarge, focused && styles.iconTextFocused]}>
                💸
              </Text>
            </View>
          ),
        }}
      />

      {/* 👤 Profile Tab */}
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Text style={[styles.iconText, focused && styles.iconTextFocused]}>
                👤
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const PlaceholderScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Coming Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  iconText: {
    fontSize: 24,
    color: "#9ca3af",
    textAlign: "center",
  },
  iconTextLarge: {
    fontSize: 26,
    color: "#9ca3af",
    fontWeight: "bold",
    textAlign: "center",
  },
  iconTextFocused: {
    color: "#22c55e",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  placeholderText: {
    fontSize: 18,
    color: "#6b7280",
  },
});

export default BottomTabs;
