import numpy as np
import pandas as pd
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_data(username):
    """Fetch user-selected subjects, thinking styles, and careers."""
    try:
        user_subjects = supabase.table("user_subject_sel").select("*").eq("username", username).single().execute().data
        user_thinking_style = supabase.table("user_ts").select("*").eq("username", username).single().execute().data
        careers = supabase.table("career").select("*").execute().data

        return (
            pd.DataFrame([user_subjects]) if user_subjects else pd.DataFrame(), 
            pd.DataFrame([user_thinking_style]) if user_thinking_style else pd.DataFrame(), 
            pd.DataFrame(careers) if careers else pd.DataFrame()
        )
    except Exception as e:
        print(f"Error fetching data: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

def career_recommendation(username):
    """Recommend top 5 careers based on user-selected subjects and thinking style."""
    user_subjects_df, user_ts_df, careers_df = fetch_data(username)

    # Validate user data
    if user_subjects_df.empty or user_ts_df.empty or careers_df.empty:
        print("Error: Missing data for user.")
        return []

    selected_subjects = user_subjects_df.iloc[0].get("selected_subjects", "")
    selected_subjects = selected_subjects.split(',') if isinstance(selected_subjects, str) else []

    # Extract user thinking style
    user_ts = user_ts_df.iloc[0]
    user_thinking_style = {
        "Concrete": float(user_ts.get("concrete", 0)),
        "Logical": float(user_ts.get("logical", 0)),
        "Theoretical": float(user_ts.get("theoretical", 0)),
        "Practical": float(user_ts.get("practical", 0)),
        "Intuitive": float(user_ts.get("intuitive", 0))
    }

    scores = []
    for _, row in careers_df.iterrows():
        # Match prerequisites
        prereqs = row.get('prerequisites', "")
        prereqs = prereqs.split(',') if isinstance(prereqs, str) else []
        prereq_score = sum(1 for prereq in prereqs if prereq in selected_subjects) / (len(prereqs) + 1)

        # Thinking style match
        career_thinking_style = {
            "Concrete": float(row.get("Concrete", 0)),
            "Logical": float(row.get("Logical", 0)),
            "Theoretical": float(row.get("Theoretical", 0)),
            "Practical": float(row.get("Practical", 0)),
            "Intuitive": float(row.get("Intuitive", 0))
        }

        # Cosine similarity for thinking style
        user_vector = np.array(list(user_thinking_style.values()), dtype=np.float64)
        career_vector = np.array(list(career_thinking_style.values()), dtype=np.float64)
        
        norm_user = np.linalg.norm(user_vector)
        norm_career = np.linalg.norm(career_vector)
        similarity = np.dot(user_vector, career_vector) / (norm_user * norm_career + 1e-9) if norm_user and norm_career else 0

        # Final score (weighted sum)
        final_score = round(0.6 * prereq_score + 0.4 * similarity, 3)
        
        # Ensure JSON-compatible format
        scores.append({
            "career_id": str(row.get("career_id", "N/A")),  # Convert IDs to string if needed
            "career_name": str(row.get("career_name", "Unknown")),
            "final_score": float(final_score)  # ✅ Convert NumPy float to Python float
        })

    # Return top 5 recommendations as JSON
    return sorted(scores, key=lambda x: x["final_score"], reverse=True)[:5]
