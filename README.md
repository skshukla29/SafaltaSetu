# SafaltaSetu: Scholastic Oracle

AI-powered Student Performance Prediction System with FastAPI backend, CatBoost/XGBoost model benchmarking, and a React + Tailwind glassmorphism dashboard.

## Quick Start

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python models/train_academic.py
python models/train_platform.py
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

### 3. Open UI

Visit http://localhost:5173

### 4. Run Backend API Tests

```powershell
cd backend
..\.venv\Scripts\python.exe -m unittest discover -s tests -p "test_*.py" -v
```

## Features

- CatBoost ML model pipeline (academic and platform predictors)
- Real-time student risk prediction via FastAPI endpoints
- Explainable AI output with top feature importance and recommendations
- What-If simulation panel for intervention tuning
- 6-model benchmark comparison with confusion matrix insights
- Full dashboard suite across 8 navigable pages
- Glassmorphism dark UI with Recharts visualizations

## API Endpoints

- `POST /predict/academic`
- `POST /predict/platform`
- `GET /predict/model-stats`
- `GET /predict/confusion-matrix`
- `GET /analytics/student`
- `GET /dashboard/stats`

## Project Structure

- `backend/` FastAPI app, training scripts, model artifacts, and API routes
- `frontend/` React + Vite + Tailwind web client
