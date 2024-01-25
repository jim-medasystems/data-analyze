from fastapi import HTTPException
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def gpt_analyze_data(headers: list, rows: [list]):
    if not headers and not rows:
        raise HTTPException(status_code=400, detail="No data provided")

    # Construct the prompt for GPT
    system_prompt = f"Given the following data:\n\nColumns: {', '.join(headers)}\n"
    for row in rows:
        system_prompt += f"Row: {', '.join(row)}\n"
    system_prompt += "\nWhat does this data imply or represent?"

    prompts = {
        "SYSTEM_PROMPT": system_prompt,
        "USER_PROMPT": "I am a data scientist trying to analyze a dataset. I want to know what the \
          data implies or represents. Start with a brief summary of what you think it means, then \
          give a brief list using bullets (-) of all the column data and what each represents \
          (do not use bullets anywhere else, EXCEPT on the list). There is no need to iterate and \
          explain the actual row data. Please give a brief summary of what the data implies or \
          represents.",
        "ASSISTANT_PROMPT": "Do not repeat the column names except when explaining the actual \
          column data."
    }

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompts["SYSTEM_PROMPT"]},
                {"role": "user", "content": prompts["USER_PROMPT"]},
                {"role": "assistant", "content": prompts["ASSISTANT_PROMPT"]},
            ],
            max_tokens=2048,
            stream=True,
        )
        async for chunk in response:
            content = chunk.choices[0].delta.content
            if content:
                yield content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
