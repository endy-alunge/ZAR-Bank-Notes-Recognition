import sys
import os
from pathlib import Path

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.pipeline import RecognitionPipeline
from utils.helpers import create_folder_structure, get_image_files
from utils.metrics import plot_confusion_matrix, print_classification_report


def train_model(classifier_type: str, data_path: Path) -> None:
    """Train a single model and save it to models/"""

    print("\n" + "=" * 60)
    print(f"TRAINING — {classifier_type.upper().replace('_', ' ')}")
    print("=" * 60)

    pipeline = RecognitionPipeline()
    result = pipeline.train_from_folder(str(data_path), classifier_type=classifier_type)

    if result['success']:
        save_path = f"models/{classifier_type}_model.pkl"
        pipeline.save_model(save_path)

        print(f"\n  Samples:       {result['samples']}")
        print(f"  Feature size:  {result['feature_size']}")
        print(f"  CV Accuracy:   {result['cv_accuracy'] * 100:.2f}%")
        print(f"  Saved to:      {save_path}")
    else:
        print(f"\n  Training failed: {result.get('error', 'Unknown error')}")


def test_models(data_path: Path) -> None:
    """Run a quick test on sample images using all three saved models."""

    test_path = data_path / "test_images"
    if not test_path.exists():
        return

    test_images = get_image_files(test_path)
    if not test_images:
        return

    print("\n" + "=" * 60)
    print("TESTING SAMPLE IMAGES — ALL MODELS")
    print("=" * 60)

    model_files = {
        'random_forest': 'models/random_forest_model.pkl',
        'svm':           'models/svm_model.pkl',
        'knn':           'models/knn_model.pkl',
    }

    for img_path in test_images[:3]:   # test first 3 images
        print(f"\nImage: {img_path.name}")

        for model_name, model_file in model_files.items():
            if not os.path.exists(model_file):
                print(f"  [{model_name}] model file not found — skipped")
                continue

            pipeline = RecognitionPipeline(model_path=model_file,
                                           classifier_type=model_name)
            result = pipeline.recognize(str(img_path))

            if result['success']:
                max_conf = max(result['confidence_scores'].values())
                rotation_note = (f"  rotated {result['best_rotation']}°"
                                 if result['best_rotation'] != 0 else "")
                print(f"  [{model_name}]  →  {result['denomination']}  "
                      f"({max_conf * 100:.1f}% confidence){rotation_note}")
            else:
                print(f"  [{model_name}]  →  failed: {result.get('error', 'unknown')}")


def main():
    print("=" * 60)
    print("SOUTH AFRICAN BANKNOTE RECOGNITION SYSTEM")
    print("=" * 60)

    # Create folder structure if needed
    if not os.path.exists("data/raw/R10"):
        print("\nCreating folder structure...")
        create_folder_structure()

    # Check training data exists
    data_path = Path("data")
    training_path = data_path / "raw"

    has_jpg  = len(list(training_path.glob("*/*.jpg")))  > 0
    has_jpeg = len(list(training_path.glob("*/*.jpeg"))) > 0
    has_png  = len(list(training_path.glob("*/*.png")))  > 0

    if not training_path.exists() or not (has_jpg or has_jpeg or has_png):
        print("\n" + "=" * 60)
        print("TRAINING DATA NOT FOUND")
        print("=" * 60)
        print("\nPlease organise your training data as:")
        print("  data/raw/R10/  - R10 banknote images")
        print("  data/raw/R20/  - R20 banknote images")
        print("  data/raw/R50/  - R50 banknote images")
        print("  data/raw/R100/ - R100 banknote images")
        print("  data/raw/R200/ - R200 banknote images")
        print("\nThen run this script again.")
        return

    # Create models folder if it doesn't exist
    os.makedirs("models", exist_ok=True)

    # ── Train all three models ───────────────────────────────────────────
    for classifier_type in ['random_forest', 'svm', 'knn']:
        train_model(classifier_type, data_path)

    # ── Quick test across all models ─────────────────────────────────────
    test_models(data_path)

    # ── Done ─────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("ALL MODELS TRAINED AND SAVED")
    print("=" * 60)
    print("\nModel files created:")
    for name in ['random_forest', 'svm', 'knn']:
        path = f"models/{name}_model.pkl"
        status = "OK" if os.path.exists(path) else "MISSING"
        print(f"  {path}  [{status}]")

    print("\nYou can now:")
    print("  1. Start the app:  python app.py")
    print("  2. Open browser:   http://localhost:5000")
    print("  3. Select a model from the dropdown and upload a banknote image")


if __name__ == "__main__":
    main()