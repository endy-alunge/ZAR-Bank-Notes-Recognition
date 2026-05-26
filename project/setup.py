# setup.py - Run this first to create directories and fix imports
import os
import sys
from pathlib import Path

# Get current directory
current_dir = Path.cwd()
print(f"Current directory: {current_dir}")

# Create necessary directories first
directories = [
    "backend",
    "utils",
    "models",
    "data/raw/R10",
    "data/raw/R20",
    "data/raw/R50",
    "data/raw/R100",
    "data/raw/R200",
    "data/processed",
    "data/test_images",
    "app/static/uploads",
    "app/templates",
    "notebooks"
]

print("\nCreating directories...")
for directory in directories:
    dir_path = current_dir / directory
    dir_path.mkdir(parents=True, exist_ok=True)
    print(f"  Created: {directory}")

# Create __init__.py files
init_files = [
    "backend/__init__.py",
    "utils/__init__.py",
]

print("\nCreating __init__.py files...")
for init_file in init_files:
    file_path = current_dir / init_file
    if not file_path.exists():
        with open(file_path, 'w') as f:
            f.write(f'# {init_file} - Auto-generated\n')
        print(f"  Created: {init_file}")
    else:
        print(f"  Already exists: {init_file}")

# Add to Python path
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))
    print(f"\nAdded {current_dir} to Python path")

print("\n" + "="*60)
print("SETUP COMPLETE!")
print("="*60)
print("\nNow you can:")
print("  1. Place your training images in data/raw/R10/, data/raw/R20/, etc.")
print("  2. Run: python main.py")