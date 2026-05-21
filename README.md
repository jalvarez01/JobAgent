# JobAgent - Profile Manager

## Student Information
- **Full Name:** Juan José Álvarez Ocampo, Cristian Bolaños, Leovanis Buelvas, Juan David Bedoya, Diego Aza
- **Class:** Ingeniería de Software
- **Course:** 5131
- **University:** Universidad EAFIT
- **Semester:** 2026-1

---

## Project Description

JobAgent is an intelligent job search assistant built for the Magneto365 engineering challenge. Instead of asking candidates to fill out endless forms, JobAgent reads their resume and lets AI agents handle the rest: structuring the profile, finding matching jobs, applying automatically, and supporting recruiters with AI-generated rankings, interview questions and invitation messages.

**Core promise:** *"Give me your resume and your expectations; JobAgent gets you interviews."*

### Key Features

#### For candidates
- **CV upload with AI extraction.** Upload a PDF or DOCX resume and five LangGraph agents extract structured data (skills, education, experience, languages) and pre-fill the profile.
- **Smart recommendations.** The matching engine scores every active vacancy against the candidate skills, with bonuses for salary expectations and preferred modality.
- **500 vacancies in 14 areas.** Real Colombian companies across technology, health, law, finance, engineering, marketing, design, education, hospitality, communication, sciences, HR, architecture and trainee programs.
- **Filters and search.** By area, modality, location, and salary range.
- **Kanban tracking board.** Five-stage pipeline (applied → under review → interview → offer → rejected) with full audit trail.
- **Favorites.** Save vacancies to revisit later.
- **Skills gap analysis.** See which skills you are missing and how many vacancies you would unlock by learning each one. Mark skills as "learning" to track progress.
- **CV export to PDF.** Generate a clean professional PDF of your profile with one click.
- **Notifications.** In-app bell that polls for new updates on applications and interviews.
- **Password recovery.** Self-service reset flow with single-use tokens.
- **Help center.** Built-in FAQ.

#### For administrators
- **Restricted admin panel** at `/admin` with its own login.
- **Analytics dashboard.** Live KPIs, top demanded skills, top candidate skills, most popular vacancies, educational distribution.
- **Vacancy CRUD.** Create, edit, deactivate vacancies.
- **Application kanban.** Manage every application across stages with internal notes.
- **Interview management.** Schedule interviews and score them across four sub-dimensions (technical, communication, knowledge, attitude) with automatic total and level calculation.
- **AI candidate ranking.** One click in any vacancy returns the top 5 candidates ranked by Llama 3.3-70b with score, strengths, weaknesses, matching and missing skills, plus a written justification. Falls back to deterministic ranking if the LLM is unavailable.
- **AI interview question generator.** Produces 6 to 7 personalized questions per candidate, categorized (technical, behavioral, experience, motivation, closing), with the objective and a hint for the interviewer.
- **AI invitation message generator.** Drafts the subject and body of the interview invitation in 150 to 220 words, with specific points about what the candidate should prepare based on the vacancy requirements. One-click copy or open in mail client.

---

## Architecture

The system follows **layered architecture with Domain-Driven Design** plus an agentic AI layer:

```
Frontend (React + Vite)
    ↓ HTTP REST + JWT
Backend (FastAPI + Python)
    ├── API Layer (routers)
    ├── Domain Layer
    │   ├── Services (perfil, recomendacion, postulacion,
    │   │            notificacion, favorito, entrevista,
    │   │            dashboard, brechas, cv_pdf,
    │   │            password_reset, ranking_ia, entrevista_ia)
    │   └── Agents (5 LangGraph nodes)
    ├── Infrastructure Layer
    │   ├── Persistence (SQLAlchemy + SQLite, 9 tables)
    │   ├── LLM (Groq Cloud — Llama 3.3-70b)
    │   └── Loaders (PyMuPDF4LLM, docx2txt)
    └── Graph Layer (LangGraph StateGraph)
```

**Agent Pipeline:** Cargar → Estructurar → Validar → Match → Postular

