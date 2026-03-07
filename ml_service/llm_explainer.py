from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("LLM_API_KEY")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)


def generate_summary(risk_class, risk_score, features):

    prompt = f"""
You are a solar plant maintenance advisor.

Risk Class: {risk_class}
Risk Score: {risk_score}

Top SHAP Features:
{features}

Explain the inverter failure cause and recommend actions.
"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role":"user","content":prompt}]
    )

    return response.choices[0].message.content