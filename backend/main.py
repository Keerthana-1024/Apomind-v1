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
from apomind import generate_thinking_style

from apomind import gen , ft_model
max_style="None"

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

def update_thinking_style(user_id, user_message, category):
    """Check Supabase for existing thinking style, if missing, run model and store result."""
    
    user_response = supabase.table("user_subject_sel").select("username").eq("id", user_id).execute()
    if not user_response.data:
        raise ValueError(f"User {user_id} not found in user_subject_sel")

    username = user_response.data[0]["username"]  # Extract username

    # ✅ Only call LLM when category is "Exploration"
    if category == "Exploration":
        peft_model_output = generate_thinking_style(user_message)  # Call the LLM model
    else:
        peft_model_output = {"concrete": 0, "logical": 0, "theoretical": 0, "practical": 0, "intuitive": 0}

    # ✅ Extract dominant thinking style
    thinking_styles = ["concrete", "logical", "theoretical", "practical", "intuitive"]
    max_style = max(thinking_styles, key=lambda style: peft_model_output.get(style, 0))  

    print("Checking existing entry in Supabase...")

    # ✅ Check if user_id already exists
    existing_entry = supabase.table("user_ts").select("*").eq("id", user_id).execute()

    if existing_entry.data:
        print("User already exists, applying weighted update...")
        existing_data = existing_entry.data[0]  # Get the existing record

        # ✅ Apply weighted update: old_value + 0.15 * new_value
        updated_values = {
            "username": username,
            "concrete": existing_data["concrete"] + (0.15 * peft_model_output["concrete"]),
            "logical": existing_data["logical"] + (0.15 * peft_model_output["logical"]),
            "theoretical": existing_data["theoretical"] + (0.15 * peft_model_output["theoretical"]),
            "practical": existing_data["practical"] + (0.15 * peft_model_output["practical"]),
            "intuitive": existing_data["intuitive"] + (0.15 * peft_model_output["intuitive"]),
            "timestamp": "now()"
        }

        # ✅ Update the existing record
        supabase.table("user_ts").update(updated_values).eq("id", user_id).execute()

    else:
        print("Inserting new record...")
        # ✅ Insert if the user does not exist
        supabase.table("user_ts").insert([{
            "id": user_id,
            "username": username,
            "concrete": peft_model_output["concrete"],
            "logical": peft_model_output["logical"],
            "theoretical": peft_model_output["theoretical"],
            "practical": peft_model_output["practical"],
            "intuitive": peft_model_output["intuitive"],
            "timestamp": "now()"
        }]).execute()
    
    return max_style  # ✅ Return stored thinking style

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
        3. **Exploration** – How the user is exploring the subject/topic.
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
    valid_categories = ["Decision Making", "Risk Taking", "Exploration","Doubt"]
    return category if category in valid_categories else "Unknown"



@app.post("/chat/")
async def chat_endpoint(request: ChatRequest):
    """Process user query, classify it, and store response in Supabase."""

    category = get_question_data(request.message)  # ✅ Classify input
    print("category" , category)

    # ✅ Call thinking style function only for "Exploration"
    user_thinking_style = None
    if category == "Exploration":
        user_thinking_style = update_thinking_style(request.user_id, request.message, category)

    # ✅ Construct the prompt
    prompt = f"""
    You are an AI tutor guiding a student.
    The user's question has been classified under '{category}'.
    Thinking Style: {user_thinking_style if user_thinking_style else 'Unknown'}.
    
    Respond thoughtfully and encourage deeper discussion.
    User Input: {request.message}
    """

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [{"role": "system", "content": prompt}, {"role": "user", "content": request.message}],
        "max_tokens": 500,
        "temperature": 0.3,
    }

    response = requests.post(f"{BASE_URL}/chat/completions", json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="API Error")

    bot_response = response.json()["choices"][0]["message"]["content"]

    # ✅ Store responses in Supabase
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
