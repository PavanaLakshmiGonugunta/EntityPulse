from flask import Flask, request, jsonify
from paddleocr import PaddleOCR
import paddleocr as _pocr_pkg
import numpy as np
import cv2
from flask_cors import CORS
import inspect
import types
import re
from collections import Counter
from pathlib import Path

app = Flask(__name__)
CORS(app)

# -----------------------
# Initialize PaddleOCR once
# -----------------------
ocr = PaddleOCR(
    use_angle_cls=True,  # keep using angle classification via init flag
    lang='en',
    rec_model_dir=None,
    det_model_dir=None
)

# -----------------------
# Robust caller for PaddleOCR (v2 / v3 compatible)
# -----------------------
def call_ocr(ocr_obj, image_rgb):
    """
    Robust caller for different PaddleOCR versions.
    Accepts numpy RGB image or a path-like string.
    Returns the raw OCR output.
    """
    def try_call(fn, *args, **kwargs):
        try:
            return True, fn(*args, **kwargs)
        except Exception as e:
            return False, e

    # Try predict variations first (v3 uses predict; v2 also had predict)
    if hasattr(ocr_obj, "predict"):
        pred = ocr_obj.predict
        # common patterns to try (ordered)
        tries = [
            (pred, (image_rgb,), {}),
            (pred, ([image_rgb],), {}),
            (pred, (image_rgb,), {"det": True, "cls": True}),
            (pred, ([image_rgb],), {"det": True, "cls": True}),
        ]

        # inspect signature to only pass kwargs supported
        try:
            sig = inspect.signature(pred)
            params = sig.parameters
        except Exception:
            params = {}

        # filter kwargs to those accepted
        filtered_tries = []
        for fn, args, kwargs in tries:
            if not kwargs:
                filtered_tries.append((fn, args, kwargs))
                continue
            allowed = {k: v for k, v in kwargs.items() if k in params}
            filtered_tries.append((fn, args, allowed))

        for fn, args, kwargs in filtered_tries:
            ok, out = try_call(fn, *args, **kwargs)
            if ok:
                return out

    # Try older .ocr()
    if hasattr(ocr_obj, "ocr"):
        ok, out = try_call(ocr_obj.ocr, image_rgb)
        if ok:
            return out
        ok, out = try_call(ocr_obj.ocr, [image_rgb])
        if ok:
            return out

    # If the object itself is callable
    if callable(ocr_obj):
        ok, out = try_call(ocr_obj, image_rgb)
        if ok:
            return out

    raise RuntimeError("Unable to call PaddleOCR: no compatible method found.")

import re
from collections import Counter

# Patterns to detect noisy, programmatic reprs
_RE_ARRAY_LIKE = re.compile(r"\barray\s*\(|\bshape\s*=|\bdtype\s*=|\<[^>]*object at 0x[0-9a-fA-F]+\>|\b0x[0-9a-fA-F]{4,}\b")
_RE_NON_ALPHA = re.compile(r"^[^A-Za-z]*$")
_RE_HEX_ADDR = re.compile(r"0x[0-9a-fA-F]+")

def _collect_text_candidates(obj, out_list):
    """Recursive collector for candidates (same as earlier)."""
    if obj is None:
        return
    if isinstance(obj, str):
        s = obj.strip()
        if s:
            out_list.append(s)
        return
    if isinstance(obj, (int, float)):
        out_list.append(str(obj))
        return
    if isinstance(obj, (list, tuple)):
        for el in obj:
            _collect_text_candidates(el, out_list)
        return
    if isinstance(obj, dict):
        priority_keys = [
            "text", "rec_text", "transcription", "texts", "ocr_text",
            "value", "label", "predictions", "result", "rec_result",
            "recognition_result", "words", "words_info", "lines", "sentence"
        ]
        for k in priority_keys:
            if k in obj:
                _collect_text_candidates(obj[k], out_list)
        for k, v in obj.items():
            if k in priority_keys:
                continue
            _collect_text_candidates(v, out_list)
        return
    try:
        s = repr(obj)
        if s:
            out_list.append(s)
    except Exception:
        pass

