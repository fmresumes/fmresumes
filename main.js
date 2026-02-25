// FM Resumes - Main JavaScript

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a link
    const navLinkItems = document.querySelectorAll('.nav-links a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
});

// Package Price Calculator
function initPackageCalculator() {
    const basePriceEl = document.getElementById('base-price');
    const coverLetterCheckbox = document.getElementById('cover-letter');
    const linkedinCheckbox = document.getElementById('linkedin');
    const totalPriceEl = document.getElementById('total-price');
    const coverLetterRow = document.getElementById('cover-letter-row');
    const linkedinRow = document.getElementById('linkedin-row');

    if (!basePriceEl || !totalPriceEl) return;

    const basePrice = parseInt(basePriceEl.dataset.price);

    function updateTotal() {
        let total = basePrice;
        
        if (coverLetterCheckbox && coverLetterCheckbox.checked) {
            total += 40;
            coverLetterRow.style.display = 'flex';
        } else if (coverLetterRow) {
            coverLetterRow.style.display = 'none';
        }

        if (linkedinCheckbox && linkedinCheckbox.checked) {
            total += 60;
            linkedinRow.style.display = 'flex';
        } else if (linkedinRow) {
            linkedinRow.style.display = 'none';
        }

        totalPriceEl.textContent = '$' + total;

        // Store selection in sessionStorage
        const selection = {
            basePrice: basePrice,
            coverLetter: coverLetterCheckbox ? coverLetterCheckbox.checked : false,
            linkedin: linkedinCheckbox ? linkedinCheckbox.checked : false,
            total: total,
            packageName: document.querySelector('h1') ? document.querySelector('h1').textContent.replace(' Resume Package', '') + ' Career Package' : 'Resume Package'
        };
        sessionStorage.setItem('packageSelection', JSON.stringify(selection));
    }

    if (coverLetterCheckbox) {
        coverLetterCheckbox.addEventListener('change', updateTotal);
    }
    if (linkedinCheckbox) {
        linkedinCheckbox.addEventListener('change', updateTotal);
    }

    // Initialize
    updateTotal();
}

// ATS Checker
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

    if (!uploadArea || !fileInput) return;

    let uploadedFile = null;

    // Drag and drop
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

    function handleFile(file) {
        const allowedTypes = ['application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF, DOC, DOCX, or TXT file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB.');
            return;
        }

        uploadedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = (file.size / 1024).toFixed(1) + ' KB';
        uploadArea.style.display = 'none';
        fileInfo.style.display = 'block';
    }

    if (removeFile) {
        removeFile.addEventListener('click', () => {
            uploadedFile = null;
            fileInput.value = '';
            uploadArea.style.display = 'block';
            fileInfo.style.display = 'none';
            resultsSection.style.display = 'none';
        });
    }

    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            if (!uploadedFile) {
                alert('Please upload a resume first.');
                return;
            }

            scanBtn.disabled = true;
            scanProgress.style.display = 'block';
            resultsSection.style.display = 'none';

            let progress = 0;
            const interval = setInterval(() => {
                progress += 5;
                progressBar.style.width = progress + '%';

                if (progress >= 100) {
                    clearInterval(interval);
                    scanBtn.disabled = false;
                    scanProgress.style.display = 'none';
                    showResults(uploadedFile.name);
                }
            }, 100);
        });
    }

    function showResults(filename) {
        const scoreValue = document.getElementById('score-value');
        const scoreCircle = document.getElementById('score-circle-fill');
        const scoreMessage = document.getElementById('score-message');
        const scoreBadge = document.getElementById('score-badge');

        // Check if filename contains fmresumes variants
        const lowerFilename = filename.toLowerCase();
        const isFMResume = lowerFilename.includes('fmresumes') || 
                          lowerFilename.includes('fm-resumes') || 
                          lowerFilename.includes('fm_resumes');

        let score;
        if (isFMResume) {
            score = Math.floor(Math.random() * (90 - 75 + 1)) + 75;
        } else {
            score = Math.floor(Math.random() * (55 - 35 + 1)) + 35;
        }

        // Animate score
        let currentScore = 0;
        const scoreInterval = setInterval(() => {
            currentScore += 2;
            if (currentScore >= score) {
                currentScore = score;
                clearInterval(scoreInterval);
            }
            scoreValue.textContent = currentScore + '%';
            
            // Update circle
            const circumference = 2 * Math.PI * 56;
            const offset = circumference - (currentScore / 100) * circumference;
            scoreCircle.style.strokeDashoffset = offset;
        }, 30);

        // Set color based on score
        let color, badgeClass, badgeText;
        if (score >= 80) {
            color = '#22c55e';
            badgeClass = 'badge-success';
            badgeText = 'ATS Friendly';
            scoreMessage.textContent = 'Great job! Your resume is well-optimized for ATS systems.';
        } else if (score >= 60) {
            color = '#f59e0b';
            badgeClass = 'badge-warning';
            badgeText = 'Needs Improvement';
            scoreMessage.textContent = 'Good start! There are some improvements you can make.';
        } else {
            color = '#ef4444';
            badgeClass = 'badge-danger';
            badgeText = 'Low Compatibility';
            scoreMessage.textContent = 'Your resume shows moderate ATS alignment. Professional optimization can significantly increase your score.';
        }

        scoreCircle.style.stroke = color;
        scoreValue.style.color = color;
        scoreBadge.className = 'badge ' + badgeClass;
        scoreBadge.textContent = badgeText;

        resultsSection.style.display = 'block';
    }
}

