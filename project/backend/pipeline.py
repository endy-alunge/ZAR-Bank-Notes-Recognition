import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import tempfile
import os

from sklearn.model_selection import cross_val_score
from backend.preprocessing import ImagePreprocessor
from backend.segmentation import ImageSegmenter
from backend.features import FeatureExtractor
from backend.classification import BanknoteClassifier


class RecognitionPipeline:
    """Complete pipeline for banknote recognition"""

    def __init__(self, model_path: Optional[str] = None, classifier_type: str = 'random_forest'):
        self.preprocessor = ImagePreprocessor()
        self.segmenter = ImageSegmenter()
        self.feature_extractor = FeatureExtractor()
        self.classifier = BanknoteClassifier()
        self.classifier_type = classifier_type

        if model_path and os.path.exists(model_path):
            self.classifier.load_model(model_path)
            print("Model loaded successfully")
        else:
            print("No model loaded. Train the system first.")

        self.debug_images = {}

    def extract_features_from_image(self, image_path: str) -> Tuple[Optional[np.ndarray], bool]:
        """Extract features from a single image"""
        try:
            # Preprocess
            preprocessed, original = self.preprocessor.preprocess_pipeline(image_path)

            # Segment
            segmented = self.segmenter.segmentation_pipeline(preprocessed)

            # Extract features
            features = self.feature_extractor.extract_feature_vector(segmented, original)

            # Store debug info
            self.debug_images = {
                'preprocessed': preprocessed,
                'segmented': segmented,
                'original': original
            }

            return features, True
        except Exception as e:
            print(f"Error processing {image_path}: {e}")
            return None, False

    def apply_rotation_invariance(self, image_path: str) -> Tuple[Optional[str], Optional[Dict], int, List]:
        """
        Handle rotated banknotes by trying multiple rotations

        Returns:
            Tuple of (denomination, confidence_scores, best_rotation, all_results)
        """
        # Load original image
        original_img = cv2.imread(image_path)
        if original_img is None:
            return None, None, None, None

        # Get dimensions
        h, w = original_img.shape[:2]

        # Upscale if too small
        if h < 100 or w < 100:
            scale_factor = max(200 / h, 200 / w)
            new_h = int(h * scale_factor)
            new_w = int(w * scale_factor)
            original_img = cv2.resize(original_img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)

        # Define rotations
        rotations = [0, 90, 180, 270]
        best_result = None
        best_confidence = 0
        best_denomination = None
        best_rotation = 0
        all_results = []

        for angle in rotations:
            # Rotate image
            h, w = original_img.shape[:2]
            center = (w // 2, h // 2)
            rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated_img = cv2.warpAffine(original_img, rotation_matrix, (w, h))

            # Save to temp file
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                temp_path = tmp_file.name
                cv2.imwrite(temp_path, rotated_img)

            try:
                # Extract features
                features, success = self.extract_features_from_image(temp_path)

                if success and self.classifier.trained:
                    # Predict
                    prediction, prob_dict = self.classifier.predict(features)
                    max_confidence = max(prob_dict.values())

                    result = {
                        'angle': angle,
                        'prediction': prediction,
                        'confidence': max_confidence,
                        'prob_dict': prob_dict
                    }
                    all_results.append(result)

                    if max_confidence > best_confidence:
                        best_confidence = max_confidence
                        best_denomination = prediction
                        best_rotation = angle
                        best_result = result

                # Clean up
                os.unlink(temp_path)

            except Exception as e:
                print(f"Error processing rotation {angle}: {e}")
                continue

        if best_result and best_confidence >= 0.4:  # Minimum confidence threshold
            return best_denomination, best_result['prob_dict'], best_rotation, all_results

        return None, None, None, None

    def recognize(self, image_path: str, handle_rotation: bool = True) -> Dict:
        """
        Recognize a banknote from image path

        Args:
            image_path: Path to the image file
            handle_rotation: Whether to apply rotation invariance

        Returns:
            Dictionary with recognition results
        """
        result = {
            'success': False,
            'denomination': None,
            'confidence_scores': None,
            'best_rotation': 0,
            'all_rotations': [],
            'error': None
        }

        if not os.path.exists(image_path):
            result['error'] = f"File not found: {image_path}"
            return result

        if not self.classifier.trained:
            result['error'] = "Model not trained. Please train first."
            return result

        try:
            if handle_rotation:
                # Use rotation-invariant recognition
                denom, scores, rotation, all_rots = self.apply_rotation_invariance(image_path)

                if denom:
                    result['success'] = True
                    result['denomination'] = denom
                    result['confidence_scores'] = scores
                    result['best_rotation'] = rotation
                    result['all_rotations'] = all_rots
                else:
                    result['error'] = "Could not identify banknote with sufficient confidence"
            else:
                # Simple recognition without rotation handling
                features, success = self.extract_features_from_image(image_path)

                if success:
                    denom, scores = self.classifier.predict(features)
                    result['success'] = True
                    result['denomination'] = denom
                    result['confidence_scores'] = scores
                else:
                    result['error'] = "Failed to extract features"

            return result

        except Exception as e:
            result['error'] = str(e)
            return result

    def train_from_folder(self, data_path: str, classifier_type: str = 'random_forest') -> Dict:
        """
        Train the system from folder structure

        Expected structure:
        data_path/
        └── training/
            ├── R10/
            ├── R20/
            ├── R50/
            ├── R100/
            └── R200/
        """
        print("=" * 60)
        print("LOADING DATASET FROM FOLDER STRUCTURE")
        print("=" * 60)

        training_path = Path(data_path) / "training"

        if not training_path.exists():
            return {'success': False, 'error': f"Training folder not found at {training_path}"}

        print(f"Looking for training data in: {training_path}")

        features_list = []
        labels_list = []

        # Process each denomination folder
        for denom in self.classifier.denominations:
            denom_folder = training_path / denom

            if not denom_folder.exists():
                print(f"Warning: {denom} folder not found")
                continue

            print(f"\nProcessing {denom}...")

            # Get all images
            image_files = []
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
                image_files.extend(denom_folder.glob(ext))

            if len(image_files) == 0:
                print(f"  No images found in {denom}")
                continue

            print(f"  Found {len(image_files)} images")

            # Process each image
            successful = 0
            for img_path in image_files:
                features, success = self.extract_features_from_image(str(img_path))
                if success:
                    features_list.append(features)
                    labels_list.append(denom)
                    successful += 1

            print(f"  Successfully processed: {successful}/{len(image_files)} images")

        if len(features_list) == 0:
            return {'success': False, 'error': 'No valid training data found'}

        # Convert to numpy arrays
        X = np.array(features_list)
        y = np.array(labels_list)

        print("\n" + "=" * 60)
        print("DATASET SUMMARY")
        print("=" * 60)
        print(f"Total samples: {len(X)}")
        print(f"Feature vector size: {X.shape[1]}")
        print(f"\nClass Distribution:")

        for denom in self.classifier.denominations:
            count = np.sum(y == denom)
            percentage = (count / len(y)) * 100 if len(y) > 0 else 0
            status = "OK" if count >= 10 else "WARNING"
            print(f"  {denom}: {count} images ({percentage:.1f}%) - {status}")

        # Train classifier
        print("\n" + "=" * 60)
        print(f"TRAINING CLASSIFIER — {classifier_type.upper()}")
        print("=" * 60)

        self.classifier.train_classifier(X, y, classifier_type)
        self.classifier_type = classifier_type

        # Cross-validation
        cv_scores = cross_val_score(
            self.classifier.classifier,
            self.classifier.scaler.transform(X),
            y,
            cv=min(5, len(np.unique(y)))
        )
        print(f"Cross-validation accuracy: {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")

        return {
            'success': True,
            'samples': len(X),
            'feature_size': X.shape[1],
            'cv_accuracy': cv_scores.mean(),
            'classifier_type': classifier_type,
            'class_distribution': {denom: int(np.sum(y == denom)) for denom in self.classifier.denominations}
        }

    def save_model(self, filepath: str) -> None:
        """Save the trained model"""
        self.classifier.save_model(filepath)

    def load_model(self, filepath: str) -> None:
        """Load a trained model"""
        self.classifier.load_model(filepath)

    def get_debug_images(self) -> Dict:
        """Get debug images from last processing"""
        return self.debug_images