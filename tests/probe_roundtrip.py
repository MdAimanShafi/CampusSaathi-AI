import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
import gradio as gr
from campus_saathi.ai import campus_chat, reset_chat

chatbot = gr.Chatbot()
reset_chat()

print("=== TURN 1 ===")
# Gradio sends [] (empty) as history on first message
history_in_1 = []
history_out_1, cleared = campus_chat(history_in_1, "hii")
print(f"campus_chat returned {len(history_out_1)} messages")
for m in history_out_1:
    print(f"  {m['role']}: content type={type(m['content']).__name__!r}, value={str(m['content'])[:50]!r}")

# Gradio postprocesses the return value
try:
    internal_1 = chatbot.postprocess(history_out_1)
    print("postprocess turn1: OK")
except Exception as e:
    print(f"postprocess turn1 FAIL: {e}")
    sys.exit(1)

print("\n=== TURN 2 ===")
# Gradio preprocesses the internal state to send back to campus_chat
history_in_2 = chatbot.preprocess(internal_1)
print(f"preprocess returned {len(history_in_2)} messages")
for m in history_in_2:
    print(f"  {m['role']}: content type={type(m['content']).__name__!r}, value={str(m['content'])[:60]!r}")

# campus_chat appends new plain-string messages to the preprocessed history
history_out_2, _ = campus_chat(history_in_2, "What is the hostel like?")
print(f"\ncampus_chat returned {len(history_out_2)} messages")
for m in history_out_2:
    print(f"  {m['role']}: content type={type(m['content']).__name__!r}")

# Gradio postprocesses the return value — this is where the error fires
try:
    internal_2 = chatbot.postprocess(history_out_2)
    print("postprocess turn2: OK")
except Exception as e:
    print(f"postprocess turn2 FAIL: {e}")
