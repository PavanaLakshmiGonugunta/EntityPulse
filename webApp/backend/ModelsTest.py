from transformers import AutoModelForTokenClassification, AutoTokenizer

model_path = "D:/Project/EntityPulse/EntityPulse/Models/finbert-entity-sentiment"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForTokenClassification.from_pretrained(model_path, local_files_only=True)

print("Model loaded successfully!")

# Test tokenization and forward pass
inputs = tokenizer("Test sentence", return_tensors="pt")
outputs = model(**inputs)
print("Forward pass successful! Logits shape:", outputs.logits.shape)
