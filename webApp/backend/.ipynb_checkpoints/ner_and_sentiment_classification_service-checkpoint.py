from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForTokenClassification, AutoModelForSequenceClassification
import torch
import numpy as np
import json
import os
import traceback
from scipy.special import softmax
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

# Access environment variables
FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
TWELVE_API_KEY = os.getenv("TWELVE_API_KEY")

app = Flask(__name__)

NER_MODEL = None
SENTIMENT_MODEL = None
NER_TOKENIZER = None
SENTIMENT_TOKENIZER = None

SENTIMENT_MAPPING = {
    0: 'Negative',
    1: 'Neutral',
    2: 'Positive'
}

NER_ID2LABEL = {}

def load_models():
    """Loads all models and tokenizers once into memory."""
    global NER_MODEL, NER_TOKENIZER, SENTIMENT_MODEL, SENTIMENT_TOKENIZER, NER_ID2LABEL
    print("--- Starting Model Loading ---")

    # Define model paths up-front so exception handlers can reference them safely
    BASE_NER_PATH = "C:\\Users\\JAYASHREE\\Downloads\\EntityPulse\\Models\\finbert_ner_model_1"
    SENTIMENT_PATH = "C:\\Users\\JAYASHREE\\Downloads\\EntityPulse\\Models\\finbert-entity-sentiment"

    # BASE_NER_PATH = 'C:\Users\JAYASHREE\Downloads\EntityPulse\Models\finbert_ner_model_1'
    NER_PATH = os.path.join(BASE_NER_PATH, 'content', 'finbert_ner_model')
    # SENTIMENT_PATH = 'C:\Users\JAYASHREE\Downloads\EntityPulse\Models\finbert-entity-sentiment'

    try:
        # Load label mappings
        with open("./label_mappings.json", "r") as f:
            MAPPINGS = json.load(f)
        NER_ID2LABEL = {int(k): v for k,v in MAPPINGS["id2label"].items()}

        # Quick filesystem checks and diagnostics before attempting to load heavy models
        def _check_model_dir(path, required_files=['config.json', 'tokenizer.json', 'vocab.txt']):
            if not os.path.isdir(path):
                return (False, f"Directory not found: {path}")
            files = os.listdir(path)
            missing_files = [f for f in required_files if f not in files]
            if missing_files:
                return (False, f"Missing required files in {path}: {', '.join(missing_files)}")
            return (True, files)

        # First check base NER directory exists
        if not os.path.isdir(BASE_NER_PATH):
            raise FileNotFoundError(f"Base NER model directory missing: {BASE_NER_PATH}")
            
        # Then check the actual model directory
        ok, ner_info = _check_model_dir(NER_PATH)
        if not ok:
            raise FileNotFoundError(f"NER model directory missing or incomplete: {ner_info}")
        else:
            print(f"Found NER model files: {ner_info}")

        ok, sent_info = _check_model_dir(SENTIMENT_PATH)
        if not ok:
            raise FileNotFoundError(f"Sentiment model directory missing: {sent_info}")
        else:
            print(f"Found Sentiment model files: {sent_info}")

        #Load NER model
        print(f"Loading NER model from: {NER_PATH}")
        try:
            NER_TOKENIZER = AutoTokenizer.from_pretrained(
                NER_PATH,
                trust_remote_code=True,
                local_files_only=True
            )
            NER_MODEL = AutoModelForTokenClassification.from_pretrained(
                NER_PATH,
                id2label=NER_ID2LABEL,
                trust_remote_code=True,
                local_files_only=True
            )
            print("NER Model loaded successfully")
        except Exception as ner_exc:
            print(f"ERROR loading NER model from {NER_PATH}: {ner_exc}")
            # Provide traceback for deeper debugging
            traceback.print_exc()
            raise

        # Load Sentiment model
        print(f"Loading Sentiment model from: {SENTIMENT_PATH}")
        try:
            SENTIMENT_TOKENIZER = AutoTokenizer.from_pretrained(
                SENTIMENT_PATH,
                trust_remote_code=True,
                local_files_only=True
            )
            SENTIMENT_MODEL = AutoModelForSequenceClassification.from_pretrained(
                SENTIMENT_PATH,
                trust_remote_code=True,
                local_files_only=True
            )
            print("Sentiment Model loaded successfully")
        except Exception as sent_exc:
            print(f"ERROR loading Sentiment model from {SENTIMENT_PATH}: {sent_exc}")
            traceback.print_exc()
            raise

    except Exception as e:
        print(f"ERROR: Failed to load models: {str(e)}")
        print("Please verify the following:")
        print("1. Model directories exist and have correct permissions")
        print("2. All model files are present and not corrupted (e.g. model.safetensors)")
        print("3. Model paths are correct:")
        print(f"   NER Path: {NER_PATH}")
        print(f"   Sentiment Path: {SENTIMENT_PATH}")
        # Do not reference variables that might not be defined; re-raise so caller can handle
        raise


