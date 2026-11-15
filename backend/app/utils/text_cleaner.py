import re

# Comprehensive list of recognized tech skills, tools, languages, and methodologies
TECH_SKILLS_DB = {
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "dart", "r", "matlab", "bash", "shell",
    "sql", "nosql", "html", "html5", "css", "css3", "sass", "scss",

    # Frontend Frameworks & UI
    "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "nuxt", "angular",
    "svelte", "sveltekit", "tailwind", "tailwindcss", "bootstrap", "shadcn", "material ui",
    "redux", "zustand", "mobx", "webpack", "vite", "babel",

    # Backend & APIs
    "node", "node.js", "nodejs", "express", "express.js", "fastapi", "flask", "django",
    "spring", "spring boot", "asp.net", "dotnet", ".net", "laravel", "ruby on rails",
    "rest", "rest api", "restful", "graphql", "grpc", "soap", "websocket", "websockets",
    "microservices", "jwt", "oauth",

    # Databases & Storage
    "mongodb", "postgresql", "postgres", "mysql", "sqlite", "redis", "cassandra",
    "dynamodb", "elasticsearch", "supabase", "firebase", "mariadb", "prisma", "sqlalchemy",

    # Cloud, DevOps & Containers
    "docker", "kubernetes", "k8s", "aws", "amazon web services", "azure", "gcp",
    "google cloud", "terraform", "ansible", "ci/cd", "github actions", "gitlab", "jenkins",
    "linux", "nginx", "apache", "cloudflare", "serverless", "lambda",

    # Testing & QA
    "jest", "cypress", "playwright", "selenium", "pytest", "mocha", "chai",
    "unit testing", "integration testing", "end to end testing", "e2e",

    # Data Science & AI/ML
    "machine learning", "deep learning", "ai", "artificial intelligence", "nlp",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn", "pandas",
    "numpy", "scipy", "data analysis", "llm", "langchain", "transformers", "hugging face",

    # Tooling & Architecture
    "git", "github", "jira", "figma", "postman", "agile", "scrum", "kanban",
    "system design", "data structures", "algorithms", "object oriented programming", "oop",
}

