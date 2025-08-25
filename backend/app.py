from flask import Flask, request, jsonify
from models.QA_bot import retriever_qa, health_check, WatsonXConfigError, DocumentProcessingError
from flask_cors import CORS
import traceback
import logging

app = Flask(__name__)
# CORS setup for development and production
CORS(app, origins=[
    'http://localhost:5173',  # Vite dev server
    'http://localhost:3000',  # Alternative dev port
    'https://your-frontend-domain.vercel.app',  # Update with your actual frontend URL
])

@app.route("/bot", methods=['POST'])
def bot():
    try:
        logging.info("Received QA request")
        file = request.files.get('context')
        query = request.form.get("question")

        logging.info(f"File: {file.filename if file else 'None'}")
        logging.info(f"Query: {query}")

        if not file or not query:
            return jsonify({'error': 'Context file or question is missing'}), 400

        logging.info("Processing with retriever_qa...")
        response = retriever_qa(file, query)
        logging.info(f"Response generated successfully")

        return jsonify({'bot_ans': response})

    except DocumentProcessingError as e:
        logging.error(f"Document processing error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except WatsonXConfigError as e:
        logging.error(f"WatsonX configuration error: {str(e)}")
        return jsonify({'error': 'AI service configuration error. Please contact support.'}), 500
    except ValueError as e:
        logging.error(f"Validation error: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        logging.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'An unexpected error occurred. Please try again.'}), 500

@app.route("/health", methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        health_status = health_check()
        return jsonify(health_status)
    except Exception as e:
        logging.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000, host='0.0.0.0')
