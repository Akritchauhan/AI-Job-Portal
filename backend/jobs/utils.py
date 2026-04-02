from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)


# 🔹 Extract text from PDF
def extract_text_from_pdf(file):
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + " "
        
        text = text.strip()
        logger.info(f"✅ PDF extracted successfully - Length: {len(text)} chars")
        
        if len(text) < 10:
            logger.warning(f"⚠️ PDF seems empty or too short ({len(text)} chars)")
        
        return text
    except Exception as e:
        logger.error(f"❌ PDF extraction failed: {str(e)}")
        return ""


# 🔹 Match Score
def calculate_match_score(resume_text, job_description, skills_required=""):
    logger.info(f"📊 Calculating match score...")
    logger.info(f"   Resume length: {len(resume_text)} chars")
    logger.info(f"   Job description length: {len(job_description)} chars")
    logger.info(f"   Skills required: {skills_required}")
    
    # Show first 200 chars of each for debugging
    logger.info(f"   Resume text (first 200 chars): {resume_text[:200]}")
    logger.info(f"   Job description (first 200 chars): {job_description[:200]}")
    
    if not resume_text or (not job_description and not skills_required):
        logger.warning("⚠️ Empty resume or job description")
        return 0.0
    
    if len(resume_text.split()) < 3:
        logger.warning(f"⚠️ Resume too short: only {len(resume_text.split())} words")
        return 0.0

    try:
        # 🔥 IMPORTANT: Combine job description + skills_required for better matching
        # This ensures that required skills are weighted in the scoring
        combined_job_text = f"{job_description} {skills_required}".strip()
        
        if not combined_job_text:
            logger.warning("⚠️ No job description or skills after combining")
            return 0.0
        
        logger.info(f"   Combined job text length: {len(combined_job_text)} chars")
        
        vectorizer = TfidfVectorizer(stop_words='english', min_df=1, lowercase=True)
        vectors = vectorizer.fit_transform([resume_text, combined_job_text])
        
        logger.info(f"   Vectorizer created {len(vectorizer.get_feature_names_out())} features")
        
        # ✅ CORRECT WAY: Use 2D array slicing
        score_matrix = cosine_similarity(vectors[0:1], vectors[1:2])
        score = score_matrix[0][0]
        
        match_percentage = round(score * 100, 2)
        logger.info(f"✅ Match score calculated: {match_percentage}%")
        logger.info(f"   Raw score: {score}")
        
        return match_percentage
        
    except Exception as e:
        logger.error(f"❌ Score calculation failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return 0.0


# 🔹 Job Recommendation
def recommend_jobs(resume_text, jobs):
    if not resume_text or not jobs:
        return []

    job_list = []
    # 🔥 Combine description + skills for each job
    descriptions = [f"{job.description or ''} {job.skills_required or ''}".strip() for job in jobs]

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