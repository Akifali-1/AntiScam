class BiometricAgent:
    """
    Biometric/Emotion Agent: Analyzes typing patterns and hesitation
    Detects if user is acting under pressure or rushed
    Optional demo layer for hackathon
    """
    
    def __init__(self):
        # Normal typing speed: 40-80 WPM, scam pressure: >150 WPM or <20 WPM
        self.normal_typing_speed_range = (40, 80)  # Words per minute
        self.normal_hesitation_threshold = 3  # Number of backspaces/corrections
    
    def analyze(self, transaction):
        """
        Analyze biometric indicators (typing speed, hesitation)
        
        Args:
            transaction: dict with 'typing_speed', 'hesitation_count', etc.
        
        Returns:
            dict with risk_score, message, details, evidence
        """
        typing_speed = transaction.get('typing_speed')
        hesitation_count = transaction.get('hesitation_count')
        
        # If no biometric data, return neutral score
        if typing_speed is None and hesitation_count is None:
            return {
                'agent_name': 'Biometric Agent',
                'risk_score': 25,
                'message': "No biometric data available",
                'details': "Typing pattern analysis requires user interaction data. Not available in this demo.",
                'evidence': ["Biometric analysis requires real-time data collection"]
            }
        
        risk_score = 25  # Base neutral score
        evidence = []
        
        # Analyze typing speed
        if typing_speed:
            if typing_speed > 150:
                risk_score += 35
                evidence.append(f"Very fast typing speed ({typing_speed} WPM) suggests rushed decision")
            elif typing_speed < 20:
                risk_score += 30
                evidence.append(f"Very slow typing speed ({typing_speed} WPM) may indicate hesitation or pressure")
            elif typing_speed < 40:
                risk_score += 15
                evidence.append(f"Below normal typing speed ({typing_speed} WPM)")
            else:
                evidence.append(f"Normal typing speed ({typing_speed} WPM)")
        
        # Analyze hesitation
        if hesitation_count is not None:
            if hesitation_count > 5:
                risk_score += 25
                evidence.append(f"High hesitation count ({hesitation_count}) suggests uncertainty or pressure")
            elif hesitation_count > 2:
                risk_score += 10
                evidence.append(f"Some hesitation detected ({hesitation_count} corrections)")
            else:
                evidence.append("Normal input pattern - minimal hesitation")
        
        # Cap risk score
        risk_score = min(risk_score, 90)
        
        # Generate message
        if risk_score >= 60:
            message = "⚠️ High pressure indicators detected!"
        elif risk_score >= 40:
            message = "⚠️ Some behavioral stress signals"
        else:
            message = "✓ Normal input patterns detected"
        
        details = f"""
        Analyzed typing patterns and user interaction behavior.
        {'Detected indicators suggesting user may be acting under pressure or rushing.' if risk_score >= 40 else 'No significant behavioral stress indicators detected.'}
        Biometric analysis helps detect if users are being pressured into transactions.
        """
        
        return {
            'agent_name': 'Biometric Agent',
            'risk_score': round(risk_score, 1),
            'message': message,
            'details': details.strip(),
            'evidence': evidence if evidence else ["No behavioral anomalies detected"]
        }

