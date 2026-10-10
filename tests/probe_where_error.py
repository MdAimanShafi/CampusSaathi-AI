import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
import gradio as gr
import inspect

# Find all methods that call _check_format
src = inspect.getsource(gr.Chatbot)
# Find every occurrence
lines = src.split('\n')
for i, line in enumerate(lines):
    if '_check_format' in line or 'check_format' in line:
        print(f"Line {i}: {line}")

print("\n--- preprocess source ---")
print(inspect.getsource(gr.Chatbot.preprocess))
