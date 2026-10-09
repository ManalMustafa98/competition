import os
import sys
from dotenv import load_dotenv

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

def mask(val: str) -> str:
    if not val:
        return "[NOT SET]"
    if len(val) <= 8:
        return "****"
    return f"{val[:4]}...{val[-4:]}"

def check_supabase():
    print("--- 1. Testing Supabase Connection ---")
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip() or os.getenv("SUPABASE_KEY", "").strip()

    print(f"SUPABASE_URL: {mask(url)}")
    print(f"SUPABASE_KEY: {mask(key)}")

    if not url or not key or "your-project-id" in url or key.startswith("your_"):
        print(" [WARNING] Supabase credentials appear to be placeholders or missing.")
        return False

    try:
        from supabase import create_client
        client = create_client(url, key)
        # Attempt to query the expenses table
        res = client.table("expenses").select("id", count="exact").limit(1).execute()
        count = res.count if res.count is not None else len(res.data)
        print(f" [SUCCESS] Connected to Supabase! Found 'expenses' table with {count} existing records.")
        return True
    except Exception as e:
        print(f" [ERROR] Could not connect to Supabase: {e}")
        return False

def check_openrouter():
    print("\n--- 2. Testing OpenRouter API ---")
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    model = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct").strip()

    print(f"OPENROUTER_API_KEY: {mask(api_key)}")
    print(f"OPENROUTER_MODEL: {model}")

    if not api_key or api_key.startswith("your_"):
        print(" [WARNING] OpenRouter API key is not configured or is a placeholder.")
        return False

    import httpx
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Smart Expense Analyzer"
        }
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": "Respond with the word 'OK' if you can read this."}
            ],
            "max_tokens": 10
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                answer = resp.json()["choices"][0]["message"]["content"].strip()
                print(f" [SUCCESS] OpenRouter API is working! Model responded: '{answer}'")
                return True
            else:
                print(f" [ERROR] OpenRouter returned status {resp.status_code}: {resp.text}")
                return False
    except Exception as e:
        print(f" [ERROR] OpenRouter request failed: {e}")
        return False

if __name__ == "__main__":
    supa_ok = check_supabase()
    openr_ok = check_openrouter()
    print("\n===============================")
    if supa_ok and openr_ok:
        print(" ALL INTEGRATIONS VERIFIED WORKING!")
    else:
        print(" Check warnings/errors above.")
