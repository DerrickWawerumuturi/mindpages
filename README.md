# MindPages - An AI Document Assistant

A modern web application that allows users to upload documents and ask questions to get intelligent insights and summaries using AI.

## 🚀 Features

- **Document Upload**: Support for PDF, DOCX, and TXT files
- **AI-Powered Q&A**: Ask questions about your documents and get intelligent responses
- **Modern UI**: Beautiful, responsive design with drag-and-drop file upload
- **Real-time Processing**: Live feedback during document analysis
- **Secure**: Local document processing with no data retention

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Axios** for API communication

### Backend
- **Flask** Python web framework
- **WatsonX** AI integration for document processing
- **CORS** enabled for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- pip

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv server

# Activate virtual environment
# On macOS/Linux:
source server/bin/activate
# On Windows:
server\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage

1. **Upload Document**: Drag and drop or click to upload a PDF, DOCX, or TXT file
2. **Ask Questions**: Type your question in the text area
3. **Get AI Response**: Click "Ask our AI" to receive intelligent insights about your document

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id_here
```

## 📁 Project Structure

```
mindpages/
├── backend/
│   ├── app.py              # Flask application
│   ├── models/
│   │   └── QA_bot.py       # AI integration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── sections/
│   │   │   └── Rag.tsx     # Main RAG component
│   │   └── App.tsx         # Root component
│   ├── package.json        # Node dependencies
│   └── index.html          # Entry point
└── README.md
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

### Backend (Heroku/Railway)
```bash
cd backend
# Ensure requirements.txt is up to date
pip freeze > requirements.txt
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Verify your WatsonX API credentials
4. Open an issue on GitHub

---

Built by [Derrick Muturi](https://github.com/DerrickWawerumuturi)