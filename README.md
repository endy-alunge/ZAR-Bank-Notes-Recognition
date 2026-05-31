# ZAR Bank Notes Recognition

A deep learning and computer vision framework for South African Banknote (ZAR) detection and authentication.

The system processes uploaded banknote images through a custom image processing pipeline consisting of preprocessing, region segmentation, feature extraction, and machine learning classification. The application is designed to identify South African currency denominations and assist in verifying note authenticity in real time.

---

## GitHub Repository

Repository URL:

https://github.com/endy-alunge/ZAR-Bank-Notes-Recognition.git

---

## Features

* South African banknote denomination recognition
* Image preprocessing and enhancement
* Region-based segmentation
* Feature extraction using computer vision techniques
* Machine learning classification
* Real-time prediction through a Flask web application
* Model persistence and reuse
* User-friendly web interface

---

## Technologies Used

* Python
* OpenCV
* NumPy
* Scikit-Image
* Scikit-Learn
* Flask
* Matplotlib
* Seaborn
* Pillow

---

## Requirements

Install the following dependencies:
opencv-python>=4.8.1.78
numpy>=1.26.0
scikit-image>=0.21.0
scikit-learn>=1.3.0
matplotlib>=3.7.2
seaborn>=0.12.2
flask>=2.3.3
pillow>=10.3.0
joblib>=1.3.2

Alternatively, install all dependencies from a requirements file:
bash
pip install -r requirements.txt

---

## Project Structure
project/
│
├── app/
│   ├── static/
│   │   ├── styles.css
│   │   ├── script.js
│   │   └── uploads/
│   │
│   ├── templates/
│   │   ├── index.html
│   │   └── result.html
│   │
│   └── ui.py
│
├── backend/
│   ├── preprocessing.py
│   ├── segmentation.py
│   ├── features.py
│   ├── classification.py
│   └── pipeline.py
│
├── models/
│   ├── svm_model.pkl
│   ├── knn_model.pkl
│   └── randomforest.pkl
│
├── data/
│   ├── raw/
│   │   ├── R10/
│   │   ├── R20/
│   │   ├── R50/
│   │   ├── R100/
│   │   └── R200/
│   │
│   ├── processed/
│   └── test_images/
│
├── notebooks/
│   ├── exploration.ipynb
│   ├── feature_analysis.ipynb
│   └── model_testing.ipynb
│
├── utils/
│   ├── image_utils.py
│   ├── metrics.py
│   └── helpers.py
│
├── main.py
├── app.py
├── requirements.txt
└── README.md

---

## Architecture Overview

The application follows a layered architecture:

1. Data Layer

   * Stores raw, processed, and testing banknote images.

2. Backend Layer

   * Performs preprocessing, segmentation, feature extraction, and classification.
   * The pipeline orchestrates the complete recognition workflow.

3. Model Layer

   * Stores trained machine learning models used for denomination prediction and authenticity analysis.

4. Frontend Layer

   * Provides a web-based interface for image uploads and displaying prediction results.

5. Application Entry Points

   * `main.py` trains and saves machine learning models.
   * `app.py` launches the Flask web application for real-time banknote recognition.

---

## Installation

### 1. Clone the Repository
bash
git clone https://github.com/endy-alunge/ZAR-Bank-Notes-Recognition.git

### 2. Navigate to the Project Directory
bash
cd ZAR-Bank-Notes-Recognition

### 3. Install Dependencies
bash
pip install -r requirements.txt

---

## Running the Project

### Step 1: Train the Models

Before launching the application, the machine learning models must exist.

Run:
bash
python main.py

This script will:

* Load and preprocess the banknote dataset
* Extract features from the images
* Train the machine learning models
* Save the trained models for future use

If trained models already exist, retraining is not required.

---

### Step 2: Start the Flask Application

Once the models have been generated, launch the web application:
bash
python app.py

The Flask server will start and display a local URL similar to:
http://127.0.0.1:5000

Open the URL in your browser to access the application.

---

## How to Use

1. Start the application using `app.py`.
2. Open the web interface in your browser.
3. Upload a South African banknote image.
4. The system will:

   * Preprocess the image
   * Segment important banknote regions
   * Extract relevant features
   * Classify the denomination
   * Display the prediction results

---

## Output

The system provides:

* Predicted banknote denomination
* Classification confidence
* Processed image information
* Authentication-related analysis results

---

## Troubleshooting

### Models Not Found

If the application reports missing models, run:
bash
python main.py

to generate them before running the Flask application.

### Missing Python Packages

Install all required packages:
bash
pip install -r requirements.txt

### Flask Application Fails to Start

Ensure that:

* Python 3.10 or newer is installed
* All dependencies are installed successfully
* Trained model files exist in the `models` directory
