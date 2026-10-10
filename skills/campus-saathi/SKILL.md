---
name: campus-saathi
description: >
  CampusSaathi AI is a smart campus assistant for Kalinga University, Raipur.
  It helps students report campus problems, track complaint status, ask questions
  about campus facilities, and summarize university notices — all powered by
  Gemma 4 (gemma-4-26b-a4b-it) via the Gemini API.
license: MIT
metadata:
  author: CampusSaathi Team — MLH Hack Day, IIT Bhilai
  model: gemma-4-26b-a4b-it
  version: 1.0.0
  entry_point: campus_saathi/app.py
  repository: https://github.com/RudraDudhat2509/gemma4-starter
---

# CampusSaathi AI — Agent Skill

CampusSaathi AI is an open-source smart campus platform built with Gemma 4.
Use this skill to help students navigate campus life at Kalinga University.

## Capabilities

### 1. Campus AI Assistant

Answer student questions about Kalinga University campus facilities.

**Use when:** A student asks about hostel rules, canteen timings, library access,
transport routes, lab availability, health services, or sports facilities.

**How to use:**
- Call `campus_saathi/ai.py → campus_chat(history, user_message)`
- Pass conversation history as `[{"role": "user"|"assistant", "content": "..."}]`
- The system prompt instructs Gemma 4 to stay factual and admit uncertainty
- Never invent opening hours, prices, contact numbers, or official policies
- Direct students to `kalingauniversity.ac.in` for verified official information

**Example input:** `"What are the library timings?"`

**Example output:** A helpful response noting that Gemma 4 does not have live
university data and recommending the student check the official website.

### 2. Complaint Analyzer

Analyze a student complaint and return structured data for routing and tracking.

**Use when:** A student submits a campus problem report.

**How to use:**
- Call `campus_saathi/ai.py → analyze_complaint(category, location, description)`
- Returns JSON: `{category, summary, description, priority, priority_reason, next_action, missing_info}`
- Priority values: `Low`, `Medium`, `High`, `Critical`
- Categories: Canteen & Mess, Washrooms, Parking, Hostel, Library,
  Labs & Classrooms, Transport, Health & Safety, Sports & Other

**Important:** Complaints are stored locally (MVP). They are not automatically
forwarded to university staff. Always make this clear to the student.

### 3. Smart Notice Summarizer

Extract key information from university notices.

**Use when:** A student pastes a notice or uploads a notice image.

**How to use:**
- Text: call `campus_saathi/ai.py → summarize_notice(text)`
- Image: call `gemma_client.ask_with_image(path, prompt)` then `summarize_notice(extracted_text)`
- Returns JSON: `{summary, dates, action_items, missing_info}`
- Never invent dates or deadlines not present in the source text
- Always label the output as AI-generated and advise verification against the original

## Constraints

- Always use `gemma-4-26b-a4b-it` via the Gemini API. Do not switch models.
- Never hard-code or expose the `GEMINI_API_KEY`. Read it from the environment.
- Do not claim official university affiliation or endorsement.
- Do not submit complaints or update statuses without explicit user confirmation.
- Do not record, store, or transmit audio. Voice input uses browser-native speech
  recognition; only the text transcript reaches the backend.
- Label all AI responses as suggestions, not official decisions.

## Running the skill

```powershell
# Backend (FastAPI)
uvicorn backend.main:app --reload --port 8000

# Frontend (React)
cd frontend && npm run dev

# Gradio fallback
python campus_saathi/app.py
```

## Testing

```powershell
python tests/test_gemma_diagnostic.py   # live Gemma 4 connection
python tests/test_chat_fix.py           # real chat pipeline
python tests/test_chat_regression.py    # offline format regression
python tests/_test_backend.py           # API endpoints (backend must be running)
```

## References

- [Gemma 4 on Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api)
- [Kalinga University](https://www.kalingauniversity.ac.in)
- [Agent Skill Open Standard](https://agentskills.io/specification)