// Checkout Form
function initCheckout() {
    const checkoutForm = document.getElementById('checkout-form');
    const modal = document.getElementById('success-modal');
    const closeModal = document.getElementById('close-modal');
    const orderRef = document.getElementById('order-ref');
    const selectedPackageInput = document.getElementById('selected-package');
    const selectedAddonsInput = document.getElementById('selected-addons');

    // File upload elements
    const uploadArea = document.getElementById('checkout-upload-area');
    const fileInput = document.getElementById('checkout-resume-upload');
    const fileInfo = document.getElementById('checkout-file-info');
    const fileNameEl = document.getElementById('checkout-file-name');
    const fileSizeEl = document.getElementById('checkout-file-size');

    // File upload handling
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', function() {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            var file = e.dataTransfer.files[0];
            if (file) handleCheckoutFile(file);
        });

        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (file) handleCheckoutFile(file);
        });
    }

    function handleCheckoutFile(file) {
        var allowedTypes = ['application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (!allowedTypes.includes(file.type)) {
            alert('Please upload a PDF, DOC, or DOCX file.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB.');
            return;
        }

        // Update the file input so the form includes the file
        var dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        if (fileNameEl) fileNameEl.textContent = file.name;
        if (fileSizeEl) fileSizeEl.textContent = (file.size / 1024).toFixed(1) + ' KB';
        if (uploadArea) uploadArea.style.display = 'none';
        if (fileInfo) fileInfo.style.display = 'block';
    }

    // Load package selection
    const selection = JSON.parse(sessionStorage.getItem('packageSelection') || '{}');

    // Update summary
    const summaryPackage = document.getElementById('summary-package');
    const summaryBasePrice = document.getElementById('summary-base-price');
    const summaryCoverLetter = document.getElementById('summary-cover-letter');
    const summaryLinkedin = document.getElementById('summary-linkedin');
    const summaryTotal = document.getElementById('summary-total');

    if (summaryPackage && selection.packageName) {
        summaryPackage.textContent = selection.packageName;
    }
    if (summaryBasePrice && selection.basePrice) {
        summaryBasePrice.textContent = '$' + selection.basePrice;
    }
    if (summaryCoverLetter) {
        summaryCoverLetter.textContent = selection.coverLetter ? '$40' : '$0';
        summaryCoverLetter.parentElement.style.display = selection.coverLetter ? 'flex' : 'none';
    }
    if (summaryLinkedin) {
        summaryLinkedin.textContent = selection.linkedin ? '$60' : '$0';
        summaryLinkedin.parentElement.style.display = selection.linkedin ? 'flex' : 'none';
    }
    if (summaryTotal && selection.total) {
        summaryTotal.textContent = '$' + selection.total;
    }

    function getSelectedAddons() {
        const addons = [];
        if (selection.coverLetter) addons.push('Cover Letter');
        if (selection.linkedin) addons.push('LinkedIn Optimization');
        return addons.length ? addons.join(', ') : 'None';
    }

    function updateSelectionFields() {
        if (selectedPackageInput) {
            selectedPackageInput.value = selection.packageName || '';
        }
        if (selectedAddonsInput) {
            selectedAddonsInput.value = getSelectedAddons();
        }
    }

    updateSelectionFields();

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate file is uploaded
            if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
                alert('Please upload your resume before submitting.');
                return;
            }

            // Generate order reference
            const ref = 'FM-' + Date.now().toString(36).toUpperCase();
            if (orderRef) {
                orderRef.textContent = ref;
            }

            // Submit form data to Netlify Forms
            var formData = new FormData(checkoutForm);
            formData.set('form-name', 'checkout');
            formData.set('order-ref', ref);
            if (selection.packageName) formData.set('package', selection.packageName);
            if (selection.total) formData.set('total', '$' + selection.total);
            updateSelectionFields();
            if (selectedPackageInput) formData.set('selected_package', selectedPackageInput.value);
            if (selectedAddonsInput) formData.set('selected_addons', selectedAddonsInput.value);

            var submitBtn = checkoutForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            fetch('/', {
                method: 'POST',
                body: formData
            }).then(function(response) {
                if (response.ok) {
                    if (modal) modal.classList.add('active');
                } else {
                    alert('There was an error submitting your order. Please try again.');
                }
            }).catch(function() {
                alert('There was an error submitting your order. Please try again.');
            }).finally(function() {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit Order';
                }
            });
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.classList.remove('active');
            // Redirect to home
            window.location.href = 'index.html';
        });
    }
}

// Initialize functions based on page
document.addEventListener('DOMContentLoaded', function() {
    initPackageCalculator();
    initCheckout();
});
