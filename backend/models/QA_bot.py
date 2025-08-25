# 1. Import required libraries
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames as GenParams
from langchain_ibm import WatsonxLLM, WatsonxEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from ibm_watsonx_ai.metanames import EmbedTextParamsMetaNames
from langchain_community.vectorstores import Chroma
from langchain.chains import RetrievalQA
from urllib3 import response
import os
import tempfile
import logging
import hashlib
from typing import Optional, Dict, Any
from functools import lru_cache

# env
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Persistent db
CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_store")

# Configuration constants
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200
DEFAULT_MAX_TOKENS = 512
DEFAULT_TEMPERATURE = 0.3
MODEL_ID = "ibm/granite-13b-instruct-v2"
EMBEDDING_MODEL_ID = "ibm/slate-125m-english-rtrvr"

class WatsonXConfigError(Exception):
    """Custom exception for WatsonX configuration errors"""
    pass

class DocumentProcessingError(Exception):
    """Custom exception for document processing errors"""
    pass

def validate_environment() -> None:
    """Validate that all required environment variables are set"""
    required_vars = ['WATSONX_APIKEY', 'WATSONX_URL', 'WATSONX_PROJECT_ID']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        raise WatsonXConfigError(f"Missing required environment variables: {', '.join(missing_vars)}")

@lru_cache(maxsize=1)
def get_llm() -> WatsonxLLM:
    """
    Initialize and cache the WatsonX LLM instance.
    Uses LRU cache to avoid recreating the model on each request.
    """
    try:
        validate_environment()
        
        parameters = {
            GenParams.MAX_NEW_TOKENS: DEFAULT_MAX_TOKENS,
            GenParams.TEMPERATURE: DEFAULT_TEMPERATURE,
            GenParams.TOP_P: 0.9,
            GenParams.REPETITION_PENALTY: 1.1
        }

        logger.info("Initializing WatsonX LLM...")
        watsonx_llm = WatsonxLLM(
            model_id=MODEL_ID,
            apikey=os.getenv('WATSONX_APIKEY'),
            url=os.getenv('WATSONX_URL'),
            project_id=os.getenv('WATSONX_PROJECT_ID'),
            params=parameters
        )
        
        logger.info("WatsonX LLM initialized successfully")
        return watsonx_llm
        
    except Exception as e:
        logger.error(f"Failed to initialize WatsonX LLM: {str(e)}")
        raise WatsonXConfigError(f"LLM initialization failed: {str(e)}")

def document_loader(file) -> list:
    """
    Load and process uploaded PDF document with improved error handling.
    
    Args:
        file: Uploaded file object
        
    Returns:
        list: Loaded documents
        
    Raises:
        DocumentProcessingError: If file processing fails
    """
    if not file or not file.filename:
        raise DocumentProcessingError("No file provided")
    
    if not file.filename.lower().endswith('.pdf'):
        raise DocumentProcessingError("Only PDF files are supported")
    
    temp_dir = None
    temp_path = None
    
    try:
        # Create temporary directory with unique name
        temp_dir = tempfile.mkdtemp(prefix="mindpages_")
        temp_path = os.path.join(temp_dir, file.filename)
        
        logger.info(f"Processing file: {file.filename}")
        file.save(temp_path)
        
        # Validate file size (max 50MB)
        file_size = os.path.getsize(temp_path)
        if file_size > 50 * 1024 * 1024:  # 50MB
            raise DocumentProcessingError("File size exceeds 50MB limit")
        
        loader = PyPDFLoader(temp_path)
        documents = loader.load()
        
        if not documents:
            raise DocumentProcessingError("No content could be extracted from the PDF")
        
        logger.info(f"Successfully loaded {len(documents)} pages from {file.filename}")
        return documents
        
    except Exception as e:
        logger.error(f"Error processing document {file.filename}: {str(e)}")
        raise DocumentProcessingError(f"Failed to process document: {str(e)}")
        
    finally:
        # Clean up temporary files
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Failed to remove temporary file {temp_path}: {str(e)}")
        
        if temp_dir and os.path.exists(temp_dir):
            try:
                os.rmdir(temp_dir)
            except Exception as e:
                logger.warning(f"Failed to remove temporary directory {temp_dir}: {str(e)}")

def text_splitter(data: list, chunk_size: int = DEFAULT_CHUNK_SIZE, 
                 chunk_overlap: int = DEFAULT_CHUNK_OVERLAP) -> list:
    """
    Split documents into chunks with improved parameters.
    
    Args:
        data: List of documents to split
        chunk_size: Size of each chunk
        chunk_overlap: Overlap between chunks
        
    Returns:
        list: Split document chunks
    """
    try:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]  # Better separators for PDF content
        )
        
        chunks = text_splitter.split_documents(data)
        logger.info(f"Split {len(data)} documents into {len(chunks)} chunks")
        return chunks
        
    except Exception as e:
        logger.error(f"Error splitting text: {str(e)}")
        raise DocumentProcessingError(f"Text splitting failed: {str(e)}")

