// Banknote Recognition System - Working Version
let currentFile = null;
let originalImageData = null;
let isProcessing = false;

<<<<<<< HEAD
// Icon HTML definitions
const CASH_ICON_HTML = '<img src="/static/uploads/icons8-cash-50.png" alt="Money" class="result-icon" style="width: 40px; height: 40px; object-fit: contain;">';
const CASH_ICON_SMALL_HTML = '<img src="/static/uploads/icons8-cash-50.png" alt="Money" style="width: 24px; height: 24px; object-fit: contain;">';
const CASH_ICON_DIMMED_HTML = '<img src="/static/uploads/icons8-cash-50.png" alt="Money" class="result-icon" style="width: 40px; height: 40px; object-fit: contain; opacity: 0.5;">';
const CROSS_ICON_HTML = '<img src="/static/uploads/cross.png" alt="Error" class="result-icon" style="width: 40px; height: 40px; object-fit: contain;">';
const CROSS_ICON_SMALL_HTML = '<img src="/static/uploads/cross.png" alt="Error" style="width: 24px; height: 24px; object-fit: contain;">';
const CROSS_ICON_TINY_HTML = '<img src="/static/uploads/cross.png" alt="Error" style="width: 14px; height: 14px; object-fit: contain; vertical-align: middle; margin-right: 4px;">';
const LAMP_ICON_TINY_HTML = '<img src="/static/uploads/lamp.png" alt="Time" style="width: 14px; height: 14px; object-fit: contain; vertical-align: middle; margin-right: 4px;">';
const CHECK_ICON_TINY_HTML = '<img src="/static/uploads/check.png" alt="Check" style="width: 14px; height: 14px; object-fit: contain; vertical-align: middle; margin-right: 4px;">';

// Initialize event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateStats();
    // Hide preview section initially
    const previewSection = document.getElementById('previewSection');
    if (previewSection) {
        previewSection.style.display = 'none';
    }
    // Reset confidence scores on load
=======
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
>>>>>>> Lungani-Fakazi
    resetConfidenceScores();
    clearCanvases();
    initializeModelDropdown();
});

function initializeEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const compareBtn = document.getElementById('compareBtn');
    
    // Click on dropzone or button triggers file input
    if (dropZone) {
        dropZone.addEventListener('click', (e) => {
            // Don't trigger if clicking the button (button has its own handler)
            if (e.target !== uploadBtn && !uploadBtn.contains(e.target)) {
                fileInput.click();
            }
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'rgba(59,130,246,0.5)';
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'rgba(59,130,246,0.25)';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'rgba(59,130,246,0.25)';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleFileSelect(file);
            } else {
                showToast('Please upload an image file', 'error');
            }
        });
    }
    
    if (uploadBtn) {
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', runAnalysis);
    }
    
    if (compareBtn) {
        compareBtn.addEventListener('click', compareModels);
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
        
        // Show preview card
        const previewCard = document.getElementById('previewCard');
        if (previewCard) {
            previewCard.classList.add('visible');
        }
        
        // Reset UI
        showResultIdle();
        resetConfidenceScores();
        resetPipeline();
        clearCanvases();
        
        showToast('Image uploaded successfully!', 'success');
        
        // Enable buttons
        const analyzeBtn = document.getElementById('analyzeBtn');
        const compareBtn = document.getElementById('compareBtn');
        if (analyzeBtn) analyzeBtn.disabled = false;
        if (compareBtn) compareBtn.disabled = false;
    };
    
    reader.readAsDataURL(file);
}

