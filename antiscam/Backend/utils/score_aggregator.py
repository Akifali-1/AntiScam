def aggregate_scores(agents):
    """
    Aggregate risk scores from all agents into overall risk score
    
    Args:
        agents: List of agent result dicts with 'risk_score' key
    
    Returns:
        float: Overall risk score (0-100)
    """
    if not agents:
        return 0
    
    scores = [agent['risk_score'] for agent in agents if 'risk_score' in agent]
    
    if not scores:
        return 0
    
    # Weighted average (can adjust weights based on agent reliability)
    weights = {
        'Pattern Agent': 0.30,
        'Network Agent': 0.35,  # Most important - crowd intelligence
        'Behavior Agent': 0.25,
        'Biometric Agent': 0.10
    }
    
    # Simple average for now (can implement weighted later)
    overall = sum(scores) / len(scores)
    
    # Optional: Boost score if multiple agents flag high risk
    high_risk_count = sum(1 for score in scores if score >= 70)
    if high_risk_count >= 2:
        overall = min(overall * 1.15, 100)  # Boost by 15%, cap at 100
    elif high_risk_count == 1 and overall >= 50:
        overall = min(overall * 1.10, 100)  # Boost by 10%
    
    return round(overall, 1)

