import numpy as np
import pandas as pd
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, SAGEConv, GATConv
from torch_geometric.data import Data
import numpy as np

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_data(username):
    """Fetch user-selected subjects, thinking styles, and careers."""
    try:
        #print("=== 1 fd")
        user_subjects = supabase.table("user_subject_sel").select("*").eq("username", username).single().execute().data
        #print("=== 2 fd")
        careers = supabase.table("career").select("*").execute().data
        ##print("=== 3 fd")
        user_thinking_style = supabase.table("user_ts").select("concrete, logical, theoretical, practical, intuitive").eq("username", username).execute().data
        #print("=== 4 fd")
        #print(f"\nno1\n{user_subjects}\nno2\n{user_thinking_style}\nno3\n{careers}")
        return (
            pd.DataFrame([user_subjects]) if user_subjects else pd.DataFrame(), 
            pd.DataFrame([user_thinking_style]) if user_thinking_style else pd.DataFrame(), 
            pd.DataFrame(careers) if careers else pd.DataFrame()
        )
    except Exception as e:
        print(f"Error fetching data: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

# def career_recommendation(username):
#     """Recommend top 5 careers based on user-selected subjects and thinking style."""
#     user_subjects_df, user_ts_df, careers_df = fetch_data(username)
#     print("==== 1r")
#     # Validate user data
#     if user_subjects_df.empty or user_ts_df.empty or careers_df.empty:
#         print("Error: Missing data for user.")
#         return []
#     print("==== 2r")
#     selected_subjects = user_subjects_df.iloc[0].get("selected_subjects", "")
#     selected_subjects = selected_subjects.split(',') if isinstance(selected_subjects, str) else []

#     # Extract user thinking style
#     user_ts = user_ts_df.iloc[0]
#     user_thinking_style = {
#         "Concrete": float(user_ts.get("concrete", 0)),
#         "Logical": float(user_ts.get("logical", 0)),
#         "Theoretical": float(user_ts.get("theoretical", 0)),
#         "Practical": float(user_ts.get("practical", 0)),
#         "Intuitive": float(user_ts.get("intuitive", 0))
#     }
#     print("==== 3r")
#     scores = []
#     for _, row in careers_df.iterrows():
#         # Match prerequisites
#         prereqs = row.get('prerequisites', "")
#         prereqs = prereqs.split(',') if isinstance(prereqs, str) else []
#         prereq_score = sum(1 for prereq in prereqs if prereq in selected_subjects) / (len(prereqs) + 1)

#         # Thinking style match
#         career_thinking_style = {
#             "Concrete": float(row.get("Concrete", 0)),
#             "Logical": float(row.get("Logical", 0)),
#             "Theoretical": float(row.get("Theoretical", 0)),
#             "Practical": float(row.get("Practical", 0)),
#             "Intuitive": float(row.get("Intuitive", 0))
#         }
    
#         # Cosine similarity for thinking style
#         user_vector = np.array(list(user_thinking_style.values()), dtype=np.float64)
#         career_vector = np.array(list(career_thinking_style.values()), dtype=np.float64)
        
#         norm_user = np.linalg.norm(user_vector)
#         norm_career = np.linalg.norm(career_vector)
#         similarity = np.dot(user_vector, career_vector) / (norm_user * norm_career + 1e-9) if norm_user and norm_career else 0

#         # Final score (weighted sum)
#         final_score = round(0.6 * prereq_score + 0.4 * similarity, 3)
#         print("")
#         # Ensure JSON-compatible format
#         scores.append({
#             "career_id": str(row.get("career_id", "N/A")),  # Convert IDs to string if needed
#             "career_name": str(row.get("career_name", "Unknown")),
#             "final_score": float(final_score)  # ✅ Convert NumPy float to Python float
#         })
#     print("printing score recsys")
#     print("halo ",scores)
#     # Return top 5 recommendations as JSON
#     return sorted(scores, key=lambda x: x["final_score"], reverse=True)[:5]
import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv
import pandas as pd
import numpy as np

def build_graph(user_subjects_df, user_ts_df, careers_df):
    """Constructs a graph from user subjects, thinking styles, and career data."""
    node_features = []  # Feature matrix
    edges = []  # Edge list

    # Extract all subjects from career prerequisites safely
    all_prereqs = careers_df['prerequisites'].dropna().astype(str).str.split(',').sum()
    subject_list = list(set(all_prereqs))  # Unique subjects
    subject_to_idx = {subj: i + 1 for i, subj in enumerate(subject_list)}  # Offset by 1 (0 is user)

    # ✅ Ensure user_features is a list of floats
    user_features = list(map(float, user_ts_df.iloc[0].values))
    node_features.append(user_features)  # User node at index 0

    # Selected subject nodes (only those present in subject_list)
    selected_subjects = set(user_subjects_df.iloc[0]['selected_subjects'].split(','))
    valid_subjects = [subj for subj in selected_subjects if subj in subject_to_idx]

    for subj in valid_subjects:
        node_features.append([0.0] * len(user_features))  # Placeholder
        edges.append((0, subject_to_idx[subj]))  # Connect user to subjects

    # Career nodes
    for idx, row in careers_df.iterrows():
        # ✅ Ensure career features are numeric (fill missing with 0)
        career_features = [float(row.get(col, 0.0)) for col in ['Concrete', 'Logical', 'Theoretical', 'Practical', 'Intuitive']]
        node_features.append(career_features)

        # Ensure prerequisites exist before connecting
        prereqs = row.get('prerequisites', "")
        if pd.isna(prereqs) or not isinstance(prereqs, str):
            prereqs = []
        else:
            prereqs = [p.strip() for p in prereqs.split(',') if p.strip() in subject_to_idx]

        for prereq in prereqs:
            edges.append((subject_to_idx[prereq], len(node_features) - 1))  # Subject → Career

    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    x = torch.tensor(node_features, dtype=torch.float)

    return Data(x=x, edge_index=edge_index)

class GNNRecommender(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, out_channels)

    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = self.conv2(x, edge_index)
        return x

def career_recommendation(username):
    user_subjects_df, user_ts_df, careers_df = fetch_data(username)

    if user_subjects_df.empty or user_ts_df.empty or careers_df.empty:
        print("Error: Missing data for user.")
        return []

    # Convert user_ts_df from dictionaries to numerical values
    try:
        user_features = [float(user_ts_df.iloc[0, col][key]) for col in range(user_ts_df.shape[1]) for key in user_ts_df.iloc[0, col]]
    except Exception as e:
        print(f"Error extracting user thinking style features: {e}")
        return []

    print("Extracted User Features:", user_features)  # Debugging output

    data = build_graph(user_subjects_df, user_ts_df, careers_df)

    model = GNNRecommender(data.x.shape[1], 3, data.x.shape[1])
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

    for epoch in range(100):
        optimizer.zero_grad()
        out = model(data)
        loss = F.mse_loss(out, data.x)
        loss.backward()
        optimizer.step()

    user_embedding = out[0]
    num_subjects = len([subj for subj in user_subjects_df.iloc[0]['selected_subjects'].split(',') if subj in data.x])
    career_embeddings = out[num_subjects + 1:]

    similarities = torch.cosine_similarity(user_embedding.unsqueeze(0), career_embeddings, dim=1)
    top_careers = similarities.argsort(descending=True)[:5]

    recommendations = []
    for i in top_careers:
        try:
            recommendations.append({
                "career_id": str(careers_df.iloc[i]['career_id']),
                "career_name": str(careers_df.iloc[i]['career_name']),
                "final_score": float(similarities[i].item())  # Convert safely
            })
        except Exception as e:
            print(f"Error processing career {i}: {e}")

    print("Final Recommendations:", recommendations)
    return recommendations
