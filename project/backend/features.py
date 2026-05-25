# src/feature_extraction.py
import cv2
import numpy as np
from skimage.feature import local_binary_pattern, hog
from scipy.spatial.distance import cosine

class BankNoteFeatureExtractor:
    def __init__(self):
        self.orb = cv2.ORB_create(nfeatures=1000)
        self.sift = cv2.SIFT_create(nfeatures=1000)
        
    def orb_features(self, image):
        """
        ORB (Oriented FAST and Rotated BRIEF)
        Rotation and scale invariant keypoint descriptor
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        keypoints, descriptors = self.orb.detectAndCompute(gray, None)
        return keypoints, descriptors
    
    def sift_features(self, image):
        """
        SIFT (Scale-Invariant Feature Transform)
        More accurate but slower than ORB
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        keypoints, descriptors = self.sift.detectAndCompute(gray, None)
        return keypoints, descriptors
    
    def color_histogram(self, image, bins=32):
        """
        Color histogram in HSV color space
        Invariant to lighting changes
        """
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        hist_h = cv2.calcHist([hsv], [0], None, [bins], [0, 180])
        hist_s = cv2.calcHist([hsv], [1], None, [bins], [0, 256])
        hist_v = cv2.calcHist([hsv], [2], None, [bins], [0, 256])
        
        # Normalize
        hist_h = hist_h / np.sum(hist_h)
        hist_s = hist_s / np.sum(hist_s)
        hist_v = hist_v / np.sum(hist_v)
        
        return np.concatenate([hist_h.flatten(), hist_s.flatten(), hist_v.flatten()])
    
    def hog_features(self, image):
        """
        HOG (Histogram of Oriented Gradients)
        Captures edge/structure information
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        features = hog(gray, orientations=9, pixels_per_cell=(8, 8),
                      cells_per_block=(2, 2), visualize=False)
        return features
    
    def lbp_features(self, image, radius=1, n_points=8):
        """
        LBP (Local Binary Pattern)
        Texture descriptor robust to illumination
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        lbp = local_binary_pattern(gray, n_points, radius, method='uniform')
        hist, _ = np.histogram(lbp.ravel(), bins=np.arange(0, n_points + 3),
                               range=(0, n_points + 2))
        hist = hist.astype("float")
        hist /= (hist.sum() + 1e-6)
        
        return hist
    
    def moment_invariants(self, image):
        """
        Hu moments - invariant to translation, scale, and rotation
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        moments = cv2.moments(gray)
        hu_moments = cv2.HuMoments(moments).flatten()
        
        # Log transform for better scaling
        hu_moments = -np.sign(hu_moments) * np.log10(np.abs(hu_moments) + 1e-6)
        
        return hu_moments
    
    def extract_all_features(self, image):
        """Extract and concatenate all features"""
        features = {
            'color_histogram': self.color_histogram(image),
            'hu_moments': self.moment_invariants(image),
            'lbp': self.lbp_features(image)
        }
        
        # Add SIFT/ORB features (requires keypoint matching, not direct concatenation)
        
        return features
    
    def compute_similarity(self, features1, features2, method='cosine'):
        """
        Compute similarity between two feature vectors
        Methods: 'cosine', 'euclidean', 'intersection'
        """
        similarities = {}
        
        for feature_name in features1.keys():
            f1 = features1[feature_name]
            f2 = features2[feature_name]
            
            if method == 'cosine':
                sim = 1 - cosine(f1, f2)
            elif method == 'euclidean':
                sim = 1 / (1 + np.linalg.norm(f1 - f2))
            elif method == 'intersection':
                sim = np.sum(np.minimum(f1, f2)) / np.sum(f1)
            
            similarities[feature_name] = sim
        
        return similarities