def _is_noisy_token(tok):
    """Return True if tok looks like code/array/object noise we should ignore."""
    if not tok or not isinstance(tok, str):
        return True
    t = tok.strip()
    if t in {"True", "False", "None"}:
        return True
    if _RE_ARRAY_LIKE.search(t):
        return True
    if _RE_NON_ALPHA.match(t):
        return True
    if _RE_HEX_ADDR.search(t):
        return True
    alpha_chars = re.sub(r"[^A-Za-z]+", "", t)
    if len(alpha_chars) < 2:
        return True
    return False
def parse_ocr_result(raw_result, return_mode="joined", prefer_full_sentences=True):
    """
    Robust parser compatible with earlier calls.

    Parameters:
      - raw_result: object returned by PaddleOCR
      - return_mode: "joined" (default), "longest", or "freq"
      - prefer_full_sentences: if True, prefer multi-word sentence-like tokens when available

    Returns:
      string with extracted text (best effort)
    """
    # collect candidates
    candidates = []
    try:
        _collect_text_candidates(raw_result, candidates)
    except Exception as e:
        print("parse_ocr_result: collection error:", e)

    # normalize whitespace and filter noisy tokens
    cleaned = []
    for c in candidates:
        if not isinstance(c, str):
            continue
        s = re.sub(r"\s+", " ", c).strip()
        if not s:
            continue
        if _is_noisy_token(s):
            continue
        cleaned.append(s)

    # debug print of what survived filtering
    if cleaned:
        print("PARSE DEBUG: cleaned candidates (sample up to 20):", cleaned[:20])
    else:
        print("PARSE DEBUG: no cleaned candidates found. raw candidates sample:", candidates[:12])

    if not cleaned:
        # fallback: best-effort from raw_result repr
        try:
            return str(raw_result)[:1024]
        except Exception:
            return ""

    # Prefer tokens that look like sentences (contain space and letters)
    sentence_like = [t for t in cleaned if " " in t and re.search(r"[A-Za-z]", t)]
    if prefer_full_sentences and sentence_like:
        # join them in original order but avoid exact duplicates
        out = []
        seen = set()
        for t in sentence_like:
            if t in seen:
                continue
            out.append(t)
            seen.add(t)
        joined_sentences = " ".join(out)

        # apply return_mode options while keeping joined sentences preference
        if return_mode == "joined":
            final = joined_sentences
        elif return_mode == "longest":
            cand = max(sentence_like + cleaned, key=len)
            final = cand
        elif return_mode == "freq":
            final = Counter(cleaned).most_common(1)[0][0]
        else:
            final = joined_sentences
    else:
        # If we get here there were no multi-word sentence-like tokens (or prefer_full_sentences False)
        if return_mode == "joined":
            # join cleaned tokens, collapse adjacent duplicates
            out = []
            last = None
            for t in cleaned:
                if t == last:
                    continue
                out.append(t)
                last = t
            final = " ".join(out)
        elif return_mode == "longest":
            final = max(cleaned, key=len)
        elif return_mode == "freq":
            final = Counter(cleaned).most_common(1)[0][0]
        else:
            final = " ".join(cleaned)

    # ----------------------
    # Remove unwanted leading tokens like "min" and "general"
    # ----------------------
    # define tokens to remove from the start (case-insensitive)
    leading_remove = {"min", "general"}
    # split into words, remove any leading items that are in the set
    parts = final.strip().split()
    while parts and parts[0].lower() in leading_remove:
        parts.pop(0)
    # re-join
    final = " ".join(parts)

    return final

