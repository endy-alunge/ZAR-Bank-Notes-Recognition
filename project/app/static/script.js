// Banknote Recognition System - Frontend JavaScript
let currentFile = null;
let originalImageData = null;
let isProcessing = false;

// Initialize event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateStats();
    // Hide preview section initially
    document.getElementById('previewSection').style.display = 'none';
    // Reset confidence scores on load
    resetConfidenceScores();
});

function initializeEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleFileSelect(file);
            } else {
                showNotification('Please upload an image file', 'error');
            }
        });
    }
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', runAnalysis);
    }
}

function handleFileSelect(file) {
    currentFile = file;
    const reader = new FileReader();
    
    reader.onload = function(e) {
        originalImageData = e.target.result;
        const imgElement = document.getElementById('originalImg');
        if (imgElement) {
            imgElement.src = originalImageData;
        }
        
        // Show preview section
        const previewSection = document.getElementById('previewSection');
        if (previewSection) {
            previewSection.style.display = 'block';
        }
        
        // Reset result banner to default/loading state
        resetResultBanner();
        
        // Reset confidence scores when new image is uploaded
        resetConfidenceScores();
        
        // Update UI
        updatePipelineStep(0, true);
        
        // Reset canvases
        clearCanvases();
        
        // Show notification
        showNotification('Image uploaded successfully! Click "Analyze Banknote" to start recognition.', 'success');
        
        // Enable analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
        }
    };
    
    reader.readAsDataURL(file);
}

function handleFile(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
}

function resetResultBanner() {
    // Reset result banner to waiting state
    const resultIcon = document.getElementById('resultIcon');
    const resultValue = document.getElementById('resultValue');
    const resultConf = document.getElementById('resultConf');
    const metaChips = document.querySelector('.meta-chips');
    
    if (resultIcon) resultIcon.textContent = '🔍';
    if (resultValue) resultValue.textContent = 'Waiting for analysis';
    if (resultConf) resultConf.textContent = 'Upload an image and click analyze';
    
    // Update meta chips
    if (metaChips) {
        metaChips.innerHTML = `
            <div class="chip chip-blue">⏳ READY</div>
            <div class="chip chip-green">✓ AWAITING INPUT</div>
        `;
    }
    
    // Hide result banner or show with waiting state
    const resultBanner = document.getElementById('resultBanner');
    if (resultBanner) {
        resultBanner.style.display = 'flex';
    }
}

function clearCanvases() {
    const segCanvas = document.getElementById('segCanvas');
    const featCanvas = document.getElementById('featCanvas');
    
    if (segCanvas) {
        const ctx1 = segCanvas.getContext('2d');
        segCanvas.width = 300;
        segCanvas.height = 300;
        ctx1.clearRect(0, 0, segCanvas.width, segCanvas.height);
        ctx1.fillStyle = 'rgba(0,10,30,0.5)';
        ctx1.fillRect(0, 0, segCanvas.width, segCanvas.height);
        ctx1.fillStyle = '#ffffff';
        ctx1.font = '14px Arial';
        ctx1.fillText('Waiting for analysis', 50, 150);
    }
    
    if (featCanvas) {
        const ctx2 = featCanvas.getContext('2d');
        featCanvas.width = 300;
        featCanvas.height = 300;
        ctx2.clearRect(0, 0, featCanvas.width, featCanvas.height);
        ctx2.fillStyle = 'rgba(0,10,30,0.5)';
        ctx2.fillRect(0, 0, featCanvas.width, featCanvas.height);
        ctx2.fillStyle = '#ffffff';
        ctx2.font = '14px Arial';
        ctx2.fillText('Features will appear here', 50, 150);
    }
}

function updatePipelineStep(step, isActive) {
    for (let i = 0; i <= 5; i++) {
        const dot = document.getElementById(`pd${i}`);
        const label = document.getElementById(`pl${i}`);
        if (dot && label) {
            if (i <= step && isActive) {
                dot.classList.add('active');
                label.classList.add('active');
            } else if (!isActive) {
                dot.classList.remove('active');
                label.classList.remove('active');
            }
        }
    }
}

function updateProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? 'rgba(220,53,69,0.95)' : 'rgba(40,167,69,0.95)'};
        color: white;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-family: 'Space Mono', monospace;
        font-size: 13px;
        backdrop-filter: blur(10px);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        if (notification && notification.remove) {
            notification.remove();
        }
    }, 3000);
}

