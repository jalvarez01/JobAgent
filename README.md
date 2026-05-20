# JobAgent - Profile Manager

## Student Information
- **Full Name:** Juan José Álvarez Ocampo, Cristian Bolaños, Leovanis Buelvas, Juan David Bedoya, Diego Aza
- **Class:** Ingeniería de Software
- **Course:** 5131
- **University:** Universidad EAFIT
- **Semester:** 2026-1

---

## Project Description

JobAgent is an intelligent job search assistant built for the Magneto365 engineering challenge. It shifts the traditional job search model — where the candidate does all the work — to a proactive system where AI agents manage the profile, recommend opportunities, and automate operational tasks.

**Core promise:** *"Give me your resume and your expectations; JobAgent gets you interviews."*

### Key Features
- **CV Upload & AI Analysis:** Upload PDF/DOCX resumes. AI extracts structured data (skills, education, experience) and pre-fills the candidate profile.
- **Smart Recommendations:** Scoring engine matches candidate skills against job requirements with salary and modality bonuses.
- **Automated Applications:** LangGraph agent pipeline auto-applies to jobs above a 50% match threshold.
- **Kanban Tracking Board:** Track application status across 5 stages (applied → under review → interview → offer → rejected).
- **Admin Panel:** Separate admin interface at `/admin` for creating, editing, and managing job vacancies.
- **Authentication:** Secure registration and login with hashed passwords.

---

## Architecture

The system follows **Clean Architecture** with an agentic AI pipeline:

```
Frontend (React + Vite)
    ↓ HTTP REST
Backend (FastAPI + Python)
    ├── API Layer (routers)
    ├── Domain Layer
    │   ├── Services (PerfilService, RecomendacionService, PostulacionService)
    │   └── Agents (5 LangGraph nodes)
    ├── Infrastructure Layer
    │   ├── Persistence (SQLAlchemy + SQLite)
    │   └── LLM (Groq Cloud — Llama 3.3-70b)
    └── Graph Layer (LangGraph StateGraph)

```

**Agent Pipeline:** Perfil → Vacantes → Recomendación → Postulación → Seguimiento

---

## Environment
- **Operating Systems:** macOS Tahoe 26.0.1 (Apple Silicon M4) / Windows 11 Pro / Ubuntu 24.04
- **Processor:** Apple M4 / Intel64 Family
- **Memory:** 16 GB RAM
- **Terminal:** zsh 5.9 (macOS) / PowerShell 5.1 (Windows) / bash (Linux)

---

## Prerequisites

Before starting, make sure you have the following installed:

1. **Python 3.11 or higher**
   - Check: `python --version` or `python3 --version`
   - Download: https://www.python.org/downloads/

2. **Node.js 18 or higher**
   - Check: `node --version`
   - Download: https://nodejs.org/

3. **npm** (comes with Node.js)
   - Check: `npm --version`

4. **pip** (comes with Python)
   - Check: `pip --version` or `pip3 --version`

5. **Git**
   - Check: `git --version`
   - Download: https://git-scm.com/downloads

6. **Groq API Key** (for AI analysis)
   - Get one at: https://console.groq.com/keys

---

## Installation and Setup

## Option A

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

When the virtual environment is activated, you'll see `(venv)` at the beginning of your command line.

### Step 3: Install Backend Dependencies

With the virtual environment activated:

```bash
pip install -r backend/requirements.txt
```

This will install:
- FastAPI + Uvicorn (web server)
- SQLAlchemy (database ORM)
- Pydantic (data validation)
- LangChain + LangGraph (AI agent orchestration)
- LangChain-Groq (LLM provider)
- PyMuPDF4LLM (PDF text extraction)
- python-dotenv (environment variables)
- And other dependencies

### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

**On Windows:**
```bash
echo GROQ_API_KEY=your_groq_api_key_here > .env
```

**On macOS/Linux:**
```bash
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
```

