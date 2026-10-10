import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
import gradio as gr, inspect

# Get _check_format source
src = inspect.getsource(gr.Chatbot._check_format)
print("_check_format source:\n", src)
