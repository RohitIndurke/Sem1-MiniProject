import { ChevronRight } from "lucide-react";

export function TargetJobCard({ jdText, setJdText, onContinue }) {
  const isValid = (jdText || "").trim().length >= 20;

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 sm:p-7 transition-all">
      {/* Title & Description */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Choose Target Job
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Paste the target job description to match your resume against
        </p>
      </div>

      {/* Paste Job Description */}
      <div className="space-y-2 mb-6">
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
          PASTE JOB DESCRIPTION
        </label>
        <textarea
          rows={8}
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
