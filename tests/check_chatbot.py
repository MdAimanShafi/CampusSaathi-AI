import gradio as gr, inspect
sig = inspect.signature(gr.Chatbot.__init__)
print("All params:", list(sig.parameters.keys()))
