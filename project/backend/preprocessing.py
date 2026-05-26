import cv2
import numpy as np
from typing import Tuple, Optional


class ImagePreprocessor:
    """Handles image preprocessing and enhancement techniques"""
    
    def __init__(self):
        self.methods_compared = []
    
    def load_image(self, image_path: str) -> np.ndarray:
        """Load image from path"""
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Cannot load image from {image_path}")
        return image
    
    def convert_to_grayscale(self, image: np.ndarray) -> np.ndarray:
        """Convert BGR to grayscale"""
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    def apply_gaussian_blur(self, image: np.ndarray, kernel_size: Tuple[int, int] = (5, 5)) -> np.ndarray:
        """Apply Gaussian blur for noise reduction"""
        return cv2.GaussianBlur(image, kernel_size, 0)
    
    def apply_median_blur(self, image: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """Apply median blur for salt-and-pepper noise reduction"""
        return cv2.medianBlur(image, kernel_size)
    
    def apply_bilateral_filter(self, image: np.ndarray, d: int = 9, 
                               sigma_color: float = 75, sigma_space: float = 75) -> np.ndarray:
        """Apply bilateral filter that preserves edges"""
        return cv2.bilateralFilter(image, d, sigma_color, sigma_space)
    
    def histogram_equalization(self, image: np.ndarray) -> np.ndarray:
        """Apply histogram equalization for contrast enhancement"""
        return cv2.equalizeHist(image)
    
    def apply_clahe(self, image: np.ndarray, clip_limit: float = 2.0, 
                    grid_size: Tuple[int, int] = (8, 8)) -> np.ndarray:
        """Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)"""
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)
        return clahe.apply(image)
    
    def resize_image(self, image: np.ndarray, target_size: Tuple[int, int] = (500, 500)) -> np.ndarray:
        """Resize image to target size"""
        return cv2.resize(image, target_size, interpolation=cv2.INTER_AREA)
    
    def rotate_image(self, image: np.ndarray, angle: float) -> np.ndarray:
        """Rotate image by given angle"""
        h, w = image.shape[:2]
        center = (w // 2, h // 2)
        rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, rotation_matrix, (w, h))
        return rotated
    
    def preprocess_pipeline(self, image_path: str, method: str = 'clahe') -> Tuple[np.ndarray, np.ndarray]:
        """
        Complete preprocessing pipeline
        
        Returns:
            Tuple of (preprocessed_grayscale, original_color_image)
        """
        # Load image
        original = self.load_image(image_path)
        
        # Resize
        resized = self.resize_image(original)
        
        # Convert to grayscale
        gray = self.convert_to_grayscale(resized)
        
        # Apply enhancement based on method
        if method == 'clahe':
            enhanced = self.apply_clahe(gray)
            filtered = self.apply_bilateral_filter(enhanced)
        elif method == 'hist_eq':
            enhanced = self.histogram_equalization(gray)
            filtered = self.apply_gaussian_blur(enhanced)
        elif method == 'adaptive':
            filtered = self.apply_gaussian_blur(gray)
            enhanced = filtered  # Placeholder
        else:
            filtered = self.apply_median_blur(gray)
            enhanced = self.histogram_equalization(filtered)
        
        return filtered, resized