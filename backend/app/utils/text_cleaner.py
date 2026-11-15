import re

TECH_SKILLS_DB = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go", "rust",
    "ruby", "php", "swift", "kotlin", "sql", "nosql", "html", "html5", "css", "css3",

    # Frontend Frameworks & UI
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte",
    "tailwind", "tailwindcss", "bootstrap", "shadcn", "redux", "zustand",

    # Backend & APIs
    "node", "node.js", "nodejs", "express", "express.js", "fastapi", "flask", "django",
    "rest", "rest api", "restful", "graphql", "grpc", "microservices", "jwt", "oauth",

    # Databases & Cloud
    "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "supabase", "firebase",
    "docker", "kubernetes", "k8s", "aws", "azure", "gcp", "ci/cd", "git", "github", "linux",

    # Testing & AI
    "jest", "cypress", "playwright", "selenium", "pytest", "unit testing",
    "machine learning", "deep learning", "ai", "artificial intelligence", "nlp",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch",
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
    if not text:
        return ""
    # Strip emails, urls, phone numbers
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", " ", text)
    text = re.sub(r"https?://\S+|www\.\S+|\b[a-zA-Z0-9.-]+\.(com|org|net|io|dev)/\S*", " ", text)
    text = re.sub(r"\(?\b[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b", " ", text)
    text = re.sub(r"[\r\t\xa0]", " ", text)
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    text = re.sub(r"[ ]{2,}", " ", text)
    return text.strip()


def extract_keywords(text: str) -> set[str]:
    if not text:
        return set()

    cleaned = clean_text(text).lower()
    found_skills: set[str] = set()

    for skill in TECH_SKILLS_DB:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, cleaned):
            found_skills.add(skill)

    tokens = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#.-]{1,24}\b", cleaned)
    for token in tokens:
        word = token.strip(".-")
        if len(word) >= 3 and word not in EXCLUDED_NOISE_WORDS and not word.isdigit():
            if word.endswith("s") and len(word) > 4 and not word.endswith(("ss", "us", "is")):
                singular = word[:-1]
                if singular in TECH_SKILLS_DB:
                    found_skills.add(singular)
                    continue
            found_skills.add(word)

    return found_skills