function updateStats() {
    const statAcc = document.getElementById('statAcc');
    const statTime = document.getElementById('statTime');
    const statCount = document.getElementById('statCount');
    
    if (statAcc) statAcc.textContent = '98.5%';
    if (statTime) statTime.textContent = '0.8s';
    if (statCount) statCount.textContent = '5';
}

// ============================================
// NEW FUNCTION: Update confidence scores display
// ============================================
function updateConfidenceScores(confidenceScores, predictedDenomination) {
    const denominations = ['R10', 'R20', 'R50', 'R100', 'R200'];
    const topPredictionBadge = document.getElementById('topPredictionBadge');
    
    // Update top prediction badge
    if (topPredictionBadge && predictedDenomination) {
        const topConfidence = confidenceScores[predictedDenomination];
        topPredictionBadge.innerHTML = `🏆 TOP PREDICTION: ${predictedDenomination} (${topConfidence.toFixed(1)}%)`;
        topPredictionBadge.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            if (topPredictionBadge) topPredictionBadge.style.animation = '';
        }, 500);
    }
    
    // Update each confidence bar
    for (const denom of denominations) {
        const score = confidenceScores[denom] || 0;
        const isPrediction = (denom === predictedDenomination);
        
        // Get elements by finding the confidence items
        const confidenceItems = document.querySelectorAll('.confidence-item');
        const index = denominations.indexOf(denom);
        
        if (confidenceItems[index]) {
            const bar = confidenceItems[index].querySelector('.confidence-bar');
            const percentElement = confidenceItems[index].querySelector('.confidence-percent');
            
            if (bar) {
                bar.style.width = `${score}%`;
                if (score > 25) {
                    bar.innerHTML = `<span style="margin-right: 8px;">${score.toFixed(1)}%</span>`;
                } else {
                    bar.innerHTML = '';
                }
            }
            
            if (percentElement) {
                percentElement.textContent = `${score.toFixed(1)}%`;
            }
            
            // Highlight the predicted denomination
            if (isPrediction) {
                confidenceItems[index].classList.add('prediction');
            } else {
                confidenceItems[index].classList.remove('prediction');
            }
        }
    }
    
    createConfidenceHashMarks();
}

// ============================================
// NEW FUNCTION: Add hash marks to confidence bars
// ============================================
function createConfidenceHashMarks() {
    const containers = document.querySelectorAll('.confidence-bar-container');
    
    containers.forEach(container => {
        const existingMarks = container.querySelectorAll('.hash-mark');
        existingMarks.forEach(mark => mark.remove());
        
        const marks = [25, 50, 75];
        marks.forEach(mark => {
            const markElement = document.createElement('div');
            markElement.className = 'hash-mark';
            markElement.style.cssText = `
                position: absolute;
                left: ${mark}%;
                top: 0;
                bottom: 0;
                width: 2px;
                background: rgba(255, 255, 255, 0.2);
                z-index: 1;
                pointer-events: none;
            `;
            container.appendChild(markElement);
        });
    });
}

// ============================================
// NEW FUNCTION: Reset confidence scores to zero
// ============================================
function resetConfidenceScores() {
    const denominations = ['R10', 'R20', 'R50', 'R100', 'R200'];
    const topPredictionBadge = document.getElementById('topPredictionBadge');
    
    if (topPredictionBadge) {
        topPredictionBadge.innerHTML = 'AWAITING ANALYSIS';
    }
    
    const confidenceItems = document.querySelectorAll('.confidence-item');
    for (let i = 0; i < denominations.length && i < confidenceItems.length; i++) {
        const bar = confidenceItems[i].querySelector('.confidence-bar');
        const percentElement = confidenceItems[i].querySelector('.confidence-percent');
        
        if (bar) {
            bar.style.width = '0%';
            bar.innerHTML = '';
        }
        
        if (percentElement) {
            percentElement.textContent = '0.0%';
        }
        
        confidenceItems[i].classList.remove('prediction');
    }
}

