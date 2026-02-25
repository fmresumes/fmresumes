# Production-Grade ATS Resume Scanning System

A comprehensive, enterprise-ready ATS (Applicant Tracking System) resume scanning solution with advanced NLP capabilities, semantic matching, and detailed optimization recommendations.

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ATS RESUME SCANNER SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────────────────┐  │
│  │   Frontend   │──────▶│  FastAPI     │──────▶│  Resume Parser Module    │  │
│  │   (React)    │◀──────│  Backend     │◀──────│  (PDFPlumber/Docx)       │  │
│  └──────────────┘      └──────────────┘      └──────────────────────────┘  │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     NLP PROCESSING PIPELINE                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │   Entity    │  │   Keyword   │  │  Semantic   │  │  Format    │  │   │
│  │  │  Extraction │─▶│   Matcher   │─▶│ Similarity  │─▶│  Analyzer  │  │   │
│  │  │   (spaCy)   │  │  (Fuzzy+Syn)│  │(Sentence-  │  │ (Structure)│  │   │
│  │  └─────────────┘  └─────────────┘  │ Transformers)│  └────────────┘  │   │
│  │                                    └─────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      ATS SCORING ENGINE                              │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │   │
│  │  │Keyword Match │ │Semantic Match│ │  Experience  │ │  Formatting │ │   │
│  │  │    40%       │ │    25%       │ │  Alignment   │ │Compatibility│ │   │
│  │  │              │ │              │ │    20%       │ │    10%      │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │   │
│  │  │              Section Completeness: 5%                          │ │   │
│  │  └─────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                               │                                             │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         OUTPUT GENERATOR                             │   │
│  │  • ATS Score (0-100)    • Matched Keywords  • Formatting Issues      │   │
│  │  • Missing Keywords     • Bullet Tips       • Section Recommendations│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Architecture Components

### 1. Resume Parser Module
- **PDF Parser**: PDFPlumber for text extraction with layout preservation
- **DOCX Parser**: python-docx for Word document processing
- **Text Cleaner**: Normalization, encoding fixes, special character handling

### 2. Job Description Parser
- **Text Input**: Direct job description text processing
- **File Upload**: Support for JD files (PDF, DOCX, TXT)
- **Entity Extraction**: Skills, requirements, qualifications, experience level

### 3. Keyword & Synonym Matching
- **Exact Match**: Direct keyword comparison
- **Fuzzy Match**: Levenshtein distance for typos/variations
- **Synonym Expansion**: WordNet + domain-specific synonyms
- **N-gram Analysis**: Multi-word phrase matching

### 4. Semantic Similarity (Embeddings)
- **Model**: sentence-transformers/all-MiniLM-L6-v2
- **Similarity**: Cosine similarity between resume and JD embeddings
- **Context Understanding**: Captures meaning beyond exact keywords

### 5. ATS Scoring Engine
- **Weighted Scoring**: Configurable weight distribution
- **Sub-scores**: Individual component scores with detailed breakdown
- **Threshold Alerts**: Warnings for critical issues

### 6. Formatting Analyzer
- **Table Detection**: Identifies problematic table structures
- **Column Layout**: Detects multi-column formats
- **Image Detection**: Flags embedded images/icons
- **Font Analysis**: Checks ATS-readable fonts
- **Heading Validation**: Verifies proper section headers

## API Endpoints

```
POST /api/v1/ats/scan
├── Upload resume (PDF/DOCX)
├── Upload/Input job description
└── Returns complete ATS analysis

POST /api/v1/ats/parse-resume
├── Upload resume only
└── Returns parsed resume data

POST /api/v1/ats/extract-keywords
├── Upload job description
└── Returns extracted keywords

GET  /api/v1/health
└── Service health check
```

## Scoring Weights

| Component | Weight | Description |
|-----------|--------|-------------|
| Keyword Match | 40% | Exact and fuzzy keyword matching |
| Semantic Match | 25% | Embedding-based similarity |
| Experience Alignment | 20% | Years, level, role alignment |
| Formatting Compatibility | 10% | ATS-readable format checks |
| Section Completeness | 5% | Required sections present |

## Tech Stack

- **Backend**: Python 3.11, FastAPI
- **NLP**: spaCy, sentence-transformers, nltk
- **Parsing**: PDFPlumber, python-docx
- **Frontend**: React, TypeScript, Tailwind CSS
- **Deployment**: Docker, AWS/GCP ready

## Installation

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_lg
uvicorn main:app --reload

# Frontend (integration into existing site)
cd frontend-integration
npm install
npm run build
```

## Security Features

- File type validation (whitelist approach)
- File size limits (5MB default)
- Secure file handling (temp files, auto-cleanup)
- No persistent storage of uploaded files
- CORS configuration
- Rate limiting ready

## Performance Optimizations

- Async request handling
- Model caching (sentence-transformers loaded once)
- Connection pooling
- Response caching for similar requests
- Optimized NLP pipelines
