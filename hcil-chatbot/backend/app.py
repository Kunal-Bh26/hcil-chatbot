import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
from fuzzywuzzy import fuzz, process

app = Flask(__name__)
CORS(app)

# --- Render Persistent Disk Configuration ---
# Render provides a persistent disk at /var/data. We'll use it for our cache.
CACHE_DIR = '/var/data/st_cache'
KNOWLEDGE_BASE_PATH = 'dataset.csv'
os.makedirs(CACHE_DIR, exist_ok=True)

# --- In-Memory Cache for loaded objects ---
cache = {}

def get_models_and_data():
    """
    Loads models and data, using a cache to avoid reloading on warm instances.
    Downloads the model to a persistent disk on the first run.
    """
    if "models_loaded" in cache:
        return cache["model"], cache["df_embeddings"], cache["df"]
    
    try:
        print("--- COLD START: Loading models and data for the first time... ---")
        
        # The model is downloaded to the persistent disk if not already present.
        model = SentenceTransformer("all-MiniLM-L6-v2", cache_folder=CACHE_DIR)
        
        if not os.path.exists(KNOWLEDGE_BASE_PATH):
            raise FileNotFoundError(f"Knowledge base file not found: {KNOWLEDGE_BASE_PATH}")
            
        df = pd.read_csv(KNOWLEDGE_BASE_PATH)
        df.dropna(subset=['questions', 'answers'], inplace=True)
        
        # Pre-compute embeddings for the entire dataset once.
        df_embeddings = model.encode(df['questions'].tolist(), convert_to_tensor=True, show_progress_bar=False)
        
        # Store the loaded objects in the in-memory cache
        cache["model"] = model
        cache["df_embeddings"] = df_embeddings
        cache["df"] = df
        cache["models_loaded"] = True
        
        print("--- Models and data loaded and cached successfully. ---")
        return model, df_embeddings, df
        
    except Exception as e:
        print(f"FATAL: Error loading models or data: {e}")
        return None, None, None

def get_greeting_response(text):
    greetings = {
        "hello": "Hello! 👋 How can I help you today?", "hi": "Hi there! How can I assist you?",
        "hey": "Hey! What can I do for you?", "how are you": "I'm just a bot, but I'm ready to help! 😊",
        "thank you": "You're welcome! Is there anything else I can help with?", "thanks": "You're welcome!",
        "bye": "Thank you for chatting. Goodbye! 👋", "goodbye": "Goodbye! Have a great day. 👋"
    }
    text_lower = text.lower()
    for greet, response in greetings.items():
        if fuzz.partial_ratio(greet, text_lower) > 85:
            return response
    return None

def get_bot_response(user_query, model, df_embeddings, df):
    greeting_response = get_greeting_response(user_query)
    if greeting_response:
        return greeting_response

    questions = df['questions'].tolist()
    best_match, score = process.extractOne(user_query, questions, scorer=fuzz.token_sort_ratio)
    
    if score > 85:
        idx = questions.index(best_match)
        return df.iloc[idx]['answers']

    query_embedding = model.encode(user_query, convert_to_tensor=True)
    hits = util.semantic_search(query_embedding, df_embeddings, top_k=1)
    hit = hits[0][0]
    
    if hit['score'] > 0.5:
        return df.iloc[hit['corpus_id']]['answers']
        
    return "I'm sorry, I don't have information on that topic. Could you try asking in a different way?"

@app.route('/api/chat', methods=['POST'])
def chat():
    model, df_embeddings, df = get_models_and_data()
    
    if df is None:
        return jsonify({'error': 'Service is temporarily unavailable due to a configuration error.'}), 503
        
    try:
        data = request.get_json()
        user_message = data.get('message')
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        bot_response = get_bot_response(user_message, model, df_embeddings, df)
        return jsonify({'response': bot_response})
        
    except Exception as e:
        print(f"Error in /api/chat: {e}")
        return jsonify({'error': 'An internal server error occurred'}), 500

# This block is for local development only
if __name__ == '__main__':
    app.run(debug=True, port=5001)