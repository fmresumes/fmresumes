# ATS Resume Scanner - Integration Guide

This guide explains how to integrate the new ATS Scanner API with your existing FM Resumes website.

## Quick Integration Steps

### 1. Deploy the Backend

Choose one of the deployment options from `DEPLOYMENT.md`:

**Option A: Docker (Quickest)**
```bash
cd ats-system
docker-compose up -d
```

**Option B: Cloud (Recommended for Production)**
- Deploy to AWS ECS, Google Cloud Run, or Heroku
- Get your API URL: `https://api.yourdomain.com`

### 2. Update Your Frontend

#### Step 1: Add the JavaScript Module

Copy `ats-checker-new.js` to your website's JS folder:
```bash
cp ats-system/frontend-integration/ats-checker-new.js /path/to/your/website/js/
```

#### Step 2: Update ats-checker.html

Replace your existing `ats-checker.html` with the integration version:

```html
<!-- Add before closing </body> tag -->
<script src="js/ats-checker-new.js"></script>
<script>
    // Initialize with your API URL
    const atsChecker = new ATSChecker('https://api.yourdomain.com/api/v1');
</script>
```

### 3. Full Integration Code

Here's the complete updated `ats-checker.html` section:

```html
<!-- ATS Checker Section -->
<section class="section">
    <div class="container">
        <div style="max-width: 800px; margin: 0 auto;">
            
            <!-- Upload Section -->
            <div id="upload-section">
                <!-- Enhanced Upload Area -->
                <div class="upload-area" id="upload-area">
                    <!-- ... existing upload area code ... -->
                </div>

                <!-- Job Description Input (NEW) -->
                <div class="jd-input-section" style="margin-top: 1.5rem; padding: 1.5rem; background: var(--gray-50); border-radius: var(--radius-lg);">
                    <h4 style="margin-bottom: 1rem;">Job Description (Optional but Recommended)</h4>
                    <textarea id="job-description" style="width: 100%; min-height: 150px; padding: 1rem; border: 1px solid var(--gray-300); border-radius: var(--radius);" placeholder="Paste the job description here for more accurate scoring..."></textarea>
                    <p style="font-size: 0.875rem; color: var(--gray-500); margin-top: 0.5rem;">
                        Adding a job description enables keyword matching and semantic analysis.
                    </p>
                </div>

                <!-- Scan Button -->
                <div style="text-align: center; margin-top: 2rem;">
                    <button id="scan-btn" class="btn btn-primary btn-large" disabled>
                        Scan My Resume
                    </button>
                </div>
            </div>

            <!-- Enhanced Results Section -->
            <div id="results-section" style="display: none;">
                <!-- Score Display -->
                <div class="score-display" style="text-align: center; padding: 2rem; background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); margin-bottom: 2rem;">
                    <div id="score-circle" style="position: relative; width: 180px; height: 180px; margin: 0 auto 1.5rem;">
                        <!-- Score circle rendered by JS -->
                    </div>
                    <span id="score-badge" class="badge">Checking...</span>
                    <p id="score-message" style="margin-top: 1rem; color: var(--gray-600);"></p>
                </div>

                <!-- Score Breakdown -->
                <div class="score-breakdown" style="background: white; border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
                    <h3>Score Breakdown</h3>
                    <div id="score-breakdown-content"></div>
                </div>

                <!-- Keywords -->
                <div class="keywords-section" style="background: white; border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
                    <h3>Keywords Analysis</h3>
                    <div id="keywords-content"></div>
                </div>

                <!-- Formatting -->
                <div class="formatting-section" style="background: white; border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
                    <h3>Formatting Analysis</h3>
                    <div id="formatting-content"></div>
                </div>

                <!-- Suggestions -->
                <div class="suggestions-section" style="background: white; border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
                    <h3>Optimization Suggestions</h3>
                    <div id="suggestions-content"></div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Add scanning overlay -->
<div id="scanning-overlay" style="display: none; position: fixed; inset: 0; background: rgba(255,255,255,0.9); z-index: 1000; flex-direction: column; align-items: center; justify-content: center;">
    <div style="width: 60px; height: 60px; border: 4px solid var(--gray-200); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
    <p style="margin-top: 1rem; color: var(--gray-600);">Analyzing your resume...</p>
    <div style="width: 300px; height: 8px; background: var(--gray-200); border-radius: 9999px; margin-top: 1rem; overflow: hidden;">
        <div id="scanning-progress-bar" style="height: 100%; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); width: 0%; transition: width 0.3s;"></div>
    </div>
</div>

<style>
    @keyframes spin { to { transform: rotate(360deg); } }
</style>

<!-- Include the new ATS Checker module -->
<script src="js/ats-checker-new.js"></script>

<script>
// Initialize ATS Checker with your API URL
const atsChecker = new ATSChecker('https://api.yourdomain.com/api/v1');

// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('resume-upload');
const fileInfo = document.getElementById('file-info');
const scanBtn = document.getElementById('scan-btn');
const jobDescription = document.getElementById('job-description');
const resultsSection = document.getElementById('results-section');
const uploadSection = document.getElementById('upload-section');
const scanningOverlay = document.getElementById('scanning-overlay');
const scanningProgressBar = document.getElementById('scanning-progress-bar');

let uploadedFile = null;

// File upload handling
uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
});

function handleFile(file) {
    const validation = atsChecker.validateFile(file);
    if (!validation.valid) {
        alert(validation.error);
        return;
    }
    
    uploadedFile = file;
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = atsChecker.formatFileSize(file.size);
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'block';
    scanBtn.disabled = false;
}

// Scan button handler
scanBtn.addEventListener('click', async () => {
    if (!uploadedFile) return;
    
    scanningOverlay.style.display = 'flex';
    
    // Animate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        if (progress > 90) progress = 90;
        scanningProgressBar.style.width = progress + '%';
    }, 200);
    
    try {
        const jdText = jobDescription.value.trim() || null;
        const result = await atsChecker.scanResume(uploadedFile, jdText);
        
        clearInterval(interval);
        scanningProgressBar.style.width = '100%';
        
        setTimeout(() => {
            scanningOverlay.style.display = 'none';
            displayResults(result);
        }, 500);
        
    } catch (error) {
        clearInterval(interval);
        scanningOverlay.style.display = 'none';
        alert('Error: ' + error.message);
    }
});

function displayResults(result) {
    uploadSection.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Render score circle
    atsChecker.renderScoreCircle(result.ats_score, 'score-circle');
    
    // Update badge and message
    document.getElementById('score-badge').textContent = atsChecker.getScoreLabel(result.ats_score);
    document.getElementById('score-badge').style.background = atsChecker.getScoreColor(result.ats_score);
    document.getElementById('score-message').textContent = atsChecker.getScoreMessage(result.ats_score);
    
    // Render score breakdown
    renderScoreBreakdown(result.score_breakdown);
    
    // Render other sections
    atsChecker.renderMatchedKeywords(result.matched_keywords, 'keywords-content');
    atsChecker.renderFormattingIssues(result.formatting_issues, 'formatting-content');
    atsChecker.renderSuggestions(result.optimization_suggestions, 'suggestions-content');
}

function renderScoreBreakdown(breakdown) {
    const container = document.getElementById('score-breakdown-content');
    const items = [
        { label: 'Keyword Match', value: breakdown.keyword_match, weight: '40%' },
        { label: 'Semantic Match', value: breakdown.semantic_match, weight: '25%' },
        { label: 'Experience Alignment', value: breakdown.experience_alignment, weight: '20%' },
        { label: 'Formatting Compatibility', value: breakdown.formatting_compatibility, weight: '10%' },
        { label: 'Section Completeness', value: breakdown.section_completeness, weight: '5%' }
    ];
    
    container.innerHTML = items.map(item => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--gray-100);">
            <span>${item.label} <small style="color: var(--gray-400);">(${item.weight})</small></span>
            <div style="flex: 1; height: 8px; background: var(--gray-200); border-radius: 9999px; margin: 0 1rem; overflow: hidden;">
                <div style="height: 100%; background: var(--primary); width: ${item.value}%;"></div>
            </div>
            <span style="font-weight: 600; min-width: 50px; text-align: right;">${item.value}%</span>
        </div>
    `).join('');
}
</script>
```

### 4. Update Your CSS

Add these styles to your existing `style.css`:

```css
/* ATS Checker Enhancements */

