import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  Receiver: undefined;
  TransactionDetail: {
    receiver: string;
    id?: number;
  };
  PaymentSummary: {
    receiver: string;
    receiverName?: string;
    receiverId: string; // UPI ID
    amount: number;
    description?: string;
  };
  RiskResult: {
    receiver: string;
    amount: number;
    message?: string;
    risk: {
      score: number;
      label: string;
    };
  };
  AnalysisResult: {
    receiver: string;
    receiverName: string;
    amount: number;
    message?: string;
    typingSpeed?: number;
    hesitationCount?: number;
    analysisData?: {
      overallRisk: {
        score: number;
        label: string;
      };
      agents: Array<{
        name: string;
        icon: string;
        color: string;
        riskScore: number;
        message: string;
        details: string;
        evidence: string[];
      }>;
    };
  };
  Pin: {
    receiver: string;
    receiverName?: string;
    amount: number;
    message?: string;
    risk?: {
      score: number;
      label: string;
    };
  };
  Feedback: {
    transaction_id?: string | number;
    receiver?: string;
    amount?: number;
    message?: string;
    risk?: {
      score: number;
      label: string;
    };
  };
};

export type BottomTabParamList = {
  Home: undefined;
  History: undefined;
  Pay: undefined;
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type BottomTabScreenProps<T extends keyof BottomTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<BottomTabParamList, T>,
  RootStackScreenProps<"MainTabs">
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

