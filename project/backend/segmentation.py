import cv2
import numpy as np
from typing import List, Tuple, Optional


class ImageSegmenter:
    """Handles banknote segmentation from images"""
    
    def __init__(self):
        self.methods_compared = []
    
    def find_contours(self, image: np.ndarray) -> List[np.ndarray]:
        """Find contours in binary image"""
        contours, _ = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        return contours
    
    def get_largest_contour(self, contours: List[np.ndarray]) -> Optional[np.ndarray]:
        """Get the largest contour by area"""
        if not contours:
            return None
        return max(contours, key=cv2.contourArea)
    
    def get_bounding_rect(self, contour: np.ndarray) -> Tuple[int, int, int, int]:
        """Get bounding rectangle of contour"""
        return cv2.boundingRect(contour)
    
    def segment_using_otsu(self, image: np.ndarray) -> np.ndarray:
        """Segment using Otsu's thresholding"""
        _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binary
    
    def segment_using_adaptive_threshold(self, image: np.ndarray) -> np.ndarray:
        """Segment using adaptive thresholding"""
        binary = cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                      cv2.THRESH_BINARY_INV, 11, 2)
        return binary
    
    def extract_banknote(self, image: np.ndarray, binary_mask: np.ndarray) -> np.ndarray:
        """Extract banknote region using mask"""
        # Apply morphological operations to clean mask
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(binary_mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        # Find largest contour
        contours = self.find_contours(mask)
        largest_contour = self.get_largest_contour(contours)
        
        if largest_contour is not None:
            # Get bounding rectangle
            x, y, w, h = self.get_bounding_rect(largest_contour)
            # Extract banknote region
            banknote = image[y:y+h, x:x+w]
            return banknote
        
        return image
    
    def segmentation_pipeline(self, image: np.ndarray, method: str = 'otsu') -> np.ndarray:
        """
        Complete segmentation pipeline
        
        Returns:
            Segmented banknote image
        """
        if method == 'otsu':
            binary = self.segment_using_otsu(image)
        elif method == 'adaptive':
            binary = self.segment_using_adaptive_threshold(image)
        else:
            binary = self.segment_using_otsu(image)
        
        # Extract banknote
        banknote = self.extract_banknote(image, binary)
        
        return banknote