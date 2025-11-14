

from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import numpy as np
import cv2
from flask_cors import CORS

# --------------------------------------------
# CONFIG
# --------------------------------------------
app = Flask(__name__)
CORS(app)

# Initialize PaddleOCR once (heavy model load)
# PP-OCRv4_server = high-accuracy model (better than default lightweight version)
# ocr = PaddleOCR(
#     use_angle_cls=True,
#     lang='en',
#     rec_model_dir=None,  # uses default en_PP-OCRv4_server model
#     det_model_dir=None,
#     use_gpu=False         # change to True if GPU available
# )

ocr = PaddleOCR(
    use_textline_orientation=True,  # replaces use_angle_cls
    lang="en"
)

@app.route("/extract-text", methods=["POST"])
def extract_text():
    try:
        if not request.data:
            return jsonify({"error": "No image data received"}), 400

        # Decode the image from bytes
        img_bytes = np.frombuffer(request.data, np.uint8)
        image = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({"error": "Invalid image format"}), 400

        # Optional preprocessing (PaddleOCR is already strong, but helps on bad quality)
        image = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        image = cv2.detailEnhance(image, sigma_s=10, sigma_r=0.15)

        # OCR inference
        result = ocr.ocr(image)

        # Collect extracted text lines
        extracted_text = ""
        for line in result[0]:
            extracted_text += line[1][0] + " "

        clean_text = " ".join(extracted_text.split())

        print("\n✅ OCR Request processed successfully!")
        print("📜 Extracted Text:", clean_text if clean_text else "[No text detected]")

        return jsonify({"extracted_text": clean_text or ""})

    except Exception as e:
        print("❌ OCR Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 Advanced OCR Flask service running on http://127.0.0.1:5002")
    print("⚙️  Model: PP-OCRv4_server | Mode: CPU | Language: English")
    app.run(host="127.0.0.1", port=5002)
