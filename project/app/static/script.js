// Banknote Recognition System - Working Version
let currentFile = null;
let originalImageData = null;
let isProcessing = false;

document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
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
    }
}

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
            const maxConf = Math.max(...Object.values(data.confidence_scores));
            updateResultDisplay(data.denomination, maxConf, processingTime, selectedModel);
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
}