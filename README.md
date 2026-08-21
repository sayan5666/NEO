# Multi-Agent AI Interview Platform (Neo-Intv)

A production-grade, distributed microservices application for orchestrating stateful, multi-agent AI technical and behavioral interview sessions with real-time token streaming, automated evaluator critiques, and PDF export.

---

## 🏛️ System Architecture

```text
                                  ┌───────────────────────────────┐
                                  │      Client (Next.js / Vite)  │
                                  │       Port 3000 / 5173        │
                                  └───────────────┬───────────────┘
                                                  │ (HTTP / WebSocket)
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │      Express API Gateway      │
                                  │           Port 5000           │
                                  └──────┬────────┬────────┬──────┘
                                         │        │        │
                   ┌─────────────────────┘        │        └─────────────────────┐
                   ▼                              ▼                              ▼
        ┌─────────────────────┐        ┌─────────────────────┐        ┌─────────────────────┐
        │     Auth Service    │        │  Interview Service  │        │   AI Agent Service  │
        │    Node / Express   │        │    Node / Express   │        │   Python / FastAPI  │
        │      Port 5001      │        │      Port 5002      │        │      Port 8000      │
        └──────────┬──────────┘        └──────────┬──────────┘        └──────────┬──────────┘
                   │                              │                              │
                   │ (Mongoose)                   │ (Mongoose / Socket.io)       │ (LangGraph / Gemini)
                   ▼                              ▼                              ▼
        ┌────────────────────────────────────────────────────┐        ┌─────────────────────┐
        │                    MongoDB 7.0                     │        │     Redis 7.0       │
        │              Document & Report Store               │        │ Pub/Sub & Rate Limit│
        │                     Port 27017                     │        │      Port 6379      │
        └────────────────────────────────────────────────────┘        └─────────────────────┘
```

### Multi-Agent Interview Flow (LangGraph)
1. **Screening Agent**: Evaluates candidate background and resume context.
2. **Technical Agent (Rounds 1 & 2)**: Probes deep architecture, concurrency, system design, and algorithms.
3. **Coding Agent (Live Coding Round)**: Presents an algorithmic/system implementation problem evaluated in an in-browser Monaco Editor with sandbox execution (`/interview/:sessionId/code`).
4. **Behavioral Agent**: Evaluates team dynamics, outage scenarios, and STAR methodology.
5. **Evaluator Agent**: Synthesizes the final critique, numerical competency scores, sentiment analysis, observations, and transcript snippets.

---

## 📦 Services Overview

| Service | Technology | Port | Purpose |
| :--- | :--- | :--- | :--- |
| **Gateway** | Express / HTTP-Proxy | `5000` | Central routing, CORS, proxying, and WebSocket bridging |
| **Auth Service** | Node / Express / JWT | `5001` | User registration, login, JWT verification, resume upload & parsing |
| **Interview Service** | Node / Express / Socket.io | `5002` | Session persistence, state transitions, Socket.io rooms, reports |
| **AI Agent Service** | FastAPI / LangGraph / Gemini | `8000` | Multi-agent state graph, Redis token streaming, live code execution, rate limiting |
| **Client** | Next.js 15 / React / Tailwind | `3000` / `5173` | Neo-brutalist interactive UI, Monaco Code IDE, Voice Dictation, PDF export |
| **MongoDB** | Mongo 7.0 | `27017` | Persistent storage for users, sessions, and evaluation reports |
| **Redis** | Redis 7 Alpine | `6379` | Real-time Pub/Sub streaming (`interview:<sessionId>`) & rate limiting |

---

## 💡 Advanced Features

### 1. Live Coding Round & Sandbox Execution
- **Interactive Monaco Editor**: Integrated `@monaco-editor/react` with multi-language support (JavaScript, TypeScript, Python 3, Go).
- **Dedicated Route**: Candidates can launch the dedicated IDE step at `/interview/:sessionId/code` or transition dynamically via the `coding_agent`.
- **Dual Execution Engine**:
  - Direct integration with Judge0 API via `POST /code/execute` when `JUDGE0_API_KEY` is provided.
  - Built-in sandboxed runner fallback with sub-millisecond execution metrics, memory tracking, and captured stdout/stderr.
- **Deep AI Evaluation**: The `coding_agent` critiques correctness, time/space Big-O complexity, and modular code architecture.

### 2. Voice-Based Interaction
- **Speech-to-Text Dictation**: Push-to-talk and continuous voice input powered by the Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
- **Text-to-Speech Question Readout**: Real-time browser audio playback using `speechSynthesis`.
- **Silent Degradation**: Gracefully falls back to text input if audio devices are unavailable or unsupported.

---

## 🚀 Quick Start (Docker Compose)

### 1. Prerequisites
- [Docker Engine](https://docs.docker.com/engine/install/) (v24.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.20+)
- Google Gemini API Key

### 2. Environment Setup
Copy the environment files for each service:

```bash
cp services/gateway/.env.example services/gateway/.env
cp services/auth-service/.env.example services/auth-service/.env
cp services/interview-service/.env.example services/interview-service/.env
cp services/ai-agent-service/.env.example services/ai-agent-service/.env
cp client/.env.example client/.env
```

Export your Gemini API Key:
```bash
export GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Launch the Stack
Run from the root directory:
```bash
docker-compose up --build
```

The services will initialize in sequence:
- Web Application: `http://localhost:3000` (or `http://localhost:5173`)
- API Gateway: `http://localhost:5000`
- AI Agent Service Swagger Docs: `http://localhost:8000/docs`

---

## 🛡️ Standardized Error Response Format

All microservices adhere to a consistent JSON error schema:

```json
{
  "success": false,
  "message": "Human-readable description of the error",
  "error": "ERROR_CODE_OR_TYPE",
  "status": 400
}
```

---

## ⏱️ Redis-Backed Rate Limiting

The AI agent endpoints (`/interview/ask` and `/api/interview/ask`) enforce Redis-backed rate limiting to prevent denial-of-service and LLM quota exhaustion:
- **Default Limit**: 30 requests per 60-second sliding window per client session / IP address.
- **Exceeded Response**: HTTP 429 Too Many Requests.
- **Fail-Open Strategy**: If Redis is temporarily unreachable, the service gracefully degrades to local sliding window memory without dropping valid user requests.

---

## 📚 Key API Endpoints

### 1. AI Agent Workflow
- `POST /api/interview/ask` (Proxied to `:8000/interview/ask`)
  - **Body**: `{ "sessionId": "...", "role": "Senior Backend Engineer", "resumeText": "...", "transcript": [...], "candidateAnswer": "..." }`
  - **Response**: `{ "success": true, "agent": "TECHNICAL_AGENT", "nextQuestion": "...", "isComplete": false, "report": null }`

### 2. Authentication & Resume
- `POST /api/auth/signup` — Create user account (`name`, `email`, `password`, `resumeUrl`)
- `POST /api/auth/login` — Authenticate and receive JWT tokens
- `POST /api/resume/upload` — Upload PDF resume (extracts text, computes word count, generates summary)

### 3. Sessions & Evaluation Reports
- `POST /api/sessions` — Start an interview session (`role`, `track`)
- `GET /api/sessions/:id` — Retrieve session status and transcript
- `GET /api/reports/:sessionId` — Fetch structured evaluation report & critique metrics
- `POST /api/reports` — Save or update evaluation report

---

## 📄 PDF Export
The final report page (`/report/:sessionId`) includes full high-resolution PDF export powered by `html2canvas` and `jspdf`, generating branded Neo-Intv evaluation reports with score breakdowns, competency matrices, and evaluator observations.
