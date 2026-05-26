import cv2
import matplotlib.pyplot as plt
from pathlib import Path
import os


def resize_image(image, target_size=(500, 500)):
    """Resize image to target size"""
    return cv2.resize(image, target_size, interpolation=cv2.INTER_AREA)


def display_image(image, title="Image", figsize=(10, 8)):
    """Display image using matplotlib"""
    plt.figure(figsize=figsize)
    
    if len(image.shape) == 2:
        plt.imshow(image, cmap='gray')
    else:
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    
    plt.title(title)
    plt.axis('off')
    plt.show()


def save_image(image, save_path, filename):
    """Save image to disk"""
    full_path = Path(save_path) / filename
    os.makedirs(save_path, exist_ok=True)
    cv2.imwrite(str(full_path), image)
    return str(full_path)


def display_results_grid(images, titles, figsize=(15, 10)):
    """Display multiple images in a grid"""
    n = len(images)
    cols = min(3, n)
    rows = (n + cols - 1) // cols
    
    fig, axes = plt.subplots(rows, cols, figsize=figsize)
    axes = axes.flatten() if n > 1 else [axes]
    
    for i, (img, title) in enumerate(zip(images, titles)):
        if len(img.shape) == 2:
            axes[i].imshow(img, cmap='gray')
        else:
            axes[i].imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
        axes[i].set_title(title)
        axes[i].axis('off')
    
    # Hide unused subplots
    for i in range(n, len(axes)):
        axes[i].axis('off')
    
    plt.tight_layout()
    plt.show()