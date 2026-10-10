"""Gemma 4 connection diagnostic — safe, no secrets printed."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

def run():
    key = os.environ.get("GEMINI_API_KEY", "").strip().strip("\"'")
    assert key and key != "paste-your-key-here", \
        "GEMINI_API_KEY missing. Copy .env.example to .env and set your key."
    print("1. API key present: YES (value hidden)")

    import gemma_client
    client = gemma_client.get_client()
    assert client is not None
    print("2. Client initialized: OK")

    response = gemma_client.ask("Reply with exactly: GEMMA_OK")
    assert response and len(response.strip()) > 0, "Empty response from model"
    print(f"3. Model response received: {response.strip()[:60]}")
    print(f"4. Model used: {gemma_client.MODEL}")
    print("\nDIAGNOSTIC_PASS")

if __name__ == "__main__":
    try:
        run()
    except AssertionError as e:
        print(f"DIAGNOSTIC_FAIL: {e}")
        sys.exit(1)
    except Exception as e:
        import gemma_client
        print(f"DIAGNOSTIC_FAIL: {gemma_client.describe_error(e)}")
        sys.exit(1)
