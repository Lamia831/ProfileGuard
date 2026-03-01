# model.py
def predict_fake(data):
    followers = int(data["followers"])
    following = int(data["following"])
    posts = int(data["posts"])
    has_photo = data["photo"]  # "yes" / "no"

    score = 0

    if followers < 50:
        score += 1
    if following > followers * 2:
        score += 1
    if posts < 3:
        score += 1
    if has_photo == "no":
        score += 1

    if score >= 2:
        return "FAKE ACCOUNT", 85
    else:
        return "REAL ACCOUNT", 90