Replace `your_groq_api_key_here` with your actual Groq API key from https://console.groq.com/keys.

### Step 5: Install Frontend Dependencies

Open a **new terminal** (keep the backend terminal open):

```bash
cd frontend
npm install
```

### Step 6: Run the Backend Server

In the **first terminal** (with virtual environment activated), from the project root:

```bash
uvicorn backend.main:app --reload
```

You'll see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     [seed] 20 vacantes cargadas desde CSV
```

The database and tables are created automatically on first startup. 20 sample Colombian job vacancies are loaded from `data/vacantes.csv`.

### Step 7: Run the Frontend Server

In the **second terminal**, from the `frontend/` directory:

```bash
npm run dev
```

You'll see:
```
VITE v8.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### Step 8: Open the Application

Open your web browser and visit:

- **Main application (candidates):** http://localhost:5173/
- **Admin panel (vacancy management):** http://localhost:5173/admin
- **API documentation (Swagger):** http://127.0.0.1:8000/docs
- **API health check:** http://127.0.0.1:8000/health

---

## Option B

### Step 1: Clone the repository

```bash
git clone https://github.com/jalvarez01/JobAgent.git
cd JobAgent
```

### Step 2: Configure environment variables (Create a .env file in the project root)

```bash
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
```

### Step 3: Build and run the containers

```bash
docker compose up --build
```
### Step 4: Access the application

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs

### Step 5: Stop the containers

```bash
docker compose down
```

---

## How to Use

### As a Candidate

1. **Create an account:** Click "Crear perfil" → upload your CV (PDF/DOCX) → the AI extracts your data automatically → set a password → save.
2. **Login:** Use your email and password to log in. Your session persists across browser restarts.
3. **View recommendations:** Go to "Vacantes" to see jobs ranked by your skill match percentage.
4. **Search & filter:** Use the search bar to find specific jobs. Filter by modality, location, or salary range.
5. **Apply:** Click on a vacancy → "Postularme a esta vacante."
6. **Track progress:** Go to "Tablero" to see your applications in a Kanban board.
7. **Run the pipeline:** Go to "Pipeline" to execute the full AI agent flow (analyze profile → load vacancies → recommend → auto-apply → generate next steps).

### As an Admin (Magneto)

1. Navigate to http://localhost:5173/admin
2. Create, edit, or delete job vacancies.
3. Set skills as requirements (separated by `;`) — these are used for candidate matching.

---

## Project Structure

