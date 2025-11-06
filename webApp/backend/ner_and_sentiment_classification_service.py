# from flask import Flask, request, jsonify
# from transformers import AutoTokenizer, AutoModelForTokenClassification, AutoModelForSequenceClassification
# import torch
# import numpy as np
# import json
# from scipy.special import softmax

# app = Flask(__name__)

# NER_MODEL = None
# SENTIMENT_MODEL = None
# NER_TOKENIZER = None
# SENTIMENT_TOKENIZER = None

# SENTIMENT_MAPPING = {
#     0: 'Negative',
#     1: 'Neutral',
#     2: 'Positive'
# }

# NER_ID2LABEL = {}

# def load_models():
#     """Loads all models and tokenizers once into memory."""
#     global NER_MODEL, NER_TOKENIZER, SENTIMENT_MODEL, SENTIMENT_TOKENIZER, NER_ID2LABEL
    
#     print("--- Starting Model Loading ---")
#     try:
#         # Load label mappings
#         with open("./label_mappings.json", "r") as f:
#             MAPPINGS = json.load(f)
#         NER_ID2LABEL = {int(k): v for k,v in MAPPINGS["id2label"].items()}
    
#         # Load NER model with trust_remote_code=True and local_files_only=True
#         NER_PATH = 'D:/Project/EntityPulse/EntityPulse/Models/finbert_ner_model'
#         print(f"Loading NER model from: {NER_PATH}")
#         NER_TOKENIZER = AutoTokenizer.from_pretrained(
#             NER_PATH,
#             trust_remote_code=True,
#             local_files_only=True
#         )
#         NER_MODEL = AutoModelForTokenClassification.from_pretrained(
#             NER_PATH,
#             id2label=NER_ID2LABEL,
#             trust_remote_code=True,
#             local_files_only=True
#         )
#         print("NER Model loaded successfully")
    
#         # Load Sentiment model with trust_remote_code=True and local_files_only=True
#         SENTIMENT_PATH = 'D:/Project/EntityPulse/EntityPulse/Models/finbert-entity-sentiment'
#         print(f"Loading Sentiment model from: {SENTIMENT_PATH}")
#         SENTIMENT_TOKENIZER = AutoTokenizer.from_pretrained(
#             SENTIMENT_PATH,
#             trust_remote_code=True,
#             local_files_only=True
#         )
#         SENTIMENT_MODEL = AutoModelForSequenceClassification.from_pretrained(
#             SENTIMENT_PATH,
#             trust_remote_code=True,
#             local_files_only=True
#         )
#         print("Sentiment Model loaded successfully")
    
#     except Exception as e:
#         print(f"ERROR: Failed to load models: {str(e)}")
#         print("Please verify the following:")
#         print("1. Model directories exist and have correct permissions")
#         print("2. All model files are present and not corrupted")
#         print("3. Model paths are correct:")
#         print(f"   NER Path: {NER_PATH}")
#         print(f"   Sentiment Path: {SENTIMENT_PATH}")
#         raise e


# def run_ner_model(text):
#     """
#     Runs NER model on text, extracts token predictions, and reconstructs entities.
#     Returns a list of reconstructed unique entity dictionaries.
#     """
#     inputs = NER_TOKENIZER(text, return_tensors='pt',truncation=True, max_length=128 )
#     with torch.no_grad():
#         outputs = NER_MODEL(**inputs)
#         predictions = torch.argmax(outputs.logits, dim=2).squeeze().tolist()
#     if not isinstance(predictions, list):
#         predictions = [predictions]
    
#     tokens = NER_TOKENIZER.convert_ids_to_tokens(inputs['input_ids'].squeeze().tolist())
    
#     entities={}
#     current_entity = {
#         "text": "" ,
#         "type": None
#     }
    
#     for token, pred_id in zip(tokens, predictions):
#         tag = NER_ID2LABEL.get(pred_id, "0")
#         tag_parts = tag.split("-")
        
#         clean_token = token.replace("##", "")
#         if clean_token in ['[CLS]', '[SEP]', '[PAD]'] or pred_id == -100:
#             continue
#         is_entity_start = tag_parts[0] in ['B', 'U']
#         is_inside_entity = tag_parts[0] in ['I', 'L']
        
