# src/classification.py
import cv2
import numpy as np
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
import pickle

class BankNoteClassifier:
    def __init__(self):
        self.classifiers = {
            'svm': SVC(kernel='rbf', C=10, gamma='scale', probability=True),
            'random_forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'knn': KNeighborsClassifier(n_neighbors=5)
        }
        self.current_classifier = None
        self.feature_extractor = None
        
        # Define classes (denominations)
        self.classes = ['R10', 'R20', 'R50', 'R100', 'R200']
        
    def train(self, X, y, classifier_name='svm', test_size=0.2):
        """Train classifier with cross-validation"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        clf = self.classifiers[classifier_name]
        clf.fit(X_train, y_train)
        
        # Evaluate
        y_pred = clf.predict(X_test)
        accuracy = np.mean(y_pred == y_test)
        
        print(f"Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred, target_names=self.classes))
        
        # Cross-validation
        cv_scores = cross_val_score(clf, X, y, cv=5)
        print(f"Cross-validation scores: {cv_scores}")
        print(f"Mean CV accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        self.current_classifier = clf
        return clf, accuracy
    
    def predict(self, features):
        """Predict denomination"""
        if self.current_classifier is None:
            raise ValueError("Classifier not trained yet")
        
        probs = self.current_classifier.predict_proba([features])[0]
        predicted_idx = np.argmax(probs)
        
        return {
            'denomination': self.classes[predicted_idx],
            'confidence': probs[predicted_idx],
            'all_probabilities': dict(zip(self.classes, probs))
        }
    
    def match_keypoints(self, descriptors1, descriptors2, ratio_thresh=0.75):
        """
        Match SIFT/ORB descriptors for verification
        Returns match confidence score
        """
        if descriptors1 is None or descriptors2 is None:
            return 0.0
        
        # Use FLANN matcher for SIFT/ORB
        FLANN_INDEX_KDTREE = 1
        index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
        search_params = dict(checks=50)
        
        flann = cv2.FlannBasedMatcher(index_params, search_params)
        
        try:
            matches = flann.knnMatch(descriptors1, descriptors2, k=2)
        except:
            return 0.0
        
        # Apply ratio test
        good_matches = []
        for match_pair in matches:
            if len(match_pair) == 2:
                m, n = match_pair
                if m.distance < ratio_thresh * n.distance:
                    good_matches.append(m)
        
        # Confidence as ratio of good matches
        confidence = len(good_matches) / min(len(descriptors1), len(descriptors2))
        
        return min(confidence, 1.0)
    
    def ensemble_predict(self, feature_vector, keypoints1=None, descriptors1=None, 
                         reference_db=None):
        """
        Ensemble prediction combining multiple methods
        """
        # Primary classification
        primary_result = self.predict(feature_vector)
        
        # Keypoint matching if reference database provided
        match_confidences = []
        if reference_db and descriptors1 is not None:
            for ref_class, ref_data in reference_db.items():
                match_conf = self.match_keypoints(descriptors1, ref_data['descriptors'])
                match_confidences.append((ref_class, match_conf))
        
        # Combine predictions (weighted average)
        # (Implementation depends on your ensemble strategy)
        
        return primary_result