The same model (Llama 3.3-70b via Groq) powers three additional AI features that the recruiter triggers manually: candidate ranking, interview question generation and invitation drafting.

---

## Environment
- **Operating Systems:** macOS Tahoe 26.0.1 (Apple Silicon M4) / Windows 11 Pro / Ubuntu 24.04
- **Processor:** Apple M4 / Intel64 Family
- **Memory:** 16 GB RAM
- **Terminal:** zsh 5.9 (macOS) / PowerShell 5.1 (Windows) / bash (Linux)

---

## Prerequisites

1. **Python 3.11 or higher** — https://www.python.org/downloads/
2. **Node.js 18 or higher** — https://nodejs.org/
3. **npm** (bundled with Node.js)
4. **pip** (bundled with Python)
5. **Git** — https://git-scm.com/downloads
6. **Groq API Key** — https://console.groq.com/keys

---

## Installation and Setup

## Option A — Local

### Step 1: Get the Code

```bash
git clone https://github.com/jalvarez01/JobAgent.git
cd JobAgent
```

### Step 2: Backend Setup — Create a Virtual Environment

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

When the virtual environment is activated, `(venv)` appears at the beginning of your command line.

### Step 3: Install Backend Dependencies

```bash
pip install -r backend/requirements.txt
```

This installs FastAPI, Uvicorn, SQLAlchemy, Pydantic, LangChain, LangGraph, langchain-groq, PyMuPDF4LLM, docx2txt, ReportLab (PDF generation), PyJWT (authentication) and the rest of the stack.

### Step 4: Configure Environment Variables

Create a `.env` file in the project root with your Groq API key:

**On Windows:**
```bash
echo GROQ_API_KEY=your_groq_api_key_here > .env
```

**On macOS/Linux:**
```bash
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
```

### Step 5: Install Frontend Dependencies

In a **second terminal** (keep the backend one open):

```bash
cd frontend
npm install
```

### Step 6: Run the Backend Server

From the project root, with the virtual environment activated:

```bash
uvicorn backend.main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     [seed] 500 vacantes cargadas desde CSV
```

The database is created automatically on first startup. 500 sample vacancies across 14 areas are seeded from `data/vacantes.csv`.

### Step 7: Run the Frontend Server

In the second terminal, from `frontend/`:

```bash
npm run dev
```

You should see:
```
VITE v8.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Step 8: Open the Application

- **Landing and candidate app:** http://localhost:5173/
- **Admin panel:** http://localhost:5173/admin (default credentials: `admin` / `admin`)
- **API documentation (Swagger):** http://127.0.0.1:8000/docs
- **Health check:** http://127.0.0.1:8000/health

---

## Option B — Docker

### Step 1: Clone the repository

```bash
git clone https://github.com/jalvarez01/JobAgent.git
cd JobAgent
```

### Step 2: Configure environment variables

```bash
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
```

### Step 3: Build and run

```bash
docker compose up --build
```

### Step 4: Access

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs

### Step 5: Stop

```bash
docker compose down
```

---

## How to Use

### As a Candidate

1. **Landing page.** The first page introduces the product. Click "Comenzar gratis" to register or "Iniciar sesión" if you already have an account.
2. **Create an account.** Upload your CV (PDF or DOCX). The AI extracts your data automatically. Set a password and save.
3. **Login.** Email and password. The session persists across browser restarts.
4. **View recommendations.** Go to "Vacantes" to see jobs ranked by your skill match percentage. Filter by area, modality, location or salary range.
5. **Apply.** Click on a vacancy, optionally add a cover letter (up to 3000 characters), then submit.
6. **Track progress.** "Tablero" shows your applications in a Kanban board with the current stage of each.
7. **Check gaps.** "Brechas" lists the skills you're missing, prioritized by how many extra vacancies each would unlock.
8. **Export your CV.** From the profile view, click "Exportar como PDF" to download a professional version of your profile.
9. **Save favorites.** Bookmark vacancies you want to revisit.

### As an Admin

1. Navigate to http://localhost:5173/admin and log in with `admin` / `admin`.
2. **Dashboard.** First view, with live KPIs and analytics.
3. **Vacantes.** CRUD over vacancies. The "Mejor candidato" button on each vacancy triggers the AI ranking.
4. **Postulaciones.** Kanban over all applications. Move cards between stages, add internal notes, view attached cover letters.
5. **Entrevistas.** Schedule and score interviews with four sub-scores and automatic level calculation.
6. **IA Entrevistas.** Pick a candidate plus a vacancy from the postulation list, then either generate interview questions or draft an invitation message. Both flows are powered by Llama 3.3 via Groq.

---

## Project Structure

```

