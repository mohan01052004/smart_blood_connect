import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


def detect_language(text: str) -> str:
    """Detect the language of the input text."""
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        prompt = f"""Detect the language of this text and return ONLY the language name in English (e.g., "Hindi", "Kannada", "English", "Telugu", etc.).

Text: {text}

Language:"""
        response = model.generate_content(prompt)
        language = response.text.strip()
        return language
    except Exception as e:
        print(f"Language detection failed: {e}")
        return "English"


def translate_reply(reply_text: str, target_language: str) -> str:
    """Translate the reply text to the target language."""
    if target_language.lower() == "english":
        return reply_text
    
    try:
        model = genai.GenerativeModel("models/gemini-2.5-flash")
        prompt = f"""Translate the following blood bank response to {target_language}. Keep blood groups (A+, B-, O+, etc.), phone numbers, addresses, and numerical values unchanged. Only translate the descriptive text.

Text to translate:
{reply_text}

Translated text:"""
        response = model.generate_content(prompt)
        translated = response.text.strip()
        return translated
    except Exception as e:
        print(f"Translation failed: {e}")
        return reply_text
