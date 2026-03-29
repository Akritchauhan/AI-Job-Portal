from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# 🔹 Extract text from PDF
def extract_text_from_pdf(file):
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except:
        return ""


# 🔹 Match Score
def calculate_match_score(resume_text, job_description):
    if not resume_text or not job_description:
        return 0.0

    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform([resume_text, job_description])
    score = cosine_similarity(vectors[0], vectors[1])

    return round(score[0][0] * 100, 2)


# 🔹 Job Recommendation
def recommend_jobs(resume_text, jobs):
    if not resume_text or not jobs:
        return []

    job_list = []
    descriptions = [job.description or "" for job in jobs]

    vectorizer = TfidfVectorizer(stop_words='english')
    vectors = vectorizer.fit_transform([resume_text] + descriptions)

    scores = cosine_similarity(vectors[0:1], vectors[1:]).flatten()

    for i, job in enumerate(jobs):
        job_list.append({
            "job_id": job.id,
            "role": job.role,
            "company": job.company_name,
            "score": round(scores[i] * 100, 2)
        })

    job_list = sorted(job_list, key=lambda x: x['score'], reverse=True)

    return job_list[:5]