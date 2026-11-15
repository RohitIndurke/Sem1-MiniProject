from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.utils.text_cleaner import clean_text, extract_keywords, TECH_SKILLS_DB


def analyze_resume_against_jd(resume_text: str, jd_text: str) -> dict:
    """
    Compares a candidate's resume text against a Job Description.
    Calculates TF-IDF Cosine Similarity, keyword overlap, and an overall ATS score.
    """
    cleaned_resume = clean_text(resume_text)
    cleaned_jd = clean_text(jd_text)

    if not cleaned_resume:
        return {
            "score": 0.0,
            "similarity_score": 0.0,
            "keyword_match_score": 0.0,
            "matching_keywords": [],
            "missing_keywords": [],
            "match_level": "No Content",
            "message": "Resume appears to be empty or unscannable.",
        }

    if not cleaned_jd:
        return {
            "score": 0.0,
            "similarity_score": 0.0,
            "keyword_match_score": 0.0,
            "matching_keywords": [],
            "missing_keywords": [],
            "match_level": "No Job Description",
            "message": "Job description is empty.",
        }

    # 1. TF-IDF & Cosine Similarity
    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            sublinear_tf=True,
            min_df=1,
        )
        tfidf_matrix = vectorizer.fit_transform([cleaned_resume, cleaned_jd])
        raw_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        similarity_score = round(float(raw_sim) * 100, 1)
    except Exception:
        similarity_score = 0.0

    # 2. Skill & Keyword Overlap
    resume_keywords = extract_keywords(cleaned_resume)
    jd_keywords = extract_keywords(cleaned_jd)

    all_matched = resume_keywords.intersection(jd_keywords)
    all_missing = jd_keywords - resume_keywords

    # Prioritize recognized technical skills first, followed by other domain keywords
    def rank_skills(skill_set: set[str]) -> list[str]:
        tech = sorted([s for s in skill_set if s in TECH_SKILLS_DB])
        other = sorted([s for s in skill_set if s not in TECH_SKILLS_DB])
        return tech + other

    ranked_matched = rank_skills(all_matched)
    ranked_missing = rank_skills(all_missing)

    total_jd_keywords = max(len(jd_keywords), 1)
    keyword_match_score = round((len(all_matched) / total_jd_keywords) * 100, 1)

    # 3. Composite ATS Score (Weighted: 45% semantic relevance + 55% skill coverage)
    composite_score = round((similarity_score * 0.45) + (keyword_match_score * 0.55), 1)
    composite_score = min(max(composite_score, 0.0), 100.0)

    # 4. Match Rating Category
    if composite_score >= 75:
        match_level = "Strong Match"
        status_color = "emerald"
    elif composite_score >= 50:
        match_level = "Good Match"
        status_color = "blue"
    elif composite_score >= 30:
        match_level = "Moderate Match"
        status_color = "amber"
    else:
        match_level = "Needs Improvement"
        status_color = "rose"

    return {
        "score": composite_score,
        "similarity_score": similarity_score,
        "keyword_match_score": keyword_match_score,
        "matching_keywords": ranked_matched[:20],       # Top meaningful matches
        "missing_keywords": ranked_missing[:16],         # Top actionable missing skills
        "total_matched": len(all_matched),
        "total_missing": len(all_missing),
        "match_level": match_level,
        "status_color": status_color,
        "resume_word_count": len(cleaned_resume.split()),
        "jd_word_count": len(cleaned_jd.split()),
    }
