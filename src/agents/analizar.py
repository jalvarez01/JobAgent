import os 
from langchain_groq import ChatGroq 
from langchain_core.prompts import PromptTemplate 
from langchain_pymupdf4llm import PyMuPDF4LLMLoader 
from langchain_community.document_loaders import Docx2txtLoader 
import streamlit as st
from pathlib import Path
from dotenv import load_dotenv 

# Initialize the Groq LLM

llm = ChatGroq(model_name="llama-3.3-70b-versatile", 
            temperature=0.1, 
            model_kwargs={"top_p": 0.2, "seed": 1337}) 

def analizar_cv (texto: str) -> str:
    template = """
    Analiza el siguiente CV.

    Entrega tu respuesta en tres secciones claras:

    1. Fortalezas del perfil
    2. Debilidades o áreas de mejora
    3. Recomendaciones específicas para mejorar el CV

    CV:
    {text}
    """
    # Se define el cuerpo del prompt
    prompt = PromptTemplate(template=template, input_variables=["text"]) 
    # Se crea la cadena o secuencia
    chain = prompt | llm

    result = chain.invoke({"text": texto})

    return result.content