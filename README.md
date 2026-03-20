# Energy Audit AI Dashboard

A modern, full-stack microservices application for conducting AI-powered energy audits and analytics for commercial facilities, factories, and warehouses.

## Features
- **AI-Powered Summaries**: Leverages Google Gemini to formulate actionable optimization strategies out of raw energy data.
- **Microservice Architecture**: Decoupled Node.js gateway server and Python FastAPI AI engine.
- **Dynamic Energy Visualizations**: Displays robust bar charts rendering energy footprints using `Chart.js`.
- **Export to PDF**: Offers native one-click, professional PDF reporting powered by `jsPDF`.
- **Premium User Experience**: Designed using Tailwind CSS v4 featuring glassmorphism elements, gradients, and animated interactions.

## Project Structure
```text
energy-audit-dashboard/
├── frontend/     # React + Vite application (Tailwind v4 UI, Chart.js)
├── backend/      # Node.js + Express API Gateway + MongoDB history storage
└── ai-service/   # Python 3 + FastAPI server (Gemini LLM logic)
```

## Setup & Running Locally
Since this relies on a decoupled architecture, run each component in its own terminal environment.

### 1. Frontend 
```bash
cd frontend
npm install
npm run dev
```
(Application will run on http://localhost:5173)

### 2. Backend Gateway
```bash
cd backend
npm install
npm start
```
(Server will run on http://localhost:5000)

### 3. AI Service
```bash
cd ai-service
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```
(Server runs on http://localhost:8000)

**Note on AI Integration**: 
To use real Google Gemini, create a file named `.env` in the `/ai-service` directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```
If no key is provided, the API will securely fallback to generate mock analytics data so you can test the frontend unconditionally.
