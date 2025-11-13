
# from flask import Flask, request, jsonify
# import cv2
# import numpy as np
# import pytesseract
# from flask_cors import CORS

# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# app = Flask(__name__)
# CORS(app)
# @app.route("/extract-text", methods=["POST"])
# def extract_text():
#     try:
#         # Check if image data was received
#         if not request.data:
#             return jsonify({"error": "No image data received"}), 400

#         # Decode the image from bytes
#         img_bytes = np.frombuffer(request.data, np.uint8)
#         image = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

#         if image is None:
#             return jsonify({"error": "Invalid image format"}), 400

#         # ----- IMAGE PREPROCESSING -----
#         # Convert to grayscale
#         gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

#         # Apply CLAHE (contrast enhancement)
#         clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
#         gray = clahe.apply(gray)

#         # Remove small noise
#         kernel = np.ones((1, 1), np.uint8)
#         gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
#         gray = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)

#         # Adaptive thresholding
#         thresh = cv2.adaptiveThreshold(
#             gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
#             cv2.THRESH_BINARY, 31, 2
#         )

#         # OCR with Tesseract
#         custom_config = r'--oem 3 --psm 6'
#         text = pytesseract.image_to_string(thresh, config=custom_config)

#         # Clean the text
#         clean_text = " ".join(text.split())

#         print("\n✅ Request received!")
#         print("📸 Image processed successfully.")
#         print("📜 Extracted Text:", clean_text if clean_text else "[No text detected]")

#         return jsonify({"extracted_text": clean_text})

#     except Exception as e:
#         print("❌ Error:", e)
#         return jsonify({"error": str(e)}), 500


# if __name__ == "__main__":
#     print("🚀 OCR Flask service running on http://127.0.0.1:5002")
#     app.run(host="127.0.0.1", port=5002)


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
ocr = PaddleOCR(
    use_angle_cls=True,
    lang='en',
    rec_model_dir=None,  # uses default en_PP-OCRv4_server model
    det_model_dir=None,
    use_gpu=False         # change to True if GPU available
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
        result = ocr.ocr(image, cls=True)

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
