def detect_fake(account_age_months, posts, followers, following, has_profile_pic=True):
    """
    Advanced AI-inspired heuristic for profile authenticity analysis.
    Returns: (status, confidence_score)
    """
    risk_score = 0
    
    # 1. Account Age Risk
    if account_age_months < 1:
        risk_score += 40
    elif account_age_months < 6:
        risk_score += 20
        
    # 2. Activity / Content Ratio
    if posts < 3:
        risk_score += 25
    elif posts < 10:
        risk_score += 10
        
    # 3. Follower/Following Disparity (Bot pattern)
    if followers > 2000 and posts < 5:
        risk_score += 35
    elif following > (followers * 5) and following > 500:
        risk_score += 20
        
    # 4. Visual Verification
    if not has_profile_pic:
        risk_score += 30
        
    # Determine Status
    if risk_score >= 70:
        status = "Deceptive (High Risk)"
    elif risk_score >= 35:
        status = "Suspicious (Medium Risk)"
    else:
        status = "Authentic (Low Risk)"
        
    # Confidence calculation simulation
    confidence = 85 + (min(risk_score, 100) % 10)
    
    return status, confidence

# Demo testing
if __name__ == "__main__":
    test_cases = [
        (0.5, 1, 3000, 50, False),  # Heavy Fake
        (24, 150, 800, 400, True),  # Real
        (4, 8, 1200, 2000, True)    # Suspicious
    ]
    
    for age, p, fo, fi, pic in test_cases:
        res, conf = detect_fake(age, p, fo, fi, pic)
        print(f"Result: {res} | Confidence: {conf}%")
