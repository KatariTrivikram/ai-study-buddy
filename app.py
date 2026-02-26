"""
AI-Powered Study Buddy - Flask Backend
IBM Edunet Foundation Internship Project
"""

import os
import json
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from openai import OpenAI

# ── Load environment variables ──────────────────────────────────────────────
load_dotenv()

# ── Configure OpenRouter API ────────────────────────────────────────────────
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY not found. Create a .env file with your key.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

MODEL = "google/gemini-2.0-flash-001"  # Free-tier model on OpenRouter

# ── Flask app ───────────────────────────────────────────────────────────────
app = Flask(__name__)


# ── Helper: call OpenRouter and return text ─────────────────────────────────
def ask_ai(prompt: str) -> str:
    """Send a prompt to OpenRouter and return the response text."""
    try:
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        return completion.choices[0].message.content
    except Exception as e:
        raise RuntimeError(f"OpenRouter API error: {str(e)}")


# ── Routes ──────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


# 1. Concept Explainer -------------------------------------------------------
@app.route("/api/explain", methods=["POST"])
def explain_concept():
    data = request.get_json()
    topic = data.get("topic", "").strip()
    if not topic:
        return jsonify({"error": "Topic is required."}), 400

    prompt = f"""You are an expert teacher. Explain the topic: "{topic}"

Return your response in the following JSON format ONLY (no markdown, no code fences):
{{
  "simple": "A simple one-paragraph explanation a beginner can understand",
  "detailed": "A detailed multi-paragraph explanation with depth",
  "example": "A real-life relatable example illustrating the concept",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
}}"""

    try:
        raw = ask_ai(prompt)
        # Strip markdown code fences if present
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        result = json.loads(cleaned)
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({
            "simple": raw,
            "detailed": "",
            "example": "",
            "steps": []
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2. Notes Summarizer --------------------------------------------------------
@app.route("/api/summarize", methods=["POST"])
def summarize_notes():
    data = request.get_json()
    notes = data.get("notes", "").strip()
    if not notes:
        return jsonify({"error": "Notes text is required."}), 400

    prompt = f"""You are an expert academic summarizer. Summarize the following notes.

Notes:
\"\"\"
{notes}
\"\"\"

Return your response in the following JSON format ONLY (no markdown, no code fences):
{{
  "summary": "A concise 2-3 sentence summary",
  "bullets": ["Key point 1", "Key point 2", "Key point 3"],
  "takeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}}"""

    try:
        raw = ask_ai(prompt)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        result = json.loads(cleaned)
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({
            "summary": raw,
            "bullets": [],
            "takeaways": []
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 3. Quiz Generator -----------------------------------------------------------
@app.route("/api/quiz", methods=["POST"])
def generate_quiz():
    data = request.get_json()
    topic = data.get("topic", "").strip()
    difficulty = data.get("difficulty", "Medium").strip()
    if not topic:
        return jsonify({"error": "Topic is required."}), 400

    prompt = f"""You are a quiz master. Generate exactly 5 multiple-choice questions on "{topic}" at {difficulty} difficulty.

Return your response in the following JSON format ONLY (no markdown, no code fences):
{{
  "questions": [
    {{
      "question": "The question text?",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "answer": "A",
      "explanation": "Brief explanation of why A is correct"
    }}
  ]
}}"""

    try:
        raw = ask_ai(prompt)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        result = json.loads(cleaned)
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse quiz. Please try again."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 4. Flashcard Generator ------------------------------------------------------
@app.route("/api/flashcards", methods=["POST"])
def generate_flashcards():
    data = request.get_json()
    topic = data.get("topic", "").strip()
    count = data.get("count", 6)
    if not topic:
        return jsonify({"error": "Topic is required."}), 400

    prompt = f"""You are a study assistant. Generate {count} flashcards on the topic: "{topic}"

Return your response in the following JSON format ONLY (no markdown, no code fences):
{{
  "flashcards": [
    {{
      "question": "What is ...?",
      "answer": "The answer is ..."
    }}
  ]
}}"""

    try:
        raw = ask_ai(prompt)
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        result = json.loads(cleaned)
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse flashcards. Please try again."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 5. AI Chat ------------------------------------------------------------------
@app.route("/api/chat", methods=["POST"])
def ai_chat():
    data = request.get_json()
    message = data.get("message", "").strip()
    history = data.get("history", [])
    if not message:
        return jsonify({"error": "Message is required."}), 400

    context = ""
    if history:
        context = "Previous conversation:\n"
        for msg in history[-10:]:  # Keep last 10 messages for context
            role = "Student" if msg.get("role") == "user" else "Buddy"
            context += f"{role}: {msg.get('content', '')}\n"
        context += "\n"

    prompt = f"""{context}You are "Study Buddy", a friendly and knowledgeable AI tutor. 
A student asks: "{message}"

Give a clear, helpful, and encouraging response. Use examples when helpful.
Keep the response concise but thorough. Format with markdown if helpful."""

    try:
        raw = ask_ai(prompt)
        return jsonify({"reply": raw})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Run ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run()
