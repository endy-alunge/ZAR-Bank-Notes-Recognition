import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Fix imports - remove 'project.' prefix
from backend.pipeline import RecognitionPipeline
from utils.helpers import create_folder_structure, get_image_files
from utils.metrics import plot_confusion_matrix, print_classification_report


def main():
    """Main function to run the backend pipeline"""
    
    print("="*60)
    print("SOUTH AFRICAN BANKNOTE RECOGNITION SYSTEM")
    print("="*60)
    
    # Create folder structure if needed
    if not os.path.exists("data/raw/R10"):
        print("\nCreating folder structure...")
        create_folder_structure()
    
    # Initialize pipeline
    pipeline = RecognitionPipeline()
    
    # Check if data exists
    data_path = Path("data")
    training_path = data_path / "raw"
    
    if not training_path.exists() or len(list(training_path.glob("*/*.jpg"))) == 0:
        print("\n" + "="*60)
        print("TRAINING DATA NOT FOUND")
        print("="*60)
        print("\nPlease organize your training data as:")
        print("  data/raw/R10/  - R10 banknote images")
        print("  data/raw/R20/  - R20 banknote images")
        print("  data/raw/R50/  - R50 banknote images")
        print("  data/raw/R100/ - R100 banknote images")
        print("  data/raw/R200/ - R200 banknote images")
        print("\nThen run this script again.")
        return
    
    # Train the system
    print("\n" + "="*60)
    print("STARTING TRAINING")
    print("="*60)
    
    result = pipeline.train_from_folder("data", classifier_type='random_forest')
    
    if result['success']:
        print(f"\nTraining completed successfully!")
        print(f"  Samples: {result['samples']}")
        print(f"  Feature size: {result['feature_size']}")
        print(f"  CV Accuracy: {result['cv_accuracy']*100:.2f}%")
        
        # Save the model
        pipeline.save_model("models/banknote_model.pkl")
        print("\nModel saved to models/banknote_model.pkl")
        
        # Test with sample images if available
        test_path = data_path / "test_images"
        if test_path.exists():
            test_images = get_image_files(test_path)
            if test_images:
                print("\n" + "="*60)
                print("TESTING ON SAMPLE IMAGES")
                print("="*60)
                
                for img_path in test_images[:5]:  # Test first 5 images
                    print(f"\nTesting: {img_path.name}")
                    result = pipeline.recognize(str(img_path))
                    
                    if result['success']:
                        print(f"  Recognized as: {result['denomination']}")
                        max_conf = max(result['confidence_scores'].values())
                        print(f"  Confidence: {max_conf*100:.1f}%")
                        if result['best_rotation'] != 0:
                            print(f"  Best rotation: {result['best_rotation']} degrees")
                    else:
                        print(f"  Recognition failed: {result.get('error', 'Unknown error')}")
    
    else:
        print(f"\nTraining failed: {result.get('error', 'Unknown error')}")
    
    print("\n" + "="*60)
    print("BACKEND READY")
    print("="*60)
    print("\nYou can now:")
    print("  1. Run frontend: python app.py")
    print("  2. Test single image: python -c \"from backend.pipeline import RecognitionPipeline; p = RecognitionPipeline('models/banknote_model.pkl'); print(p.recognize('path/to/image.jpg'))\"")


if __name__ == "__main__":
    main()