```
jobagent
├─ backend
│  ├─ api
│  │  ├─ cv.py
│  │  ├─ perfil.py
│  │  ├─ pipeline.py
│  │  ├─ postulaciones.py
│  │  ├─ trazabilidad.py
│  │  ├─ vacantes.py
│  │  └─ __init__.py
│  ├─ config.py
│  ├─ dependencies.py
│  ├─ domain
│  │  ├─ agents
│  │  │  ├─ analizar.py
│  │  │  ├─ cargar.py
│  │  │  ├─ perfil_agent.py
│  │  │  ├─ postulacion_agent.py
│  │  │  ├─ recomendacion_agent.py
│  │  │  ├─ seguimiento_agent.py
│  │  │  ├─ vacantes_agent.py
│  │  │  ├─ vacantes_pdf.py
│  │  │  └─ __init__.py
│  │  ├─ services
│  │  │  ├─ perfil_service.py
│  │  │  ├─ postulacion_service.py
│  │  │  ├─ recomendacion_service.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ graph
│  │  ├─ builder.py
│  │  ├─ checkpointer.py
│  │  ├─ runner.py
│  │  ├─ state.py
│  │  └─ __init__.py
│  ├─ infrastructure
│  │  ├─ llm
│  │  │  ├─ groq_provider.py
│  │  │  └─ __init__.py
│  │  ├─ loaders
│  │  │  ├─ csv_loader.py
│  │  │  ├─ pdf_loader.py
│  │  │  └─ __init__.py
│  │  ├─ persistence
│  │  │  ├─ database.py
│  │  │  ├─ models
│  │  │  │  ├─ perfil.py
│  │  │  │  ├─ postulacion.py
│  │  │  │  ├─ traza.py
│  │  │  │  ├─ vacante.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ repositories
│  │  │  │  ├─ perfil_repo.py
│  │  │  │  ├─ postulacion_repo.py
│  │  │  │  ├─ vacante_repo.py
│  │  │  │  └─ __init__.py
│  │  │  └─ __init__.py
│  │  └─ __init__.py
│  ├─ main.py
│  ├─ requirements.txt
│  ├─ schemas
│  │  ├─ cv.py
│  │  ├─ postulacion.py
│  │  ├─ traza.py
│  │  ├─ vacante.py
│  │  └─ __init__.py
│  └─ __init__.py
├─ data
│  ├─ jobagent.db
│  ├─ uploads
│  │  ├─ 701e43c3a9584240900b1283639e5214_CV_Inglés.pdf
│  │  └─ ec9723e7e72741bf963c068984f84c5e_CV_Inglés.pdf
│  └─ vacantes.csv
├─ frontend
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  │  ├─ cv.js
│  │  │  ├─ perfil.js
│  │  │  ├─ postulaciones.js
│  │  │  └─ vacantes.js
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  └─ pages
│  │     ├─ AdminVacantes.jsx
│  │     ├─ CrearPerfil.jsx
│  │     ├─ DetalleVacante.jsx
│  │     ├─ PipelineDashboard.jsx
│  │     ├─ Recomendaciones.jsx
│  │     ├─ SubirCV.jsx
│  │     ├─ Tablero.jsx
│  │     └─ VerPerfil.jsx
│  └─ vite.config.js
├─ pages
│  └─ Mi perfil.py
├─ README.md
├─ src
│  └─ agents
└─ storage
   ├─ analisis_05290bdd72344628b45c44aaa8930452.txt
   ├─ analisis_5f8b0f110b1a4b31b0339d64f26e25c6.txt
   ├─ analisis_7e2299cfb92f44bd9414602a8a016fe7.txt
   └─ analisis_fe037744e00e4845bb2af893c398b8e1.txt
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate user |
| `POST` | `/cv/upload` | Upload CV (PDF/DOCX) |
| `POST` | `/cv/analizar-estructurado` | Analyze CV with AI (structured JSON) |
| `POST` | `/perfiles/` | Create profile (with password) |
| `GET` | `/perfiles/{id}` | Get profile |
| `PUT` | `/perfiles/{id}` | Update profile |
| `GET` | `/vacantes/` | List active vacancies |
| `GET` | `/vacantes/?q=python` | Search vacancies |
| `POST` | `/vacantes/` | Create vacancy (admin) |
| `PUT` | `/vacantes/{id}` | Update vacancy (admin) |
| `DELETE` | `/vacantes/{id}` | Delete vacancy (admin) |
| `GET` | `/vacantes/recomendaciones/{perfil_id}` | Get recommendations for profile |
| `POST` | `/postulaciones/` | Apply to vacancy |
| `GET` | `/postulaciones/perfil/{perfil_id}` | List applications |
| `PATCH` | `/postulaciones/{id}/estado` | Change application status |
| `GET` | `/trazas/{perfil_id}` | Get activity history |
| `POST` | `/pipeline/ejecutar` | Run full agent pipeline |

Full interactive documentation at: http://127.0.0.1:8000/docs

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, JavaScript/JSX |
| Backend | FastAPI, Python 3.11+, Uvicorn |
| Database | SQLite (SQLAlchemy ORM) |
| AI/Agents | LangChain, LangGraph, Groq Cloud (Llama 3.3-70b) |
| CV Parsing | PyMuPDF4LLM, Docx2txt |
| Validation | Pydantic v2 |

---

## Useful Commands

### Stop the Servers
Press `Ctrl + C` in each terminal (backend and frontend).

### Deactivate the Virtual Environment
```bash
deactivate
```

### Reset the Database
```bash
rm data/jobagent.db
```
Tables are recreated automatically on the next backend startup.

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

### View API Documentation
Visit http://127.0.0.1:8000/docs for interactive Swagger UI.

---

## Common Troubleshooting

### Error: "python is not recognized as a command"
- **Solution:** Make sure Python is installed and added to your system's PATH.
- Try using `python3` instead of `python`.

### Error: "No module named 'backend'"
- **Solution:** Make sure you're running `uvicorn` from the **project root** (`JobAgent/`), not from inside `backend/`.

### Error: "npm: command not found"
- **Solution:** Install Node.js from https://nodejs.org/. npm comes bundled with it.

### Error: "Port 5173 is in use"
- **Solution:** Vite will automatically try the next port (5174, 5175...). Check the terminal output for the actual URL.

### Error: "GROQ_API_KEY not configured"
- **Solution:** Create a `.env` file in the project root with your Groq API key. The CV analysis feature won't work without it, but the rest of the app will.

### Error: "422 Unprocessable Entity" when creating a profile
- **Solution:** Make sure all required fields are filled: name, email, and password (minimum 8 characters, at least one uppercase and one lowercase letter).

### Error: "Port 8000 is already in use"
- **Solution:** Another process is using port 8000. Either close it or use a different port:
```bash
uvicorn backend.main:app --reload --port 9000
```
Then update `VITE_API_URL` in your frontend `.env` accordingly.

### Database issues after schema changes
- **Solution:** Delete the database and restart:
```bash
rm data/jobagent.db
uvicorn backend.main:app --reload
```

### Frontend shows blank page
- **Solution:** Open the browser developer console (F12 or Cmd+Option+C in Safari) and check for import errors. The most common cause is a missing file in `frontend/src/pages/`.

---

## References
- [Magneto365 — Profile Manager Case Study (v1.0, 01/02/2026)](https://www.magnetoempleos.com)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/)
- [Groq API Documentation](https://console.groq.com/docs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Last updated:** April 2026

```
JobAgent
├─ README.md
├─ backend
│  ├─ __init__.py
│  ├─ api
│  │  ├─ __init__.py
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
│  │     ├─ entrevista_service.py
│  │     ├─ favorito_service.py
│  │     ├─ notificacion_service.py
│  │     ├─ password_reset_service.py
│  │     ├─ perfil_service.py
│  │     ├─ postulacion_service.py
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
│  │  ├─ 4836761154f5463c8df35b87b5e74917_CV_ ESPAÑOL.docx
│  │  ├─ 51f6405de9364e63aabc4495850f3c8e_CV_ ESPAÑOL.docx
│  │  ├─ 6343430051a84422a0e0ba106a90dab9_CV_Inglés.pdf
│  │  ├─ 687657f33e234506a6af9fe9788448f8_CV_Inglés.pdf
│  │  ├─ 71e4dac33d5b4adb9538d23f372c5e15_CV_ ESPAÑOL.docx
│  │  ├─ 85625d7b09d844a1a7c241f5fbf25550_CV_ ESPAÑOL.docx
│  │  ├─ 8ab85207fa7849d480c3555c39f08402_CV_ ESPAÑOL.docx
│  │  ├─ b2e9b9cd256b404b97a0da6212ed0ebd_CV_ ESPAÑOL.docx
│  │  ├─ b6c949afb4074254806a43e99bd6f0f9_CV_Inglés.pdf
│  │  ├─ b6fc643961744420960e982b6e80585c_CV_ ESPAÑOL.docx
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
│  │     ├─ Login.jsx
│  │     ├─ NotificacionesBell.jsx
│  │     ├─ PipelineDashboard.jsx
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