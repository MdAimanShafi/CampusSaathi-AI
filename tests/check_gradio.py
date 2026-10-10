import gradio
print(gradio.__version__)
# Check what Chatbot type parameter expects
import inspect
sig = inspect.signature(gradio.Chatbot.__init__)
print("Chatbot params:", list(sig.parameters.keys())[:10])
