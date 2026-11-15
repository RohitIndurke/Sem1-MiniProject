import { Check, Plus, ChevronRight, Target, Layers } from "lucide-react";

export function ReviewInfoCard({ analysis, filename, onBack, onContinue }) {
  if (!analysis) return null;

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xs border border-slate-200/80 p-7 sm:p-8 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Review Info & ATS Analysis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyzed document: <span className="font-semibold text-slate-700">{filename}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          ← Back
        </button>
      </div>

      {/* Main Score & Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 mb-6">
        {/* Score Ring */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="size-24 rounded-full border-4 border-blue-600 bg-white flex flex-col items-center justify-center shadow-xs">
            <span className="text-2xl font-extrabold text-slate-900">
              {analysis.score}%
            </span>
            <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
              Match
            </span>
          </div>
          <span className="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100/70 text-blue-700">
            {analysis.match_level}
          </span>
        </div>

        {/* Breakdown Stats */}
        <div className="sm:col-span-2 grid grid-cols-2 gap-3 content-center">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Target className="size-3.5 text-blue-600" />
              Semantic Match
            </div>
            <div className="text-lg font-bold text-slate-900">
              {analysis.similarity_score}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
              <Layers className="size-3.5 text-blue-600" />
              Skill Overlap
            </div>
            <div className="text-lg font-bold text-slate-900">
              {analysis.keyword_match_score}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="text-xs text-emerald-600 font-medium mb-1">
              Skills Found
            </div>
            <div className="text-lg font-bold text-emerald-600">
              {analysis.total_matched}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80">
            <div className="text-xs text-amber-600 font-medium mb-1">
              Missing Skills
            </div>
            <div className="text-lg font-bold text-amber-600">
              {analysis.total_missing}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
        {/* Matched Skills */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Matching Skills ({analysis.matching_keywords?.length || 0})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {analysis.matching_keywords?.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60"
              >
                <Check className="size-3 text-emerald-600" />
                {kw}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Missing Skills ({analysis.missing_keywords?.length || 0})
            </h4>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
            {analysis.missing_keywords?.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-200/60"
              >
                <Plus className="size-3 text-amber-600" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          ← Edit Resume / Job
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
        >
          <span>Continue to Generated Resume</span>
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
