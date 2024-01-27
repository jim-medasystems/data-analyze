# Data Analysis tool

This is a very generic data analysis tool for the latest hackathon (Jan 26, 2024).

Data was retrieved from kaggle (kaggle.com)

## Setup

This is a dev only environment for demo purposes.

A sample of the `backend/.env` file should look like this:

```
OPENAI_API_KEY="your-openai-api-key-here"
UPLOAD_FOLDER="uploads" # optional, but can be specified if needed
```

A sample of the `frontend/.env` file should look like this:

```
VITE_BACKEND_URL_UPLOAD=http://localhost:8000/upload
VITE_BACKEND_URL_WS=ws://localhost:8000/ws
```

## How to run

To run the backend (FastAPI):

```
cd backend
pipenv install
pipenv run uvicorn app:app --reload
```

To run the frontend (React+TypeScript+Vite):

```
cd frontend
npm install
npm run dev
```

You should now be able to access the demo via: http://localhost:5173
