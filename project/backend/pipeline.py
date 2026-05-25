# main.py
import cv2
import numpy as np
from src.preprocessing import BankNotePreprocessor, BankNoteSegmenter
from src.feature_extraction import BankNoteFeatureExtractor
from src.classification import BankNoteClassifier
import os
import pickle

class BankNoteRecognitionSystem:
    def __init__(self):
        self.preprocessor = BankNotePreprocessor()
        self.segmenter = BankNoteSegmenter(self.preprocessor)
        self.feature_extractor = BankNoteFeatureExtractor()
        self.classifier = BankNoteClassifier()
        
    def process_single_note(self, image_path, visualize=True):
        """
        Complete pipeline for a single banknote
        """
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Cannot load image from {image_path}")
        
        print(f"Processing {image_path}...")
        
        # 1. Preprocessing
        enhanced = self.preprocessor.clahe_enhancement(image)
        denoised = self.preprocessor.bilateral_filter(enhanced)
        
        # 2. Segmentation
        segmented, contour_viz, contour = self.segmenter.contour_segmentation(denoised)
        
        # 3. Feature extraction
        features = self.feature_extractor.extract_all_features(segmented)
        
        # 4. Classification (if classifier is trained)
        if self.classifier.current_classifier:
            # Combine features into single vector
            feature_vector = np.concatenate([
                features['color_histogram'],
                features['hu_moments'],
                features['lbp']
            ])
            result = self.classifier.predict(feature_vector)
            print(f"Predicted: {result['denomination']} (Confidence: {result['confidence']:.3f})")
            
            # Also extract SIFT features for verification
            _, sift_desc = self.feature_extractor.sift_features(segmented)
            
            return {
                'image': image,
                'segmented': segmented,
                'features': features,
                'prediction': result,
                'sift_descriptors': sift_desc
            }
        
        return {
            'image': image,
            'segmented': segmented,
            'features': features
        }
    
    def extract_dataset_features(self, data_dir):
        """
        Extract features from all images in dataset
        """
        X = []  # Feature vectors
        y = []  # Labels
        
        for class_name in self.classifier.classes:
            class_dir = os.path.join(data_dir, class_name)
            if not os.path.exists(class_dir):
                print(f"Warning: {class_dir} not found")
                continue
                
            for img_file in os.listdir(class_dir):
                if img_file.endswith(('.jpg', '.png', '.jpeg')):
                    img_path = os.path.join(class_dir, img_file)
                    result = self.process_single_note(img_path, visualize=False)
                    
                    feature_vector = np.concatenate([
                        result['features']['color_histogram'],
                        result['features']['hu_moments'],
                        result['features']['lbp']
                    ])
                    
                    X.append(feature_vector)
                    y.append(class_name)
        
        return np.array(X), np.array(y)
    
    def train(self, data_dir, classifier_name='random_forest'):
        """
        Train the system on dataset
        """
        print("Extracting features from dataset...")
        X, y = self.extract_dataset_features(data_dir)
        
        print(f"Extracted {len(X)} features, each of dimension {X[0].shape[0]}")
        
        print("\nTraining classifier...")
        self.classifier.train(X, y, classifier_name=classifier_name)
        
        return X, y
    
    def save_model(self, filepath):
        """Save trained classifier"""
        with open(filepath, 'wb') as f:
            pickle.dump(self.classifier.current_classifier, f)
    
    def load_model(self, filepath):
        """Load trained classifier"""
        with open(filepath, 'rb') as f:
            self.classifier.current_classifier = pickle.load(f)

# Example usage
if __name__ == "__main__":
    # Initialize system
    system = BankNoteRecognitionSystem()
    
    # Train (uncomment when you have dataset)
    # X, y = system.train('data/processed/', classifier_name='random_forest')
    # system.save_model('models/banknote_classifier.pkl')
    
    # Load pre-trained model
    # system.load_model('models/banknote_classifier.pkl')
    
    # Test on single image
    result = system.process_single_note('data/test/r10_front.jpg')
    
    # Visualize results
    cv2.imshow('Original', result['image'])
    cv2.imshow('Segmented', result['segmented'])
    cv2.waitKey(0)
    cv2.destroyAllWindows()
