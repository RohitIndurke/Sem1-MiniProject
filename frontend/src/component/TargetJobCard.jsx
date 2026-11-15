import { useState } from "react";
import { Briefcase, FileText, ChevronRight } from "lucide-react";

const SAMPLE_JOBS = [
  {
    id: "react-dev",
    title: "React Web Developer",
    company: "SiliconFriends",
    jd: `Job Title: React Web Developer
Company: SiliconFriends
Summary: We are seeking a skilled React Web Developer to build high-performance, responsive web applications using modern frontend technologies.
Key Responsibilities:
- Develop scalable UI components using React.js and modern state management.
- Convert Figma designs into responsive, production-ready code.
- Integrate frontend interfaces with RESTful and GraphQL APIs.
- Optimize web application loading speed and cross-browser performance.
Required Skills:
- React.js, JavaScript (ES6+), TypeScript, HTML5, CSS3/Tailwind CSS
- Responsive Web Design, Git version control, REST APIs
Nice to Have:
- Next.js, Redux or Zustand, Unit Testing (Jest, Cypress), CI/CD pipelines`,
  },
  {
    id: "fullstack-eng",
    title: "Full-Stack Software Engineer",
    company: "TechCorp",
    jd: `Job Title: Full-Stack Software Engineer
Company: TechCorp
Summary: Looking for a Full-Stack Engineer proficient in Python and React to build scalable AI-driven web platforms.
Responsibilities:
- Build modern web APIs with FastAPI and responsive user interfaces with React.
- Design database schemas and optimize queries in PostgreSQL or MongoDB.
- Containerize services with Docker and manage AWS cloud deployments.
- Write maintainable, testable code following agile engineering practices.
Requirements:
- Python, FastAPI or Django, React, TypeScript
- MongoDB or PostgreSQL, Docker, Git, CI/CD
- Strong problem solving and system design fundamentals`,
  },
  {
    id: "backend-py",
    title: "Backend Engineer (Python / FastAPI)",
    company: "CloudScale Systems",
    jd: `Job Title: Backend Engineer
Company: CloudScale Systems
Responsibilities:
- Design and maintain high-throughput microservices using Python and FastAPI.
- Implement secure authentication (OAuth2 / JWT) and Redis caching layers.
- Work closely with frontend engineers and DevOps on CI/CD pipelines and Kubernetes.
Qualifications:
- 2+ years backend engineering experience with Python.
- Deep expertise in relational/NoSQL databases (PostgreSQL, MongoDB).
- Familiarity with Docker, Linux, and asynchronous event-driven architectures.`,
  },
];

export function TargetJobCard({ jdText, setJdText, onContinue }) {
  const [activeTab, setActiveTab] = useState("paste"); // 'select' | 'paste'
  const [selectedJobId, setSelectedJobId] = useState(null);

  const isValid = (jdText || "").trim().length >= 20;

  const handleSelectJob = (job) => {
    setSelectedJobId(job.id);
    setJdText(job.jd);
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-7 transition-all">
      {/* Title & Description */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Choose Target Job
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select an existing job posting or paste a custom job description
        </p>
      </div>

      {/* Segmented Button / Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("select")}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "select"
              ? "bg-white text-slate-900 font-semibold shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Briefcase className="size-4" />
          <span>Select a Job</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("paste")}
          className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === "paste"
              ? "bg-white text-slate-900 font-semibold shadow-xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="size-4" />
          <span>Paste JD</span>
        </button>
      </div>

      {/* Tab 1: Select a Job */}
      {activeTab === "select" && (
        <div className="space-y-3 mb-6">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            AVAILABLE BENCHMARK JOBS
          </label>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {SAMPLE_JOBS.map((job) => {
              const isSelected = selectedJobId === job.id;
              return (
                <div
                  key={job.id}
                  onClick={() => handleSelectJob(job)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">
                        {job.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {job.company}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-100/60 px-2.5 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Paste JD */}
      {activeTab === "paste" && (
        <div className="space-y-2 mb-6">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            PASTE JOB DESCRIPTION
          </label>
          <textarea
            rows={7}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder={`Paste the full job description here...\n\nExample:\nSoftware Engineer at TechCorp\n\nResponsibilities:\n- Build and maintain web applications\n- Collaborate with cross-functional teams`}
            className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none leading-relaxed"
          />
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Minimum 20 characters</span>
            <span className={isValid ? "text-slate-500 font-medium" : "text-slate-400"}>
              {(jdText || "").length} characters
            </span>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <button
        type="button"
        disabled={!isValid}
        onClick={onContinue}
        className={`w-auto px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
          isValid
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        <span>Continue</span>
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}