JobAgent
├─ README.md
├─ backend
│  ├─ __init__.py
│  ├─ api
│  │  ├─ __init__.py
│  │  ├─ ai.py
│  │  ├─ auth.py
│  │  ├─ brechas.py
│  │  ├─ cv.py
│  │  ├─ cv_export.py
│  │  ├─ dashboard.py
│  │  ├─ entrevistas.py
│  │  ├─ favoritos.py
│  │  ├─ notificaciones.py
│  │  ├─ perfil.py
│  │  ├─ pipeline.py
│  │  ├─ postulaciones.py
│  │  ├─ recuperacion.py
│  │  ├─ trazabilidad.py
│  │  └─ vacantes.py
│  ├─ config.py
│  ├─ data
│  ├─ dependencies.py
│  ├─ dockerfile
│  ├─ domain
│  │  ├─ __init__.py
│  │  ├─ agents
│  │  │  ├─ __init__.py
│  │  │  ├─ analizar.py
│  │  │  ├─ cargar.py
│  │  │  ├─ perfil_agent.py
│  │  │  ├─ postulacion_agent.py
│  │  │  ├─ recomendacion_agent.py
│  │  │  ├─ seguimiento_agent.py
│  │  │  ├─ vacantes_agent.py
│  │  │  └─ vacantes_pdf.py
│  │  └─ services
│  │     ├─ __init__.py
│  │     ├─ brechas_service.py
│  │     ├─ cv_pdf_service.py
│  │     ├─ dashboard_service.py
│  │     ├─ entrevista_ia_service.py
│  │     ├─ entrevista_service.py
│  │     ├─ favorito_service.py
│  │     ├─ notificacion_service.py
│  │     ├─ password_reset_service.py
│  │     ├─ perfil_service.py
│  │     ├─ postulacion_service.py
│  │     ├─ ranking_ia_service.py
│  │     └─ recomendacion_service.py
│  ├─ graph
│  │  ├─ __init__.py
│  │  ├─ builder.py
│  │  ├─ checkpointer.py
│  │  ├─ runner.py
│  │  └─ state.py
│  ├─ infrastructure
│  │  ├─ __init__.py
│  │  ├─ llm
│  │  │  ├─ __init__.py
│  │  │  └─ groq_provider.py
│  │  ├─ loaders
│  │  │  ├─ __init__.py
│  │  │  ├─ csv_loader.py
│  │  │  └─ pdf_loader.py
│  │  └─ persistence
│  │     ├─ __init__.py
│  │     ├─ database.py
│  │     ├─ models
│  │     │  ├─ __init__.py
│  │     │  ├─ entrevista.py
│  │     │  ├─ favorito.py
│  │     │  ├─ notificacion.py
│  │     │  ├─ password_reset_token.py
│  │     │  ├─ perfil.py
│  │     │  ├─ postulacion.py
│  │     │  ├─ skill_aprendizaje.py
│  │     │  ├─ traza.py
│  │     │  └─ vacante.py
│  │     └─ repositories
│  │        ├─ __init__.py
│  │        ├─ entrevista_repo.py
│  │        ├─ favorito_repo.py
│  │        ├─ notificacion_repo.py
│  │        ├─ password_reset_repo.py
│  │        ├─ perfil_repo.py
│  │        ├─ postulacion_repo.py
│  │        ├─ skill_aprendizaje_repo.py
│  │        └─ vacante_repo.py
│  ├─ main.py
│  ├─ requirements.txt
│  ├─ schemas
│  │  ├─ __init__.py
│  │  ├─ auth.py
│  │  ├─ cv.py
│  │  ├─ entrevista.py
│  │  ├─ favorito.py
│  │  ├─ notificacion.py
│  │  ├─ password_reset.py
│  │  ├─ postulacion.py
│  │  ├─ traza.py
│  │  └─ vacante.py
│  ├─ security.py
│  └─ storage
├─ data
│  ├─ jobagent.db
│  ├─ uploads
│  │  ├─ 079f475776054f02ac0a5acceab6db18_CV_ ESPAÑOL.docx
│  │  ├─ 0d551c07a6244c949360ae1fa5ef3915_CV_ ESPAÑOL.docx
│  │  ├─ 10f49e4d17d34073a0e775ad4fe9f2d3_CV_Inglés.pdf
│  │  ├─ 17495e3d0eda44cb904b2d34942cd4b9_CV_Inglés.pdf
│  │  ├─ 2c045cffab1142d19b9256097c606569_CV_ ESPAÑOL.docx
│  │  ├─ 33b5516c186a4ec1af7a87f4b866c006_CV_ ESPAÑOL.docx
│  │  ├─ 4836761154f5463c8df35b87b5e74917_CV_ ESPAÑOL.docx
│  │  ├─ 51f6405de9364e63aabc4495850f3c8e_CV_ ESPAÑOL.docx
│  │  ├─ 6343430051a84422a0e0ba106a90dab9_CV_Inglés.pdf
│  │  ├─ 687657f33e234506a6af9fe9788448f8_CV_Inglés.pdf
│  │  ├─ 6c934a011c9c4a70a49468b1e14f6708_cv_29_Marcela_Ortiz.pdf
│  │  ├─ 71e4dac33d5b4adb9538d23f372c5e15_CV_ ESPAÑOL.docx
│  │  ├─ 85625d7b09d844a1a7c241f5fbf25550_CV_ ESPAÑOL.docx
│  │  ├─ 8ab85207fa7849d480c3555c39f08402_CV_ ESPAÑOL.docx
│  │  ├─ 8eb82ff044e64f6cac13cea96d294126_cv_2_Felipe_Ruiz.pdf
│  │  ├─ b2e9b9cd256b404b97a0da6212ed0ebd_CV_ ESPAÑOL.docx
│  │  ├─ b6c949afb4074254806a43e99bd6f0f9_CV_Inglés.pdf
│  │  ├─ b6fc643961744420960e982b6e80585c_CV_ ESPAÑOL.docx
│  │  ├─ bb4506e6cc444f4a84c2ceb1bb3993d6_cv_1_Diego_Moreno.pdf
│  │  └─ c99700c855f64df9ba6bf509bea1773c_CV_ ESPAÑOL.docx
│  └─ vacantes.csv
├─ docker-compose.yml
├─ frontend
│  ├─ .vite
│  │  └─ deps
│  │     ├─ _metadata.json
│  │     ├─ package.json
│  │     ├─ react-FLDBkK74.js
│  │     ├─ react-FLDBkK74.js.map
│  │     ├─ react-dom_client.js
│  │     ├─ react-dom_client.js.map
│  │     ├─ react.js
│  │     ├─ react_jsx-dev-runtime.js
│  │     └─ react_jsx-dev-runtime.js.map
│  ├─ README.md
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-CTQJuQtq.js
│  │  │  └─ index-nqMpL4T3.css
│  │  ├─ favicon.png
│  │  └─ index.html
│  ├─ dockerfile
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  └─ favicon.png
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ api
│  │  │  ├─ ai.js
│  │  │  ├─ auth.js
│  │  │  ├─ brechas.js
│  │  │  ├─ client.js
│  │  │  ├─ cv.js
│  │  │  ├─ cvExport.js
│  │  │  ├─ dashboard.js
│  │  │  ├─ entrevistas.js
│  │  │  ├─ favoritos.js
│  │  │  ├─ notificaciones.js
│  │  │  ├─ perfil.js
│  │  │  ├─ postulaciones.js
│  │  │  ├─ recuperacion.js
│  │  │  └─ vacantes.js
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  └─ pages
│  │     ├─ AdminDashboard.jsx
│  │     ├─ AdminEntrevistas.jsx
│  │     ├─ AdminEntrevistasIA.jsx
│  │     ├─ AdminPostulaciones.jsx
│  │     ├─ AdminVacantes.jsx
│  │     ├─ Ayuda.jsx
│  │     ├─ Brechas.jsx
│  │     ├─ BtnExportarCV.jsx
│  │     ├─ CrearPerfil.jsx
│  │     ├─ DetalleVacante.jsx
│  │     ├─ EditarPerfil.jsx
│  │     ├─ Entrevistas.jsx
│  │     ├─ Favoritos.jsx
│  │     ├─ Landing.jsx
│  │     ├─ Login.jsx
│  │     ├─ NotificacionesBell.jsx
│  │     ├─ PipelineDashboard.jsx
│  │     ├─ RankingIAModal.jsx
│  │     ├─ Recomendaciones.jsx
│  │     ├─ RecuperarPassword.jsx
│  │     ├─ ResetPassword.jsx
│  │     ├─ SubirCV.jsx
│  │     ├─ Tablero.jsx
│  │     └─ VerPerfil.jsx
│  └─ vite.config.js
├─ storage
│  ├─ analisis_05290bdd72344628b45c44aaa8930452.txt
│  ├─ analisis_5f8b0f110b1a4b31b0339d64f26e25c6.txt
│  ├─ analisis_7e2299cfb92f44bd9414602a8a016fe7.txt
│  └─ analisis_fe037744e00e4845bb2af893c398b8e1.txt
└─ tests
   ├─ test_agents
   ├─ test_api
   └─ test_services


