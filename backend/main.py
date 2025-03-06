from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from pydantic import BaseModel
import os
import requests
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from docx import Document
import shutil
from supabase import create_client, Client
from getRes import getRes  # ✅ Import getRes function

# Load API Keys & Supabase Credentials
load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")
BASE_URL = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize FastAPI App
app = FastAPI()

# Initialize Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Enable CORS for Frontend Communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Chat history (stores user & assistant messages)
chat_history = []

class ChatRequest(BaseModel):
    message: str
    user_id: int

def get_thinking_style(user_id):
    """Retrieve the dominant thinking style from the user_ts table."""
    response = supabase.table("user_ts").select("*").eq("id", user_id).execute()
    if response.data:
        user_data = response.data[0]
        max_style = max(
            ("concrete", user_data["concrete"]),
            ("logical", user_data["logical"]),
            ("theoretical", user_data["theoretical"]),
            ("practical", user_data["practical"]),
            ("intuitive", user_data["intuitive"]),
            key=lambda x: x[1]
        )[0]
        return max_style
    return None

import requests

def get_question_data(user_message):
    """Classify user message into Decision Making, Risk Taking, or Exploration using OpenRouter AI."""

    API_KEY = os.getenv("OPENROUTER_API_KEY")  # Ensure API key is loaded
    BASE_URL = os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1")

    if not API_KEY:
        raise ValueError("Missing OpenRouter API Key")

    # Define system prompt for classification
    system_prompt = {
        "role": "system",
        "content": """
        You are an AI classifier. Your task is to analyze the user's input and classify it into one of four categories:
        
         
        1. **Decision Making** – The user is contemplating multiple options and needs help choosing one.
        2. **Risk Taking** – The user is considering actions that involve potential danger, uncertainty, or high stakes.
        3. **Exploration** – The user is explore something strongly.
        4. **Method to Approach** – The user is asking for advice on how to solve a problem or approach a challenge systematically.
        5. **Doubt** – The user is uncertain or seeking clarification about something, expressing lack of clarity.

    
        **Respond with only the category name.**
        """
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mistralai/mistral-7b-instruct",  # Change model if needed
        "messages": [system_prompt, {"role": "user", "content": user_message}],
        "max_tokens": 5,  # Limit response length to only return category name
        "temperature": 0.0  # Keep deterministic for consistent classification
    }

    response = requests.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers)

    if response.status_code != 200:
        raise ValueError(f"API Error: {response.status_code} - {response.text}")

    category = response.json()["choices"][0]["message"]["content"].strip()

    # Ensure the response is one of the expected categories
    valid_categories = ["Decision Making", "Risk Taking", "Exploration" , "Method to approach" ,"Doubt"]
    return category if category in valid_categories else "Unknown"



@app.post("/chat/")
async def chat_endpoint(request: ChatRequest):
    """Process user query, classify it, personalize response, and save chat history."""
    if not API_KEY:
        raise HTTPException(status_code=500, detail="Missing API Key")

    user_thinking_style = get_thinking_style(request.user_id)
    category = get_question_data(request.message)  # This now returns a string

    print("Category" , category)
    # Fetch the objective from Supabase based on the category
    response = supabase.table("ques_dir").select("*").eq("category", category).execute()
    
    if response.data:
        question_data = response.data[0]  # Fetch the first matching row
        objective = question_data["objective"]
    else:
        objective = "Provide a helpful response."

    # ✅ Updated prompt
    prompt = f"""
    You are an AI tutor guiding a student.
    The user's question has been classified under '{category}'.
    Your goal is to:
    1. Address the user's question based on the objective: {objective}.
    2. Respond in a way that matches their thinking style: {user_thinking_style}.
    3. Encourage the user to engage in meaningful discussion by asking follow-up questions.
    4. force the user to ask only studies related and dont answer non academic questions/non studies questions
    """

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    # ✅ Append user query to chat history
    chat_history.append({"role": "user", "content": request.message})
    print(chat_history)

    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [{"role": "system", "content": prompt}] + chat_history,
        "max_tokens": 500,
        "temperature": 0.3,
    }

    response = requests.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="API Error")

    bot_response = response.json()["choices"][0]["message"]["content"]

    # ✅ Append AI response to chat history
    chat_history.append({"role": "assistant", "content": bot_response})

    # Store user query & bot response in Supabase chat_history
    supabase.table("chat_history").insert([
        {"uid": request.user_id, "role": "user", "message": request.message}
    ]).execute()

    supabase.table("chat_history").insert([
        {"uid": request.user_id, "role": "bot", "message": bot_response}
    ]).execute()

    return {"reply": bot_response}


def extract_text_from_file(file_path):
    """Extract text from a file (TXT, PDF, DOCX)"""
    if file_path.endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
    elif file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs])
    else:
        raise ValueError("Unsupported file type. Use TXT, PDF, or DOCX.")

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), question: str = Form(...), user_id: int = Form(...)):
    """Handles file uploads and generates AI responses based on file content + user question."""
    
    if not API_KEY:
        raise HTTPException(status_code=500, detail="Missing API Key")

    # Save file temporarily
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Extract text from uploaded file
        extracted_text = extract_text_from_file(temp_file_path)

        # Ensure the text isn't too long for OpenRouter
        truncated_text = extracted_text[:4000]  

        # Retrieve user thinking style
        user_thinking_style = get_thinking_style(user_id)

        # ✅ Define system prompt for file analysis
        system_prompt = {
            "role": "system",
            "content": f"""
            You are an AI assistant analyzing a document.
            The user uploaded a file and has a question related to it.
            Your goal is to:
            1. Read and understand the document.
            2. Answer the user's question based on the document.
            3. Provide additional insights if relevant.
            4. Respond in a way that aligns with the user's thinking style: {user_thinking_style}.

            Document Content:
            {truncated_text}
            """
        }

        # ✅ Append file question to chat history
        chat_history.append({"role": "user", "content": question})

        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "mistralai/mistral-7b-instruct",
            "messages": [system_prompt] + chat_history,
            "max_tokens": 500,
            "temperature": 0.3,
        }

        response = requests.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="API Error")

        bot_response = response.json()["choices"][0]["message"]["content"]

        # ✅ Append AI response to chat history
        chat_history.append({"role": "assistant", "content": bot_response})

        # Store the user file query & bot response in Supabase chat_history
        supabase.table("chat_history").insert([
            {"uid": user_id, "role": "user", "message": question}
        ]).execute()

        supabase.table("chat_history").insert([
            {"uid": user_id, "role": "bot", "message": bot_response}
        ]).execute()

        return {"reply": bot_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Cleanup: Remove temporary file
        os.remove(temp_file_path)
