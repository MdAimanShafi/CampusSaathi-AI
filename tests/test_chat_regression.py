"""
Regression test for: "Data incompatible with messages format"

Root cause: Gradio 6 preprocess() converts content from str to
[{'text': '...', 'type': 'text'}]. campus_chat must normalize this
back to str before appending new messages, so the returned list
always has uniform str content that Gradio can postprocess cleanly.
"""
import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')

import gradio as gr
from campus_saathi.ai import campus_chat, reset_chat, _normalize_history

chatbot = gr.Chatbot()

# ── Unit tests for _normalize_history ────────────────────────────────────────

# 1. Empty list
assert _normalize_history([]) == []

# 2. Already plain strings — must pass through unchanged
plain = [{"role": "user", "content": "hello"}, {"role": "assistant", "content": "hi"}]
assert _normalize_history(plain) == plain

# 3. Gradio preprocessed format (list content) — must flatten to str
gradio_format = [
    {"role": "user",      "content": [{"text": "hii", "type": "text"}], "metadata": None, "options": None},
    {"role": "assistant", "content": [{"text": "Hello!", "type": "text"}], "metadata": None, "options": None},
]
normalized = _normalize_history(gradio_format)
assert normalized[0] == {"role": "user",      "content": "hii"},   f"Got: {normalized[0]}"
assert normalized[1] == {"role": "assistant", "content": "Hello!"}, f"Got: {normalized[1]}"
print("normalize_unit_tests: PASS")

# ── Full round-trip through Gradio postprocess/preprocess ────────────────────

reset_chat()

# Turn 1: empty history → campus_chat → postprocess
h1, _ = campus_chat([], "hii")
assert all(isinstance(m["content"], str) for m in h1), "Turn 1 content must be str"
internal1 = chatbot.postprocess(h1)   # must not raise
print(f"turn1_postprocess: PASS  ({len(h1)} messages)")

# Turn 2: preprocess gives list-content → campus_chat normalizes → postprocess
h1_preprocessed = chatbot.preprocess(internal1)
# Confirm Gradio did convert content to list
assert isinstance(h1_preprocessed[0]["content"], list), "Gradio should have converted content to list"

h2, _ = campus_chat(h1_preprocessed, "What facilities are in the hostel?")
# After normalization + append, ALL content must be str
assert all(isinstance(m["content"], str) for m in h2), \
    f"Turn 2 mixed content: {[(m['role'], type(m['content']).__name__) for m in h2]}"
internal2 = chatbot.postprocess(h2)   # must not raise
print(f"turn2_postprocess: PASS  ({len(h2)} messages)")

# Turn 3: another round to confirm stability
h2_preprocessed = chatbot.preprocess(internal2)
h3, _ = campus_chat(h2_preprocessed, "Tell me about the library.")
assert all(isinstance(m["content"], str) for m in h3)
chatbot.postprocess(h3)
print(f"turn3_postprocess: PASS  ({len(h3)} messages)")

# Reset returns correct format
h_reset, cleared = reset_chat()
assert h_reset == []
assert cleared == ""
print("reset: PASS")

print("\nREGRESSION_TEST_PASS")
