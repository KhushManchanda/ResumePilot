# ResumePilot

**AI-Powered JSON-First Resume Editor with LaTeX Compilation**

Single-user web application for creating tailored resumes across multiple variants (AI/ML, Full-Stack, Backend/Cloud) with AI-driven editing and professional LaTeX PDF generation.

---

## Features

✨ **Three Resume Variants**
- AI/ML Engineer
- Full-Stack Developer  
- Backend/Cloud Engineer

🤖 **AI-Powered Editing**
- Edit individual bullets with natural language instructions
- Modify entire sections (experience, projects, skills, etc.)
- Tailor resume to job descriptions automatically
- Powered by OpenAI GPT-4 with JSON Patch operations

📄 **LaTeX PDF Generation**
- Professional ATS-friendly resume template
- Server-side compilation with caching
- Real-time PDF preview
- One-click download

💾 **Version Control**
- Save snapshots with notes
- View version history
- Compare changes (diff view)

---

## Prerequisites

- **Node.js** 18+ and npm
- **pdflatex** (part of TeX Live distribution)
- **OpenAI API key**

### Installing LaTeX (pdflatex)

**macOS:**
```bash
brew install --cask mactex
```

**Ubuntu/Debian:**
```bash
sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-fonts-extra
```

**Windows:**  
Download and install [MiKTeX](https://miktex.org/download) or [TeX Live](https://www.tug.org/texlive/).

---

## Quick Start

### 1. Clone and Install

```bash
cd /Users/khushmanchanda/Desktop/ResumePilot

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

Copy the example env file and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
DATABASE_PATH=./server/db/resumes.db
PDF_CACHE_DIR=./server/cache/pdfs
PORT=3001
NODE_ENV=development
```

### 3. Initialize Database

```bash
cd server
npm run db:migrate
npm run db:seed
```

This creates the SQLite database and loads three starter resume variants.

### 4. Run Development Servers

#### Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Backend runs on `http://localhost:3001`

#### Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:3000`

### 5. Open Application

Navigate to **http://localhost:3000** in your browser.

---

## 📖 Usage Guide

### Switching Variants

Use the dropdown in the top bar to switch between AI/ML, Full-Stack, and Backend/Cloud resume variants.

### Editing with AI

**Edit a Bullet:**
1. Click on any bullet point in the Resume Editor (middle panel)
2. Click "✏️ Edit Selected Bullet" in the Chat Panel (left)
3. Describe your desired changes
4. Review AI suggestions and click "Apply Changes"

**Edit a Section:**
1. Type your instruction in the chat input (e.g., "Make my experience bullets more quantitative")
2. AI will suggest JSON Patch operations
3. Apply changes with one click

**Tailor to Job Description:**
1. Click "🎯 Tailor to Job Description"
2. Paste the job description
3. AI selects relevant bullets and rewrites them to match the role
4. Review and apply changes

### Generating PDF

1. Click **"📄 Export PDF"** in the top bar (compiles and downloads)
2. OR use **"🔄 Recompile"** in the PDF Preview panel (right)
3. View PDF in embedded viewer
4. Check compilation logs if needed

### Saving Versions

1. Click **"💾 Save Version"**
2. Add an optional note (e.g., "Software Engineer at Google")
3. Version is saved to database

---

## Architecture

### Backend (`/server`)
- **Express** REST API (TypeScript)
- **SQLite** database with migrations
- **LaTeX Renderer**: Converts resume JSON → LaTeX using template macros
- **Compiler**: Executes `pdflatex` with caching
- **AI Integration**: OpenAI GPT-4 with JSON Patch guardrails

### Frontend (`/client`)
- **Next.js 14** App Router (TypeScript)
- **React** components with state management
- **Tailwind CSS** for styling
- **3-column layout**: Chat Panel | Resume Editor | PDF Preview

### Database Schema

**`resumes`**: Current resume JSON for each variant  
**`resume_versions`**: Historical snapshots with notes  
**`compiled_pdfs`**: PDF cache indexed by LaTeX hash

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resume` | GET | Fetch resume JSON by variant |
| `/api/resume/save` | POST | Save current state as version |
| `/api/resume/apply-patch` | POST | Apply JSON Patch operations |
| `/api/ai/edit-bullet` | POST | AI edit single bullet |
| `/api/ai/edit-section` | POST | AI edit section |
| `/api/ai/tailor` | POST | AI tailor to job description |
| `/api/render` | POST | Render LaTeX from JSON |
| `/api/compile` | POST | Compile LaTeX → PDF |

---

## Project Structure

```
ResumePilot/
├── server/
│   ├── src/
│   │   ├── ai/              # OpenAI integration
│   │   │   ├── openaiClient.ts
│   │   │   ├── editBullet.ts
│   │   │   ├── editSection.ts
│   │   │   └── tailorToJob.ts
│   │   ├── render/          # JSON → LaTeX converter
│   │   │   └── latexRenderer.ts
│   │   ├── compile/         # pdflatex wrapper
│   │   │   └── compiler.ts
│   │   ├── db/              # SQLite operations
│   │   │   └── database.ts
│   │   ├── routes/          # Express routes
│   │   │   ├── resumeRoutes.ts
│   │   │   ├── aiRoutes.ts
│   │   │   └── renderRoutes.ts
│   │   ├── utils/           # Helpers
│   │   │   └── helpers.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── templates/
│   │   └── template.tex     # LaTeX template
│   ├── seeds/
│   │   ├── resume_ai_ml.json
│   │   ├── resume_full_stack.json
│   │   └── resume_backend_cloud.json
│   └── package.json
├── client/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── TopBar.tsx
│   │   ├── ChatPanel/
│   │   │   └── ChatPanel.tsx
│   │   ├── ResumeEditor/
│   │   │   └── ResumeEditor.tsx
│   │   └── PdfPreview/
│   │       └── PdfPreview.tsx
│   └── package.json
├── .env.example
└── README.md
```

---

## Troubleshooting

### pdflatex not found
Ensure TeX Live is installed and `pdflatex` is in your PATH:
```bash
which pdflatex   # macOS/Linux
where pdflatex   # Windows
```

### OpenAI API errors
- Verify `OPENAI_API_KEY` in `.env`
- Check API quota/billing at https://platform.openai.com/

### Compilation fails
- Check logs in PDF Preview panel
- Common issues: missing LaTeX packages, special characters in resume text
- Run manual compile for debugging:
  ```bash
  cd server/temp/compile-xxx
  pdflatex resume.tex
  ```

### Port already in use
Change `PORT` in `.env` and restart backend server.

---

## Future Enhancements

- 🐳 Docker containerization for LaTeX compilation (security)
- 🗄️ Migrate from SQLite to PostgreSQL
- 🎨 Custom LaTeX templates
- 📊 Visual diff viewer for versions
- 🌐 Multi-user support with authentication
- 📱 Mobile responsive design

---

## License

MIT

---

## Credits

LaTeX template based on [Jake Gutierrez's resume template](https://github.com/sb2nov/resume)
