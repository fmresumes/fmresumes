# ATS Resume Scanner - API Documentation

## Base URL
```
Production: https://api.yourdomain.com/api/v1
Local: http://localhost:8000/api/v1
```

## Authentication
Currently, the API is open. For production, add API key authentication:
```
Header: X-API-Key: your-api-key
```

## Endpoints

### 1. Health Check
Check if the API is running and models are loaded.

**Endpoint:** `GET /api/v1/health`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "models_loaded": true
}
```

---

### 2. Scan Resume (Main Endpoint)
Upload a resume and optionally a job description for complete ATS analysis.

**Endpoint:** `POST /api/v1/ats/scan`

**Content-Type:** `multipart/form-data`

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | File | Yes | Resume file (PDF, DOCX, TXT) |
| `job_description` | String | No | Job description text |
| `job_description_file` | File | No | Job description file |

**Request Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/ats/scan" \
  -F "resume=@resume.pdf" \
  -F "job_description=We are looking for a Python developer..."
```

**Response:**
```json
{
  "ats_score": 78.5,
  "score_breakdown": {
    "keyword_match": 85.0,
    "semantic_match": 72.5,
    "experience_alignment": 80.0,
    "formatting_compatibility": 90.0,
    "section_completeness": 65.0
  },
  "matched_keywords": [
    {
      "keyword": "Python",
      "matched": true,
      "importance": "high"
    },
    {
      "keyword": "React",
      "matched": false,
      "importance": "medium"
    }
  ],
  "missing_keywords": ["React", "Docker", "Kubernetes"],
  "formatting_issues": [
    {
      "type": "table",
      "severity": "warning",
      "message": "Tables detected in resume",
      "suggestion": "Consider converting tables to plain text"
    }
  ],
  "optimization_suggestions": [
    {
      "category": "keywords",
      "priority": "high",
      "message": "Add missing keywords: React, Docker",
      "action_items": [
        "Include 'React' in your skills section",
        "Add Docker experience to your projects"
      ]
    }
  ],
  "extracted_data": {
    "skills": ["Python", "JavaScript", "SQL"],
    "job_titles": ["Software Engineer", "Developer"],
    "companies": ["ABC Corp", "XYZ Inc"],
    "education": ["Bachelor of Science in Computer Science"],
    "certifications": ["AWS Certified"],
    "years_experience": 5
  },
  "resume_text_preview": "John Doe\nSoftware Engineer..."
}
```

---

### 3. Parse Resume Only
Parse a resume and extract structured data without JD comparison.

**Endpoint:** `POST /api/v1/ats/parse-resume`

**Content-Type:** `multipart/form-data`

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `resume` | File | Yes | Resume file |

**Response:**
```json
{
  "raw_text": "Full resume text...",
  "extracted_data": {
    "skills": ["Python", "JavaScript"],
    "job_titles": ["Software Engineer"],
    "companies": ["ABC Corp"],
    "education": ["BS Computer Science"],
    "certifications": ["AWS Certified"],
    "years_experience": 5,
    "contact_info": {
      "email": "john@example.com",
      "phone": "123-456-7890",
      "linkedin": "linkedin.com/in/johndoe"
    }
  },
  "formatting_analysis": {
    "score": 85.0,
    "issues": [],
    "sections_found": ["contact", "experience", "education"]
  },
  "sections_found": ["contact", "experience", "education", "skills"]
}
```

---

### 4. Extract Keywords from JD
Extract keywords and entities from a job description.

**Endpoint:** `POST /api/v1/ats/extract-keywords`

**Content-Type:** `multipart/form-data`

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `job_description` | String | Yes* | Job description text |
| `jd_file` | File | Yes* | Job description file |

*One of the two is required

**Response:**
```json
{
  "skills": ["Python", "React", "Docker"],
  "job_titles": ["Software Engineer", "Full Stack Developer"],
  "qualifications": ["Bachelor's degree", "3+ years experience"],
  "certifications": ["AWS Certified"],
  "keywords": ["agile", "scrum", "rest api"],
  "soft_skills": ["communication", "teamwork"],
  "tools_technologies": ["Git", "Jira", "Kubernetes"]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid file type. Allowed: PDF, DOCX, TXT"
}
```

### 413 Payload Too Large
```json
{
  "detail": "File too large. Max 5MB."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Processing error: [error message]"
}
```

---

## Scoring System

### Score Breakdown

| Component | Weight | Description |
|-----------|--------|-------------|
| Keyword Match | 40% | Exact and fuzzy keyword matching |
| Semantic Match | 25% | Embedding-based similarity |
| Experience Alignment | 20% | Years, level, role alignment |
| Formatting Compatibility | 10% | ATS-readable format checks |
| Section Completeness | 5% | Required sections present |

### Score Categories

| Score Range | Category | Description |
|-------------|----------|-------------|
| 80-100 | Excellent | ATS optimized |
| 60-79 | Good | Minor improvements needed |
| 40-59 | Needs Improvement | Significant issues |
| 0-39 | Poor | Major revision needed |

---

## Rate Limiting

Default: 60 requests per minute per IP

**Headers:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
const atsChecker = new ATSChecker('https://api.yourdomain.com/api/v1');

// Scan resume
const result = await atsChecker.scanResume(
  resumeFile,
  jobDescriptionText
);

console.log(`ATS Score: ${result.ats_score}%`);
```

### Python
```python
import requests

url = "https://api.yourdomain.com/api/v1/ats/scan"

with open("resume.pdf", "rb") as f:
    files = {"resume": f}
    data = {"job_description": "Looking for Python developer..."}
    response = requests.post(url, files=files, data=data)

result = response.json()
print(f"ATS Score: {result['ats_score']}%")
```

### cURL
```bash
curl -X POST "https://api.yourdomain.com/api/v1/ats/scan" \
  -F "resume=@resume.pdf" \
  -F "job_description=Looking for a software engineer..."
```

---

## WebSocket (Future)
Real-time scanning progress updates:
```javascript
const ws = new WebSocket('wss://api.yourdomain.com/ws/scan');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(`Progress: ${data.progress}%`);
};
```