```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate user |
| `POST` | `/auth/recuperar` | Request password reset token |
| `GET`  | `/auth/recuperar/validar/{token}` | Validate reset token |
| `POST` | `/auth/recuperar/cambiar` | Change password using token |
| `POST` | `/cv/upload` | Upload CV (PDF/DOCX) |
| `POST` | `/cv/analizar-estructurado` | Analyze CV with AI |
| `POST` | `/perfiles/` | Create profile (returns JWT) |
| `GET`  | `/perfiles/{id}` | Get profile (owner only) |
| `PUT`  | `/perfiles/{id}` | Update profile (owner only) |
| `GET`  | `/perfiles/admin/listar` | List profiles (admin panel) |
| `GET`  | `/vacantes/` | List active vacancies (filters: q, area) |
| `GET`  | `/vacantes/areas` | List available areas |
| `POST` | `/vacantes/` | Create vacancy |
| `PUT`  | `/vacantes/{id}` | Update vacancy |
| `DELETE` | `/vacantes/{id}` | Delete vacancy |
| `GET`  | `/vacantes/recomendaciones/{perfil_id}` | Personalized recommendations |
| `POST` | `/postulaciones/` | Apply to vacancy (with optional cover letter) |
| `GET`  | `/postulaciones/perfil/{perfil_id}` | List applications |
| `PATCH` | `/postulaciones/{id}/estado` | Change application status |
| `GET`  | `/trazas/{perfil_id}` | Activity history |
| `POST` | `/pipeline/ejecutar` | Run full agent pipeline |
| `GET`  | `/favoritos/{perfil_id}` | List favorites |
| `POST` | `/favoritos/` | Add favorite |
| `DELETE` | `/favoritos/{id}` | Remove favorite |
| `GET`  | `/entrevistas/` | List interviews |
| `POST` | `/entrevistas/` | Schedule interview |
| `PUT`  | `/entrevistas/{id}` | Update interview (scoring) |
| `GET`  | `/notificaciones/{perfil_id}` | List notifications |
| `PATCH` | `/notificaciones/{id}/leer` | Mark as read |
| `GET`  | `/dashboard/` | Admin dashboard summary |
| `GET`  | `/brechas/{perfil_id}` | Skills gap analysis |
| `POST` | `/brechas/{perfil_id}/aprendizaje` | Add learning skill |
| `DELETE` | `/brechas/{perfil_id}/aprendizaje` | Remove learning skill |
| `GET`  | `/cv/exportar/{perfil_id}` | Download CV PDF |
| `GET`  | `/cv/exportar/{perfil_id}/validar` | Check if profile is complete enough |
| `GET`  | `/ai/ranking/{vacante_id}` | AI candidate ranking for a vacancy |
| `POST` | `/ai/entrevista/preguntas` | AI interview questions |
| `POST` | `/ai/entrevista/invitacion` | AI invitation message |

Full interactive docs: http://127.0.0.1:8000/docs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, JavaScript/JSX |
| Design System | Centralized CSS tokens, Apple-inspired (SF Pro typography, frosted glass) |
| Backend | FastAPI, Python 3.11+, Uvicorn |
| Database | SQLite (SQLAlchemy 2.0 ORM, 9 tables) |
| Authentication | PyJWT (HS256), SHA-256 + salt |
| AI / Agents | LangChain, LangGraph 0.2.60, Groq Cloud (Llama 3.3-70b) |
| CV Parsing | PyMuPDF4LLM, docx2txt |
| PDF Generation | ReportLab |
| Validation | Pydantic v2 |

---

## Useful Commands

### Stop the Servers
Press `Ctrl + C` in each terminal.

### Deactivate the Virtual Environment
```bash
deactivate
```

### Reset the Database
```bash
rm data/jobagent.db
```
Tables are recreated automatically on the next backend startup, and the 500 vacancies are reseeded from `data/vacantes.csv`.

### Kill stuck Vite instances (macOS/Linux)
```bash
pkill -9 -f vite
```

### Run on a Different Port

**Backend:**
```bash
uvicorn backend.main:app --reload --port 9000
```

**Frontend:**
```bash
cd frontend
npm run dev -- --port 3000
```

---

## Common Troubleshooting

### Error: "python is not recognized as a command"
Use `python3` instead of `python` on macOS/Linux, or add Python to your PATH on Windows.

### Error: "No module named 'backend'"
Run `uvicorn` from the project root (`JobAgent/`), not from inside `backend/`.

### Error: "Port 5173 is in use"
Vite will try the next port (5174, 5175...). If you have stuck Vite zombies, run `pkill -9 -f vite` on macOS/Linux and start again.

### CORS error from `:5174` or `:5175`
This happens when a stale Vite process keeps port 5173 busy and your new one falls back to another port. Kill all Vite instances (`pkill -9 -f vite`) and restart.

### Error: "GROQ_API_KEY not configured"
Create a `.env` file in the project root with your Groq API key. Without it, CV analysis and the three AI features (ranking, questions, invitation) will not work, but the rest of the app remains functional.

### Error: "422 Unprocessable Entity" when creating a profile
Required fields: name, email, and password (minimum 8 characters, at least one uppercase and one lowercase letter).

### Error: "No such column: area" or similar schema mismatch
After changing models, drop the database and restart:
```bash
rm data/jobagent.db
uvicorn backend.main:app --reload
```

### Frontend shows blank page
Open developer tools and check the console for import errors. The most common cause is a missing or renamed file in `frontend/src/pages/`.

### Favicon doesn't update
Safari caches favicons aggressively. Try `Cmd+Option+E` to empty cache, close all localhost tabs, restart Safari, and reload. If it still shows the old icon, try Chrome or Firefox to confirm it's a cache issue rather than a missing file.

---

## References
- [Magneto365 — Profile Manager Case Study (v1.0, 01/02/2026)](https://www.magnetoempleos.com)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/)
- [Groq API Documentation](https://console.groq.com/docs/)
- [ReportLab Documentation](https://www.reportlab.com/docs/reportlab-userguide.pdf)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last updated:** May 2026
