"""Verify the Gradio app builds (all components instantiate) without launching."""
import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
from campus_saathi.app import build_app
demo = build_app()
# Confirm it's a Gradio Blocks instance
assert hasattr(demo, 'launch'), "Expected a Gradio Blocks object"
print(f"app_build_ok: {type(demo).__name__}")
