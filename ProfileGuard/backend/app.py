# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from model import predict_fake

app = Flask(__name__)
CORS(app)  # Cross-Origin requests allow

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    result, score = predict_fake(data)
    return jsonify({
        "prediction": result,
        "confidence": score
    })

if __name__ == "__main__":
    app.run(debug=True)

