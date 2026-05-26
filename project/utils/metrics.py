import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score


def calculate_metrics(y_true, y_pred, labels=None):
    """
    Calculate various classification metrics
    
    Returns:
        Dictionary with accuracy, classification report, confusion matrix
    """
    accuracy = accuracy_score(y_true, y_pred)
    report = classification_report(y_true, y_pred, output_dict=True)
    conf_matrix = confusion_matrix(y_true, y_pred)
    
    return {
        'accuracy': accuracy,
        'classification_report': report,
        'confusion_matrix': conf_matrix
    }


def print_classification_report(y_true, y_pred, labels=None):
    """Print formatted classification report"""
    print("\nClassification Report:")
    print("="*50)
    print(classification_report(y_true, y_pred, target_names=labels))


def plot_confusion_matrix(y_true, y_pred, labels, title="Confusion Matrix"):
    """Plot confusion matrix as heatmap"""
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=labels, yticklabels=labels)
    plt.title(title)
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.show()
    
    return cm


def plot_confidence_bars(confidence_scores, title="Confidence Scores"):
    """Plot confidence scores as bar chart"""
    denominations = list(confidence_scores.keys())
    scores = [confidence_scores[d] * 100 for d in denominations]
    
    plt.figure(figsize=(10, 6))
    bars = plt.bar(denominations, scores, color='steelblue')
    plt.ylabel('Confidence (%)')
    plt.title(title)
    plt.ylim(0, 100)
    
    # Add value labels
    for bar, score in zip(bars, scores):
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                f'{score:.1f}%', ha='center', va='bottom', fontsize=10)
    
    plt.tight_layout()
    plt.show()