import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
import gradio as gr
from gradio import ChatMessage

# Simulate what Gradio does: validate a list of dicts
chatbot = gr.Chatbot()

# Test 1: empty list — should pass
try:
    chatbot._check_format([])
    print("PASS: empty list")
except Exception as e:
    print(f"FAIL empty list: {e}")

# Test 2: correct dict format
try:
    chatbot._check_format([
        {"role": "user", "content": "hello"},
        {"role": "assistant", "content": "hi"},
    ])
    print("PASS: dict format")
except Exception as e:
    print(f"FAIL dict format: {e}")

# Test 3: ChatMessage objects
try:
    chatbot._check_format([
        ChatMessage(role="user", content="hello"),
        ChatMessage(role="assistant", content="hi"),
    ])
    print("PASS: ChatMessage objects")
except Exception as e:
    print(f"FAIL ChatMessage: {e}")

# Test 4: OLD tuple format — this is what causes the error
try:
    chatbot._check_format([["hello", "hi"]])
    print("PASS: tuple format (unexpected)")
except Exception as e:
    print(f"FAIL tuple format (expected): {e}")

# Test 5: dict missing 'content'
try:
    chatbot._check_format([{"role": "user"}])
    print("PASS: missing content (unexpected)")
except Exception as e:
    print(f"FAIL missing content (expected): {e}")

# Test 6: what postprocess returns — check the type
result = chatbot.postprocess([
    {"role": "user", "content": "hello"},
    {"role": "assistant", "content": "hi"},
])
print(f"\npostprocess returns type: {type(result)}")
print(f"postprocess root type: {type(result.root)}")
print(f"postprocess root[0] type: {type(result.root[0])}")
print(f"postprocess root[0]: {result.root[0]}")

# Test 7: what preprocess returns (what Gradio sends TO the callback)
raw = chatbot.preprocess(result)
print(f"\npreprocess returns type: {type(raw)}")
if raw:
    print(f"preprocess[0] type: {type(raw[0])}")
    print(f"preprocess[0]: {raw[0]}")