#         if is_entity_start:
#             # end previous entity if one was being tracked
#             if current_entity["text"]:
#                 key = current_entity["text"].strip().lower()
#                 entities[key] = entities.get(key, current_entity)
#                 # entities[key]["mentions"]+=1
                
#             current_entity = {
#                 "text": clean_token, 
#                 "type": tag_parts[1] if len(tag_parts)>1 else "OTHER"
#             }
#         elif is_inside_entity and current_entity["text"]:
#             current_entity["text"] += " " + clean_token
#         elif tag_parts[0]=='O' and current_entity['text']:
#             # Found 'O' tag, so the current entity is complete
#             key = current_entity["text"].strip().lower()
#             entities[key] = entities.get(key, current_entity)
#             # entities[key]["mentions"] += 1
#             current_entity = {"text": "", "type": None, "mentions": 0} # Reset tracker
#     # Check for entity at the very end of the sentence
#     if current_entity["text"]:
#         key = current_entity["text"].strip().lower()
#         entities[key] = entities.get(key, current_entity)
#         # entities[key]["mentions"] += 1

#     # Returns list of unique entities (we care about unique names here)
#     return list(entities.values())


# def run_sentiment_model(text, entity):
#     """
#     Runs the sequence classification model for a given text and entity pair.
#     Returns the sentiment label and confidence score.
#     """
#     inputs = SENTIMENT_TOKENIZER(text, entity, return_tensors="pt", truncation=True, max_length=256)
#     with torch.no_grad():
#         outputs = SENTIMENT_MODEL(**inputs)

#     logits = outputs.logits.detach().cpu().numpy()
#     scores = softmax(logits, axis=1).squeeze()
    
#     pred_id = np.argmax(scores)
#     confidence = scores[pred_id]
#     sentiment_label = SENTIMENT_MAPPING.get(pred_id, "Unknown")
    
#     print("Scores:", scores, "Predicted label:", sentiment_label)
    
#     return sentiment_label, float(confidence)



# @app.route('/analyze-text-ner-sentiment', methods=['POST'])
# def analyze_text():
#     """API endpoint to coordinate NER and Sentiment analysis."""
    
#     data = request.get_json()
#     text = data.get('text')
    
#     if not text:
#         return jsonify({"error": "Missing text"}, 400)
    
#     entity_candidates = run_ner_model(text)
#     final_entities=[]
#     overall_scores = []
    
#     for candidate in entity_candidates:
#         sentiment, confidence = run_sentiment_model(text, candidate['text'])
        
#         score_value =0
#         if sentiment=="Positive":
#             score_value = confidence
#         elif sentiment == "Negative":
#             score_value = -confidence
        
#         overall_scores.append(score_value)
        
#         final_entities.append({
#             'entityName':candidate["text"].title(),
#             'sentiment': sentiment,
#             'confidence': confidence,
#             'entityType': candidate["type"]
#         })
#     if overall_scores:
#         avg_score = np.mean(overall_scores)
        
#         if avg_score >= 0.1:
#             overall_sentiment = "Positive"
#         elif avg_score <= -0.1:
#             overall_sentiment = "Negative"
#         else:
#             overall_sentiment = "Neutral"
#         overall_confidence = float(abs(avg_score))
#     else:
#         overall_sentiment, overall_confidence = "Neutral", 0.0
        
#     response = {
#         "overallSentiment": overall_sentiment,
#         "overallConfidence": overall_confidence,
#         "analyzedText": text,
#         "entities": final_entities
#     }
    
#     return jsonify(response)

# if __name__ == '__main__':
#     try:
#         load_models()
#         print("Starting Flask server...")
#         app.run(host='0.0.0.0', port = 5001)
#     except Exception as e:
#         print(f"\n--- FATAL ERROR STARTUP ---")
#         print(f"Error loading models or starting server: {e}")
#         print("Please check paths and file names for your models.")



