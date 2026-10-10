"""Diagnose the chat error — runs the exact same code path as the Gradio app."""
import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')

# Step 1: check key loads
import os
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path('C:/Users/DELL/gemma4-starter/.env'))
key = os.environ.get("GEMINI_API_KEY", "")
print(f"Key present: {bool(key)} | starts with: {key[:6] if key else 'NONE'}")

# Step 2: check gemma_client imports
import gemma_client
print(f"Model: {gemma_client.MODEL}")

# Step 3: try making the client
try:
    client = gemma_client.get_client()
    print("Client created OK")
except Exception as e:
    print(f"Client error: {e}")
    sys.exit(1)

# Step 4: try a simple ask (uses cache if available)
try:
    reply = gemma_client.ask("Say hello in one word.", system="You are a helpful assistant.")
    print(f"ask() OK: {reply[:60]}")
except Exception as e:
    print(f"ask() error: {gemma_client.describe_error(e)}")
    sys.exit(1)

# Step 5: try make_chat + send_message (exact path used by campus_chat)
try:
    chat = gemma_client.make_chat(system="You are a helpful assistant.")
    reply = chat.send_message("Say hello in one word.")
    print(f"make_chat() OK: {reply[:60]}")
except Exception as e:
    print(f"make_chat() error: {gemma_client.describe_error(e)}")
    sys.exit(1)

# Step 6: test campus_chat function directly
from campus_saathi.ai import campus_chat, reset_chat
reset_chat()
try:
    history, _ = campus_chat([], "hii")
    print(f"campus_chat() OK: {history[-1][1][:80]}")
except Exception as e:
    print(f"campus_chat() error: {e}")

print("\nDIAGNOSTIC_COMPLETE")
