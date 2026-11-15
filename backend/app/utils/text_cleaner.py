import re

# Comprehensive list of recognized tech skills, tools, languages, and methodologies
TECH_SKILLS_DB = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "dart", "r", "matlab", "bash", "shell",
    "sql", "nosql", "html", "html5", "css", "css3", "sass", "scss",

    # Frontend Frameworks & Libraries
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte",
    "redux", "zustand", "mobx", "tailwind", "tailwindcss", "bootstrap", "shadcn",
    "material-ui", "mui", "webpack", "vite", "babel",

    # Backend Frameworks & APIs
    "node", "node.js", "nodejs", "express", "express.js", "fastapi", "flask", "django",
    "spring", "spring boot", "asp.net", "laravel", "ruby on rails", "nestjs",
    "rest", "rest api", "restful", "graphql", "grpc", "microservices", "websockets",
    "jwt", "oauth", "oauth2",

    # Databases & Caches
    "mongodb", "postgresql", "postgres", "mysql", "mariadb", "sqlite", "redis",
    "elasticsearch", "cassandra", "dynamodb", "supabase", "firebase",

    # DevOps, Cloud & Tools
    "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "google cloud", "terraform",
    "ansible", "ci/cd", "jenkins", "github actions", "gitlab ci", "git", "github", "gitlab",
    "linux", "nginx", "apache",

    # Testing & QA
    "jest", "cypress", "playwright", "selenium", "pytest", "mocha", "chai", "unit testing",

    # AI, ML & Data
    "machine learning", "deep learning", "ai", "artificial intelligence", "nlp",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras", "opencv",
    "llm", "rag", "langchain",
}

EXCLUDED_NOISE_WORDS = {
    "a", "about", "above", "accepted", "across", "after", "again", "against", "all",
    "also", "am", "an", "and", "any", "application", "applications", "apply", "are",
    "as", "at", "bachelor", "basic", "benefits", "best", "bonus", "both", "browsers",
    "build", "building", "career", "clean", "code", "collaborate", "collaborative",
    "company", "competitive", "components", "computer", "contact", "context", "contract",
    "control", "convert", "culture", "daily", "debug", "degree", "design", "designers",
    "designs", "desktop", "develop", "developer", "developers", "development", "digital",
    "do", "does", "email", "employment", "engineer", "engineering", "ensure", "environment",
    "etc", "experience", "experienced", "expert", "first", "flexible", "focused",
    "for", "from", "full", "get", "gmail", "gmail.com", "good", "great", "grow",
    "have", "having", "help", "high", "hire", "hiring", "how", "i", "if", "in",
    "including", "integration", "interfaces", "into", "is", "it", "its", "job",
    "jobs", "join", "just", "key", "knowledge", "lead", "learn", "learning", "level",
    "like", "look", "looking", "manage", "management", "manager", "many", "must",
    "need", "new", "no", "not", "of", "on", "open", "opportunity", "or", "our",
    "out", "over", "people", "perform", "personal", "phone", "plus", "position",
    "preferred", "project", "projects", "provide", "quality", "quick", "real",
    "receive", "relevant", "remote", "required", "requirements", "responsibilities",
    "role", "roles", "same", "seeking", "self", "senior", "service", "services",
    "skills", "software", "solutions", "start", "strong", "such", "support",
    "system", "systems", "take", "tasks", "team", "teams", "tech", "technical",
    "test", "testing", "than", "that", "the", "their", "this", "time", "to",
    "tools", "try", "under", "use", "used", "user", "using", "value", "view",
    "want", "was", "we", "well", "were", "what", "when", "where", "which",
    "while", "who", "will", "with", "work", "worked", "working", "works",
    "would", "year", "years", "you", "your",
}


def clean_text(text: str) -> str:
    """
    Sanitizes raw text: removes emails, URLs, special characters, and excess whitespace.
    """
    if not text:
        return ""

    # Remove email addresses
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", " ", text)

    # Remove URLs
    text = re.sub(r"https?://\S+|www\.\S+|\b[a-zA-Z0-9.-]+\.(com|org|net|io|edu|dev)/\S*", " ", text)

    # Remove phone numbers
    text = re.sub(r"\(?\b[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b", " ", text)

    # Normalize whitespace and tabs
    text = re.sub(r"[\r\t\xa0]", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    text = re.sub(r"[ ]{2,}", " ", text)

    return text.strip()


def extract_keywords(text: str) -> set[str]:
    """
    Extracts high-value technical skills and keywords from text.
    1. First checks for multi-word and single-word skills from TECH_SKILLS_DB.
    2. Then extracts other domain terms while filtering out generic English words and filler.
    """
    if not text:
        return set()

    cleaned = clean_text(text).lower()
    found_skills: set[str] = set()

    # 1. Match against known tech skills database
    for skill in TECH_SKILLS_DB:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, cleaned):
            found_skills.add(skill)

    # 2. Extract other prominent alphanumeric tokens that could be tools/libs
    tokens = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#.-]{1,24}\b", cleaned)
    for token in tokens:
        word = token.strip(".-")
        if len(word) >= 3 and word not in EXCLUDED_NOISE_WORDS and not word.isdigit():
            # Basic plural normalization
            if word.endswith("s") and len(word) > 4 and not word.endswith(("ss", "us", "is")):
                singular = word[:-1]
                if singular in TECH_SKILLS_DB:
                    found_skills.add(singular)
                    continue
            found_skills.add(word)

    return found_skills
