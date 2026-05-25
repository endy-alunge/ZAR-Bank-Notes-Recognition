# src/preprocessing.py
import cv2
import numpy as np
from matplotlib import pyplot as plt

class BankNotePreprocessor:
    def __init__(self):
        self.methods = {
            'grayscale': self.to_grayscale,
            'hist_equalization': self.histogram_equalization,
            'clahe': self.clahe_enhancement,
            'adaptive_threshold': self.adaptive_thresholding
        }
    
    def to_grayscale(self, image):
        """Convert to grayscale"""
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    def histogram_equalization(self, image):
        """Global histogram equalization for contrast enhancement"""
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return cv2.equalizeHist(image)
    
    def clahe_enhancement(self, image, clip_limit=2.0, grid_size=(8, 8)):
        """
        CLAHE (Contrast Limited Adaptive Histogram Equalization)
        Better than global equalization for local contrast
        """
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)
        return clahe.apply(image)
    
    def adaptive_thresholding(self, image, method='gaussian', block_size=11, C=2):
        """
        Adaptive thresholding for uneven illumination
        Methods: 'mean' or 'gaussian'
        """
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        if method == 'mean':
            return cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, 
                                        cv2.THRESH_BINARY, block_size, C)
        else:
            return cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                        cv2.THRESH_BINARY, block_size, C)
    
    def bilateral_filter(self, image, d=9, sigma_color=75, sigma_space=75):
        """Edge-preserving denoising"""
        return cv2.bilateralFilter(image, d, sigma_color, sigma_space)
    
    def compare_methods(self, image):
        """Generate comparison grid of all preprocessing methods"""
        methods = {
            'Original': image,
            'Grayscale': self.to_grayscale(image),
            'Histogram Eq': self.histogram_equalization(image),
            'CLAHE': self.clahe_enhancement(image),
            'Bilateral Filter': self.bilateral_filter(image)
        }
        
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        axes = axes.ravel()
        
        for idx, (name, img) in enumerate(methods.items()):
            if idx < 5:
                if len(img.shape) == 3:
                    axes[idx].imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
                else:
                    axes[idx].imshow(img, cmap='gray')
                axes[idx].set_title(name)
                axes[idx].axis('off')
        
        plt.tight_layout()
        plt.savefig('preprocessing_comparison.png')
        return fig
