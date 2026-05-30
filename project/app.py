# app.py
import os
import cv2
import base64
import time
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from pathlib import Path
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import backend pipeline
from backend.pipeline import RecognitionPipeline

# Get absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'app', 'templates')
STATIC_DIR = os.path.join(BASE_DIR, 'app', 'static')
UPLOAD_DIR = os.path.join(STATIC_DIR, 'uploads')

# Initialize Flask with explicit paths
app = Flask(__name__,
            template_folder=TEMPLATE_DIR,
            static_folder=STATIC_DIR)

# Configuration
app.config['UPLOAD_FOLDER'] = UPLOAD_DIR
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp'}

# Create upload folder
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Print paths for debugging
print(f"Template folder: {TEMPLATE_DIR}")
print(f"Static folder:   {STATIC_DIR}")
print(f"Upload folder:   {UPLOAD_DIR}")
print(f"Template exists: {os.path.exists(os.path.join(TEMPLATE_DIR, 'index.html'))}")

# Map dropdown values to their saved .pkl files
MODEL_PATHS = {
    'random_forest': 'models/random_forest_model.pkl',
    'svm':           'models/svm_model.pkl',
    'knn':           'models/knn_model.pkl',
}

# Fallback: if old single model file exists, use it for random_forest
LEGACY_MODEL = 'models/banknote_model.pkl'
if os.path.exists(LEGACY_MODEL) and not os.path.exists(MODEL_PATHS['random_forest']):
    MODEL_PATHS['random_forest'] = LEGACY_MODEL


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def get_pipeline(classifier_type: str) -> RecognitionPipeline:
    """Return a pipeline loaded with the correct model for the chosen classifier."""
    model_path = MODEL_PATHS.get(classifier_type, MODEL_PATHS['random_forest'])
    return RecognitionPipeline(model_path=model_path, classifier_type=classifier_type)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    start_time = time.time()

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Please upload JPG, PNG, or WEBP'}), 400

    # Read which model the user selected (defaults to random_forest)
    classifier_type = request.form.get('model', 'random_forest')
    if classifier_type not in MODEL_PATHS:
        classifier_type = 'random_forest'

    # Save uploaded file
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    try:
        # Load the correct pipeline for the chosen model
        pipeline = get_pipeline(classifier_type)

        # Check the model file actually exists
        model_path = MODEL_PATHS[classifier_type]
        if not os.path.exists(model_path):
            return jsonify({
                'error': f'Model file not found for {classifier_type}. '
                         f'Please run main.py to train and save all models first.'
            }), 400

        # Run recognition
        result = pipeline.recognize(filepath)

        processing_time = time.time() - start_time

        if result['success']:
            # Convert confidence scores to percentages
            confidence_scores = {
                denom: round(score * 100, 2)
                for denom, score in result['confidence_scores'].items()
            }

            response = {
                'success':           True,
                'denomination':      result['denomination'],
                'confidence_scores': confidence_scores,
                'processing_time':   round(processing_time, 2),
                'best_rotation':     result.get('best_rotation', 0),
                'model_used':        classifier_type,   # sent back so JS can display it
            }
        else:
            response = {
                'success': False,
                'error':   result.get('error', 'Recognition failed'),
            }

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        # Clean up uploaded file
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass


@app.route('/health')
def health():
    """Quick health check — verifies which model files are present."""
    model_status = {
        name: os.path.exists(path)
        for name, path in MODEL_PATHS.items()
    }
    return jsonify({
        'status':       'healthy',
        'model_files':  model_status,
    })


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("STARTING BANKNOTE RECOGNITION WEB APP")
    print("=" * 50)
    print(f"URL: http://localhost:5000")
    print(f"Template folder: {TEMPLATE_DIR}")
    print(f"Static folder:   {STATIC_DIR}")
    print("=" * 50 + "\n")

    app.run(debug=True, host='0.0.0.0', port=5000)