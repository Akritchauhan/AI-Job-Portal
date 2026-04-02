import logging
import re
from typing import Dict, List

logger = logging.getLogger(__name__)

# Try to import transformers for advanced semantic matching
try:
    from sentence_transformers import SentenceTransformer, util
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    logger.warning("sentence-transformers not installed. Install with: pip install sentence-transformers")


class AIATSScorer:
    """
    AI-based ATS (Applicant Tracking System) Scorer
    Evaluates resume-to-job matching using semantic similarity and skill analysis
    """
    
    def __init__(self):
        self.model = None
        if TRANSFORMERS_AVAILABLE:
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                logger.info("AI model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load AI model: {str(e)}")
                self.model = None
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from text"""
        # Common technical skills patterns
        skills_patterns = [
            r'\b(Python|Java|C\+\+|JavaScript|TypeScript|C#|PHP|Ruby|Go|Rust)\b',
            r'\b(Django|Flask|FastAPI|Spring|React|Vue|Angular|Node\.js)\b',
            r'\b(SQL|MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)\b',
            r'\b(Docker|Kubernetes|AWS|Azure|GCP|CI/CD|Jenkins|Git)\b',
            r'\b(Machine Learning|Deep Learning|NLP|Computer Vision|TensorFlow|PyTorch)\b',
            r'\b(Agile|Scrum|JIRA|REST API|GraphQL|Microservices)\b',
            r'\b(Verilog|VHDL|SystemVerilog|FPGA|RTL|Xilinx|Vivado|STA|CMOS)\b',
            r'\b(Linux|Windows|Unix|shell|bash|PowerShell)\b',
        ]
        
        found_skills = set()
        text_lower = text.lower()
        
        for pattern in skills_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            found_skills.update([m[0] if isinstance(m, tuple) else m for m in matches])
        
        # Also split by common delimiters to catch skills written as lists
        skill_sections = re.split(r'skills:|technical skills:|competencies:', text_lower)
        if len(skill_sections) > 1:
            skills_text = skill_sections[1].split('\n')[0:3]  # Get next 3 lines
            additional_skills = re.findall(r'\b([a-zA-Z\+\#]+)\b', ' '.join(skills_text))
            found_skills.update([s for s in additional_skills if len(s) > 2])
        
        return list(found_skills)
    
    def extract_experience_years(self, text: str) -> float:
        """Extract years of experience from resume"""
        years_pattern = r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)'
        matches = re.findall(years_pattern, text, re.IGNORECASE)
        
        if matches:
            return float(matches[0])
        
        # Try to estimate from education dates
        dates = re.findall(r'(19|20)\d{2}', text)
        if len(dates) >= 2:
            earliest = min(int(d) for d in dates)
            latest = max(int(d) for d in dates)
            return latest - earliest
        
        return 0.0
    
    def calculate_semantic_similarity(self, resume_text: str, job_text: str) -> float:
        """Calculate semantic similarity using AI model"""
        if not self.model:
            return 0.0
        
        try:
            resume_embedding = self.model.encode(resume_text, convert_to_tensor=True)
            job_embedding = self.model.encode(job_text, convert_to_tensor=True)
            similarity = util.pytorch_cos_sim(resume_embedding, job_embedding)
            return float(similarity[0][0])
        except Exception as e:
            logger.error(f"Semantic similarity calculation failed: {str(e)}")
            return 0.0
    
    def calculate_ats_score(self, resume_text: str, job_description: str, 
                           required_skills: str = "", required_experience: int = 0) -> Dict:
        """
        Calculate comprehensive ATS score with detailed breakdown
        
        Returns:
            Dictionary with overall_score, skill_match, experience_match, semantic_match and breakdown
        """
        
        # Extract information from resume
        resume_skills = set(self.extract_skills(resume_text))
        candidate_experience = self.extract_experience_years(resume_text)
        
        # Extract required skills from job
        job_skills = set(self.extract_skills(job_description + " " + required_skills))
        
        # SKILL MATCHING SCORE
        if job_skills:
            matched = len(resume_skills.intersection(job_skills))
            total = len(job_skills)
            skill_match = (matched / total) * 100 if total > 0 else 0
        else:
            skill_match = 50
        
        # EXPERIENCE MATCHING SCORE
        if required_experience > 0:
            if candidate_experience >= required_experience:
                experience_match = 100
            else:
                experience_match = (candidate_experience / required_experience) * 80
        else:
            experience_match = 80 if candidate_experience > 0 else 50
        
        # SEMANTIC/CONTENT SIMILARITY SCORE
        combined_job_text = f"{job_description} {required_skills}"
        semantic_match = self.calculate_semantic_similarity(resume_text, combined_job_text) * 100
        
        if semantic_match == 0:
            semantic_match = 50
        
        # OVERALL SCORE (Weighted average)
        # Weights: Skills 40%, Semantic 35%, Experience 25%
        overall_score = (
            (skill_match * 0.40) +
            (semantic_match * 0.35) +
            (experience_match * 0.25)
        )
        
        overall_score = min(100, max(0, overall_score))
        
        # Build detailed response
        matched_skills = list(resume_skills.intersection(job_skills))
        missing_skills = list(job_skills - resume_skills)
        
        result = {
            'overall_score': round(overall_score, 2),
            'skill_match': round(skill_match, 2),
            'experience_match': round(experience_match, 2),
            'semantic_match': round(semantic_match, 2),
            'breakdown': {
                'matched_skills': matched_skills,
                'missing_skills': missing_skills,
                'candidate_experience_years': round(candidate_experience, 1),
                'required_experience_years': required_experience,
            },
            'recommendation': self._get_recommendation(overall_score)
        }
        
        return result
    
    def _get_recommendation(self, score: float) -> str:
        """Get hiring recommendation based on score"""
        if score >= 80:
            return "EXCELLENT MATCH - Highly Recommended"
        elif score >= 60:
            return "GOOD MATCH - Recommended"
        elif score >= 40:
            return "MODERATE MATCH - Review Carefully"
        elif score >= 20:
            return "WEAK MATCH - Likely Not Suitable"
        else:
            return "POOR MATCH - Not Recommended"


# Global ATS scorer instance
ats_scorer = AIATSScorer()


def calculate_ai_ats_score(resume_text: str, job_description: str, 
                           skills_required: str = "", experience_years: int = 0) -> Dict:
    """
    Calculate ATS score using AI-based analysis
    
    Args:
        resume_text: Extracted text from resume PDF
        job_description: Job description text
        skills_required: Required skills (comma-separated)
        experience_years: Required years of experience
    
    Returns:
        Dictionary with overall_score and detailed breakdown
    """
    return ats_scorer.calculate_ats_score(resume_text, job_description, skills_required, experience_years)
