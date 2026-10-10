"""AI functions powered by Gemma 4 via gemma_client."""

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import gemma_client

_CAMPUS_SYSTEM = """You are CampusSaathi, the AI assistant for Kalinga University, Raipur.
Help students with campus questions: facilities, hostel, canteen, library, labs, transport, health, sports.
Rules:
- Be friendly, concise and helpful.
- Never invent opening hours, prices, policies, contact numbers or official announcements.
- If you don't know something, say so clearly and suggest the student check: kalingauniversity.ac.in
- Keep answers under 200 words unless detail is truly needed."""

_COMPLAINT_SYSTEM = """You are a campus complaint analyst. Given a student complaint, return ONLY valid JSON:
{
  "category": "<one of: Canteen & Mess, Washrooms, Parking, Hostel, Library, Labs & Classrooms, Transport, Health & Safety, Sports & Other>",
  "summary": "<one sentence, max 15 words>",
  "description": "<clear restatement, max 40 words>",
  "priority": "<one of: Low, Medium, High, Critical>",
  "priority_reason": "<one sentence>",
  "next_action": "<recommended next step>",
  "missing_info": "<what clarification would help, or empty string>"
}
Return only the JSON object. No markdown fences. No extra text."""

_NOTICE_SYSTEM = """You are a university notice summarizer. Return ONLY valid JSON:
{
  "summary": "<2-3 sentence plain-language summary>",
  "dates": ["<explicit dates/deadlines from the text>"],
  "action_items": ["<things students must do>"],
  "missing_info": "<note if key details are absent, else empty string>"
}
Never invent dates or details. Return only the JSON object."""

# Chat session stored at module level (one session per process)
_chat_session = None


def _extract_json(raw: str) -> dict:
    """Extract JSON from model output, handling markdown fences robustly."""
    # Remove ```json ... ``` or ``` ... ``` fences
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).replace("```", "").strip()
    # Try direct parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    # Find first { ... } block
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError("No valid JSON found in model response")


def _normalize_history(history: list) -> list:
    """Ensure every message has plain-string content.

    Gradio 6 preprocesses chatbot state so that content becomes
    [{'text': '...', 'type': 'text'}] instead of a plain string.
    This converts it back to str so the returned list is uniform.
    """
    normalized = []
    for msg in history:
        if not isinstance(msg, dict):
            continue
        content = msg.get("content", "")
        if isinstance(content, list):
            # Extract text from Gradio's internal TextMessage dicts
            parts = []
            for part in content:
                if isinstance(part, dict) and "text" in part:
                    parts.append(part["text"])
                elif isinstance(part, str):
                    parts.append(part)
                else:
                    parts.append(str(part))
            content = "".join(parts)
        normalized.append({"role": msg.get("role", "user"), "content": str(content)})
    return normalized


def campus_chat(history: list, user_message: str) -> tuple[list, str]:
    """Stateful chat. history is Gradio 6 messages format: [{role, content}, ...]."""
    global _chat_session
    if not user_message.strip():
        return history, ""
    # Normalize history to plain strings before appending
    history = _normalize_history(history)
    try:
        if _chat_session is None:
            _chat_session = gemma_client.make_chat(system=_CAMPUS_SYSTEM)
        reply = _chat_session.send_message(user_message)
    except Exception as e:
        reply = gemma_client.describe_error(e)
    history = history + [
        {"role": "user",      "content": user_message},
        {"role": "assistant", "content": reply},
    ]
    return history, ""


def reset_chat() -> tuple[list, str]:
    global _chat_session
    _chat_session = None
    return [], ""


def analyze_complaint(category: str, location: str, description: str) -> dict:
    """Ask Gemma to analyze a complaint and return structured data."""
    prompt = f"Category hint: {category}\nLocation: {location}\nComplaint: {description}"
    try:
        raw = gemma_client.ask(prompt, system=_COMPLAINT_SYSTEM)
        return _extract_json(raw)
    except Exception:
        return {
            "category": category,
            "summary": description[:80],
            "description": description[:200],
            "priority": "Medium",
            "priority_reason": "Could not analyze automatically.",
            "next_action": "Submit complaint for manual review.",
            "missing_info": "",
        }


def summarize_notice(text: str) -> dict:
    """Summarize a notice and extract dates and action items."""
    if len(text.strip()) < 20:
        return {"summary": "No notice text provided.", "dates": [], "action_items": [], "missing_info": ""}
    try:
        raw = gemma_client.ask(text[:3000], system=_NOTICE_SYSTEM)
        return _extract_json(raw)
    except Exception:
        return {"summary": "Could not summarize. Please try again.", "dates": [], "action_items": [], "missing_info": ""}