@lru_cache(maxsize=1)
def get_embeddings() -> WatsonxEmbeddings:
    """
    Initialize and cache the WatsonX embeddings model.
    Uses LRU cache to avoid recreating the model on each request.
    """
    try:
        validate_environment()
        
        embed_params = {
            EmbedTextParamsMetaNames.TRUNCATE_INPUT_TOKENS: 512,
            EmbedTextParamsMetaNames.RETURN_OPTIONS: {"input_text": True}
        }

        logger.info("Initializing WatsonX embeddings...")
        watsonx_embeddings = WatsonxEmbeddings(
            model_id=EMBEDDING_MODEL_ID,
            apikey=os.getenv('WATSONX_APIKEY'),
            url=os.getenv('WATSONX_URL'),
            project_id=os.getenv('WATSONX_PROJECT_ID'),
            params=embed_params
        )
        
        logger.info("WatsonX embeddings initialized successfully")
        return watsonx_embeddings
        
    except Exception as e:
        logger.error(f"Failed to initialize embeddings: {str(e)}")
        raise WatsonXConfigError(f"Embeddings initialization failed: {str(e)}")

def create_vector_database(chunks: list, collection_name: Optional[str] = None) -> Chroma:
    """
    Create or load vector database with improved error handling and collection naming.
    
    Args:
        chunks: Document chunks to embed
        collection_name: Optional collection name for the vector store
        
    Returns:
        Chroma: Vector database instance
    """
    try:
        embedding_model = get_embeddings()
        
        # Create unique collection name based on content hash if not provided
        if not collection_name:
            content_hash = hashlib.md5(str(chunks).encode()).hexdigest()[:8]
            collection_name = f"mindpages_{content_hash}"
        
        logger.info(f"Creating vector database with collection: {collection_name}")
        
        vectordb = Chroma.from_documents(
            documents=chunks,
            embedding=embedding_model,
            persist_directory=CHROMA_DB_DIR,
            collection_name=collection_name
        )
        
        vectordb.persist()
        logger.info("Vector database created and persisted successfully")
        
        return vectordb
        
    except Exception as e:
        logger.error(f"Error creating vector database: {str(e)}")
        raise DocumentProcessingError(f"Vector database creation failed: {str(e)}")

def get_retriever(file, collection_name: Optional[str] = None):
    """
    Create retriever from uploaded file with improved error handling.
    
    Args:
        file: Uploaded file object
        collection_name: Optional collection name
        
    Returns:
        Retriever: LangChain retriever instance
    """
    try:
        logger.info("Starting document processing pipeline...")
        
        # Load and process document
        documents = document_loader(file)
        chunks = text_splitter(documents)
        
        # Create vector database
        vectordb = create_vector_database(chunks, collection_name)
        
        # Create retriever with improved parameters
        retriever = vectordb.as_retriever()
        
        logger.info("Retriever created successfully")
        return retriever
        
    except Exception as e:
        logger.error(f"Error creating retriever: {str(e)}")
        raise DocumentProcessingError(f"Retriever creation failed: {str(e)}")

def retriever_qa(file, query: str) -> str:
    """
    Main QA function with comprehensive error handling and improved response generation.
    
    Args:
        file: Uploaded file object
        query: User question
        
    Returns:
        str: AI-generated response
        
    Raises:
        DocumentProcessingError: If document processing fails
        WatsonXConfigError: If AI service configuration fails
    """
    if not query or not query.strip():
        raise ValueError("Query cannot be empty")
    
    try:
        logger.info(f"Processing QA request: {query[:100]}...")
        
        # Get LLM and retriever
        llm = get_llm()
        retriever_obj = get_retriever(file)
        
        # Create QA chain with improved configuration
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever_obj,
            return_source_documents=True,
            chain_type="stuff",  # Use "stuff" for better response quality
            chain_type_kwargs={
                "prompt": None,  # Use default prompt
                "verbose": False
            }
        )
        
        # Generate response
        logger.info("Generating AI response...")
        response = qa_chain.invoke({"query": query})
        
        if not response or 'result' not in response:
            raise DocumentProcessingError("Failed to generate response from AI model")
        
        result = response['result']
        source_docs = response.get('source_documents', [])
        
        logger.info(f"Generated response with {len(source_docs)} source documents")
        
        # Add source information if available
        if source_docs:
            result += f"\n\n*Based on {len(source_docs)} relevant document sections*"
        
        return result
        
    except (WatsonXConfigError, DocumentProcessingError) as e:
        logger.error(f"QA processing error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error in QA processing: {str(e)}")
        raise DocumentProcessingError(f"QA processing failed: {str(e)}")

# Utility function for health check
def health_check() -> Dict[str, Any]:
    """
    Check the health of WatsonX services and configuration.
    
    Returns:
        dict: Health status information
    """
    try:
        validate_environment()
        
        # Test LLM initialization
        llm = get_llm()
        
        # Test embeddings initialization
        embeddings = get_embeddings()
        
        return {
            "status": "healthy",
            "llm_model": MODEL_ID,
            "embedding_model": EMBEDDING_MODEL_ID,
            "chroma_db_dir": CHROMA_DB_DIR
        }
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        } 