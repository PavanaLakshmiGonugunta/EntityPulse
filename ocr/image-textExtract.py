from flask import Flask,request,jsonify
import cv2
import numpy as np
import easyocr
app = Flask(__name__)
reader = easyocr.Reader(['en'],gpu=False)
@app.route("/extract-text",methods =["POST"])
def extract_test():
    try:
        img_bytes=np.frombuffer(request.data,np.uint8)
        image = cv2.imdecode(img_bytes,cv2.IMREAD_COLOR)
        scale_percent = 200
        width = int(image.shape[1]*scale_percent/100)
        height = int(image.shape[0]*scale_percent/100)
        image = cv2.resize(image,(width,height),interpolation=cv2.INTER_LINEAR)
        gray = cv2.cvtColor(image,cv2.COLOR_BGR2GRAY)
        results = reader.readtext(gray)
        extracted_text = " ".join([res[1] for res in results])
        return jsonify({"extracted_text":extracted_text.strip()})
    except Exception as e:
        print("Error: ",e)
        return jsonify({"error":str(2)}),500
if __name__=="__main__":
    print("Flask OCR service running on http://localhost:5001")
    app.run(host="127.0.0.1",port = 5001)