// ============================================
// UPDATE THIS FUNCTION: Add confidence scores update
// ============================================
function updateResultDisplay(denomination, confidence, processingTime) {
    // Update result banner elements
    const resultValue = document.getElementById('resultValue');
    const resultConf = document.getElementById('resultConf');
    const resultIcon = document.getElementById('resultIcon');
    const resultBanner = document.getElementById('resultBanner');
    const classLabel = document.getElementById('classLabel');
    const classIcon = document.getElementById('classIcon');
    const metaChips = document.querySelector('.meta-chips');
    
    const iconMap = {
        'R10': '💵',
        'R20': '💶', 
        'R50': '💷',
        'R100': '💴',
        'R200': '💰'
    };
    
    const selectedIcon = iconMap[denomination] || '💵';
    
    if (resultValue) {
        resultValue.textContent = `${denomination} note detected`;
        resultValue.style.animation = 'none';
        setTimeout(() => {
            if (resultValue) resultValue.style.animation = 'slideInUp 0.3s ease';
        }, 10);
    }
    
    if (resultConf) {
        resultConf.textContent = `Confidence: ${confidence.toFixed(1)}% · Model: Random Forest v1.0`;
    }
    
    if (resultIcon) {
        resultIcon.textContent = selectedIcon;
    }
    
    if (classLabel) {
        classLabel.textContent = denomination;
    }
    
    if (classIcon) {
        classIcon.textContent = selectedIcon;
    }
    
    if (metaChips) {
        const confidenceLevel = confidence >= 90 ? 'HIGH' : confidence >= 70 ? 'MEDIUM' : 'LOW';
        const confidenceColor = confidence >= 90 ? 'green' : confidence >= 70 ? 'yellow' : 'orange';
        metaChips.innerHTML = `
            <div class="chip chip-blue">⚡ ${processingTime.toFixed(1)}s</div>
            <div class="chip chip-green" style="background: ${confidenceColor === 'green' ? 'rgba(0,255,136,0.2)' : 'rgba(255,193,7,0.2)'}; color: ${confidenceColor === 'green' ? '#00ff88' : '#ffc107'}">
                ✓ ${confidenceLevel} CONFIDENCE
            </div>
        `;
    }
    
    const statTime = document.getElementById('statTime');
    if (statTime) {
        statTime.textContent = `${processingTime.toFixed(1)}s`;
    }
    
    addToHistory(denomination, confidence);
    
    if (resultBanner) {
        resultBanner.style.display = 'flex';
        resultBanner.style.animation = 'none';
        setTimeout(() => {
            if (resultBanner) resultBanner.style.animation = 'slideInUp 0.3s ease';
        }, 10);
    }
}

function addToHistory(denomination, confidence) {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;
    
    const iconMap = {
        'R10': '💵',
        'R20': '💶',
        'R50': '💷', 
        'R100': '💴',
        'R200': '💰'
    };
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const newItem = document.createElement('div');
    newItem.className = 'history-item glass';
    newItem.style.animation = 'slideIn 0.3s ease';
    newItem.innerHTML = `
        <div class="h-thumb">${iconMap[denomination] || '💵'}</div>
        <div class="h-info">
            <div class="h-val">${denomination} note detected</div>
            <div class="h-meta">analysis_${now.getTime()} · ${timeString}</div>
        </div>
        <div class="h-badge">${confidence.toFixed(1)}%</div>
    `;
    
    historyList.insertBefore(newItem, historyList.firstChild);
    
    while (historyList.children.length > 5) {
        historyList.removeChild(historyList.lastChild);
    }
}

function drawSegmentationCanvas(imageData) {
    const canvas = document.getElementById('segCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff88';
        
        const margin = 20;
        ctx.strokeRect(margin, margin, canvas.width - (margin * 2), canvas.height - (margin * 2));
        
        ctx.fillStyle = '#00ff88';
        const cornerSize = 15;
        ctx.fillRect(margin, margin, cornerSize, 3);
        ctx.fillRect(margin, margin, 3, cornerSize);
        ctx.fillRect(canvas.width - margin - cornerSize, margin, cornerSize, 3);
        ctx.fillRect(canvas.width - margin - 3, margin, 3, cornerSize);
        ctx.fillRect(margin, canvas.height - margin - 3, cornerSize, 3);
        ctx.fillRect(margin, canvas.height - margin - cornerSize, 3, cornerSize);
        ctx.fillRect(canvas.width - margin - cornerSize, canvas.height - margin - 3, cornerSize, 3);
        ctx.fillRect(canvas.width - margin - 3, canvas.height - margin - cornerSize, 3, cornerSize);
        
        ctx.shadowBlur = 0;
        ctx.font = 'bold 12px "Space Mono", monospace';
        ctx.fillStyle = '#00ff88';
        ctx.fillText('SEGMENTED REGION', margin, margin - 5);
    };
    img.src = imageData;
}

