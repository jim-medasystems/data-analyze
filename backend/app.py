import os
import json
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from gpt_analysis import gpt_analyze_data
from pathlib import Path
from suggest_graph_columns import suggest_graph_columns
from upload_file import upload_file

app = FastAPI()

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory where the files will be uploaded
UPLOAD_FOLDER = Path('../uploads')
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {'csv'}

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post('/upload')
async def handle_upload(file: UploadFile = File(...)):
    upload_response = await upload_file(file, UPLOAD_FOLDER, ALLOWED_EXTENSIONS)
    headers = list(upload_response['fullData'][0].keys())  # Extract headers from the data
    column_suggestions = await suggest_graph_columns(headers)  # Get column suggestions
    return {"full_data": upload_response['fullData'], "column_suggestions": column_suggestions['gpt_response']}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        json_data = await websocket.receive_text()
        try:
            data = json.loads(json_data)
        except json.JSONDecodeError:
            await websocket.send_text("Error: Invalid JSON format")
            return

        headers = list(data[0].keys()) if data else []
        rows = [list(row.values()) for row in data[:3]]

        async for response in gpt_analyze_data(headers, rows):
            await websocket.send_text(response)

    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        await websocket.send_text(f"Error: {str(e)}")

@app.get('/')
async def hello():
    return "hello"

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