# Generic words that often pollute ATS match results but are NOT real skills
EXCLUDED_NOISE_WORDS = {
    "a", "about", "above", "accepted", "across", "after", "again", "against", "all",
    "also", "am", "an", "and", "any", "api", "apis", "application", "applications",
    "apply", "applying", "are", "aren't", "as", "at", "bachelor", "bachelors",
    "basic", "be", "because", "been", "before", "being", "below", "benefits",
    "best", "between", "bonus", "both", "browsers", "build", "building", "built",
    "business", "but", "by", "can", "can't", "cannot", "career", "clean",
    "close", "closely", "code", "collaborate", "collaborating", "collaborative",
    "company", "competitive", "components", "computer", "contact", "context",
    "contract", "control", "convert", "could", "create", "creating", "culture",
    "customer", "customers", "daily", "day", "debug", "degree", "deliver",
    "delivering", "delivery", "design", "designer", "designers", "designs",
    "desktop", "develop", "developer", "developers", "development", "did",
    "different", "digital", "do", "does", "doing", "don't", "done", "down",
    "during", "each", "email", "employment", "engineer", "engineering", "engineers",
    "ensure", "ensuring", "enterprise", "environment", "etc", "every", "excellent",
    "experience", "experienced", "experiences", "expert", "expertise", "fast",
    "features", "feedback", "few", "first", "flexible", "focused", "focusing",
    "following", "for", "format", "free", "from", "front", "full", "fully",
    "fun", "further", "future", "get", "getting", "give", "giving", "gmail",
    "gmail.com", "goal", "goals", "good", "great", "group", "groups", "grow",
    "growing", "growth", "had", "hands", "has", "have", "having", "he", "help",
    "helping", "her", "here", "high", "highly", "him", "his", "hire", "hiring",
    "how", "i", "if", "in", "including", "industry", "initiative", "integration",
    "integrations", "interfaces", "into", "is", "isn't", "issue", "issues",
    "it", "its", "job", "jobs", "join", "joining", "just", "key", "knowledge",
    "large", "lead", "leader", "leadership", "leading", "learn", "learning",
    "level", "life", "like", "line", "live", "look", "looking", "love", "maintain",
    "maintaining", "make", "making", "manage", "management", "manager", "managing",
    "many", "market", "master", "match", "may", "me", "member", "members",
    "methods", "mindset", "mission", "mobile", "modern", "monthly", "more",
    "most", "motivation", "must", "my", "name", "need", "needed", "needs",
    "new", "next", "nice", "no", "non", "nor", "not", "notes", "now", "of",
    "off", "offer", "office", "often", "old", "on", "once", "one", "online",
    "only", "open", "operations", "opportunities", "opportunity", "or", "order",
    "organization", "other", "others", "our", "ours", "out", "over", "overall",
    "own", "package", "page", "paid", "part", "partner", "partners", "passionate",
    "past", "people", "per", "perform", "performance", "performing", "person",
    "personal", "phone", "plan", "planning", "plans", "platform", "platforms",
    "play", "please", "plus", "point", "position", "positions", "possible",
    "practice", "practices", "prefer", "preferred", "present", "principles",
    "problem", "problems", "process", "processes", "product", "production",
    "products", "professional", "program", "programs", "project", "projects",
    "provide", "providing", "quality", "quick", "quickly", "range", "ready",
    "real", "really", "reason", "receive", "recent", "regular", "related",
    "relevant", "remote", "report", "reporting", "require", "required",
    "requirement", "requirements", "research", "response", "responsibilities",
    "responsibility", "responsible", "results", "right", "role", "roles",
    "same", "scale", "scaling", "scheduled", "school", "scope", "seeking",
    "self", "senior", "service", "services", "set", "share", "should", "side",
    "simple", "simply", "site", "sites", "size", "skill", "skilled", "skills",
    "small", "smart", "so", "software", "solution", "solutions", "solve",
    "solving", "some", "someone", "something", "soon", "space", "standards",
    "start", "starting", "state", "step", "steps", "still", "story", "strong",
    "structure", "student", "studies", "successful", "such", "support",
    "supporting", "sure", "system", "systems", "take", "taking", "target",
    "task", "tasks", "team", "teams", "tech", "technical", "technologies",
    "technology", "term", "terms", "test", "testing", "than", "thank",
    "that", "the", "their", "theirs", "them", "themselves", "then", "there",
    "therefore", "these", "they", "thing", "things", "think", "thinking",
    "this", "those", "though", "through", "time", "times", "to", "today",
    "together", "too", "tools", "top", "track", "tracking", "train", "training",
    "trends", "true", "trust", "try", "trying", "two", "type", "types",
    "under", "understand", "understanding", "university", "unless", "until",
    "up", "update", "updates", "upon", "us", "use", "used", "user", "users",
    "using", "value", "values", "variety", "various", "version", "very",
    "via", "view", "visual", "want", "wanted", "wants", "was", "wasn't",
    "way", "ways", "we", "we're", "well", "went", "were", "weren't", "what",
    "whatever", "when", "where", "which", "while", "who", "whole", "whom",
    "whose", "why", "wide", "will", "willing", "win", "with", "within",
    "without", "word", "words", "work", "worked", "worker", "workers",
    "working", "works", "world", "worth", "would", "write", "writing",
    "written", "year", "years", "yes", "yet", "you", "you'd", "you'll",
    "you're", "you've", "young", "your", "yours", "yourself",
}


def clean_text(text: str) -> str:
    """
    Sanitizes raw text: removes emails, URLs, special characters, and excess whitespace.
    """
    if not text:
        return ""

    # Remove email addresses (e.g. user@example.com)
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", " ", text)

    # Remove URLs (http, https, www, github.com links)
    text = re.sub(r"https?://\S+|www\.\S+|\b[a-zA-Z0-9.-]+\.(com|org|net|io|edu|dev)/\S*", " ", text)

    # Remove phone numbers (US/Intl formats)
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

    # 1. Match against known tech skills database (handles multi-word like "rest api", "machine learning")
    for skill in TECH_SKILLS_DB:
        # Use word boundaries so "c" doesn't match every single letter c
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, cleaned):
            found_skills.add(skill)

    # 2. Extract other prominent alphanumeric tokens that could be tools/libs (e.g. vue, tailwind, etc.)
    tokens = re.findall(r"\b[a-zA-Z][a-zA-Z0-9+#.-]{1,24}\b", cleaned)
    for token in tokens:
        word = token.strip(".-")
        if len(word) >= 3 and word not in EXCLUDED_NOISE_WORDS and not word.isdigit():
            # Basic plural normalization: strip trailing 's' if not 'css', 'express', etc.
            if word.endswith("s") and len(word) > 4 and not word.endswith(("ss", "us", "is")):
                singular = word[:-1]
                if singular in TECH_SKILLS_DB:
                    found_skills.add(singular)
                    continue
            found_skills.add(word)

    return found_skills
