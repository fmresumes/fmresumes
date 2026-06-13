// ATS Checker - FM Resumes (Affinda-powered)

function initATSChecker() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('resume-upload');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const removeFile = document.getElementById('remove-file');
    const scanBtn = document.getElementById('scan-btn');
    const scanProgress = document.getElementById('scan-progress');
    const progressBar = document.getElementById('progress-bar');
    const resultsSection = document.getElementById('results-section');
    const scanAnotherBtn = document.getElementById('scan-another');

    if (!uploadArea || !fileInput || !scanBtn) return;

    let uploadedFile = null;
    let progressTimer = null;
    let progressValue = 0;

    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];

    function resetUI() {
        uploadedFile = null;
        fileInput.value = '';
        uploadArea.style.display = 'block';
        fileInfo.style.display = 'none';
        resultsSection.style.display = 'none';
        scanProgress.style.display = 'none';
        progressBar.style.width = '0%';
        scanBtn.disabled = true;
    }

    function startProgress() {
        progressValue = 0;
        progressBar.style.width = '0%';
        scanProgress.style.display = 'block';
        if (progressTimer) clearInterval(progressTimer);
        progressTimer = setInterval(() => {
            progressValue = Math.min(progressValue + 4, 90);
            progressBar.style.width = progressValue + '%';
        }, 120);
    }

    function finishProgress() {
        if (progressTimer) clearInterval(progressTimer);
        progressValue = 100;
        progressBar.style.width = '100%';
    }

    function showError(message) {
        alert(message);
    }

    function handleFile(file) {
        if (!allowedTypes.includes(file.type)) {
            showError('Please upload a PDF, DOC, DOCX, or TXT file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showError('File size must be less than 5MB.');
            return;
        }

        uploadedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'block';
        scanBtn.disabled = false;
    }

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    if (removeFile) {
        removeFile.addEventListener('click', () => {
            resetUI();
        });
    }

    if (scanAnotherBtn) {
        scanAnotherBtn.addEventListener('click', () => {
            resetUI();
        });
    }

    if (scanBtn) {
        scanBtn.addEventListener('click', async () => {
            if (!uploadedFile) {
                showError('Please upload a resume first.');
                return;
            }

            scanBtn.disabled = true;
            resultsSection.style.display = 'none';
            startProgress();

            try {
                const formData = new FormData();
                formData.append('resume', uploadedFile);

                const response = await fetch('/api/ats/scan', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json().catch(() => null);
                if (!response.ok) {
                    const message = data && (data.error || data.detail) ? (data.error || data.detail) : 'Analysis failed. Please try again.';
                    throw new Error(message);
                }

                finishProgress();
                setTimeout(() => {
                    scanProgress.style.display = 'none';
                    scanBtn.disabled = false;
                    renderResults(data);
                }, 300);
            } catch (error) {
                scanProgress.style.display = 'none';
                scanBtn.disabled = false;
                showError(error.message || 'Analysis failed. Please try again.');
            }
        });
    }

    function renderResults(result) {
        const scoreValue = document.getElementById('score-value');
        const scoreCircle = document.getElementById('score-circle-fill');
        const scoreMessage = document.getElementById('score-message');
        const scoreBadge = document.getElementById('score-badge');

        const score = Math.max(0, Math.min(100, Math.round(result.ats_score || 0)));

        let currentScore = 0;
        const scoreInterval = setInterval(() => {
            currentScore += 2;
            if (currentScore >= score) {
                currentScore = score;
                clearInterval(scoreInterval);
            }
            scoreValue.textContent = currentScore + '%';

            const circumference = 2 * Math.PI * 56;
            const offset = circumference - (currentScore / 100) * circumference;
            scoreCircle.style.strokeDashoffset = offset;
        }, 30);

        let color;
        let badgeClass;
        let badgeText;
        if (score >= 80) {
            color = '#22c55e';
            badgeClass = 'badge-success';
            badgeText = 'ATS Friendly';
        } else if (score >= 60) {
            color = '#f59e0b';
            badgeClass = 'badge-warning';
            badgeText = 'Needs Improvement';
        } else {
            color = '#ef4444';
            badgeClass = 'badge-danger';
            badgeText = 'Low Compatibility';
        }

        scoreCircle.style.stroke = color;
        scoreValue.style.color = color;
        scoreBadge.className = 'badge ' + badgeClass;
        scoreBadge.textContent = badgeText;

        const missing = result.missing_keywords || (result.analysis && result.analysis.missing_sections) || [];
        if (scoreMessage) {
            if (missing.length) {
                scoreMessage.textContent = 'Consider adding or emphasizing: ' + missing.join(', ') + '.';
            } else {
                scoreMessage.textContent = 'Your resume contains the core ATS sections. Nice work!';
            }
        }

        resultsSection.style.display = 'block';
    }

    resetUI();
}

document.addEventListener('DOMContentLoaded', initATSChecker);
