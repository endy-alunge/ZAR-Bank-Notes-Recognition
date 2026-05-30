import numpy as np
import pickle
import os
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier  
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from typing import Dict, List, Tuple, Optional


class BanknoteClassifier:
    """Handles classification of banknotes"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.classifier = None
        self.trained = False
        self.model_type = None
        self.denominations = ['R10', 'R20', 'R50', 'R100', 'R200']
    
    def train_classifier(self, X_train: np.ndarray, y_train: np.ndarray, 
                        classifier_type: str = 'random_forest') -> object:
        """
        Train classifier with different algorithms
        """
        # Standardize features
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Select classifier
        if classifier_type == 'svm':
            self.classifier = SVC(kernel='rbf', C=10, gamma='scale', 
                                  probability=True, random_state=42)
        elif classifier_type == 'random_forest':
            self.classifier = RandomForestClassifier(n_estimators=100, 
                                                     random_state=42)
        elif classifier_type == 'knn':
            self.classifier = KNeighborsClassifier(
             n_neighbors=5, 
             metric='euclidean',
             weights='distance'
    )
        else:
            raise ValueError(f"Unknown classifier type: {classifier_type}")
        
        # Train
        self.classifier.fit(X_train_scaled, y_train)
        self.model_type = classifier_type
        self.trained = True
        
        return self.classifier
    
    def predict(self, features: np.ndarray) -> Tuple[str, Dict[str, float]]:
        """
        Predict banknote denomination with confidence scores
        
        Returns:
            Tuple of (predicted_denomination, confidence_scores_dict)
        """
        if not self.trained:
            raise ValueError("Classifier not trained yet!")
        
        # Reshape if necessary
        if features.ndim == 1:
            features = features.reshape(1, -1)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict
        prediction = self.classifier.predict(features_scaled)[0]
        
        # Get probabilities for all denominations
        if hasattr(self.classifier, 'predict_proba'):
            probabilities = self.classifier.predict_proba(features_scaled)[0]
            prob_dict = {}
            for cls, prob in zip(self.classifier.classes_, probabilities):
                prob_dict[cls] = prob
            
            # Ensure all denominations are present
            for denom in self.denominations:
                if denom not in prob_dict:
                    prob_dict[denom] = 0.0
        else:
            prob_dict = {prediction: 1.0}
        
        # Sort by confidence
        prob_dict = dict(sorted(prob_dict.items(), key=lambda x: x[1], reverse=True))
        
        return prediction, prob_dict
    
    def evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict:
        """
        Evaluate classifier performance
        """
        if not self.trained:
            raise ValueError("Classifier not trained yet!")
        
        X_test_scaled = self.scaler.transform(X_test)
        y_pred = self.classifier.predict(X_test_scaled)
        
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred, output_dict=True)
        conf_matrix = confusion_matrix(y_test, y_pred)
        
        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': conf_matrix
        }
    
    def cross_validate(self, X: np.ndarray, y: np.ndarray, cv: int = 5) -> Dict:
        """
        Perform cross-validation
        """
        X_scaled = self.scaler.fit_transform(X)
        
        scores = cross_val_score(self.classifier, X_scaled, y, cv=cv, scoring='accuracy')
        
        return {
            'mean_accuracy': scores.mean(),
            'std_accuracy': scores.std(),
            'all_scores': scores
        }
    
    def save_model(self, filepath: str) -> None:
        """Save trained model to disk"""
        if not self.trained:
            raise ValueError("Cannot save untrained model!")
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        model_data = {
            'classifier': self.classifier,
            'scaler': self.scaler,
            'denominations': self.denominations,
            'model_type': self.model_type
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str) -> None:
        """Load trained model from disk"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Model file not found: {filepath}")
        
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.classifier = model_data['classifier']
        self.scaler = model_data['scaler']
        self.model_type  = model_data.get('model_type', 'unknown')
        if 'denominations' in model_data:
            self.denominations = model_data['denominations']
        self.trained = True
        
        print(f"Model loaded from {filepath}")