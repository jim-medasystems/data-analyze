from fastapi import HTTPException
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def suggest_graph_columns(headers: list[str]):
    prompt = (
        "Given a dataset with the following columns: "
        f"{', '.join(headers)}.\n\n"
        "Suggest suitable columns for:\n"
        "- A bar graph comparing two columns\n"
        "- A line graph using one column\n"
        "- A scatter plot graph comparing two columns\n"
        "Please choose columns for which the data is numberical only.\n\n"
        "Output should only be a JSON response: {\"bar\": [bar graph columns], \
            \"line\": line graph column, \
            \"scatter\": [scatter plot columns]} \
            and nothing else (no explaination needed)"
    )
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "{\"bar\": [bar graph column1, bar graph column2], \
                    \"line\": line graph column, \
                    \"scatter\": [scatter plot column1, scatter plot column2]}"},
            ],
            max_tokens=2048
        )
        return {"gpt_response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
