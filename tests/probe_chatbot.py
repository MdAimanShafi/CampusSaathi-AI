import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
import gradio as gr

print("Gradio version:", gr.__version__)

# Check what ChatMessage looks like if it exists
try:
    from gradio import ChatMessage
    print("ChatMessage exists:", ChatMessage.__doc__)
    import inspect
    print("ChatMessage fields:", inspect.signature(ChatMessage.__init__))
except ImportError:
    print("No ChatMessage class")

# Check the Chatbot value validator source to understand accepted formats
import inspect
src = inspect.getsource(gr.Chatbot.postprocess)
print("\nChatbot.postprocess source (first 800 chars):\n", src[:800])
