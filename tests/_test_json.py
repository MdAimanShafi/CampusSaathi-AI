import sys
sys.path.insert(0, 'C:/Users/DELL/gemma4-starter')
from campus_saathi.ai import _extract_json

# Plain JSON
assert _extract_json('{"priority": "High"}') == {"priority": "High"}

# With ```json fence
assert _extract_json('```json\n{"priority": "High"}\n```') == {"priority": "High"}

# With plain ``` fence
assert _extract_json('```\n{"priority": "Low"}\n```') == {"priority": "Low"}

# JSON embedded in prose
assert _extract_json('Here is the result: {"priority": "Medium"} done.') == {"priority": "Medium"}

print("json_extraction_ok")
