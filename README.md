# 🎓 AI Study Buddy

An AI-powered learning assistant that explains concepts, summarizes notes, generates quizzes and flashcards, and answers doubts through a chat tutor. Built with Flask and the OpenRouter API.

**🔗 Live Demo:** https://ai-study-buddy-jrsr.onrender.com/

> The demo is hosted on a free Render instance, so the first load may take around 30–60 seconds while the server wakes up.

Built as my project during the **6-week AICTE AI/ML Internship** (Edunet Foundation, in collaboration with IBM SkillsBuild), Jan – Feb 2026.

---

## ✨ Features

| Feature | What it does |
|---|---|
| 💡 **Concept Explainer** | Enter any topic and get a simple explanation, a detailed explanation, a real-life example, and a step-by-step breakdown |
| 📝 **Notes Summarizer** | Paste your notes and get a short summary, key bullet points, and key takeaways |
| ❓ **Quiz Generator** | Generates 5 multiple-choice questions at Easy, Medium, or Hard difficulty, with answer checking and a PDF download |
| 🃏 **Flashcard Generator** | Creates flip-style flashcards for quick revision |
| 💬 **AI Chat** | A friendly "Study Buddy" tutor that remembers the last 10 messages for context |
| 📚 **History** | Keeps a history of your sessions, with an option to clear it |

## 🛠️ Tech Stack

- **Backend:** Python, Flask
- **AI:** OpenRouter API (Google Gemini model), accessed with the OpenAI Python SDK
- **Frontend:** HTML, CSS, JavaScript (Flask templates and static files)
- **Config:** python-dotenv for environment variables
- **Hosting:** Render

## 📁 Project Structure

```
ai-study-buddy/
├── .devcontainer/      # Dev container configuration
├── static/             # CSS, JavaScript, and other static assets
├── templates/          # HTML templates (index.html)
├── .env.example        # Example environment variables
├── .gitignore
├── app.py              # Flask backend and API routes
└── requirements.txt    # Python dependencies
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the web app |
| `POST` | `/api/explain` | Concept explainer |
| `POST` | `/api/summarize` | Notes summarizer |
| `POST` | `/api/quiz` | Quiz generator (topic and difficulty) |
| `POST` | `/api/flashcards` | Flashcard generator (topic and count) |
| `POST` | `/api/chat` | AI tutor chat (message and history) |

The AI is prompted to return structured JSON. The backend cleans the response and falls back gracefully if parsing fails.

## 🚀 Run Locally

**1. Clone the repository**

```bash
git clone https://github.com/KatariTrivikram/ai-study-buddy.git
cd ai-study-buddy
```

**2. Create a virtual environment (optional but recommended)**

```bash
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
```

**3. Install dependencies**

```bash
pip install -r requirements.txt
```

**4. Add your OpenRouter API key**

Create a `.env` file in the project root (see `.env.example`):

```
OPENROUTER_API_KEY=your_api_key_here
```

You can get a key from [openrouter.ai](https://openrouter.ai/).

**5. Run the app**

```bash
python app.py
```

Then open http://127.0.0.1:5000 in your browser.

## 📸 Screenshots

<!-- Add screenshots here, for example: -->
<!-- ![Home](screenshots/home.png) -->

## 🔮 Future Improvements

- User accounts with saved study history
- Streaming responses in the chat
- Support for uploading PDF notes

## 👤 Author

**Trivikram Katari**

- GitHub: [KatariTrivikram](https://github.com/KatariTrivikram)
- LinkedIn: [trivikramkatari](https://www.linkedin.com/in/trivikramkatari/)
- Email: trivikramkatari@gmail.com
