import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import ReceiverScreen from "../screens/ReceiverScreen";
import TransactionDetailScreen from "../screens/TransactionDetailScreen";
import RiskResultScreen from "../screens/RiskResultScreen";
import PaymentSummaryScreen from "../screens/PaymentSummaryScreen";
import AnalysisResultScreen from "../screens/AnalysisResultScreen";
import PinScreen from "../screens/PinScreen";
import FeedbackScreen from "../screens/FeedbackScreen";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="Receiver" component={ReceiverScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="PaymentSummary" component={PaymentSummaryScreen} />
      <Stack.Screen name="RiskResult" component={RiskResultScreen} />
      <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
      <Stack.Screen name="Pin" component={PinScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