# =========================
# ner_and_sentiment_classification_service.py
# =========================
# Set env caps BEFORE importing numpy/torch/transformers
import os
os.environ["OMP_NUM_THREADS"] = "1"              # prevent OpenMP thread explosion
os.environ["MKL_NUM_THREADS"] = "1"              # cap MKL threads
os.environ["NUMEXPR_NUM_THREADS"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"   # avoid extra tokenizer workers
os.environ["KMP_DUPLICATE_LIB_OK"] = "True"      # helps on some Windows setups

import json
import logging
from typing import Dict, List, Tuple

from flask import Flask, request, jsonify
import torch
import numpy as np
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    AutoModelForSequenceClassification,
)
from scipy.special import softmax

# -------------------------
# Flask app & basic config
# -------------------------
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024  # 2 MB request cap

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

# Cap PyTorch threadpools (important on Windows)
torch.set_num_threads(1)
torch.set_num_interop_threads(1)

# -------------------------
# Globals
# -------------------------
NER_MODEL = None
SENTIMENT_MODEL = None
NER_TOKENIZER = None
SENTIMENT_TOKENIZER = None

SENTIMENT_MAPPING: Dict[int, str] = {0: "Negative", 1: "Neutral", 2: "Positive"}
NER_ID2LABEL: Dict[int, str] = {}

DEVICE = torch.device("cpu")

# Paths (adjust if needed)
NER_PATH = r"C:\Sravani\college\Entity pulse\Models\finbert_ner_model"
SENTIMENT_PATH = r"C:\Sravani\college\Entity pulse\Models\finbert-entity-sentiment"
LABEL_MAP_PATH = r"./label_mappings.json"

# Token caps
MAX_NER_TOKENS = 128
MAX_SENT_TOKENS = 256

# -------------------------
# Utilities
# -------------------------
def _safe_json_error(message: str, http_status: int):
    return jsonify({"error": message}), http_status

def _trim_text(s: str, max_chars: int) -> str:
    s = (s or "").strip()
    return s if len(s) <= max_chars else s[:max_chars]

def _exists(p: str) -> bool:
    try:
        return os.path.exists(p)
    except Exception:
        return False

# -------------------------
# Model loading
# -------------------------
def load_models():
    """Load models/tokenizers once, inference-only on CPU."""
    global NER_MODEL, NER_TOKENIZER, SENTIMENT_MODEL, SENTIMENT_TOKENIZER, NER_ID2LABEL

    logging.info("--- Starting Model Loading ---")

    # Validate paths for clear errors
    if not _exists(NER_PATH):
        raise FileNotFoundError(f"NER_PATH not found: {NER_PATH}")
    if not _exists(SENTIMENT_PATH):
        raise FileNotFoundError(f"SENTIMENT_PATH not found: {SENTIMENT_PATH}")
    if not _exists(LABEL_MAP_PATH):
        raise FileNotFoundError(f"Label mapping JSON not found: {LABEL_MAP_PATH}")

    # Label map
    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        mappings = json.load(f)
    if "id2label" not in mappings:
        raise ValueError("label_mappings.json must contain an 'id2label' object")
    NER_ID2LABEL = {int(k): v for k, v in mappings["id2label"].items()}

    # NER
    logging.info(f"Loading NER from: {NER_PATH}")
    NER_TOKENIZER = AutoTokenizer.from_pretrained(
        NER_PATH, trust_remote_code=True, local_files_only=True
    )
    NER_MODEL = AutoModelForTokenClassification.from_pretrained(
        NER_PATH, id2label=NER_ID2LABEL, trust_remote_code=True, local_files_only=True
    )
    NER_MODEL.eval()
    NER_MODEL.to(device=DEVICE, dtype=torch.float32)
    logging.info("NER loaded.")

    # Sentiment
    logging.info(f"Loading Sentiment from: {SENTIMENT_PATH}")
    SENTIMENT_TOKENIZER = AutoTokenizer.from_pretrained(
        SENTIMENT_PATH, trust_remote_code=True, local_files_only=True
    )
    SENTIMENT_MODEL = AutoModelForSequenceClassification.from_pretrained(
        SENTIMENT_PATH, trust_remote_code=True, local_files_only=True
    )
    SENTIMENT_MODEL.eval()
    SENTIMENT_MODEL.to(device=DEVICE, dtype=torch.float32)
    logging.info("Sentiment loaded.")

    logging.info("--- All models loaded successfully ---")