<<<<<<< HEAD
function resetResultBanner() {
    // Reset result banner to waiting state
    const resultIcon = document.getElementById('resultIcon');
    const resultValue = document.getElementById('resultValue');
    const resultConf = document.getElementById('resultConf');
    const metaChips = document.querySelector('.meta-chips');
    const classIcon = document.getElementById('classIcon');
    const classLabel = document.getElementById('classLabel');
    
    // Use dimmed cash icon for waiting state
    if (resultIcon) resultIcon.innerHTML = CASH_ICON_DIMMED_HTML;
    if (classIcon) classIcon.innerHTML = CASH_ICON_DIMMED_HTML;
    if (classLabel) classLabel.textContent = 'AWAITING CLASSIFICATION';
    if (resultValue) resultValue.textContent = 'Waiting for analysis';
    if (resultConf) resultConf.textContent = 'Upload an image and click analyze';
    
    // Update meta chips with lamp icon for ready state
    if (metaChips) {
        metaChips.innerHTML = `
            <div class="chip chip-blue">${LAMP_ICON_TINY_HTML} READY</div>
            <div class="chip chip-green">${CHECK_ICON_TINY_HTML} AWAITING INPUT</div>
        `;
    }
    
    // Show result banner
    const resultBanner = document.getElementById('resultBanner');
    if (resultBanner) {
        resultBanner.style.display = 'flex';
    }
=======
function showResultIdle() {
    const resultIdle = document.getElementById('resultIdle');
    const resultActive = document.getElementById('resultActive');
    if (resultIdle) resultIdle.style.display = 'flex';
    if (resultActive) resultActive.classList.remove('visible');
}

function showResultActive() {
    const resultIdle = document.getElementById('resultIdle');
    const resultActive = document.getElementById('resultActive');
    if (resultIdle) resultIdle.style.display = 'none';
    if (resultActive) resultActive.classList.add('visible');
>>>>>>> Lungani-Fakazi
}

function resetPipeline() {
    for (let i = 0; i <= 5; i++) {
        const dot = document.getElementById(`sd${i}`);
        const name = document.getElementById(`sn${i}`);
        if (dot) dot.classList.remove('active', 'done');
        if (name) name.classList.remove('active', 'done');
    }
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = '0%';
}

function updatePipelineStep(stepIndex) {
    for (let i = 0; i <= stepIndex; i++) {
        const dot = document.getElementById(`sd${i}`);
        const name = document.getElementById(`sn${i}`);
        if (dot && name) {
            if (i < stepIndex) {
                dot.classList.remove('active');
                dot.classList.add('done');
                name.classList.remove('active');
                name.classList.add('done');
            } else if (i === stepIndex) {
                dot.classList.remove('done');
                dot.classList.add('active');
                name.classList.remove('done');
                name.classList.add('active');
            }
        }
    }
}

function updateProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = `${percent}%`;
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function clearCanvases() {
    const segCanvas = document.getElementById('segCanvas');
    const featCanvas = document.getElementById('featCanvas');
    
<<<<<<< HEAD
    if (statAcc) statAcc.textContent = '98.5%';
    if (statTime) statTime.textContent = '0.8s';
    if (statCount) statCount.textContent = '5';
}

// ============================================
// FUNCTION: Update confidence scores display
// ============================================
function updateConfidenceScores(confidenceScores, predictedDenomination) {
    const denominations = ['R10', 'R20', 'R50', 'R100', 'R200'];
    const topPredictionBadge = document.getElementById('topPredictionBadge');
    
    // Update top prediction badge
    if (topPredictionBadge && predictedDenomination) {
        const topConfidence = confidenceScores[predictedDenomination];
        topPredictionBadge.innerHTML = `TOP PREDICTION: ${predictedDenomination} (${topConfidence.toFixed(1)}%)`;
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
// FUNCTION: Add hash marks to confidence bars
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
// FUNCTION: Reset confidence scores to zero
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
// FUNCTION: Show error state with red cross
// ============================================
function showErrorState(errorMessage) {
    const resultValue = document.getElementById('resultValue');
    const resultConf = document.getElementById('resultConf');
    const resultIcon = document.getElementById('resultIcon');
    const classIcon = document.getElementById('classIcon');
    const classLabel = document.getElementById('classLabel');
    const metaChips = document.querySelector('.meta-chips');
    
    if (resultValue) resultValue.textContent = 'Analysis Failed';
    if (resultConf) resultConf.textContent = errorMessage || 'Unable to recognize banknote';
    if (classLabel) classLabel.textContent = 'ERROR';
    
    // Use red cross icon for error state
    if (resultIcon) resultIcon.innerHTML = CROSS_ICON_HTML;
    if (classIcon) classIcon.innerHTML = CROSS_ICON_HTML;
    
    // Update meta chips with red cross icons
    if (metaChips) {
        metaChips.innerHTML = `
            <div class="chip chip-blue">${CROSS_ICON_TINY_HTML} FAILED</div>
            <div class="chip chip-green" style="background: rgba(220,53,69,0.2); color: #dc3545">
                ${CROSS_ICON_TINY_HTML} RECOGNITION FAILED
            </div>
        `;
    }
    
    // Reset pipeline steps
    for (let i = 0; i <= 5; i++) {
        updatePipelineStep(i, false);
    }
}

// ============================================
// FUNCTION: Update result display with cash icon and lamp icon for time
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
    
    // Use cash icon for result banner
    if (resultIcon) {
        resultIcon.innerHTML = CASH_ICON_HTML;
    }
    
    if (classLabel) {
        classLabel.textContent = denomination;
    }
    
    // Use cash icon for classification output
    if (classIcon) {
        classIcon.innerHTML = CASH_ICON_HTML;
    }
    
    if (metaChips) {
        const confidenceLevel = confidence >= 90 ? 'HIGH' : confidence >= 70 ? 'MEDIUM' : 'LOW';
        const confidenceColor = confidence >= 90 ? 'green' : confidence >= 70 ? 'yellow' : 'orange';
        metaChips.innerHTML = `
            <div class="chip chip-blue">${LAMP_ICON_TINY_HTML} ${processingTime.toFixed(1)}s</div>
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

// ============================================
// FUNCTION: Add to history with cash icon
// ============================================
function addToHistory(denomination, confidence) {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const newItem = document.createElement('div');
    newItem.className = 'history-item glass';
    newItem.style.animation = 'slideIn 0.3s ease';
    newItem.innerHTML = `
        <div class="h-thumb">${CASH_ICON_SMALL_HTML}</div>
        <div class="h-info">
            <div class="h-val">${denomination} note detected</div>
            <div class="h-meta">analysis_${now.getTime()} · ${timeString}</div>
        </div>
        <div class="h-badge">${confidence.toFixed(1)}%</div>
    `;
    
    historyList.insertBefore(newItem, historyList.firstChild);
    
    while (historyList.children.length > 5) {
        historyList.removeChild(historyList.lastChild);
=======
    if (segCanvas) {
        const ctx = segCanvas.getContext('2d');
        segCanvas.width = segCanvas.parentElement.clientWidth;
        segCanvas.height = segCanvas.parentElement.clientHeight;
        ctx.fillStyle = '#0c1322';
        ctx.fillRect(0, 0, segCanvas.width, segCanvas.height);
        ctx.fillStyle = '#4a5568';
        ctx.font = '10px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Awaiting analysis', segCanvas.width / 2, segCanvas.height / 2);
    }
    
    if (featCanvas) {
        const ctx = featCanvas.getContext('2d');
        featCanvas.width = featCanvas.parentElement.clientWidth;
        featCanvas.height = featCanvas.parentElement.clientHeight;
        ctx.fillStyle = '#0c1322';
        ctx.fillRect(0, 0, featCanvas.width, featCanvas.height);
        ctx.fillStyle = '#4a5568';
        ctx.font = '10px "Space Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Awaiting analysis', featCanvas.width / 2, featCanvas.height / 2);
>>>>>>> Lungani-Fakazi
    }
}

// ============================================
// FUNCTION: Add error to history with cross icon
// ============================================
function addErrorToHistory(errorMessage) {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const newItem = document.createElement('div');
    newItem.className = 'history-item glass';
    newItem.style.animation = 'slideIn 0.3s ease';
    newItem.style.opacity = '0.7';
    newItem.innerHTML = `
        <div class="h-thumb">${CROSS_ICON_SMALL_HTML}</div>
        <div class="h-info">
            <div class="h-val">Recognition Failed</div>
            <div class="h-meta">error_${now.getTime()} · ${timeString}</div>
        </div>
        <div class="h-badge" style="background: rgba(220,53,69,0.2); color: #dc3545">${CROSS_ICON_TINY_HTML} ERROR</div>
    `;
    
    historyList.insertBefore(newItem, historyList.firstChild);
    
    while (historyList.children.length > 5) {
        historyList.removeChild(historyList.lastChild);
    }
}

// ============================================
// FUNCTION: Draw segmentation canvas
// ============================================
function drawSegmentationCanvas(imageData) {
    const canvas = document.getElementById('segCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    const img = new Image();
    img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        const margin = 10;
        ctx.strokeRect(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
    };
    img.src = imageData;
}

// ============================================
// FUNCTION: Draw feature map
// ============================================
function drawFeatureMap(imageData) {
    const canvas = document.getElementById('featCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    
    const img = new Image();
    img.onload = () => {
        ctx.globalAlpha = 0.5;
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.globalAlpha = 1;
        
        // Draw feature points
        ctx.fillStyle = '#f59e0b';
        for (let i = 0; i < 12; i++) {
            const px = 20 + Math.random() * (canvas.width - 40);
            const py = 20 + Math.random() * (canvas.height - 40);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    };
    img.src = imageData;
}

<<<<<<< HEAD
// ============================================
// MAIN FUNCTION: Run analysis
// ============================================
=======
// Model Dropdown Functions
const modelDetails = {
    'random_forest': { accuracy: '98.5%', speed: '0.8s' },
    'svm': { accuracy: '97.2%', speed: '1.2s' },
    'knn': { accuracy: '95.8%', speed: '0.5s' }
};

function getSelectedModel() {
    const select = document.getElementById('modelSelect');
    return select ? select.value : 'random_forest';
}

function updateModelInfo(model) {
    const details = modelDetails[model] || modelDetails['random_forest'];
    const accuracyEl = document.getElementById('modelAccuracy');
    const speedEl = document.getElementById('modelSpeed');
    if (accuracyEl) accuracyEl.textContent = `Acc: ${details.accuracy}`;
    if (speedEl) speedEl.textContent = `Speed: ${details.speed}`;
}

function initializeModelDropdown() {
    const select = document.getElementById('modelSelect');
    if (select) {
        select.addEventListener('change', (e) => {
            updateModelInfo(e.target.value);
            showToast(`Switched to ${e.target.value.toUpperCase()} model`, 'success');
        });
    }
    updateModelInfo('random_forest');
}

// Confidence Functions
function updateConfidenceScores(confidenceScores, predictedDenomination) {
    const denominations = ['R10', 'R20', 'R50', 'R100', 'R200'];
    const badge = document.getElementById('topPredictionBadge');
    if (badge && predictedDenomination) {
        badge.innerHTML = `TOP: ${predictedDenomination} (${confidenceScores[predictedDenomination].toFixed(1)}%)`;
    }
    
    const items = document.querySelectorAll('.conf-item');
    for (let i = 0; i < denominations.length && i < items.length; i++) {
        const score = confidenceScores[denominations[i]] || 0;
        const bar = items[i].querySelector('.conf-bar');
        const pct = items[i].querySelector('.conf-pct');
        if (bar) bar.style.width = `${score}%`;
        if (pct) pct.textContent = `${score.toFixed(1)}%`;
        if (denominations[i] === predictedDenomination) {
            items[i].classList.add('prediction');
        } else {
            items[i].classList.remove('prediction');
        }
    }
}

function resetConfidenceScores() {
    const badge = document.getElementById('topPredictionBadge');
    if (badge) badge.innerHTML = 'AWAITING ANALYSIS';
    
    const items = document.querySelectorAll('.conf-item');
    for (let i = 0; i < items.length; i++) {
        const bar = items[i].querySelector('.conf-bar');
        const pct = items[i].querySelector('.conf-pct');
        if (bar) bar.style.width = '0%';
        if (pct) pct.textContent = '0.0%';
        items[i].classList.remove('prediction');
    }
}

function updateResultDisplay(denomination, confidence, processingTime, modelUsed) {
    showResultActive();
    const denomEl = document.getElementById('resultDenom');
    const confEl = document.getElementById('resultConf');
    const timeEl = document.getElementById('resultTime');
    const authEl = document.getElementById('resultAuth');
    
    const modelNames = { 'random_forest': 'Random Forest', 'svm': 'SVM', 'knn': 'KNN' };
    const modelDisplay = modelNames[modelUsed] || modelUsed;
    
    if (denomEl) denomEl.textContent = `${denomination} (${modelDisplay})`;
    if (confEl) confEl.textContent = `Confidence: ${confidence.toFixed(1)}%`;
    if (timeEl) timeEl.textContent = `${processingTime.toFixed(2)}s`;
    if (authEl) authEl.textContent = confidence >= 90 ? 'HIGH' : confidence >= 70 ? 'MEDIUM' : 'LOW';
}

// Compare Models
async function compareModels() {
    if (!currentFile) {
        showToast('Please upload an image first', 'error');
        return;
    }
    
    const btn = document.getElementById('compareBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = 'Comparing...';
    }
    
    const models = ['random_forest', 'svm', 'knn'];
    const results = [];
    
    for (const model of models) {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('model', model);
        
        const start = performance.now();
        try {
            const response = await fetch('/upload', { method: 'POST', body: formData });
            const end = performance.now();
            if (response.ok) {
                const data = await response.json();
                results.push({
                    model: model,
                    denomination: data.denomination,
                    confidence: Math.max(...Object.values(data.confidence_scores)),
                    time: (end - start) / 1000
                });
            }
        } catch(e) {
            results.push({ model: model, denomination: 'Error', confidence: 0, time: 0 });
        }
    }
    
    const modelNames = { 'random_forest': 'Random Forest', 'svm': 'SVM', 'knn': 'KNN' };
    const html = results.map(r => `
        <div class="comparison-item">
            <span class="comp-model">${modelNames[r.model]}</span>
            <span class="comp-result">${r.denomination}</span>
            <span class="comp-conf">${r.confidence.toFixed(1)}%</span>
            <span class="comp-time">${r.time.toFixed(2)}s</span>
        </div>
    `).join('');
    
    const modal = document.createElement('div');
    modal.className = 'comparison-toast';
    modal.innerHTML = `<div class="comparison-header">Model Comparison Results</div>${html}<button onclick="this.parentElement.remove()">Close</button>`;
    document.body.appendChild(modal);
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Compare Models';
    }
}

// Main Analysis
>>>>>>> Lungani-Fakazi
async function runAnalysis() {
    if (!currentFile) {
        showToast('Please select an image first', 'error');
        return;
    }
    if (isProcessing) return;
    
    isProcessing = true;
    const btn = document.getElementById('analyzeBtn');
    const selectedModel = getSelectedModel();
    
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `Processing ${selectedModel.toUpperCase()}...`;
    }
    
    const startTime = performance.now();
    
    try {
        updatePipelineStep(0);
        updateProgress(10);
        await sleep(150);
        
        updatePipelineStep(1);
        updateProgress(30);
        await sleep(200);
        
        updatePipelineStep(2);
        updateProgress(50);
        if (originalImageData) drawSegmentationCanvas(originalImageData);
        await sleep(200);
        
        updatePipelineStep(3);
        updateProgress(70);
        if (originalImageData) drawFeatureMap(originalImageData);
        await sleep(200);
        
        updatePipelineStep(4);
        updateProgress(85);
        
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('model', selectedModel);
        
        const response = await fetch('/upload', { method: 'POST', body: formData });
        const data = await response.json();
        
        const endTime = performance.now();
        const processingTime = (endTime - startTime) / 1000;
        
        if (data.success) {
            updatePipelineStep(5);
            updateProgress(100);
<<<<<<< HEAD
            
            const maxConfidence = Math.max(...Object.values(data.confidence_scores));
            
            updateResultDisplay(data.denomination, maxConfidence, processingTime);
            
            // Update confidence bars with scores
=======
            const maxConf = Math.max(...Object.values(data.confidence_scores));
            updateResultDisplay(data.denomination, maxConf, processingTime, selectedModel);
>>>>>>> Lungani-Fakazi
            updateConfidenceScores(data.confidence_scores, data.denomination);
            showToast(`Recognized as ${data.denomination}`, 'success');
        } else {
            throw new Error(data.error || 'Recognition failed');
        }
        
        for (let i = 0; i <= 5; i++) {
            const dot = document.getElementById(`sd${i}`);
            const name = document.getElementById(`sn${i}`);
            if (dot) {
                dot.classList.remove('active');
                dot.classList.add('done');
            }
            if (name) {
                name.classList.remove('active');
                name.classList.add('done');
            }
        }
        
        setTimeout(() => updateProgress(0), 1500);
        
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        updateProgress(0);
<<<<<<< HEAD
        
        // Show error state with red cross icon
        showErrorState(error.message);
        
        // Add error to history
        addErrorToHistory(error.message);
        
=======
>>>>>>> Lungani-Fakazi
    } finally {
        isProcessing = false;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = 'Analyze Banknote';
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
<<<<<<< HEAD
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
    
    /* Icon styling */
    .result-icon {
        width: 40px;
        height: 40px;
        object-fit: contain;
        display: inline-block;
        vertical-align: middle;
    }
    
    .h-thumb img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        border-radius: 8px;
    }
    
    #resultIcon, #classIcon {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 50px;
    }
    
    .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }
`;
document.head.appendChild(style);
=======
}
>>>>>>> Lungani-Fakazi