.jd-input-section {
    margin-top: 1.5rem;
    padding: 1.5rem;
    background: var(--gray-50);
    border-radius: var(--radius-lg);
}

.jd-input-section h4 {
    margin-bottom: 1rem;
    color: var(--gray-700);
}

.jd-textarea {
    width: 100%;
    min-height: 150px;
    padding: 1rem;
    border: 1px solid var(--gray-300);
    border-radius: var(--radius);
    font-family: inherit;
    font-size: 0.95rem;
    resize: vertical;
}

.jd-textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
}

/* Score Display */
.score-display {
    text-align: center;
    padding: 2rem;
    background: var(--white);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    margin-bottom: 2rem;
}

/* Keyword Tags */
.keyword-tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 500;
}

.keyword-tag.matched {
    background: #dcfce7;
    color: #166534;
}

.keyword-tag.missing {
    background: #fee2e2;
    color: #991b1b;
}

/* Issue Items */
.issue-item {
    padding: 1rem;
    border-radius: var(--radius);
    margin-bottom: 0.75rem;
}

.issue-item.severity-critical {
    background: #fee2e2;
    border-left: 4px solid #ef4444;
}

.issue-item.severity-warning {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
}

/* Suggestions */
.suggestion-item {
    padding: 1rem;
    border-radius: var(--radius);
    margin-bottom: 0.75rem;
    border-left: 4px solid;
}

.suggestion-item.priority-high {
    background: #fef2f2;
    border-color: #ef4444;
}

.suggestion-item.priority-medium {
    background: #fffbeb;
    border-color: #f59e0b;
}
```

### 5. Test the Integration

1. Start your backend API
2. Open your website's ATS checker page
3. Upload a resume
4. (Optional) Paste a job description
5. Click "Scan My Resume"
6. Review the detailed results

## Configuration Options

### Change API URL

In your HTML, update the API URL:

```javascript
// Development
const atsChecker = new ATSChecker('http://localhost:8000/api/v1');

// Production
const atsChecker = new ATSChecker('https://api.yourdomain.com/api/v1');
```

### Customize UI

The JavaScript module provides methods to customize the display:

```javascript
// Custom score colors
atsChecker.getScoreColor = (score) => {
    if (score >= 80) return '#00ff00';
    if (score >= 60) return '#ffff00';
    return '#ff0000';
};

// Custom messages
atsChecker.getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good!';
    return 'Needs work!';
};
```

## Troubleshooting

### CORS Issues

If you see CORS errors, update the backend `.env`:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### API Not Responding

1. Check if the API is running: `curl http://localhost:8000/api/v1/health`
2. Verify the API URL in your frontend code
3. Check browser console for errors

### Slow Response Times

1. The first request may be slower (model loading)
2. Subsequent requests should be faster
3. Consider deploying closer to your users

## Next Steps

1. **Customize the UI** to match your brand
2. **Add analytics** to track usage
3. **Implement rate limiting** for public API
4. **Add user accounts** for saved scans
5. **Integrate with payment** for premium features
