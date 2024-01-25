from fastapi import UploadFile, HTTPException
from pathlib import Path
import csv

def allowed_file(filename: str, allowed_extensions: set):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

async def upload_file(file: UploadFile, upload_folder: Path, allowed_extensions: set):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No selected file")
    if not allowed_file(file.filename, allowed_extensions):
        raise HTTPException(status_code=400, detail="File type not allowed")

    filename = Path(file.filename).name
    filepath = upload_folder / filename

    # Save the file
    with open(filepath, 'wb') as buffer:
        while data := await file.read(1024):  # Read chunks of the file
            buffer.write(data)
    
    # Parse CSV and convert to JSON
    rows = []
    with open(filepath, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            rows.append(row)

    return {'fullData': rows}