# -------------------------
# Inference helpers
# -------------------------
def run_ner_model(text: str) -> List[Dict]:
    """Return unique entities: [{'text': 'Apple', 'type':'ORG'}, ...]"""
    global NER_MODEL, NER_TOKENIZER, NER_ID2LABEL

    text = _trim_text(text, 20000)
    inputs = NER_TOKENIZER(text, return_tensors="pt", truncation=True, max_length=MAX_NER_TOKENS)
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

    with torch.inference_mode():
        outputs = NER_MODEL(**inputs)
        pred = torch.argmax(outputs.logits, dim=2).squeeze(0).tolist()

    tokens = NER_TOKENIZER.convert_ids_to_tokens(inputs["input_ids"].cpu().squeeze(0).tolist())

    entities: Dict[str, Dict] = {}
    current = {"text": "", "type": None}

    for token, pred_id in zip(tokens, pred):
        tag = NER_ID2LABEL.get(pred_id, "O")
        parts = tag.split("-")
        prefix = parts[0] if parts else "O"
        etype = parts[1] if len(parts) > 1 else "OTHER"

        clean = token.replace("##", "")
        if clean in ("[CLS]", "[SEP]", "[PAD]"):
            continue

        if prefix in ("B", "U"):
            if current["text"]:
                key = current["text"].strip().lower()
                if key not in entities:
                    entities[key] = dict(current)
            current = {"text": clean, "type": etype}
        elif prefix in ("I", "L") and current["text"]:
            current["text"] += " " + clean
        elif prefix == "O" and current["text"]:
            key = current["text"].strip().lower()
            if key not in entities:
                entities[key] = dict(current)
            current = {"text": "", "type": None}

    if current["text"]:
        key = current["text"].strip().lower()
        if key not in entities:
            entities[key] = dict(current)

    return list(entities.values())

def run_sentiment_model(text: str, entity: str) -> Tuple[str, float]:
    """Return (label, confidence) for text + entity pair."""
    global SENTIMENT_MODEL, SENTIMENT_TOKENIZER, SENTIMENT_MAPPING

    text = _trim_text(text, 20000)
    entity = _trim_text(entity, 256)

    inputs = SENTIMENT_TOKENIZER(text, entity, return_tensors="pt",
                                 truncation=True, max_length=MAX_SENT_TOKENS)
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

    with torch.inference_mode():
        outputs = SENTIMENT_MODEL(**inputs)

    logits = outputs.logits.detach().cpu().numpy()
    scores = softmax(logits, axis=1).squeeze()
    pred_id = int(np.argmax(scores))
    confidence = float(scores[pred_id])
    label = SENTIMENT_MAPPING.get(pred_id, "Unknown")

    logging.info(f"Scores: {scores} Predicted label: {label}")
    return label, confidence

