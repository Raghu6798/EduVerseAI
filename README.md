# Multimodal RAG Application

## Project Description

This project is a Multimodal Retrieval Augmented Generation (RAG) application designed to interact with various types of learning materials, including documents, images, videos, and audio. It leverages a FastAPI backend for processing and an AI/React frontend for the user interface, providing a smart study companion.

## Features

- **Document Analysis:** Upload PDFs and other documents to ask specific questions and get contextual answers.
- **Image Understanding:** Analyze diagrams, charts, and handwritten notes.
- **Video & Audio Processing:** Extract insights and ask questions from lecture recordings and notes.
- **Conversational Interface:** Interact with your learning materials through a chat interface.
- **Multimodal RAG:** Combines Large Language Models (LLMs) with retrieval from diverse data types.
- **User Authentication:** Secure access to uploaded materials.

## Technologies Used

### Frontend (`Frontend/`)

- React
- Vite
- TypeScript
- react-router-dom
- ai/react (for chat functionality)
- Tailwind CSS (inferred from class names)
- framer-motion (for animations)

### Backend (`fastapi_backend/`)

- FastAPI
- Python
- Langchain
- Qdrant (Vector Database)
- Supabase (Authentication and Metadata Storage)
- loguru (Logging)
- python-dotenv (Environment variable management)
- PyMuPDFLoader, RecursiveCharacterTextSplitter, HuggingFaceEmbeddings (from Langchain ecosystem)

## Project Structure

```
.
├── Frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/
│   │   │   ├── home/
│   │   │   ├── layout/
│   │   │   └── ui/         # Generic UI elements (Button, etc.)
│   │   ├── context/        # React contexts (AuthContext)
│   │   ├── pages/          # Main application pages (Home, DocumentChat, etc.)
│   │   └── ...             # Other frontend files (index.css, main.tsx, App.tsx)
├── fastapi_backend/
│   ├── config/           # Configuration settings
│   │   ├── __init__.py
│   │   └── settings.py
│   ├── Models/           # AI Models (Embeddings, Reranking)
│   │   ├── Embedding_model/
│   │   └── ...
│   ├── routes/           # FastAPI endpoints (document_qa_route.py, etc.)
│   ├── vector_databases/ # Vector store interaction code (qdrant/)
│   │   └── qdrant/
│   └── ...               # Other backend files (main.py, requirements.txt - assumed)
├── README.md           # This file
└── ...                 # Other project files (.gitignore, .env - assumed)
```

## Setup

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone <repository_url>
cd Mult_modal_RAG
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd fastapi_backend
```

Install Python dependencies. It's recommended to use a virtual environment.

```bash
# Create a virtual environment
python -m venv venv
# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies (assuming requirements.txt exists)
pip install -r requirements.txt
# If requirements.txt does not exist, you'll need to install packages manually:
# pip install fastapi uvicorn[standard] langchain langchain-community qdrant-client supabase-py loguru python-dotenv pydantic-settings PyMuPDF lucide-react framer-motion numpy # Add other dependencies as needed
```

#### Environment Variables

Create a `.env` file in the `fastapi_backend/` directory based on `fastapi_backend/.env.example` (you might need to create a `.env.example` if it doesn't exist). You will need to configure:

-   **Supabase:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_PRIVATE`.
-   **LLM API Keys:** `CEREBRAS_API_KEY`, `GOOGLE_API_KEY`, `GROQ_API_KEY` (based on `settings.py`).
-   Any other settings required by `fastapi_backend/config/settings.py`.

#### Database Setup (Supabase and Qdrant)

-   **Supabase:** Set up a Supabase project and configure your database tables (e.g., a `documents` table and a `document_qa` table as seen in `document_qa_route.py`). Obtain your project URL and service role key.
-   **Qdrant:** Ensure a Qdrant instance is running (locally or hosted) and accessible to your backend. The backend code initializes a collection named `demo_collection` (seen in `document_qa_route.py`), but you might need to configure the Qdrant connection URL in your environment variables if it's not running on the default `localhost:6333`.

### 3. Frontend Setup

Open a new terminal, navigate to the project root, and then to the frontend directory:

```bash
cd .. # Go back to project root if you are in fastapi_backend
cd Frontend
```

Install frontend dependencies:

```bash
npm install # or yarn install or pnpm install
```

#### Environment Variables

Create a `.env` file in the `Frontend/` directory based on `Frontend/.env.local.example` (you might need to create one). Configure any frontend-specific environment variables, such as the backend API URL if it's different from the default expected by `ai/react` or your custom fetch calls.

## Usage

### 1. Start the Backend Server

From the `fastapi_backend/` directory (with your virtual environment activated):

```bash
uvicorn main:app --reload
```

(Assuming your main FastAPI application instance is named `app` in `main.py`)

### 2. Start the Frontend Development Server

From the `Frontend/` directory:

```bash
npm run dev # or yarn dev or pnpm dev
```

### 3. Access the Application

Open your web browser and navigate to the address provided by the Vite development server (usually `http://localhost:5173`).

Interact with the different chat sections (Document, Image, Video, Audio) via the navigation.

## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute. (Create this file if it doesn't exist)

## License

This project is licensed under the [MIT License](LICENSE). (Create a LICENSE file if it doesn't exist)
