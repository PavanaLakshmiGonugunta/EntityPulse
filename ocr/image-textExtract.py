# from flask import Flask,request,jsonify
# import cv2
# import numpy as np
# import easyocr
# app = Flask(__name__)
# reader = easyocr.Reader(['en'],gpu=False)
# @app.route("/extract-text",methods =["POST"])
# def extract_test():
#     try:
#         img_bytes=np.frombuffer(request.data,np.uint8)
#         image = cv2.imdecode(img_bytes,cv2.IMREAD_COLOR)
#         scale_percent = 200
#         width = int(image.shape[1]*scale_percent/100)
#         height = int(image.shape[0]*scale_percent/100)
#         image = cv2.resize(image,(width,height),interpolation=cv2.INTER_LINEAR)
#         gray = cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
#         results = reader.readtext(gray)
#         extracted_text = " ".join([res[1] for res in results])
#         return jsonify({"extracted_text":extracted_text.strip()})
#     except Exception as e:
#         print("Error: ",e)
#         return jsonify({"error":str(2)}),500
# if __name__=="__main__":
#     print("Flask OCR service running on http://localhost:5001")
#     app.run(host="127.0.0.1",port = 5001)



from flask import Flask, request, jsonify
import cv2
import numpy as np
import pytesseract

app = Flask(__name__)

@app.route("/extract-text", methods=["POST"])
def extract_text():
    try:
        # Check if image data was received
        if not request.data:
            return jsonify({"error": "No image data received"}), 400

        # Decode the image from bytes
        img_bytes = np.frombuffer(request.data, np.uint8)
        image = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({"error": "Invalid image format"}), 400

        # ----- IMAGE PREPROCESSING -----
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Apply CLAHE (contrast enhancement)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)

        # Remove small noise
        kernel = np.ones((1, 1), np.uint8)
        gray = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
        gray = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)

        # Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 31, 2
        )

        # OCR with Tesseract
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(thresh, config=custom_config)

        # Clean the text
        clean_text = " ".join(text.split())

        print("\n✅ Request received!")
        print("📸 Image processed successfully.")
        print("📜 Extracted Text:", clean_text if clean_text else "[No text detected]")

        return jsonify({"extracted_text": clean_text})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 OCR Flask service running on http://127.0.0.1:5001")
    app.run(host="127.0.0.1", port=5001)



# from flask import Flask, request, jsonify
# import cv2
# import numpy as np
# import pytesseract
# import imghdr

# app = Flask(__name__)

# # ---------- IMAGE PREPROCESSING UTILITY ----------
# def preprocess_for_ocr(image, image_type="generic"):
#     """
#     Preprocess image for OCR.
#     image_type: "screenshot" or "scanned" or "generic"
#     """

#     # Convert to grayscale
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

#     # Resize to improve clarity for small fonts
#     image = cv2.resize(image, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_LINEAR)
#     gray = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_LINEAR)

#     # Remove noise
#     if image_type == "screenshot":
#         # Screenshots often have color compression artifacts
#         gray = cv2.fastNlMeansDenoising(gray, h=20)
#     else:
#         # Scanned docs may have ink noise or background shadows
#         gray = cv2.GaussianBlur(gray, (3, 3), 0)

#     # Improve contrast using CLAHE
#     clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
#     gray = clahe.apply(gray)

#     # Adaptive thresholding for text segmentation
#     thresh = cv2.adaptiveThreshold(
#         gray, 255,
#         cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
#         cv2.THRESH_BINARY,
#         31, 11
#     )

#     # Morphological cleaning (open + close)
#     kernel = np.ones((1, 1), np.uint8)
#     clean = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
#     clean = cv2.morphologyEx(clean, cv2.MORPH_CLOSE, kernel)

#     # Deskew the image
#     coords = np.column_stack(np.where(clean > 0))
#     if len(coords) > 0:
#         angle = cv2.minAreaRect(coords)[-1]
#         if angle < -45:
#             angle = -(90 + angle)
#         else:
#             angle = -angle
#         (h, w) = clean.shape[:2]
#         M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
#         clean = cv2.warpAffine(clean, M, (w, h),
#                                flags=cv2.INTER_CUBIC,
#                                borderMode=cv2.BORDER_REPLICATE)

#     return clean


# # ---------- TYPE DETECTION UTILITY ----------
# def detect_image_type(image):
#     """
#     Simple heuristic to guess whether image is a screenshot or scanned document.
#     """
#     h, w, c = image.shape
#     mean_color = cv2.mean(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY))[0]

