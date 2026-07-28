from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import io
import os
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_ollama import ChatOllama

load_dotenv()



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "DocQA API is running!"}

@app.get("/health")
def health_check():
    return {"status":"ok"}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global vector_store

    #check if it's a actual pdf 
    if not file.filename.endswith(".pdf"):
        return {"error": " only pdf files are allowed"}

    #Read the file bytes into memory
    contents = await file.read()

    #Etrct the text from pdf text
    text = "" 
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    #split into chunks
    splitter =  RecursiveCharacterTextSplitter(
        chunk_size = 500,
        chunk_overlap = 50
    )
    chunks = splitter.split_text(text)

    #convert text into vectors and store it in FAISS
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    vector_store = FAISS.from_texts(chunks, embeddings)
    return{
            "filename":file.filename,
            # "pages": total_pages,
            "chunks": len(chunks),
            "message": "PDF processed and stored successfully"
        }
    
class QueryRequest(BaseModel):
    question: str

@app.post("/query")

async def query_document(request: QueryRequest):

    #check if pdf is uploaded 
    if vector_store is None:
        return {"error": "No document uploaded yet. Please upload a PDF first"}

    #search FIASS for the 3 most relevent chunks 
    docs = vector_store.similarity_search(request.question, k=3)

    # build context from chunk
    context = "\n\n".join([doc.page_content for doc in docs])

    # build a prompt
    prompt = f"""You are a helpful assistant. Answer the question below 
    using ONLY the context provided. If the answer is not in the context, 
    say "I couldn't find that in the document."

    Context:
    {context}

    Question: {request.question}

    Answer:
    """

    llm = ChatOllama(
    model="llama3.2",
    temperature=0
)
    response = llm.invoke(prompt)
    answer = response.text

    return {
        "question": request.question,
        "answer": answer,
        "source": [
            doc.page_content[:200]
            for doc in docs
        ]
    }