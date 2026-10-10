import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')

from campus_saathi.ai import campus_chat, reset_chat

# Start fresh
reset_chat()

# Simulate exactly what Gradio 6 does: passes [] as history, gets back messages list
history, cleared_input = campus_chat([], "hii")

assert isinstance(history, list), "history must be a list"
assert len(history) == 2, f"Expected 2 messages, got {len(history)}"
assert history[0]["role"] == "user",      f"First message role wrong: {history[0]}"
assert history[0]["content"] == "hii",    f"First message content wrong: {history[0]}"
assert history[1]["role"] == "assistant", f"Second message role wrong: {history[1]}"
assert len(history[1]["content"]) > 0,    "Reply is empty"
assert cleared_input == "",               "Input should be cleared"

print(f"message_format_ok")
print(f"user:      {history[0]['content']}")
print(f"assistant: {history[1]['content'][:100]}")

# Second turn — history carries forward
history2, _ = campus_chat(history, "What facilities are in the hostel?")
assert len(history2) == 4, f"Expected 4 messages after 2 turns, got {len(history2)}"
print(f"multi_turn_ok: {history2[3]['content'][:80]}")

# Reset clears session
h, _ = reset_chat()
assert h == [], f"reset should return empty list, got {h}"
print("reset_ok")

print("\nCHAT_FIX_VERIFIED")