def run_ner_model(text):
    """
    Runs NER model on text, extracts token predictions, and reconstructs entities.
    Returns a list of reconstructed unique entity dictionaries.
    """
    inputs = NER_TOKENIZER(text, return_tensors='pt',truncation=True, max_length=128 )
    with torch.no_grad():
        outputs = NER_MODEL(**inputs)
        predictions = torch.argmax(outputs.logits, dim=2).squeeze().tolist()
    if not isinstance(predictions, list):
        predictions = [predictions]
    
    tokens = NER_TOKENIZER.convert_ids_to_tokens(inputs['input_ids'].squeeze().tolist())
    
    entities = {}
    current_entity = {
        "text": "",
        "type": None,
        "mentions": 0
    }
    
    for token, pred_id in zip(tokens, predictions):
        tag = NER_ID2LABEL.get(pred_id, "0")
        tag_parts = tag.split("-")
        
        clean_token = token.replace("##", "")
        if clean_token in ['[CLS]', '[SEP]', '[PAD]'] or pred_id == -100:
            continue
        is_entity_start = tag_parts[0] in ['B', 'U']
        is_inside_entity = tag_parts[0] in ['I', 'L']
        
        if is_entity_start:
            # end previous entity if one was being tracked
            if current_entity["text"]:
                key = current_entity["text"].strip().lower()
                if key not in entities:
                    entities[key] = {
                        "text": current_entity["text"],
                        "type": current_entity["type"],
                        "mentions": 0
                    }
                entities[key]["mentions"] += 1
                
            current_entity = {
                "text": clean_token, 
                "type": tag_parts[1] if len(tag_parts)>1 else "OTHER",
                "mentions": 1  # Initialize mentions counter
            }
        elif is_inside_entity and current_entity["text"]:
            current_entity["text"] += " " + clean_token
        elif tag_parts[0]=='O' and current_entity['text']:
            # Found 'O' tag, so the current entity is complete
            key = current_entity["text"].strip().lower()
            entities[key] = entities.get(key, current_entity)
            entities[key]["mentions"] += 1
            current_entity = {"text": "", "type": None, "mentions": 0} # Reset tracker
    # Check for entity at the very end of the sentence
    if current_entity["text"]:
        key = current_entity["text"].strip().lower()
        entities[key] = entities.get(key, current_entity)
        entities[key]["mentions"] += 1

    # Returns list of unique entities (we care about unique names here)
    return list(entities.values())
    
    # """
    # Dummy NER function for testing.
    # Returns a list of entities with types and mentions.
    # """
    # entities = []
    # if "Apple" in text:
    #     entities.append({"text": "Apple Inc", "type": "ORG", "mentions": 1})
    # if "iPhone" in text:
    #     entities.append({"text": "iPhone", "type": "PRODUCT", "mentions": 1})
    # if "Tim Cook" in text:
    #     entities.append({"text": "Tim Cook", "type": "PERSON", "mentions": 1})
    # if not entities:
    #     # default fallback entity
    #     entities.append({"text": "CompanyX", "type": "ORG", "mentions": 1})
    # return entities


def run_sentiment_model(text, entity):
    """
    Runs the sequence classification model for a given text and entity pair.
    Returns the sentiment label and confidence score.
    """
    inputs = SENTIMENT_TOKENIZER(text, entity, return_tensors="pt", truncation=True, max_length=256)
    with torch.no_grad():
        outputs = SENTIMENT_MODEL(**inputs)

    logits = outputs.logits.detach().cpu().numpy()
    scores = softmax(logits, axis=1).squeeze()
    
    pred_id = np.argmax(scores)
    confidence = scores[pred_id]
    sentiment_label = SENTIMENT_MAPPING.get(pred_id, "Unknown")
    
    return sentiment_label, float(confidence)
    
    # """
    # Dummy sentiment function for testing.
    # Returns random or predefined sentiment label and confidence.
    # """
    # # passing dummy values to first check backend connectivity
    # lower_text = text.lower()
    # if any(word in lower_text for word in ["good", "great", "excellent", "positive"]):
    #     sentiment_label = "Positive"
    #     confidence = 0.9
    # elif any(word in lower_text for word in ["bad", "poor", "negative", "terrible"]):
    #     sentiment_label = "Negative"
    #     confidence = 0.85
    # else:
    #     sentiment_label = "Neutral"
    #     confidence = 0.7

    # return sentiment_label, confidence




@app.route('/analyze-text-ner-sentiment', methods=['POST'])
def analyze_text():
    """API endpoint to coordinate NER and Sentiment analysis."""
    
    data = request.get_json()
    text = data.get('text')
    
    if not text:
        return jsonify({"error": "Missing text"}, 400)
    
    entity_candidates = run_ner_model(text)
    final_entities=[]
    overall_scores = []
    
    for candidate in entity_candidates:
        sentiment, confidence = run_sentiment_model(text, candidate['text'])
        
        score_value =0
        if sentiment=="Positive":
            score_value = confidence
        elif sentiment == "Negative":
            score_value = -confidence
        
        overall_scores.append(score_value)
        
        final_entities.append({
            'entityName':candidate["text"].title(),
            'sentiment': sentiment,
            'confidence': confidence,
            'entityType': candidate["type"]
        })
    if overall_scores:
        avg_score = np.mean(overall_scores)
        
        if avg_score >= 0.1:
            overall_sentiment = "Positive"
        elif avg_score <= -0.1:
            overall_sentiment = "Negative"
        else:
            overall_sentiment = "Neutral"
        overall_confidence = min(1, float(np.mean([abs(s) for s in overall_scores])))
    else:
        overall_sentiment, overall_confidence = "Neutral", 0.0
        
    response = {
        "overallSentiment": overall_sentiment,
        "overallConfidence": overall_confidence,
        "analyzedText": text,
        "entities": final_entities
    }
    
    return jsonify(response)

if __name__ == '__main__':
    try:
        load_models()
        print("Starting Flask server...")
        app.run(port = 5001)
    except Exception as e:
        print(f"\n--- FATAL ERROR STARTUP ---")
        print(f"Error loading models or starting server: {e}")
        print("Please check paths and file names for your models.")