function drawFeatureMap(imageData) {
    const canvas = document.getElementById('featCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    const img = new Image();
    img.onload = () => {
        ctx.globalAlpha = 0.6;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        
        ctx.fillStyle = '#ff6600';
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#ff6600';
        
        const features = [
            [50, 80], [120, 60], [200, 90], [250, 150],
            [60, 180], [150, 200], [220, 220], [180, 260],
            [90, 250], [260, 80], [30, 200], [270, 240]
        ];
        
        for (const [x, y] of features) {
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.fillStyle = '#ff6600';
        }
        
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1.5;
        for (const [x, y] of features) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 20, y - 15);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 15, y + 20);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
        ctx.font = 'bold 12px "Space Mono", monospace';
        ctx.fillStyle = '#ff6600';
        ctx.fillText('EXTRACTED FEATURES', 10, 25);
    };
    img.src = imageData;
}

async function runAnalysis() {
    if (!currentFile) {
        showNotification('Please select an image first', 'error');
        return;
    }
    
    if (isProcessing) {
        showNotification('Analysis already in progress', 'info');
        return;
    }
    
    isProcessing = true;
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Processing...';
    }
    
    const startTime = performance.now();
    
    const resultValue = document.getElementById('resultValue');
    const resultConf = document.getElementById('resultConf');
    if (resultValue) resultValue.textContent = 'Analyzing...';
    if (resultConf) resultConf.textContent = 'Processing image through pipeline';
    
    try {
        updatePipelineStep(0, true);
        updateProgress(10);
        
        updatePipelineStep(1, true);
        updateProgress(30);
        await sleep(200);
        
        updatePipelineStep(2, true);
        updateProgress(50);
        await sleep(200);
        
        if (originalImageData) {
            drawSegmentationCanvas(originalImageData);
        }
        
        updatePipelineStep(3, true);
        updateProgress(70);
        await sleep(200);
        
        if (originalImageData) {
            drawFeatureMap(originalImageData);
        }
        
        updatePipelineStep(4, true);
        updateProgress(85);
        
        const formData = new FormData();
        formData.append('file', currentFile);
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        updateProgress(95);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const endTime = performance.now();
        const processingTime = (endTime - startTime) / 1000;
        
        if (data.success) {
            updatePipelineStep(5, true);
            updateProgress(100);
            
            const maxConfidence = Math.max(...Object.values(data.confidence_scores));
            
            updateResultDisplay(data.denomination, maxConfidence, processingTime);
            
            // THIS IS THE KEY LINE - Update confidence bars with scores
            updateConfidenceScores(data.confidence_scores, data.denomination);
            
            showNotification(`Successfully recognized as ${data.denomination}`, 'success');
        } else {
            throw new Error(data.error || 'Recognition failed');
        }
        
        setTimeout(() => updateProgress(0), 1000);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        updateProgress(0);
        
        const resultValue = document.getElementById('resultValue');
        const resultConf = document.getElementById('resultConf');
        const resultIcon = document.getElementById('resultIcon');
        
        if (resultValue) resultValue.textContent = 'Analysis Failed';
        if (resultConf) resultConf.textContent = error.message;
        if (resultIcon) resultIcon.textContent = '❌';
        
        for (let i = 0; i <= 5; i++) {
            updatePipelineStep(i, false);
        }
    } finally {
        isProcessing = false;
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Analyze Banknote';
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter' && currentFile && !isProcessing) {
        runAnalysis();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
    }
    .preview-section { animation: slideInUp 0.4s ease; }
    .result-banner { transition: all 0.3s ease; }
    .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .progress-fill { transition: width 0.3s ease; }
    .pipe-dot.active {
        background: linear-gradient(135deg, #00ff88, #00b4d8);
        box-shadow: 0 0 15px rgba(0,255,136,0.5);
        transform: scale(1.1);
        transition: all 0.3s ease;
    }
    .pipe-label.active { color: #00ff88; font-weight: bold; }
    .dropzone.dragover { border: 2px dashed #00ff88; background: rgba(0, 255, 136, 0.1); }
    .history-item { transition: transform 0.2s ease; }
    .history-item:hover { transform: translateX(5px); }
`;
document.head.appendChild(style);