from database.db import get_db

class NetworkAgent:
    """
    Network Agent: Checks if receiver ID appears in past scam reports
    Uses crowd-sourced intelligence from user reports
    """
    
    def __init__(self):
        pass
    
    def analyze(self, transaction):
        """
        Check receiver ID against database of reported scams
        
        Args:
            transaction: dict with 'receiver' (UPI ID)
        
        Returns:
            dict with risk_score, message, details, evidence
        """
        receiver = transaction.get('receiver', '')
        
        if not receiver:
            return {
                'risk_score': 0,
                'message': 'No receiver ID provided',
                'details': '',
                'evidence': []
            }
        
        # Query MongoDB for reports
        db = get_db()
        scam_reports = db.scam_reports
        
        # Find scam report for this receiver
        report_doc = scam_reports.find_one({"receiver_id": receiver})
        
        if report_doc:
            report_count = report_doc.get('count', 0)
            reasons = report_doc.get('reasons', [])
        else:
            report_count = 0
            reasons = []
        
        # Calculate risk score based on report count
        if report_count >= 10:
            risk_score = 95
            message = "🚨 Very high risk - Multiple reports!"
        elif report_count >= 5:
            risk_score = 80
            message = "⚠️ High risk - Multiple scam reports"
        elif report_count >= 2:
            risk_score = 60
            message = "⚠️ Medium risk - Some reports found"
        elif report_count == 1:
            risk_score = 40
            message = "⚠️ Low risk - One report found"
        else:
            risk_score = 10
            message = "✓ No reports found - appears safe"
        
        # Generate evidence
        evidence = []
        if report_count > 0:
            evidence.append(f"This UPI ID has been reported {report_count} time(s) as a scammer")
            if reasons:
                # Get top 3 unique reasons
                unique_reasons = list(set(reasons))[:3]
                evidence.append(f"Report reasons: {', '.join(unique_reasons)}")
        else:
            evidence.append("No scam reports found for this UPI ID")
            evidence.append("Receiver ID not in scam database")
        
        details = f"""
        Checked receiver UPI ID against database of {report_count} scam reports.
        {'This ID has been flagged by other users as suspicious.' if report_count > 0 else 'This ID has not been reported before.'}
        Network intelligence relies on community reports to identify scam accounts.
        """
        
        return {
            'risk_score': round(risk_score, 1),
            'message': message,
            'details': details.strip(),
            'evidence': evidence
        }

