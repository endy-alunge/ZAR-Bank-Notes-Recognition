import cv2
import numpy as np
from skimage.feature import local_binary_pattern, hog
from typing import List, Tuple, Dict
import warnings
warnings.filterwarnings('ignore')


class FeatureExtractor:
    """Extracts features from banknote images"""
    
    def __init__(self):
        self.feature_names = []
        self.denominations = ['R10', 'R20', 'R50', 'R100', 'R200']
    
    def extract_hu_moments(self, image: np.ndarray) -> np.ndarray:
        """Extract Hu moments (invariant to scale, rotation, translation)"""
        moments = cv2.moments(image)
        hu_moments = cv2.HuMoments(moments).flatten()
        # Log transform to normalize
        hu_moments = -np.sign(hu_moments) * np.log10(np.abs(hu_moments) + 1e-10)
        return hu_moments
    
    def extract_histogram_features(self, image: np.ndarray, bins: int = 32) -> np.ndarray:
        """Extract histogram features"""
        hist = cv2.calcHist([image], [0], None, [bins], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        return hist
    
    def extract_lbp_features(self, image: np.ndarray, radius: int = 3, n_points: int = 24) -> np.ndarray:
        """Extract Local Binary Pattern features (rotation invariant)"""
        lbp = local_binary_pattern(image, n_points, radius, method='uniform')
        hist, _ = np.histogram(lbp.ravel(), bins=np.arange(0, n_points + 3), range=(0, n_points + 2))
        hist = hist.astype("float")
        hist /= (hist.sum() + 1e-6)
        return hist
    
    def extract_hog_features(self, image: np.ndarray) -> np.ndarray:
        """Extract HOG (Histogram of Oriented Gradients) features"""
        # Resize for consistent HOG computation
        resized = cv2.resize(image, (128, 128))
        hog_features = hog(resized, orientations=9, pixels_per_cell=(8, 8),
                          cells_per_block=(2, 2), visualize=False)
        return hog_features
    
    def extract_edge_features(self, image: np.ndarray) -> np.ndarray:
        """Extract edge-based features using Canny edge detector"""
        edges = cv2.Canny(image, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        edge_hist = cv2.calcHist([edges], [0], None, [16], [0, 256])
        edge_hist = cv2.normalize(edge_hist, edge_hist).flatten()
        return np.concatenate([[edge_density], edge_hist])
    
    def extract_color_features(self, original_color_image: np.ndarray) -> np.ndarray:
        """Extract color-based features"""
        if len(original_color_image.shape) == 3:
            # Convert to HSV color space
            hsv = cv2.cvtColor(original_color_image, cv2.COLOR_BGR2HSV)
            # Extract histograms for each channel
            h_hist = cv2.calcHist([hsv], [0], None, [16], [0, 180])
            s_hist = cv2.calcHist([hsv], [1], None, [16], [0, 256])
            v_hist = cv2.calcHist([hsv], [2], None, [16], [0, 256])
            color_features = np.concatenate([h_hist.flatten(), s_hist.flatten(), v_hist.flatten()])
            color_features = cv2.normalize(color_features, color_features).flatten()
            return color_features
        return np.array([])
    
    def extract_texture_features(self, image: np.ndarray) -> np.ndarray:
        """Extract texture features using image statistics"""
        mean_val = np.mean(image)
        std_val = np.std(image)
        # Calculate entropy
        hist = np.histogram(image, bins=32)[0] / image.size
        hist = hist[hist > 0]
        entropy = -np.sum(hist * np.log2(hist + 1e-7))
        return np.array([mean_val, std_val, entropy])
    
    def extract_feature_vector(self, grayscale_image: np.ndarray, 
                               original_color_image: np.ndarray = None) -> np.ndarray:
        """Extract combined feature vector for classification"""
        # Extract all features
        hu_features = self.extract_hu_moments(grayscale_image)
        hist_features = self.extract_histogram_features(grayscale_image)
        lbp_features = self.extract_lbp_features(grayscale_image)
        hog_features = self.extract_hog_features(grayscale_image)
        edge_features = self.extract_edge_features(grayscale_image)
        texture_features = self.extract_texture_features(grayscale_image)
        
        # Combine features
        features = np.concatenate([
            hu_features, hist_features, lbp_features, 
            hog_features, edge_features, texture_features
        ])
        
        # Add color features if available
        if original_color_image is not None:
            color_features = self.extract_color_features(original_color_image)
            if len(color_features) > 0:
                features = np.concatenate([features, color_features])
        
        return features
    
    def extract_all_features(self, image: np.ndarray, 
                            methods: List[str] = None) -> Dict[str, np.ndarray]:
        """Extract all features using specified methods"""
        if methods is None:
            methods = ['hu_moments', 'histogram', 'lbp', 'hog', 'edge']
        
        features = {}
        
        if 'hu_moments' in methods:
            features['hu_moments'] = self.extract_hu_moments(image)
        
        if 'histogram' in methods:
            features['histogram'] = self.extract_histogram_features(image)
        
        if 'lbp' in methods:
            features['lbp'] = self.extract_lbp_features(image)
        
        if 'hog' in methods:
            features['hog'] = self.extract_hog_features(image)
        
        if 'edge' in methods:
            features['edge'] = self.extract_edge_features(image)
        
        return features