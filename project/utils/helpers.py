import os
from pathlib import Path
import shutil


def create_folder_structure(base_path="."):
    """Create the complete project folder structure"""
    folders = [
        "app/static/uploads",
        "app/templates",
        "backend",
        "models",
        "data/raw/R10",
        "data/raw/R20", 
        "data/raw/R50",
        "data/raw/R100",
        "data/raw/R200",
        "data/processed",
        "data/test_images",
        "notebooks",
        "utils"
    ]
    
    for folder in folders:
        Path(base_path, folder).mkdir(parents=True, exist_ok=True)
    
    print("Folder structure created successfully")
    return True


def get_image_files(folder_path, extensions=None):
    """Get all image files from a folder"""
    if extensions is None:
        extensions = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']
    
    image_files = []
    for ext in extensions:
        image_files.extend(Path(folder_path).glob(ext))
    
    return list(image_files)


def clean_temp_files(temp_dir="/tmp"):
    """Clean temporary files"""
    temp_files = list(Path(temp_dir).glob("temp_*.jpg"))
    for file in temp_files:
        os.unlink(file)
    print(f"Cleaned {len(temp_files)} temporary files")


def validate_image(image_path):
    """Validate if file is a valid image"""
    if not os.path.exists(image_path):
        return False, "File not found"
    
    valid_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
    ext = Path(image_path).suffix.lower()
    
    if ext not in valid_extensions:
        return False, f"Invalid file type. Supported: {valid_extensions}"
    
    return True, "Valid image"


def get_file_size_mb(file_path):
    """Get file size in megabytes"""
    size_bytes = os.path.getsize(file_path)
    return size_bytes / (1024 * 1024)