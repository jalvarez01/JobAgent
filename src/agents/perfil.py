import os 
from langchain_groq import ChatGroq 
from langchain_core.prompts import PromptTemplate 
from langchain_pymupdf4llm import PyMuPDF4LLMLoader 
from langchain_community.document_loaders import Docx2txtLoader 
from dotenv import load_dotenv 

load_dotenv() 

# Initialize the Groq LLM

llm = ChatGroq(model_name="llama-3.3-70b-versatile", 
            temperature=0.1, 
            model_kwargs={"top_p": 0.2, "seed": 1337}) 
# Test the connection 

# response = llm.invoke("Hello, world!") 
# print(response.content) 
# Loader for cv (PDF or DOCX) 

def load_document(path): 
    if path.endswith(".pdf"): 
        loader = PyMuPDF4LLMLoader(path) 
    elif path.endswith(".docx"): 
        loader = Docx2txtLoader(path) 
    else: 
        print("Unsupported file type") 
    
    docs = loader.load()
    text = "\n".join(d.page_content for d in docs) 
    return text 
    
res = load_document("../../test.pdf") 
print(res) 
print("\n Proceso exitoso")