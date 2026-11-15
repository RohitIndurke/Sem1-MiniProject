import { useState } from "react";
import { Copy, Check, Download, RotateCcw } from "lucide-react";

export function GeneratedResumeCard({ analysis, jdText, onReset, onBack }) {
  const [copied, setCopied] = useState(false);

  const matchedList = analysis?.matching_keywords?.join(", ") || "Full-stack development, Web APIs";
  const missingList = analysis?.missing_keywords?.slice(0, 8).join(", ") || "";

  const generatedResumeText = `=====================================================
AI-OPTIMIZED ATS RESUME DRAFT
Tailored for Target Job Description
=====================================================

TARGET KEYWORDS INTEGRATED:
${missingList ? `[Added for ATS alignment]: ${missingList}` : "Comprehensive keyword match achieved."}

SUMMARY:
Results-driven software engineer with proven experience building modern web applications. 
Expertise in ${matchedList}. Experienced in developing responsive, scalable solutions 
collaborating in fast-paced agile teams.

CORE COMPETENCIES & TECHNICAL SKILLS:
- Languages & Frameworks: ${matchedList}
${missingList ? `- Targeted Qualifications: ${missingList}` : ""}
- Development Practices: Agile/Scrum, Git Version Control, RESTful API Integration
- Optimization: Cross-browser compatibility, loading performance, responsive design

PROFESSIONAL EXPERIENCE & PROJECT HIGHLIGHTS:
* Engineered modular and reusable frontend components adhering to strict UI/UX specifications.
* Integrated modern endpoints and state management, minimizing network latency.
* Applied ATS-friendly technical keywords and clean software design patterns.

EDUCATION & CERTIFICATIONS:
* B.S. in Computer Science or Equivalent Practical Experience
=====================================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedResumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedResumeText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "optimized_ats_resume.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-8 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Generated Resume
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ATS-optimized version integrating missing skills from target JD
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>← Back</span>
        </button>
      </div>

      {/* Resume Document Preview Box */}
      <div className="relative mb-6">
        <pre className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed overflow-x-auto max-h-96 whitespace-pre-wrap select-all">
          {generatedResumeText}
        </pre>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="size-3.5" />
          <span>Start Over</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied!" : "Copy Text"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Download Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
}