#     if mean_color > 180:
#         return "screenshot"  # usually brighter and cleaner
#     elif mean_color < 100:
#         return "scanned"     # darker background or shadowed edges
#     else:
#         return "generic"


# # ---------- OCR ENDPOINT ----------
# @app.route("/extract-text", methods=["POST"])
# def extract_text():
#     try:
#         # Validate image
#         if not request.data:
#             return jsonify({"error": "No image data received"}), 400

#         img_type = imghdr.what(None, request.data)
#         if img_type not in ["png", "jpeg", "jpg", "bmp"]:
#             return jsonify({"error": "Unsupported image format"}), 400

#         # Decode bytes to image
#         img_bytes = np.frombuffer(request.data, np.uint8)
#         image = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

#         if image is None:
#             return jsonify({"error": "Unable to decode image"}), 400

#         # Detect type and preprocess accordingly
#         image_type = detect_image_type(image)
#         print(f"🧠 Detected image type: {image_type}")
#         clean = preprocess_for_ocr(image, image_type)

#         # OCR extraction
#         custom_config = r'--oem 3 --psm 6'
#         text = pytesseract.image_to_string(clean, config=custom_config)
#         clean_text = " ".join(text.split())

#         print("\n✅ OCR completed successfully!")
#         print("📜 Extracted Text:", clean_text if clean_text else "[No text detected]")

#         return jsonify({
#             "image_type": image_type,
#             "extracted_text": clean_text
#         })

#     except Exception as e:
#         print("❌ Error:", e)
#         return jsonify({"error": str(e)}), 500


# # ---------- MAIN ----------
# if __name__ == "__main__":
#     print("🚀 OCR Flask service running at http://127.0.0.1:5001")
#     app.run(host="127.0.0.1", port=5001)


# from flask import Flask, request, jsonify
# import cv2
# import numpy as np
# import pytesseract

# app = Flask(__name__)

# # 🧠 Import or define the preprocess function here
# def preprocess_image(image):
#     # 1️⃣ Convert to grayscale
#     gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

#     # 2️⃣ Denoise (helps remove patterns or texture backgrounds)
#     gray = cv2.fastNlMeansDenoising(gray, h=30)

#     # 3️⃣ Sharpen (makes text edges crisper)
#     kernel = np.array([[0, -1, 0],
#                        [-1, 5, -1],
#                        [0, -1, 0]])
#     gray = cv2.filter2D(gray, -1, kernel)

#     # 4️⃣ Contrast Enhancement (CLAHE)
#     clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
#     gray = clahe.apply(gray)

#     # 5️⃣ Adaptive Thresholding
#     thresh = cv2.adaptiveThreshold(
#         gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C,
#         cv2.THRESH_BINARY, 31, 10
#     )

#     # 6️⃣ Morphological Operations (to remove small noise)
#     kernel = np.ones((2,2), np.uint8)
#     clean = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
#     clean = cv2.morphologyEx(clean, cv2.MORPH_CLOSE, kernel)

#     # 7️⃣ Deskew (optional: fix tilted text)
#     coords = np.column_stack(np.where(clean > 0))
#     angle = cv2.minAreaRect(coords)[-1]
#     if angle < -45:
#         angle = -(90 + angle)
#     else:
#         angle = -angle
#     (h, w) = clean.shape[:2]
#     M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
#     clean = cv2.warpAffine(clean, M, (w, h),
#                            flags=cv2.INTER_CUBIC,
#                            borderMode=cv2.BORDER_REPLICATE)
    
#     cv2.imwrite("gray_debug.jpg", gray)
#     cv2.imwrite("thresh_debug.jpg", thresh)
#     cv2.imwrite("clean_debug.jpg", clean)
#     print("✅ Debug images saved: gray_debug.jpg, thresh_debug.jpg, clean_debug.jpg")

#     return clean


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

#         # 🔧 Use the new preprocessing pipeline
#         processed = preprocess_image(image)

#         # 🔤 Perform OCR
#         custom_config = r'--oem 3 --psm 6'
#         text = pytesseract.image_to_string(processed, config=custom_config)

#         clean_text = " ".join(text.split())

#         print("\n✅ OCR completed successfully!")
#         print("📜 Extracted Text:", clean_text if clean_text else "[No text detected]")

#         return jsonify({"extracted_text": clean_text})

#     except Exception as e:
#         print("❌ Error:", e)
#         return jsonify({"error": str(e)}), 500


# if __name__ == "__main__":
#     print("🚀 OCR Flask service running on http://127.0.0.1:5001")
#     app.run(host="127.0.0.1", port=5001)
