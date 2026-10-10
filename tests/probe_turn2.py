import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
import gradio as gr

chatbot = gr.Chatbot()

# Turn 1: campus_chat returns plain string content
turn1_output = [
    {"role": "user",      "content": "hii"},
    {"role": "assistant", "content": "Hello! How can I help?"},
]

# Gradio postprocesses this to internal format, then preprocesses back for turn 2
internal = chatbot.postprocess(turn1_output)
turn2_input = chatbot.preprocess(internal)

print("Turn 2 input to campus_chat:")
for m in turn2_input:
    print(f"  role={m['role']!r}  content type={type(m['content']).__name__}  content={m['content']!r}")

# Now campus_chat appends new plain-string messages
turn2_output = turn2_input + [
    {"role": "user",      "content": "What is the hostel like?"},
    {"role": "assistant", "content": "The hostel has rooms..."},
]

print("\nTurn 2 output (mixed content types):")
for m in turn2_output:
    print(f"  role={m['role']!r}  content type={type(m['content']).__name__}")

# Does postprocess accept this mixed list?
try:
    chatbot._check_format(turn2_output)
    print("\n_check_format: PASS")
    result = chatbot.postprocess(turn2_output)
    print("postprocess: PASS")
except Exception as e:
    print(f"\nFAIL: {e}")
