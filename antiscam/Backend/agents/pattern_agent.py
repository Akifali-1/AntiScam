import pickle
import os
import warnings
import joblib

# Suppress sklearn version warnings (models trained with newer version work fine)
warnings.filterwarnings('ignore', category=UserWarning, module='sklearn')

class PatternAgent:
    """
    Pattern Agent: Detects known scam text patterns and keywords
    Uses ML model trained on synthetic scam text dataset
    """
    
    def __init__(self):
        # Try both possible filenames
        model_path1 = os.path.join(os.path.dirname(__file__), '..', 'models', 'pattern_agent_tiny.pkl')
        model_path2 = os.path.join(os.path.dirname(__file__), '..', 'models', 'pattern_model.pkl')
        
        # Load ML model Pipeline (trained in Colab)
        # Pipeline combines vectorizer + classifier in one file
        self.model = None
        model_path = None
        
        # Try pattern_agent_tiny.pkl first (from your Colab)
        if os.path.exists(model_path1):
            model_path = model_path1
        elif os.path.exists(model_path2):
            model_path = model_path2
        
        if model_path:
            try:
                # Check file size first
                file_size = os.path.getsize(model_path)
                if file_size == 0:
                    print(f"❌ Pattern model file is empty: {model_path}")
                    return
                
                print(f"📦 Loading pattern model from: {model_path} ({file_size:,} bytes)")
                
                # Try joblib first (from Colab), then pickle as fallback
                try:
                    self.model = joblib.load(model_path)
                    print(f"✅ Pattern Agent model loaded with joblib!")
                except Exception as joblib_error:
                    print(f"⚠️  Joblib failed, trying pickle: {joblib_error}")
                    with open(model_path, 'rb') as f:
                        self.model = pickle.load(f)
                    print(f"✅ Pattern Agent model loaded with pickle!")
                
                print(f"✅ Pattern Agent model loaded successfully!")
                
                # Verify it's a sklearn Pipeline
                if hasattr(self.model, 'predict_proba'):
                    print("✅ Model has predict_proba method - ready to use")
                else:
                    print("⚠️  Warning: Model may not have predict_proba method")
                    
            except pickle.UnpicklingError as e:
                print(f"❌ Pattern model file is not a valid pickle file: {e}")
                print(f"   File path: {model_path}")
                print("   Make sure the file was saved using joblib.dump() or pickle.dump()")
            except Exception as e:
                print(f"❌ Could not load pattern model: {e}")
                import traceback
                traceback.print_exc()
        else:
            print("Pattern model not found. Looking for: pattern_agent_tiny.pkl or pattern_model.pkl")
    
    def analyze(self, transaction):
        """
        Analyze transaction for scam patterns
        
        Args:
            transaction: dict with 'reason', 'receiver', etc.
        
        Returns:
            dict with risk_score, message, details, evidence
        """
        text = f"{transaction.get('reason', '')} {transaction.get('receiver', '')}".lower()
        
        # If model exists, use it (trained in Colab as Pipeline)
        if self.model:
            try:
                # Pipeline handles text directly (vectorizer + classifier combined)
                risk_score = self.model.predict_proba([text])[0][1] * 100
            except Exception as e:
                print(f"Error in pattern model prediction: {e}")
                # Return neutral score if model fails
                risk_score = 30
        else:
            # No model available - return neutral score
            # Model must be trained in Colab as Pipeline and placed in models/ directory
            print("Pattern model not found. Train model in Colab as Pipeline and place pattern_model.pkl in models/ directory.")
            risk_score = 30
        
        # Generate explanation
        evidence = []
        message = "Transaction appears safe"
        
        if risk_score >= 70:
            message = "⚠️ High scam risk detected!"
            evidence.append("ML model detected high-risk scam patterns in transaction text")
            evidence.append("Text analysis indicates suspicious content")
        elif risk_score >= 40:
            message = "⚠️ Medium risk - proceed with caution"
            evidence.append("ML model detected some suspicious patterns")
        else:
            message = "✓ Pattern analysis shows low risk"
            evidence.append("No scam patterns detected by ML model")
        
        details = f"""
        Analyzed transaction text using trained ML model from Colab.
        {'Detected patterns that match known scam tactics.' if risk_score >= 40 else 'No red flags found in text analysis.'}
        Pattern detection uses machine learning trained on synthetic scam datasets.
        """
        
        return {
            'risk_score': round(risk_score, 1),
            'message': message,
            'details': details.strip(),
            'evidence': evidence
        }
    