# -----------------------
# Draw boxes (best-effort) and save to disk for visual debugging
# -----------------------
def draw_boxes_and_save(raw_result, image_bgr, out_path="debug_boxes.jpg"):
    img = image_bgr.copy()
    try:
        boxes = []
        # attempt to extract points/bboxes from each detection
        if isinstance(raw_result, (list, tuple)):
            for item in raw_result:
                bbox = None
                if isinstance(item, (list, tuple)) and len(item) >= 1:
                    cand = item[0]
                    if isinstance(cand, (list, tuple)) and len(cand) >= 4:
                        bbox = cand
                if isinstance(item, dict):
                    for k in ("box", "points", "points_list", "coordinate", "bbox", "polygons"):
                        if k in item and isinstance(item[k], (list, tuple)):
                            bbox = item[k]
                            break
                if bbox:
                    pts = []
                    for p in bbox:
                        if isinstance(p, (list, tuple)) and len(p) >= 2:
                            pts.append((int(round(p[0])), int(round(p[1]))))
                    if pts:
                        boxes.append(pts)
        # try some common dict forms (v3 sometimes nests detections)
        if isinstance(raw_result, dict):
            # look for nested arrays under likely keys
            for k in ("result", "predictions", "ocr", "data", "words_info"):
                if k in raw_result and isinstance(raw_result[k], (list, tuple)):
                    for item in raw_result[k]:
                        if isinstance(item, dict):
                            if "box" in item and isinstance(item["box"], (list, tuple)):
                                pts = [(int(round(p[0])), int(round(p[1]))) for p in item["box"]]
                                boxes.append(pts)

        # draw
        for pts in boxes:
            for i in range(len(pts)):
                p1 = pts[i]
                p2 = pts[(i + 1) % len(pts)]
                cv2.line(img, p1, p2, (0, 255, 0), 2)
        cv2.imwrite(out_path, img)
        print("Wrote debug image with boxes to", out_path)
    except Exception as e:
        print("draw boxes error:", e)


# -----------------------
# Debug endpoint: returns raw_result (JSON-safe) for an input image
# -----------------------
@app.route("/debug-raw", methods=["POST"])
def debug_raw():
    if not request.data:
        return jsonify({"error": "No image data received"}), 400
    img_bytes = np.frombuffer(request.data, np.uint8)
    image_bgr = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)
    if image_bgr is None:
        return jsonify({"error": "Invalid image format"}), 400
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    raw = call_ocr(ocr, image_rgb)

    # attempt to save boxes visual for quick inspection
    try:
        debug_path = Path("debug_boxes.jpg")
        draw_boxes_and_save(raw, image_bgr, str(debug_path))
    except Exception:
        pass

    # Make JSON-serializable
    def make_serial(x):
        if isinstance(x, (str, int, float, bool)) or x is None:
            return x
        if isinstance(x, (list, tuple)):
            return [make_serial(y) for y in x]
        if isinstance(x, dict):
            return {k: make_serial(v) for k, v in x.items()}
        # fallback
        return repr(x)

    return jsonify({"raw_result": make_serial(raw)})


# -----------------------
# Main endpoint: extract-text
# -----------------------
@app.route("/extract-text", methods=["POST"])
def extract_text():
    try:
        if not request.data:
            return jsonify({"error": "No image data received"}), 400

        img_bytes = np.frombuffer(request.data, np.uint8)
        image_bgr = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

        if image_bgr is None:
            return jsonify({"error": "Invalid image format"}), 400

        # -----------------------
        # Optional preprocessing - tweak per your images
        # -----------------------
        # Example: resize small images to improve detection
        h, w = image_bgr.shape[:2]
        if max(h, w) < 800:
            scale = 800.0 / max(h, w)
            image_bgr = cv2.resize(image_bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

        # Denoise and enhance (you can comment these lines if they hurt performance)
        try:
            image_bgr = cv2.fastNlMeansDenoisingColored(image_bgr, None, 10, 10, 7, 21)
            image_bgr = cv2.detailEnhance(image_bgr, sigma_s=10, sigma_r=0.15)
        except Exception:
            pass

        # convert to RGB for PaddleOCR
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

        # Call OCR (predict or ocr depending on installed version)
        raw_result = call_ocr(ocr, image_rgb)

        # Optional: save visual debug image (uncomment to enable)
        # draw_boxes_and_save(raw_result, image_bgr, "debug_boxes.jpg")

        # Parse result into text
        clean_text = parse_ocr_result(raw_result, return_mode="joined")

        print("\n✅ OCR Request processed successfully!")
        print("PaddleOCR version:", getattr(_pocr_pkg, "__version__", "unknown"))
        print("📜 Extracted Text:", clean_text if clean_text else "[No text detected]")

        return jsonify({"extracted_text": clean_text or ""})

    except Exception as e:
        print("❌ OCR Error:", e)
        return jsonify({"error": str(e)}), 500


# -----------------------
# Run server
# -----------------------
if __name__ == "__main__":
    print("🚀 Advanced OCR Flask service running on http://127.0.0.1:5002")
    print("⚙️  Model may be PP-OCRv4_server | Mode: CPU | Language: English")
    app.run(host="127.0.0.1", port=5002)