# -------------------------
# API Endpoint
# -------------------------
@app.route("/analyze-text-ner-sentiment", methods=["POST"])
def analyze_text():
    print("received text to analyze sentiment.")
    """
    Enhanced endpoint: 
    - If 'entity' provided → runs direct sentiment (no NER)
    - Else → runs NER, then sentiment per entity
    - If NER finds none → runs fallback sentiment on text only
    """
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    entity = (data.get("entity") or "").strip()
    summary = (data.get("summary") or "").strip()

    # Combine summary if given
    if summary:
        text = f"{text}. {summary}"

    if not text:
        return _safe_json_error("Missing text", 400)
    if len(text) > 20000:
        return _safe_json_error("Text too long. Max 20,000 characters.", 413)

    final_entities = []
    overall_scores = []
    meta = {"mode": None, "target": None, "entityCount": 0}

    try:
        # --- CASE 1: Direct sentiment if entity is provided ---
        if entity:
            meta["mode"] = "direct"
            meta["target"] = entity
            sentiment, confidence = run_sentiment_model(text, entity)

            final_entities.append({
                "entityName": entity.title(),
                "sentiment": sentiment,
                "confidence": confidence,
                "entityType": "DIRECT"
            })
            score_val = confidence if sentiment == "Positive" else (-confidence if sentiment == "Negative" else 0.0)
            overall_scores.append(score_val)

        else:
            # --- CASE 2: Run NER first ---
            meta["mode"] = "ner"
            entity_candidates = run_ner_model(text)
            meta["entityCount"] = len(entity_candidates)

            if entity_candidates:
                for candidate in entity_candidates[:30]:
                    ent_text = (candidate.get("text") or "").strip()
                    if not ent_text:
                        continue

                    sentiment, confidence = run_sentiment_model(text, ent_text)
                    score_val = confidence if sentiment == "Positive" else (-confidence if sentiment == "Negative" else 0.0)
                    overall_scores.append(score_val)

                    final_entities.append({
                        "entityName": ent_text.title(),
                        "sentiment": sentiment,
                        "confidence": float(confidence),
                        "entityType": candidate.get("type") or "OTHER",
                    })
            else:
                # --- CASE 3: Fallback when NER finds no entity ---
                meta["mode"] = "fallback"
                meta["target"] = "entity"
                sentiment, confidence = run_sentiment_model(text, "entity")
                final_entities.append({
                    "entityName": "entity",
                    "sentiment": sentiment,
                    "confidence": confidence,
                    "entityType": "FALLBACK"
                })
                score_val = confidence if sentiment == "Positive" else (-confidence if sentiment == "Negative" else 0.0)
                overall_scores.append(score_val)

        # --- Compute overall sentiment ---
        if overall_scores:
            avg = float(np.mean(overall_scores))
            if avg >= 0.05:
                overall_sentiment = "Positive"
            elif avg <= -0.05:
                overall_sentiment = "Negative"
            else:
                overall_sentiment = "Neutral"
            overall_confidence = abs(avg)
        else:
            overall_sentiment, overall_confidence = "Neutral", 0.0

        return jsonify({
            "overallSentiment": overall_sentiment,
            "overallConfidence": overall_confidence,
            "analyzedText": text,
            "entities": final_entities,
            "meta": meta
        }), 200

    except Exception as e:
        logging.exception("Error during analysis")
        return _safe_json_error(f"Analysis failed: {str(e)}", 500)
    

@app.route("/analyze-batch", methods=["POST"])
def analyze_batch():
    """
    Body: { items: [{ text, summary, entity } ... up to e.g. 10 ] }
    Returns: [{ overallSentiment, overallConfidence, analyzedText, meta }, ...]
    """
    data = request.get_json(silent=True) or {}
    items = data.get("items") or []
    if not isinstance(items, list) or not items:
        return _safe_json_error("items[] required", 400)

    results = []
    for it in items[:10]:
        text = (it.get("text") or "").strip()
        summary = (it.get("summary") or "").strip()
        entity = (it.get("entity") or "").strip()
        if summary:
            text = f"{text}. {summary}"

        if not text:
            results.append({"error": "Missing text"})
            continue

        try:
            if entity:
                sentiment, confidence = run_sentiment_model(text, entity)
            else:
                # reuse analyze_text’s logic via direct functions
                cands = run_ner_model(text)
                if cands:
                    scores = []
                    for c in cands[:30]:
                        s, conf = run_sentiment_model(text, c["text"])
                        scores.append(conf if s == "Positive" else (-conf if s == "Negative" else 0.0))
                    avg = float(np.mean(scores)) if scores else 0.0
                    sentiment = "Positive" if avg >= 0.05 else ("Negative" if avg <= -0.05 else "Neutral")
                    confidence = abs(avg)
                else:
                    s, conf = run_sentiment_model(text, "entity")
                    sentiment, confidence = s, conf

            results.append({
                "overallSentiment": sentiment,
                "overallConfidence": float(confidence),
                "analyzedText": text,
            })
        except Exception as e:
            results.append({"error": f"Analysis failed: {str(e)}"})

    return jsonify({"results": results}), 200


# -------------------------
# Entrypoint
# -------------------------
if __name__ == "__main__":
    try:
        load_models()
        logging.info("Starting Flask server on 0.0.0.0:5001 …")
        # single-threaded while stabilizing
        app.run(host="0.0.0.0", port=5001, threaded=True)
    except Exception as e:
        logging.exception("FATAL: Error loading models or starting server: %s", e)
        raise
