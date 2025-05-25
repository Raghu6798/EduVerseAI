import requests
import json
import os

# ============ CONFIGURATION ============
API_KEY = os.getenv("LLM_API_KEY") or "YOUR_API_KEY_HERE"
ENDPOINT = "https://api.provider.com/v1/chat/completions"  # Replace with the actual endpoint
MODEL = "your-model-name"  # e.g., gpt-4, command-r, llama3-70b, etc.

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    # Add any provider-specific headers if needed
}

# ============ PROMPT DATA ============
data = {
    "model": MODEL,
    "messages": [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Tell me a fun fact about space."}
    ],
    "max_tokens": 150,
    "temperature": 0.7,
    # Add other optional params like top_p, stop, etc. based on provider
}

# ============ API CALL ============
response = requests.post(ENDPOINT, headers=HEADERS, data=json.dumps(data))

# ============ RESPONSE HANDLING ============
if response.status_code == 200:
    result = response.json()
    try:
        # This part may vary depending on provider's response format
        content = result["choices"][0]["message"]["content"]
    except KeyError:
        content = result
    print("Response:\n", content)
else:
    print(f"Error {response.status_code}: {response.text}")
