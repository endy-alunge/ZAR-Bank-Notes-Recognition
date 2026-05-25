# src/preprocessing.py (continued)
class BankNoteSegmenter:
    def __init__(self, preprocessor):
        self.preprocessor = preprocessor
    
    def edge_detection(self, image, method='canny', low_thresh=50, high_thresh=150):
        """
        Edge detection methods: 'canny', 'sobel', 'laplacian'
        """
        if method == 'canny':
            edges = cv2.Canny(image, low_thresh, high_thresh)
        elif method == 'sobel':
            sobelx = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
            sobely = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
            edges = cv2.magnitude(sobelx, sobely)
            edges = np.uint8(np.clip(edges, 0, 255))
        elif method == 'laplacian':
            edges = cv2.Laplacian(image, cv2.CV_64F)
            edges = np.uint8(np.abs(edges))
        
        return edges
    
    def morphological_operations(self, binary_image, operation='close', kernel_size=5):
        """
        Morphological operations: 'erode', 'dilate', 'open', 'close'
        """
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))
        
        if operation == 'erode':
            return cv2.erode(binary_image, kernel, iterations=1)
        elif operation == 'dilate':
            return cv2.dilate(binary_image, kernel, iterations=1)
        elif operation == 'open':
            return cv2.morphologyEx(binary_image, cv2.MORPH_OPEN, kernel)
        elif operation == 'close':
            return cv2.morphologyEx(binary_image, cv2.MORPH_CLOSE, kernel)
    
    def contour_segmentation(self, image, min_area=5000):
        """Extract main banknote region using contour detection"""
        # Preprocess
        gray = self.preprocessor.to_grayscale(image)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = self.edge_detection(blurred, method='canny')
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Get largest contour (assumed to be banknote)
        if contours:
            largest_contour = max(contours, key=cv2.contourArea)
            if cv2.contourArea(largest_contour) > min_area:
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(largest_contour)
                segmented = image[y:y+h, x:x+w]
                
                # Visualize
                result = image.copy()
                cv2.drawContours(result, [largest_contour], -1, (0, 255, 0), 2)
                
                return segmented, result, largest_contour
        
        return image, image, None
    
    def grabcut_segmentation(self, image):
        """
        GrabCut segmentation for more precise extraction
        Better for complex backgrounds
        """
        mask = np.zeros(image.shape[:2], np.uint8)
        bgd_model = np.zeros((1, 65), np.float64)
        fgd_model = np.zeros((1, 65), np.float64)
        
        # Initial rectangle (assume note is in center 70% of image)
        h, w = image.shape[:2]
        rect = (int(w*0.15), int(h*0.15), int(w*0.7), int(h*0.7))
        
        cv2.grabCut(image, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)
        
        # Create mask where 0 and 2 are background, 1 and 3 are foreground
        mask2 = np.where((mask == 2) | (mask == 0), 0, 1).astype('uint8')
        segmented = image * mask2[:, :, np.newaxis]
        
        return segmented
