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
print(f"Static folder: {STATIC_DIR}")
print(f"Upload folder: {UPLOAD_DIR}")
print(f"Template exists: {os.path.exists(os.path.join(TEMPLATE_DIR, 'index.html'))}")

# Initialize pipeline
pipeline = RecognitionPipeline('models/banknote_model.pkl')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def process_image_for_display(image_path):
    with open(image_path, 'rb') as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

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
    
    # Save file
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    try:
        # Recognize using backend
        result = pipeline.recognize(filepath)
        
        processing_time = time.time() - start_time
        
        if result['success']:
            # Get confidence scores as percentages
            confidence_scores = {}
            for denom, score in result['confidence_scores'].items():
                confidence_scores[denom] = round(score * 100, 2)
            
            response = {
                'success': True,
                'denomination': result['denomination'],
                'confidence_scores': confidence_scores,
                'processing_time': round(processing_time, 2),
                'best_rotation': result.get('best_rotation', 0)
            }
        else:
            response = {
                'success': False,
                'error': result.get('error', 'Recognition failed')
            }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up uploaded file
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except:
            pass

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': pipeline.trained,
        'denominations': pipeline.denominations
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("STARTING BANKNOTE RECOGNITION WEB APP")
    print("="*50)
    print(f"URL: http://localhost:5000")
    print(f"Template folder: {TEMPLATE_DIR}")
    print(f"Static folder: {STATIC_DIR}")
    print("="*50 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)